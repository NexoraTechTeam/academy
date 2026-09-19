/**
 * AI Assistant widget — DeAcademy host context adapter.
 *
 * The widget is passive: it never reads a router, URL or auth state itself.
 * This file is the ONLY place that touches DeAcademy's DOM, and it rebuilds
 * the context object on demand (docs/widget-readiness-ai-assistant.md §4).
 *
 * The bundle (`lsp-unified-app.html`) is a closed IIFE — `window.React`,
 * `globalThis.*`: zero hits — so there is no app state to read. Everything
 * here is read off the rendered DOM, using the same contract the repo's own
 * Playwright suite relies on (`tests/helpers.py`).
 *
 * ACTIVE-ROUTE CONTRACT, MEASURED NOT ASSUMED (2026-09-18, headless chromium
 * against the published /academy/): the rollout plan claimed the active nav
 * item carries an "active" CSS class. It does not. Every `aside nav button`
 * has an IDENTICAL className, no aria-current, no data-attribute, and the
 * className does not change on navigation. The real signal is the INLINE
 * STYLE the bundle sets:
 *     active   -> background-color: rgba(255, 255, 255, 0.1); color: rgb(255,255,255)
 *     inactive -> background-color: transparent;              color: rgba(255,255,255,.55)
 * So "current screen" = the nav button whose inline background-color is not
 * transparent. Anything that reads a class here would silently always report
 * the first item.
 */
import { PROJECT_ID, PROTOTYPE_VERSION } from './app.config.js';

const NAV_SELECTOR = 'aside nav button';

/** Every menu label the signed-in persona can see (helpers.py::nav_items). */
export function navItems() {
  return [...document.querySelectorAll(NAV_SELECTOR)]
    .map((b) => b.textContent.trim())
    .filter(Boolean);
}

/** The active nav button, by inline background-color — see the header note. */
export function activeNavButton() {
  return [...document.querySelectorAll(NAV_SELECTOR)].find((b) => {
    const bg = b.style.backgroundColor;
    return bg && bg !== 'transparent';
  }) || null;
}

/** Signed out when the shell has rendered no nav at all (helpers.py). */
export function isSignedOut() {
  return document.querySelectorAll(NAV_SELECTOR).length === 0;
}

/**
 * The header account button carries "<initials><Name><Role>" as its text.
 * There is no stable id, so this mirrors helpers.py::account_button: a header
 * button that is not inside the sidebar.
 */
function accountText() {
  const candidates = [...document.querySelectorAll('header button, body > div button')]
    .filter((b) => !b.closest('aside'));
  const withText = candidates.map((b) => b.textContent.trim()).filter((t) => t.length > 2);
  return withText[withText.length - 1] || '';
}

/**
 * Best-effort split of that account text into name + role. The bundle
 * concatenates initials + name + role label with no separator, so this is a
 * heuristic: match the role against the known labels rather than guessing a
 * split point. An unrecognised role degrades to an empty role, never to a
 * wrong one.
 */
const ROLE_LABELS = [
  'Participant', 'Corporate Admin', 'Operator', 'Employer / Verifier',
  'Tutor / Examiner', 'Super Admin', 'Management',
];

function parseAccount(text) {
  const role = ROLE_LABELS.find((r) => text.endsWith(r)) || '';
  let name = role ? text.slice(0, -role.length) : text;
  // Strip the leading initials the avatar renders (e.g. "DPDinda Pramesti").
  const m = name.match(/^([A-Z]{1,3})(?=[A-Z][a-z])/);
  if (m) name = name.slice(m[1].length);
  return { name: name.trim(), role: role.trim() };
}

export function buildContext({ environment = 'review' } = {}) {
  const signedOut = isSignedOut();
  const active = activeNavButton();
  const account = signedOut ? { name: '', role: '' } : parseAccount(accountText());

  return {
    project: PROJECT_ID,
    environment,
    prototypeVersion: PROTOTYPE_VERSION,
    route: signedOut ? 'signed-out' : (active ? active.textContent.trim() : 'unknown'),
    screen: signedOut ? 'Belum login' : (active ? active.textContent.trim() : 'Tidak dikenali'),
    reviewer: {
      name: account.name || 'anonymous reviewer',
      title: account.role || 'Unknown',
      role: account.role || 'unknown',
    },
    // Config summary only — never the full domain dataset (privacy rule in
    // docs/widget-readiness-ai-assistant.md §4). The menu the persona can
    // see is a permission summary; the rows behind each screen are not.
    menu: signedOut ? [] : navItems(),
    at: new Date().toISOString(),
  };
}

/**
 * Navigation adapter: synthesize a click on the nav button with that label —
 * exactly what helpers.py::goto does, so this is a supported path rather than
 * a private API. Returns false when the label isn't visible to this persona
 * (the widget must never claim it navigated when it didn't).
 */
export function navigateTo(label) {
  const btn = [...document.querySelectorAll(NAV_SELECTOR)]
    .find((b) => b.textContent.trim() === label);
  if (!btn) return false;
  btn.click();
  return true;
}
