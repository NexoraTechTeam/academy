"""v3.5 — UX fixes from the lampiran 1-4 review.

Covers: Exam Catalog filters (scheme/type/language/date/seat status),
Find Verified Talent's Position filter, Assign Training's bulk-select-by-
department with recurrence-cooldown skip, and the new Operator "Access
Requests" queue fed by the upsell-modal request flow.
Reference: docs/PRD.md §4.18/§4.2/Operator, docs/DATA-MODEL.md §3a/§11.
"""
from roles import BY_KEY


def _select_by_label_text(page, label_text, option_label):
    """These filter dropdowns pair a <label> with an adjacent <select> but
    without a for/id association, so Playwright's get_by_label can't find
    them — use the CSS sibling relationship instead."""
    page.locator("label:text-is('%s') + select" % label_text).select_option(
        label=option_label
    )


def test_exam_catalog_can_be_filtered_by_seat_availability(app):
    """Filtering to 'Full' should hide sessions that still have open seats."""
    app.page.get_by_role("button", name="Take a Certification Exam").click()
    app.page.wait_for_timeout(200)
    _select_by_label_text(app.page, "Seat Availability", "Full")
    app.page.wait_for_timeout(150)
    body = app.page.locator("body").inner_text().lower()
    assert "0 seats left" in body
    assert "full" in body
    assert "no sessions match your filters" in body  # other schemes' events hidden
    app.assert_healthy("guest/exam-catalog-filtered")
    app.screenshot("guest-exam-catalog-filtered")


def test_exam_catalog_filter_options_are_derived_not_hardcoded(app):
    """Scheme Type / Language options must reflect the current data set."""
    app.page.get_by_role("button", name="Take a Certification Exam").click()
    app.page.wait_for_timeout(200)
    type_options = app.page.locator(
        "label:text-is('Scheme Type') + select option"
    ).all_text_contents()
    assert set(type_options) == {"All Types", "BNSP", "International", "Other"}
    lang_options = app.page.locator(
        "label:text-is('Language') + select option"
    ).all_text_contents()
    assert "Indonesian" in lang_options
    assert "Bilingual (Indonesian/English)" in lang_options


def test_talent_search_can_filter_by_position(app):
    app.page.get_by_role("button", name="Find Verified Talent").click()
    app.page.wait_for_timeout(200)
    _select_by_label_text(app.page, "Position", "Quality Assurance Lead")
    app.page.wait_for_timeout(150)
    body = app.page.locator("body").inner_text()
    assert "1 of 3 verified profiles" in body
    assert "Sri Wulandari" in body
    assert "Dinda Pramesti" not in body
    app.assert_healthy("guest/talent-search-position-filter")


def test_assign_training_bulk_select_skips_employees_not_yet_due(app):
    """Bulk-selecting a department excludes anyone within the training's
    recurrence window, and switching departments doesn't discard the prior
    selection (regression for the old length-based Select All bug)."""
    app.sign_in_as_persona(BY_KEY["corporate_admin"])
    app.goto("Assign Training")
    department_select = app.page.locator("select").filter(
        has=app.page.locator("option", has_text="All Departments")
    )
    department_select.select_option(label="Quality Assurance")
    app.page.wait_for_timeout(150)
    body = app.main_text()
    assert "Not Due Until" in body
    assert "excluded from bulk select" in body

    app.page.get_by_role("button", name="Select All in Quality Assurance").click()
    app.page.wait_for_timeout(150)
    assert "Employees (1 selected)" in app.main_text()

    department_select.select_option(label="Production")
    app.page.wait_for_timeout(150)
    app.page.get_by_role("button", name="Select All in Production").click()
    app.page.wait_for_timeout(150)
    assert "Employees (4 selected)" in app.main_text()
    app.assert_healthy("corporate-admin/assign-training-bulk")
    app.screenshot("corporate-admin-assign-training-bulk")


def test_access_request_flow_participant_to_operator(app):
    """A participant's upsell access request must show up, pending, in the
    Operator's new Access Requests queue, and be approvable there."""
    app.sign_in_as_persona(BY_KEY["operator"])
    app.goto("Access Requests")
    body = app.main_text()
    assert "Dinda Pramesti" in body
    assert "Verifier access" in body
    assert "Pending" in body

    app.page.get_by_role("button", name="Approve").first.click()
    app.page.wait_for_timeout(150)
    body_after = app.main_text()
    assert "Approved" in body_after
    app.assert_healthy("operator/access-requests-approve")
    app.screenshot("operator-access-requests")


def test_verifier_full_access_gates_contact_info_independent_of_consent(app):
    """v3.6 — phone/email/messaging are paywalled behind an annual 'Full
    Access' plan, and that gate is independent of the candidate's own
    consent (portfolio_settings.consent_level) — a candidate with an
    already-approved Full Verification Report still hides contact info
    until the verifier's own account has Full Access."""
    app.sign_in_as_persona(BY_KEY["verifier"])
    app.goto("Talent Search")
    app.page.get_by_role("button", name="Dinda Pramesti", exact=False).click()
    app.page.wait_for_timeout(150)
    body = app.page.locator("body").inner_text()
    assert "Unlock with Full Access" in body
    assert "+62" not in body
    assert "dinda.pramesti@gmail.com" not in body
    app.page.locator(".fixed.inset-0.z-40.flex.justify-end button").first.click()
    app.page.wait_for_timeout(150)

    app.goto("Billing")
    body = app.main_text()
    assert "Basic (current plan)" in body
    assert "Rp 5.000.000" in body
    app.page.get_by_role("button", name="Activate Full Access").click()
    app.page.wait_for_timeout(150)
    assert "Full Access" in app.main_text()
    assert "Renews" in app.main_text()

    app.goto("Talent Search")
    app.page.get_by_role("button", name="Dinda Pramesti", exact=False).click()
    app.page.wait_for_timeout(150)
    body = app.page.locator("body").inner_text()
    assert "+62 812-3456-7890" in body
    assert "dinda.pramesti@gmail.com" in body
    assert app.page.get_by_role("button", name="Send Message").is_visible()
    app.assert_healthy("verifier/full-access-unlocked")
    app.screenshot("verifier-full-access-contact-info")


def test_verifier_can_send_message_after_full_access(app):
    app.sign_in_as_persona(BY_KEY["verifier"])
    app.goto("Billing")
    app.page.get_by_role("button", name="Activate Full Access").click()
    app.page.wait_for_timeout(150)
    app.goto("Talent Search")
    app.page.get_by_role("button", name="Sri Wulandari", exact=False).click()
    app.page.wait_for_timeout(150)
    app.page.get_by_role("button", name="Send Message").click()
    app.page.get_by_placeholder("Write a message to", exact=False).fill(
        "We have an opening that matches your profile."
    )
    app.page.get_by_role("button", name="Send", exact=True).click()
    app.page.wait_for_timeout(150)
    assert "Message sent to Sri Wulandari" in app.page.locator("body").inner_text()
    app.assert_healthy("verifier/message-sent")


def test_operator_asoperator_search_bypasses_full_access_paywall(app):
    """Internal DeAcademy staff using Talent Search as an Operator should
    never need to pay for Full Access themselves."""
    app.sign_in_as_persona(BY_KEY["operator"])
    app.goto("Talent Search")
    app.page.get_by_role("button", name="Maya Kusuma", exact=False).click()
    app.page.wait_for_timeout(150)
    body = app.page.locator("body").inner_text()
    assert "+62 856-7890-1234" in body
    assert "Unlock with Full Access" not in body
    app.assert_healthy("operator/talent-search-bypass")


def test_corporate_access_approval_requires_activation_fee(app):
    """v3.6 — approving a Corporate access request grants the role
    immediately, but the workspace also needs a separate activation fee,
    distinct from buying training seats — Operator marks it paid once
    invoiced/received, mirroring the existing pending_activation pattern
    used for operator-provisioned companies."""
    app.sign_in_as_persona(BY_KEY["operator"])
    app.goto("Access Requests")
    body = app.main_text()
    assert "Budi Santoso" in body
    assert "Corporate access" in body
    assert "PT Meridian Consulting" in body
    assert "Activation fee: Rp 10.000.000 / year" in body
    assert "Unpaid" in body

    app.page.get_by_role("button", name="Mark as Paid").click()
    app.page.wait_for_timeout(150)
    body = app.main_text()
    assert "Paid" in body
    assert "Unpaid" not in body
    app.assert_healthy("operator/activation-fee-paid")
    app.screenshot("operator-corporate-activation-fee")


def test_upsell_modal_request_button_matches_upsell_type(app):
    """Regression: the modal used to always say 'Corporate access' in its
    confirmation regardless of which upsell (Corporate/Verifier/Agency) was
    opened, because the nav item's `key` wasn't passed through to it."""
    app.sign_in_as_persona(BY_KEY["participant"])
    app.page.locator("aside button[title*='Verify Talent Before You Hire']").click()
    app.page.wait_for_timeout(150)
    assert app.page.get_by_role("button", name="Request Verifier Access").is_visible()
    app.page.get_by_role("button", name="Request Verifier Access").click()
    app.page.wait_for_timeout(150)
    assert "Verifier access" in app.page.locator("body").inner_text()
    app.assert_healthy("participant/upsell-request-verifier")
