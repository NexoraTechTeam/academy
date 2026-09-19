/**
 * AI Assistant widget — DeAcademy entry point.
 *
 * Bundled (esbuild, IIFE) and injected as ONE inline <script> between the
 * bundle's closing </script> and </body> by ops/prototypes/refresh.sh at
 * publish time. Three constraints drive every choice here:
 *
 * 1. `lsp-unified-app.html` is never edited in git (AGENTS.md forbids
 *    refactoring the minified bundle) — injection happens at publish only, so
 *    the double-click `file://` flow in README-HANDOFF.md keeps working on the
 *    committed file.
 * 2. Inline, non-module script: ES module imports don't load over file://, so
 *    the published copy has to work as a plain IIFE too.
 * 3. The repo's 92 Playwright tests must stay green. That means: add ZERO nav
 *    entries (test_every_view_renders compares `aside nav button` text to the
 *    persona's expected list exactly), and emit ZERO console errors (the
 *    `console_errors` fixture fails the run on a single one).
 */
import { mount } from './core/rr-vanilla.js';
import { buildContext, navigateTo, isSignedOut, activeNavButton } from './context.js';
import { answerQuestion } from './knowledge.js';
import { PROJECT_ID, PROTOTYPE_VERSION, FEEDBACK_APP, CHECK_AREAS } from './app.config.js';

const POLL_MS = 1000;

/**
 * The feedback collector only exists behind the nginx vhost, at
 * /widget-feedback/ — i.e. only when this page is being served as the
 * published /academy/ deployment. Anywhere else (the repo's own Playwright
 * server, a file:// double-click from README-HANDOFF.md, someone's laptop)
 * there is nothing listening, and a failed POST is logged to the console by
 * the BROWSER before any JS can catch it. That single line turns academy's
 * 92-test suite from 92 passed into 36 failed — measured, not assumed.
 * So: queue locally everywhere, transmit only where a collector exists.
 */
function collectorIsReachable() {
  try {
    return /^https?:$/.test(location.protocol) && location.pathname.startsWith('/academy/');
  } catch {
    return false;
  }
}

function start() {
  let widget = null;
  let lastRoute = null;

  // The bundle is a closed IIFE with no router and no events we can subscribe
  // to, so the only honest way to notice navigation is to watch the DOM the
  // host renders. A 1s poll comparing the active nav button is cheap, has no
  // MutationObserver storm against a React re-render, and costs nothing while
  // the tab is hidden (it reads two properties).
  function tick() {
    try {
      // Mount once and KEEP it mounted, including on the signed-out landing
      // page: the owner requires the AI Assistant to be reachable from FIRST
      // ACCESS to /academy/, not only after login (2026-09-18). The widget
      // lives in its own shadow root and adds ZERO `aside nav button`, so the
      // pre-login landing page the 92-suite asserts stays byte-for-byte in
      // the host DOM. Pre-login context resolves to route 'signed-out'
      // (context.js); the reviewer's own identity (name/email) is still
      // captured by the widget's gate, independent of any demo persona.
      if (!widget) {
        widget = mount({
          project: PROJECT_ID,
          environment: 'review',
          prototypeVersion: PROTOTYPE_VERSION,
          feedbackApp: FEEDBACK_APP,
          container: document.body,
          buildContext,
          answerQuestion,
          checkAreas: CHECK_AREAS,
          collectorEnabled: collectorIsReachable(),
          onNavigate: navigateTo,
        });
      }
      // Re-read context on ANY transition — screen-to-screen navigation and
      // the signed-out <-> signed-in flip alike — so route.viewed is recorded
      // and the panel header stays correct even while the panel is closed.
      const active = activeNavButton();
      const route = active ? active.textContent.trim() : (isSignedOut() ? 'signed-out' : 'unknown');
      if (route !== lastRoute) {
        lastRoute = route;
        widget.refresh();
      }
    } catch {
      // Never let the widget surface an error into the host page: the 92-test
      // suite fails on one console error, and a review aid must never be the
      // reason a prototype looks broken.
    }
  }

  tick();
  setInterval(tick, POLL_MS);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
