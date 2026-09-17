"""v3.9 — Wire "Assign Training" to the participant's My Trainings.

User asked whether an internal training assigned by a Corporate Admin ends up
merged into the participant's "My Trainings" (design answer: yes, one unified
list). Checking the actual code to answer that question surfaced a real gap:
it wasn't wired at all — clicking "Assign Training" in `qv` only flipped a
local boolean to show a static success banner; no state was ever written, so
the assignment never reached any participant's workspace.

Fixed by lifting a new `assignedTrainings` array to `Gd` (same pattern as
`schemes`/`questionBanks`/`auditLog`), additive rather than replacing the
existing mock data. Ratna Wijayanti (Corporate Admin, id 2) is the only
demoable target end-to-end — she's the sole Corporate-Admin-side "employee"
who is also a real login persona; added to the employee list (`Lr`) with a
`personaId` linking her assignment back to her own Participant view. She
lands on the simplified `Dt`-based My Trainings branch, not the rich `uo`
branch (that one is Dinda-only, `l?.id===1`) — the fix targets the branch
Corporate Admin personas actually see when switching to Participant view.

Reference: docs/DATA-MODEL.md §4, docs/PRD.md §4.6.
"""
from roles import BY_KEY


def test_corporate_admin_assign_reaches_own_participant_my_trainings(app):
    """Regression for the no-op Assign button: assigning a training to
    Ratna (as an employee of her own company) must make it appear in her
    own Participant-workspace My Trainings — proving genuinely shared
    state, not a local echo that disappears once the modal/tab closes."""
    app.sign_in_as_persona(BY_KEY["corporate_admin"])
    app.goto("Assign Training")

    app.page.get_by_role("button", name="Ratna Wijayanti EMP-1001").click()
    app.page.locator("main").get_by_role("button", name="Assign Training", exact=True).click()
    app.page.wait_for_timeout(150)

    body = app.main_text()
    assert "assigned to 1 employee(s)" in body
    app.assert_healthy("corporate-admin/training-assigned")

    # Navigate off Assign Training first: its employee row for "Ratna
    # Wijayanti" would otherwise also match the account-menu button locator
    # (both contain her name), breaking switch_role()'s `.last` lookup.
    app.goto("Dashboard")
    app.switch_role("Participant")
    app.goto("My Trainings")
    body = app.main_text()
    assert "Competency Assessor Certification (BNSP)" in body
    assert "Not Started" in body
    app.assert_healthy("corporate-admin-participant/assigned-training-visible")
    app.screenshot("corporate-admin-assign-training-my-trainings")


def test_dinda_my_trainings_unaffected_by_corporate_assignments(app):
    """The fix is additive — Dinda's existing 6-item My Trainings list (the
    rich `uo`-based render, reachable only for persona id 1) must render
    exactly as before, unaffected by any corporate-side assignment."""
    app.sign_in_as_persona(BY_KEY["participant"])
    app.goto("My Trainings")
    body = app.main_text()
    assert "Every training you've purchased or enrolled in" in body
    assert "Corporate H&S Regulation Awareness" in body
    assert "Assessor Code of Ethics" in body
    app.assert_healthy("participant/my-trainings-unaffected")
