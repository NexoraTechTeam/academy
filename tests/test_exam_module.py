"""v3.4 — Exam decoupled from Training.

Covers the three surfaces the redesign touches: guest exam catalog (landing
page's third CTA), participant "My Exams" (separate from "My Trainings"),
and the Examiner's split queues (Exam Review vs Eligibility Verifications).
Reference: docs/PRD.md §4.18, docs/DATA-MODEL.md §3a.
"""
from roles import BY_KEY


def test_guest_can_browse_exam_catalog_without_login(app):
    """Direct-path candidates should reach exam info with zero account."""
    app.page.get_by_role("button", name="Take a Certification Exam").click()
    app.page.wait_for_timeout(200)
    body = app.page.locator("body").inner_text().lower()
    assert "competency assessor certification (bnsp)" in body
    assert "eligibility review required" in body
    assert "open registration" in body
    assert "sign in to register" in body
    app.assert_healthy("guest/exam-catalog")
    app.screenshot("guest-exam-catalog")


def test_participant_my_exams_is_separate_from_my_trainings(app):
    """My Exams must exist as its own nav item, not nested under My Trainings."""
    app.sign_in_as_persona(BY_KEY["participant"])
    nav = app.nav_items()
    assert "My Exams" in nav
    assert nav.index("My Exams") > nav.index("My Trainings")


def test_participant_my_exams_shows_all_three_registration_states(app):
    """Training-path (eligible), direct-verified (pending), direct-open (unregistered)."""
    app.sign_in_as_persona(BY_KEY["participant"])
    app.goto("My Exams")
    body = app.main_text().lower()
    assert "ready to book" in body  # training-path, exam included
    assert "under examiner review" in body  # direct-path, verification pending
    assert "not registered yet" in body  # direct-path, open registration
    app.assert_healthy("participant/my-exams")
    app.screenshot("participant-my-exams")


def test_participant_can_start_exam_from_my_exams(app):
    """The exam-taking flow launches from My Exams, not from the course player."""
    app.sign_in_as_persona(BY_KEY["participant"])
    app.goto("My Exams")
    app.page.get_by_role("button", name="Start Exam").first.click()
    app.page.wait_for_timeout(200)
    body = app.main_text().lower()
    assert "certification exam" in body
    assert "competency assessor certification (bnsp)" in body
    assert "back to my exams" in app.page.locator("body").inner_text().lower()
    app.assert_healthy("participant/start-exam")


def test_course_player_curriculum_has_no_exam_item(app):
    """Training now ends at the last content module — exam moved to My Exams."""
    app.sign_in_as_persona(BY_KEY["participant"])
    app.goto("My Trainings")
    app.page.get_by_text("Competency Assessor Certification (BNSP)", exact=False).first.click()
    app.page.wait_for_timeout(200)
    continue_btn = app.page.get_by_role("button", name="Continue")
    if continue_btn.count():
        continue_btn.first.click()
        app.page.wait_for_timeout(300)
    sidebar_text = app.page.locator("aside").first.inner_text()
    assert "Final Certification Exam" not in sidebar_text
    assert "Module 3" in sidebar_text
    app.assert_healthy("participant/course-player-no-exam")


def test_examiner_has_separate_eligibility_and_exam_queues(app):
    app.sign_in_as_persona(BY_KEY["tutor_examiner"])
    nav = app.nav_items()
    assert "Exam Review" in nav
    assert "Eligibility Verifications" in nav
    assert nav.index("Eligibility Verifications") > nav.index("Exam Review")


def test_examiner_can_approve_eligibility_verification(app):
    app.sign_in_as_persona(BY_KEY["tutor_examiner"])
    app.goto("Eligibility Verifications")
    body_before = app.main_text()
    assert "Pending Review" in body_before
    app.page.get_by_role("button", name="Approve").first.click()
    app.page.wait_for_timeout(150)
    body_after = app.main_text()
    assert "Approved" in body_after
    app.assert_healthy("examiner/eligibility-approve")
    app.screenshot("examiner-eligibility-verifications")


def test_examiner_can_request_more_info_and_participant_can_respond(app):
    """v3.5.1 — a third option besides Approve/Reject: ask for missing
    documents or a verification contact without rejecting (and triggering a
    refund) outright. Round-trips through both personas in one session so it
    proves the record is genuinely shared, not two independent mocks."""
    app.sign_in_as_persona(BY_KEY["tutor_examiner"])
    app.goto("Eligibility Verifications")
    dinda_card = app.page.locator("div").filter(has_text="Dinda Pramesti").filter(
        has=app.page.get_by_role("button", name="Request More Info")
    ).last
    dinda_card.get_by_role("button", name="Request More Info").click()
    app.page.wait_for_timeout(150)
    app.page.get_by_placeholder("What's missing or unclear", exact=False).fill(
        "Please send the previous employer's HR contact for verification."
    )
    app.page.get_by_role("button", name="Send Request").click()
    app.page.wait_for_timeout(150)
    body = app.main_text()
    assert "Awaiting Participant Response" in body
    assert "Please send the previous employer's HR contact" in body
    app.assert_healthy("examiner/eligibility-request-more-info")

    app.sign_out()
    app.sign_in_as_persona(BY_KEY["participant"])
    app.goto("My Exams")
    # My Exams renders its status badge with CSS text-transform:uppercase,
    # unlike the Examiner queue's `O` badge component — compare case-insensitively.
    body = app.main_text()
    assert "action needed" in body.lower()
    assert "Examiner requested more information" in body
    assert "previous employer's HR contact" in body
    app.page.get_by_placeholder("Type your response", exact=False).fill(
        "HR contact: Mr. Sutrisno, sutrisno@example.com"
    )
    app.page.get_by_role("button", name="Send Response").click()
    app.page.wait_for_timeout(150)
    assert "under examiner review" in app.main_text().lower()
    app.assert_healthy("participant/eligibility-respond")

    app.sign_out()
    app.sign_in_as_persona(BY_KEY["tutor_examiner"])
    app.goto("Eligibility Verifications")
    body = app.main_text()
    assert "HR contact: Mr. Sutrisno" in body
    dinda_card = app.page.locator("div").filter(has_text="Dinda Pramesti").filter(
        has=app.page.get_by_role("button", name="Approve")
    ).last
    assert dinda_card.get_by_role("button", name="Approve").is_visible()


def test_participant_can_attach_a_document_when_responding_to_more_info(app):
    """User asked directly: a text note might not be enough — sometimes the
    examiner is asking for a document to be re-uploaded. This checks the
    participant can attach a file (not just type a note), reusing the app's
    existing `fo` file-picker component, and the examiner sees the filename."""
    app.sign_in_as_persona(BY_KEY["tutor_examiner"])
    app.goto("Eligibility Verifications")
    dinda_card = app.page.locator("div").filter(has_text="Dinda Pramesti").filter(
        has=app.page.get_by_role("button", name="Request More Info")
    ).last
    dinda_card.get_by_role("button", name="Request More Info").click()
    app.page.wait_for_timeout(150)
    app.page.get_by_placeholder("What's missing or unclear", exact=False).fill(
        "Please re-upload a clearer copy of the certificate."
    )
    app.page.get_by_role("button", name="Send Request").click()
    app.page.wait_for_timeout(150)

    app.sign_out()
    app.sign_in_as_persona(BY_KEY["participant"])
    app.goto("My Exams")
    scheme_card = app.page.locator("div").filter(has_text="Ahli K3 Umum").filter(
        has=app.page.locator('input[type="file"]')
    ).last
    scheme_card.locator('input[type="file"]').set_input_files(
        files=[{
            "name": "K3-Certificate-Resubmit.pdf",
            "mimeType": "application/pdf",
            "buffer": b"dummy pdf bytes",
        }]
    )
    body = app.page.locator("body").inner_text()
    assert "K3-Certificate-Resubmit.pdf" in body
    # Attaching a file alone (no typed note) must be enough to enable sending.
    send_btn = app.page.get_by_role("button", name="Send Response")
    assert send_btn.is_enabled()
    send_btn.click()
    app.page.wait_for_timeout(150)
    assert "under examiner review" in app.page.locator("body").inner_text().lower()
    app.assert_healthy("participant/eligibility-respond-with-file")

    app.sign_out()
    app.sign_in_as_persona(BY_KEY["tutor_examiner"])
    app.goto("Eligibility Verifications")
    assert "K3-Certificate-Resubmit.pdf" in app.main_text()
    app.assert_healthy("examiner/eligibility-response-file-visible")
    app.screenshot("eligibility-response-with-attachment")
    app.assert_healthy("examiner/eligibility-response-visible")
