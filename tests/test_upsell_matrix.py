"""Upsell-targeting matrix.

Two layers:

1. Unit matrix over the agreed CONTRACT (tests/upsell_rules.py) — locks the
   product decisions in, independent of the app build.
2. E2E checks against the current bundle. As of 2026-09-08 the bundle's
   dynamic upsell computation in `Fh` (independent-HR gets both upsells,
   company participants get the corporate upsell, copy interpolates the
   user's own org) matches the contract in full — no more agreed-but-unbuilt
   gaps here. If a future change regresses one of these, the corresponding
   test below fails outright (no xfail cushioning it).
"""
import pytest

from roles import BY_KEY
from upsell_rules import is_hr, load_positions, upsells_for

DOC = load_positions()


# ---------------------------------------------------------------------------
# Layer 1 — contract matrix (pure rules, no browser)
# ---------------------------------------------------------------------------

def U(org, position, roles):
    return {"org": org, "position": position, "roles": roles}


HR = "HR Manager"
NON_HR = "Software Engineer"

MATRIX = [
    # id, user, active_role, expected upsell keys
    ("independent-non-hr", U(None, NON_HR, ["participant"]), "participant",
     ["agency-upsell"]),
    ("independent-hr-gets-both", U(None, HR, ["participant"]), "participant",
     ["agency-upsell", "verifier-upsell"]),
    ("company-participant", U("PT Alpha", NON_HR, ["participant"]), "participant",
     ["corporate-upsell", "verifier-upsell"]),
    ("company-hr-participant", U("PT Alpha", HR, ["participant"]), "participant",
     ["corporate-upsell", "verifier-upsell"]),
    ("corporate-admin", U("PT Alpha", HR, ["corporate_admin", "participant"]),
     "corporate_admin", ["verifier-upsell"]),
    ("corporate-admin-as-participant",
     U("PT Alpha", HR, ["corporate_admin", "participant"]), "participant",
     ["verifier-upsell"]),
    ("verifier-with-company", U("PT Beta", NON_HR, ["verifier", "participant"]),
     "verifier", ["corporate-upsell"]),
    ("verifier-without-company", U(None, NON_HR, ["verifier", "participant"]),
     "verifier", []),
    ("verifier-as-participant", U("PT Beta", NON_HR, ["verifier", "participant"]),
     "participant", ["corporate-upsell"]),
    ("operator", U("DeAcademy Staff", NON_HR, ["operator", "participant"]),
     "operator", []),
    ("operator-as-participant",
     U("DeAcademy Staff", NON_HR, ["operator", "participant"]), "participant",
     ["corporate-upsell"]),
    ("admin-as-participant",
     U("DeAcademy Staff", NON_HR, ["admin", "participant"]), "participant",
     ["corporate-upsell", "verifier-upsell"]),
]


@pytest.mark.parametrize("case_id,user,role,expected",
                         MATRIX, ids=[m[0] for m in MATRIX])
def test_contract_matrix(case_id, user, role, expected):
    assert upsells_for(user, role, DOC) == expected


def test_hr_flag_comes_from_master_data_not_text():
    """An HR-sounding free-text title outside master data must NOT count."""
    assert is_hr(DOC, "HR Manager")
    assert is_hr(DOC, "Freelance HR & Competency Consultant")
    assert not is_hr(DOC, "Head of HR Wizardry")   # not in master data
    assert not is_hr(DOC, "Software Engineer")


def test_legacy_titles_resolve():
    """Bare legacy titles map onto generic master-data entries."""
    from upsell_rules import position_record
    for legacy in ("Manager", "Supervisor", "Staff"):
        rec = position_record(DOC, legacy)
        assert rec is not None, "%s must resolve via legacyAliases" % legacy
        assert not rec["hrFamily"]


def test_master_data_integrity():
    ids = [p["id"] for p in DOC["positions"]]
    assert len(ids) == len(set(ids)), "duplicate position ids"
    cats = set(DOC["categories"])
    for p in DOC["positions"]:
        assert p["category"] in cats, "%s: unknown category" % p["id"]
        assert isinstance(p["hrFamily"], bool)
        assert isinstance(p["active"], bool)
        assert isinstance(p["system"], bool)
    for alias, target in DOC.get("legacyAliases", {}).items():
        assert target in set(ids), "alias %s -> missing id %s" % (alias, target)


def test_every_persona_position_is_in_master_data():
    """No persona may carry a position the dropdown cannot represent."""
    from roles import PERSONAS
    from upsell_rules import position_record

    POSITIONS = {
        "participant": "Freelance HR & Competency Consultant",
        "corporate_admin": "HR & L&D Manager",
        "operator": "Platform Operations Lead",
        "verifier": "Talent Acquisition Lead",
        "tutor_examiner": "Senior Tutor & Certified Examiner",
        "admin": "IT Security & Compliance Lead",
        "management": "Head of Academy",
    }
    assert set(POSITIONS) == {p.key for p in PERSONAS}
    for key, label in POSITIONS.items():
        assert position_record(DOC, label) is not None, (
            "%s: position %r missing from master data" % (key, label)
        )


# ---------------------------------------------------------------------------
# Layer 2 — current bundle vs contract (browser)
# ---------------------------------------------------------------------------

def locked_nav_labels(app):
    """Sidebar upsell entries — marked by their 'click to learn more' tooltip."""
    return [
        t.strip()
        for t in app.page.locator(
            'aside nav button[title*="click to learn more"]'
        ).all_text_contents()
    ]


def test_e2e_agency_upsell_only_for_independent(app):
    """Conforming today: org==null gates Manage Clients."""
    app.sign_in_as_persona(BY_KEY["participant"])       # Dinda, org=null
    assert "Manage Clients" in locked_nav_labels(app)

    app.sign_out()
    app.sign_in_as_persona(BY_KEY["operator"])          # Nadia, has org
    app.switch_role("Participant")
    assert "Manage Clients" not in locked_nav_labels(app)


def test_e2e_independent_hr_gets_talent_search_upsell(app):
    app.sign_in_as_persona(BY_KEY["participant"])       # Dinda: hrFamily, org=null
    labels = locked_nav_labels(app)
    assert "Manage Clients" in labels
    assert "Verify Talent" in labels


def test_bundle_upsell_copy_not_hardcoded():
    """Source-level check: an E2E test cannot catch this because the demo
    personas' orgs coincide with the hardcoded names."""
    import pathlib
    import re

    bundle = (pathlib.Path(__file__).parent.parent / "lsp-unified-app.html").read_text(
        encoding="utf-8", errors="replace"
    )
    # upsellBody values are written as either "..." or template literals `...`
    bodies = re.findall(r'upsellBody:"([^"]*)"', bundle) + re.findall(
        r"upsellBody:`([^`]*)`", bundle
    )
    assert bodies, "no upsell copy found in bundle"
    offenders = [b[:60] for b in bodies if re.search(r"PT [A-Z]", b)]
    assert not offenders, "hardcoded company names in upsell copy: %s" % offenders


def test_e2e_company_participant_gets_corporate_upsell(app):
    app.sign_in_as_persona(BY_KEY["tutor_examiner"])    # Hendra, has org
    app.switch_role("Participant")
    assert "Team Training" in locked_nav_labels(app)
