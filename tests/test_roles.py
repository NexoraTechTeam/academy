"""Full end-to-end sweep across every role in the LSP Unified App."""
import pytest

from roles import PERSONAS

IDS = [p.key for p in PERSONAS]


@pytest.mark.parametrize("persona", PERSONAS, ids=IDS)
def test_login_renders_role_shell(app, persona):
    """Signing in as each persona lands on that role's workspace."""
    app.sign_in_as_persona(persona)

    body = app.page.locator("body").inner_text()
    assert persona.name in body, "signed-in user name not shown"
    assert persona.role_label in body, "role label %r not shown" % persona.role_label

    app.assert_healthy("%s/login" % persona.key)
    app.screenshot("%s-login" % persona.key)


@pytest.mark.parametrize("persona", PERSONAS, ids=IDS)
def test_nav_matches_role(app, persona):
    """The sidebar exposes exactly the menu defined for that role."""
    app.sign_in_as_persona(persona)
    actual = app.nav_items()
    assert actual == persona.nav, "nav mismatch for %s" % persona.key


@pytest.mark.parametrize("persona", PERSONAS, ids=IDS)
def test_every_view_renders(app, persona):
    """Every menu entry for the role opens a view that renders without error."""
    app.sign_in_as_persona(persona)

    failures = []
    for label in persona.nav:
        app.goto(label)
        try:
            app.assert_healthy("%s/%s" % (persona.key, label))
        except AssertionError as exc:
            failures.append(str(exc))
        app.screenshot("%s-%s" % (persona.key, label.replace("/", "-").replace(" ", "_")))
        # Locked (upsell) entries open a dialog instead of a tab — close it
        # so it doesn't block the click on whatever nav item comes next.
        app.dismiss_upsell_modal_if_open()

    assert not failures, "views failed for %s:\n%s" % (persona.key, "\n".join(failures))


@pytest.mark.parametrize("persona", PERSONAS, ids=IDS)
def test_sign_in_with_email_form(app, persona):
    """The credential form resolves each persona by email, not just the shortcut."""
    app.sign_in_with_email(persona)
    body = app.page.locator("body").inner_text()
    assert persona.name in body, "email login did not resolve %s" % persona.email
    app.assert_healthy("%s/email-login" % persona.key)


MULTI_ROLE = [p for p in PERSONAS if len(p.roles) > 1]


@pytest.mark.parametrize("persona", MULTI_ROLE, ids=[p.key for p in MULTI_ROLE])
def test_role_switch(app, persona):
    """Dual-role personas can switch into the Participant workspace and back."""
    app.sign_in_as_persona(persona)
    assert app.nav_items() == persona.nav

    app.switch_role("Participant")
    assert app.nav_items() == persona.participant_nav, (
        "%s did not get the Participant menu after switching" % persona.key
    )
    app.assert_healthy("%s/as-participant" % persona.key)
    app.screenshot("%s-as-participant" % persona.key)

    app.switch_role(persona.role_label)
    assert app.nav_items() == persona.nav, (
        "%s did not return to its own menu" % persona.key
    )


@pytest.mark.parametrize("persona", PERSONAS, ids=IDS)
def test_sign_out(app, persona):
    """Signing out returns to the public landing screen."""
    app.sign_in_as_persona(persona)
    app.sign_out()
    app.page.get_by_role("button", name="Sign Up", exact=True).first.wait_for(
        state="visible"
    )
    assert app.page.locator("aside nav button").count() == 0, "shell still mounted"
    app.assert_healthy("%s/signed-out" % persona.key)
