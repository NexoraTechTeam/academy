"""AI Assistant widget — visibility gate (owner requirement, 2026-09-18).

The committed lsp-unified-app.html carries NO widget: it is injected at publish
time by ops/prototypes/build-academy-widget.sh. These checks are therefore
meaningful only against the INJECTED/published artifact and SKIP against the
plain committed file, so the default ./run-tests.sh keeps its baseline while the
published build gets a real gate.

Owner requirement: the AI Assistant must appear from FIRST ACCESS to /academy/,
i.e. already on the signed-out public landing page — not only after login.
Root cause of it being absent before: widget/main.js tore the widget down
whenever isSignedOut() (no `aside nav button`), which is exactly the landing
page.
"""
import pytest

# Unique string the injector always writes into the inline <script> comment.
WIDGET_MARKER = "AI Assistant review widget — injected at publish"
FAB_TEXT = "AI Assistant"  # the FAB label "✦ AI Assistant" (open shadow root — Playwright pierces it)


def _widget_injected(page):
    return WIDGET_MARKER in page.content()


def test_widget_fab_present_on_signed_out_landing(app):
    """The FAB is visible on the public landing page, before any sign-in."""
    if not _widget_injected(app.page):
        pytest.skip("widget not injected in this build (plain committed file)")
    assert app.page.locator("aside nav button").count() == 0, "precondition: landing must be signed-out"
    app.page.get_by_text(FAB_TEXT).first.wait_for(state="visible", timeout=5000)
    app.assert_healthy("widget/landing-fab")


def test_widget_landing_adds_no_nav_and_no_console_error(app):
    """The widget on the landing page must not add nav entries or log errors."""
    if not _widget_injected(app.page):
        pytest.skip("widget not injected in this build (plain committed file)")
    # The widget lives in its own shadow root on document.body; it must never
    # add an `aside nav button` (the 92-suite compares those to each persona).
    assert app.page.locator("aside nav button").count() == 0
    app.assert_healthy("widget/landing-clean")
