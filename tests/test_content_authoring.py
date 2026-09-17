"""v3.7 — Content authoring gaps found when the user asked how training
material, quizzes, and exams actually get created, and who does it.

Two real gaps confirmed against the live bundle (not just the docs):
1. Corporate Admin's "Create Internal Training" never gave a training a
   syllabus, and there was no Edit button anywhere — so "Manage Content"
   was a permanent dead end. Fixed by reusing the same syllabus module
   editor (`jv`) already built for Operator's training form.
2. PRD §4.18 documented Operator managing certification_schemes (toggle
   eligibility verification, set fees) and scheduling exam_events, but none
   of it was ever built — `Ew` was a bare constant with no setter anywhere.
   Fixed by lifting it into shared state and giving Operator a real CRUD UI.

Reference: docs/PRD.md §4.5/§4.6, docs/DATA-MODEL.md §3a/§9c.
"""
from roles import BY_KEY


def test_corporate_admin_can_add_syllabus_and_then_manage_content(app):
    """Regression for the dead end: an internal training with no syllabus
    could never reach a usable 'Manage Content' screen."""
    app.sign_in_as_persona(BY_KEY["corporate_admin"])
    app.goto("Internal Trainings")
    body = app.main_text()
    assert "Content Incomplete" in body  # Factory Safety SOP Refresher, empty syllabus

    row = app.page.locator("div").filter(has_text="Factory Safety SOP Refresher").filter(
        has=app.page.get_by_role("button", name="Edit Syllabus")
    ).last
    row.get_by_role("button", name="Edit Syllabus").click()
    app.page.wait_for_timeout(150)
    app.page.get_by_role("button", name="+ Add Module").click()
    app.page.get_by_placeholder("Module title").fill("Fire Safety & Evacuation")
    app.page.get_by_placeholder("Topics, comma-separated").fill(
        "Fire extinguisher use, Evacuation routes"
    )
    app.page.get_by_role("button", name="Save Syllabus").click()
    app.page.wait_for_timeout(150)

    body = app.main_text()
    assert "Content Incomplete" not in body
    app.assert_healthy("corporate-admin/syllabus-saved")

    row2 = app.page.locator("div").filter(has_text="Factory Safety SOP Refresher").filter(
        has=app.page.get_by_role("button", name="Manage Content")
    ).last
    row2.get_by_role("button", name="Manage Content").click()
    app.page.wait_for_timeout(150)
    body = app.page.locator("body").inner_text()
    assert "Lesson Content Setup" in body
    assert "Fire Safety & Evacuation" in body
    assert "belum ada syllabus" not in body.lower()
    assert "doesn't have a syllabus yet" not in body
    app.assert_healthy("corporate-admin/manage-content-unblocked")
    app.screenshot("corporate-admin-syllabus-unblocked")


def test_operator_can_add_certification_scheme_and_it_reaches_guest_catalog(app):
    """Confirms schemes are genuinely shared state (lifted to the top-level
    app component), not a local copy that only Operator sees — the whole
    point of building this was to make Operator's edits visible platform-wide."""
    app.sign_in_as_persona(BY_KEY["operator"])
    app.goto("Certification Schemes")
    app.page.get_by_role("button", name="Add Scheme").click()
    app.page.wait_for_timeout(150)
    app.page.get_by_placeholder("e.g. Certified Data Protection Officer").fill(
        "Certified Data Protection Officer"
    )
    app.page.get_by_placeholder("e.g. BNSP, DeAcademy").fill("KAN")
    app.page.get_by_placeholder("e.g. BNSP, KAN, International, Other").fill("KAN")
    app.page.get_by_placeholder("e.g. Indonesian").fill("Indonesian")
    app.page.locator('input[type="number"]').fill("1500000")
    app.page.get_by_role("button", name="Create Scheme").click()
    app.page.wait_for_timeout(150)
    body = app.main_text()
    assert "Certified Data Protection Officer" in body
    app.assert_healthy("operator/scheme-created")

    app.sign_out()
    app.page.get_by_role("button", name="Take a Certification Exam").click()
    app.page.wait_for_timeout(200)
    body = app.page.locator("body").inner_text()
    assert "Certified Data Protection Officer" in body
    assert "KAN" in body  # new Scheme Type option, derived from data not hardcoded
    app.assert_healthy("guest/new-scheme-visible")
    app.screenshot("guest-exam-catalog-new-scheme")


def test_operator_can_schedule_exam_session_for_existing_scheme(app):
    app.sign_in_as_persona(BY_KEY["operator"])
    app.goto("Certification Schemes")
    app.page.get_by_role("button").filter(has_text="Ahli K3 Umum").click()
    app.page.wait_for_timeout(150)

    app.page.get_by_placeholder("e.g. Nov 12, 2026").fill("Dec 1, 2026")
    app.page.get_by_role("combobox").select_option("Onsite")
    app.page.get_by_placeholder("Location, e.g. Jakarta").fill("Surabaya")
    app.page.get_by_role("button", name="+ Schedule Session").click()
    app.page.wait_for_timeout(150)
    body = app.page.locator("body").inner_text()
    assert "Dec 1, 2026" in body
    assert "Onsite — Surabaya" in body

    app.page.get_by_role("button", name="Save Changes").click()
    app.page.wait_for_timeout(150)
    assert "2 session(s)" in app.main_text()
    app.assert_healthy("operator/scheme-session-scheduled")
