"""Reference implementation of the intended upsell-targeting rules.

This is the CONTRACT the app should implement, agreed on 2026-08-24:

- Position is no longer free text: it comes from data/positions.json, and
  whether a user "works in HR" is the position's `hrFamily` flag — never a
  regex over a job-title string. Operators / Super Admins can add positions
  (system: false), so the list is extensible without a deploy.

- Corporate upsell ("Team Training"): targeted at users WITH a company that
  do not already manage one (not corporate_admin).

- Talent Search upsell ("Verify Talent"): targeted at companies AND at HR
  individuals — anyone with a company, or anyone whose position is hrFamily,
  who is not already a verifier or operator (both already have Talent Search).

- Agency upsell ("Manage Clients"): unchanged — independent users (org null)
  in the Participant workspace.

- An HR individual WITHOUT a company gets BOTH the agency upsell and the
  Talent Search upsell (explicit product decision).

- Upsell copy must interpolate the user's own org name, never hardcode one.
"""
import json
import pathlib

_DATA = pathlib.Path(__file__).parent.parent / "data" / "positions.json"


def load_positions():
    return json.loads(_DATA.read_text(encoding="utf-8"))


def position_record(doc, label):
    """Resolve a position label (or legacy alias) to its master-data record."""
    aliases = doc.get("legacyAliases", {})
    by_label = {p["label"]: p for p in doc["positions"]}
    by_id = {p["id"]: p for p in doc["positions"]}
    if label in by_label:
        return by_label[label]
    if label in aliases:
        return by_id[aliases[label]]
    return None


def is_hr(doc, position_label):
    rec = position_record(doc, position_label)
    return bool(rec and rec["hrFamily"] and rec["active"])


def upsells_for(user, active_role, doc):
    """Return the ordered list of upsell keys this user should see.

    user: dict with `org` (str|None), `position` (label str), `roles` (list).
    active_role: the workspace currently open.
    """
    roles = set(user["roles"])
    has_company = user["org"] is not None
    hr = is_hr(doc, user["position"])
    out = []

    if active_role == "participant":
        if has_company and "corporate_admin" not in roles:
            out.append("corporate-upsell")
        if not has_company:
            out.append("agency-upsell")

    already_has_search = roles & {"verifier", "operator"}
    if (has_company or hr) and not already_has_search:
        if active_role in ("participant", "corporate_admin"):
            out.append("verifier-upsell")

    if active_role == "verifier" and has_company and "corporate_admin" not in roles:
        out.append("corporate-upsell")

    return out
