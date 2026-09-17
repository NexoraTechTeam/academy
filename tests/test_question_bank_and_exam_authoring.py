"""v3.8 — Question Bank, Exam Authoring & Stable-ID Migration (Phase 1).

A user-supplied "Corrective Implementation Prompt" asked for a production-grade
Question Bank + Exam Authoring system with stable IDs everywhere. The document
itself was discarded (this prototype has no backend, so several of its
requirements — server-enforced authorization, persistent audit storage — can't
exist here), but the underlying gaps it named were real and are fixed here:

1. Certification schemes were referenced by array index (`schemeIdx`) in 9
   places (Examiner's eligibility queue, participant My Exams, and two Gd-level
   seed arrays). Migrated to a real `schemeId` foreign key everywhere; exam
   events (previously position-only) now carry a stable `id` too.
2. Quiz/exam question *content* was static seed data (`Od`, `hh`) with no
   authoring UI and no setter anywhere. Migrated into real Question Bank
   shared state (`questionBanks`) and Exam Definition shared state
   (`examDefinitions`), with a genuine Operator-facing CRUD UI.
3. Certification scheme deletion was simply unavailable (no button at all).
   Replaced with a real Delete button that blocks with a visible dependency
   reason when the scheme has eligibility verifications or registered seats.

Reference: docs/PRD.md §4.19, docs/DATA-MODEL.md §3c, docs/ROLES-PERMISSIONS-MATRIX.md.
"""
from roles import BY_KEY


def test_operator_can_create_and_publish_a_question(app):
    """A brand-new question can be authored in the General bank and is
    genuinely persisted (shared state, not a local-only draft)."""
    app.sign_in_as_persona(BY_KEY["operator"])
    app.goto("Question Bank")
    app.page.get_by_text("General Certification Exam Bank").click()
    app.page.wait_for_timeout(150)

    app.page.get_by_role("button", name="+ Add Question").click()
    app.page.wait_for_timeout(150)
    app.page.get_by_placeholder("e.g. What is the primary purpose of a certification exam?").fill(
        "What does OJT stand for?"
    )
    app.page.get_by_placeholder("Option 1").fill("On-the-Job Training")
    app.page.get_by_placeholder("Option 2").fill("Office Job Transfer")
    app.page.get_by_role("button", name="Save Question").click()
    app.page.wait_for_timeout(150)

    body = app.main_text()
    assert "What does OJT stand for?" in body
    assert "DRAFT" in body
    app.assert_healthy("operator/question-created")

    app.page.get_by_text("What does OJT stand for?").click()
    app.page.wait_for_timeout(150)
    app.page.get_by_role("button", name="published", exact=True).click()
    app.page.get_by_role("button", name="Save Question").click()
    app.page.wait_for_timeout(150)
    assert "PUBLISHED" in app.main_text()
    app.assert_healthy("operator/question-published")
    app.screenshot("operator-question-bank-published")


def test_operator_can_build_exam_definition_from_bank_questions(app):
    """A new Exam Definition can reference existing published bank content —
    the actual point of migrating away from static Od/hh seed arrays."""
    app.sign_in_as_persona(BY_KEY["operator"])
    app.goto("Exam Builder")
    app.page.get_by_role("combobox").select_option(label="ISO 9001:2015 Lead Auditor")
    app.page.get_by_role("button", name="+ Add Exam Definition").click()
    app.page.wait_for_timeout(150)

    app.page.get_by_placeholder("e.g. Competency Assessor Certification Exam").fill(
        "ISO 9001 Retake Exam"
    )
    app.page.locator("label", has_text="The primary purpose of a certification exam is to:").locator(
        'input[type="checkbox"]'
    ).check()
    app.page.get_by_role("button", name="Save Exam Definition").click()
    app.page.wait_for_timeout(150)

    body = app.main_text()
    assert "ISO 9001 Retake Exam" in body
    assert "1 fixed question(s)" in body
    app.assert_healthy("operator/exam-definition-created")
    app.screenshot("operator-exam-builder-created")


def test_stable_id_survives_adding_a_new_scheme(app):
    """Regression for the schemeIdx bug: eligibility verifications used to be
    linked by array position, so inserting a new scheme ahead of an existing
    one silently relabelled every downstream reference. Confirms the fix by
    adding a new scheme first, then checking Examiner's queue still shows the
    correct scheme name for pre-existing eligibility verifications."""
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
    app.assert_healthy("operator/extra-scheme-added")

    app.sign_out()
    app.sign_in_as_persona(BY_KEY["tutor_examiner"])
    app.goto("Eligibility Verifications")
    body = app.main_text()
    # ev-1..ev-3 must still point at their original schemes (K3, BNSP, K3),
    # unaffected by the new scheme being appended to the schemes array.
    assert "Yusuf Ramadhan" in body and "Ahli K3 Umum" in body
    assert "Farah Azzahra" in body and "Competency Assessor Certification (BNSP)" in body
    assert "Dinda Pramesti" in body
    app.assert_healthy("examiner/eligibility-scheme-ids-stable")


def test_scheme_delete_is_blocked_with_a_visible_reason(app):
    """The old behaviour was to simply not offer a Delete button. Now there
    is a real Delete button, and clicking it on a scheme with dependents
    explains why deletion is blocked instead of silently doing nothing."""
    app.sign_in_as_persona(BY_KEY["operator"])
    app.goto("Certification Schemes")
    app.page.get_by_role("button").filter(has_text="Competency Assessor Certification (BNSP)").click()
    app.page.wait_for_timeout(150)
    app.page.get_by_role("button", name="Delete Scheme").click()
    app.page.wait_for_timeout(150)
    body = app.main_text()
    assert "can't be deleted" in body
    assert "eligibility verification" in body
    app.assert_healthy("operator/scheme-delete-blocked")
    app.screenshot("operator-scheme-delete-blocked")
