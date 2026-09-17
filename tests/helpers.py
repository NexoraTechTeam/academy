"""Page object for the LSP Unified App shell."""
import re

# Text React renders when an error boundary trips, plus the minified-React
# error page it links to. Any of these in the DOM means the view blew up.
CRASH_MARKERS = [
    "Minified React error",
    "reactjs.org/docs/error-decoder",
    "Something went wrong",
]


class App:
    def __init__(self, page, console_errors):
        self.page = page
        self.console_errors = console_errors
        self.current_name = None

    # ---------- auth ----------

    def open_sign_in(self):
        self.page.get_by_role("button", name="Sign In", exact=True).first.click()
        self.page.get_by_placeholder("name@company.com").wait_for(state="visible")

    def sign_in_as_persona(self, persona):
        """Sign in with the one-click demo persona button."""
        self.open_sign_in()
        self.page.get_by_role("button").filter(has_text=persona.name).first.click()
        self.current_name = persona.name
        self.wait_for_shell()

    def sign_in_with_email(self, persona):
        """Sign in by typing credentials into the form."""
        self.open_sign_in()
        self.page.get_by_placeholder("name@company.com").fill(persona.email)
        self.page.get_by_placeholder("••••••••").fill("demo-password")
        self.page.get_by_role("button", name="Sign In", exact=True).click()
        self.current_name = persona.name
        self.wait_for_shell()

    def wait_for_shell(self):
        self.page.locator("aside nav button").first.wait_for(state="visible")

    def account_button(self):
        """The header avatar button — carries '<initials><Name><Role>' as text."""
        return (
            self.page.locator("header button, body > div button")
            .filter(has_text=self.current_name)
            .filter(has_not=self.page.locator("aside"))
            .last
        )

    def open_account_menu(self):
        self.account_button().click()
        self.page.get_by_role("button", name="Sign Out", exact=True).wait_for(
            state="visible"
        )

    def sign_out(self):
        self.open_account_menu()
        self.page.get_by_role("button", name="Sign Out", exact=True).click()
        self.current_name = None

    def account_menu_items(self):
        self.open_account_menu()
        items = self.page.locator("button:visible").all_text_contents()
        self.page.keyboard.press("Escape")
        return [i.strip() for i in items]

    def switch_role(self, role_label):
        self.open_account_menu()
        self.page.get_by_role("button", name=role_label, exact=True).click()
        self.page.wait_for_timeout(200)
        self.wait_for_shell()

    # ---------- navigation ----------

    def nav_items(self):
        return [t.strip() for t in self.page.locator("aside nav button").all_text_contents()]

    def goto(self, label):
        self.page.locator("aside nav button").filter(
            has_text=re.compile(r"^\s*%s\s*$" % re.escape(label))
        ).first.click()
        self.page.wait_for_timeout(200)

    def main_text(self):
        return self.page.locator("main").inner_text()

    def dismiss_upsell_modal_if_open(self):
        """Locked nav entries (upsell offers) open a dialog instead of
        switching tabs. Personas can now carry more than one such entry in a
        row, so callers that click through a whole nav list need to close
        each dialog before the next click — otherwise the overlay intercepts
        it. No-op if no dialog is open."""
        maybe_later = self.page.get_by_role("button", name="Maybe Later")
        if maybe_later.count() and maybe_later.first.is_visible():
            maybe_later.first.click()
            self.page.wait_for_timeout(150)

    # ---------- assertions ----------

    def assert_healthy(self, context):
        """The current view rendered real content and nothing crashed."""
        body = self.page.locator("body").inner_text()
        for marker in CRASH_MARKERS:
            assert marker not in body, "%s: crash marker %r in DOM" % (context, marker)

        assert len(body.strip()) > 60, "%s: page nearly empty (%d chars)" % (
            context,
            len(body.strip()),
        )

        assert not self.console_errors, "%s: console errors: %s" % (
            context,
            self.console_errors,
        )

    def screenshot(self, name):
        from conftest import ARTIFACTS

        self.page.screenshot(path=str(ARTIFACTS / ("%s.png" % name)))
