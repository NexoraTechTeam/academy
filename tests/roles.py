"""Role/persona definitions for the LSP Unified App, mirrored from the app source.

Personas come from the demo account list on the sign-in screen (`Fd`); the
navigation labels come from the per-role nav map (`qp`) in `lsp-unified-app.html`.
"""

from upsell_rules import load_positions, upsells_for

APP_PATH = "/lsp-unified-app.html"

PARTICIPANT_NAV = [
    "Dashboard",
    "My Profile",
    "Training Catalog",
    "My Trainings",
    "My Exams",
    "Certificates",
    "CPD / CPE",
    "Membership",
]

# Maps the upsell keys the contract (upsell_rules.upsells_for) returns to the
# nav label the bundle actually renders for each — keep in sync with the
# `cu`/`vu`/`au` objects in Fh inside lsp-unified-app.html.
UPSELL_LABELS = {
    "corporate-upsell": "Team Training",
    "verifier-upsell": "Verify Talent",
    "agency-upsell": "Manage Clients",
}

_POSITIONS_DOC = load_positions()


class Persona:
    def __init__(self, key, name, email, role_label, nav, roles, org, position):
        self.key = key
        self.name = name
        self.email = email
        self.role_label = role_label
        self.roles = roles
        self.org = org
        self.position = position
        self._nav = nav

    @property
    def role_keys(self):
        """Internal role keys (as used by upsells_for), not display labels."""
        if self.key == "participant":
            return ["participant"]
        return [self.key, "participant"]

    @property
    def nav(self):
        if self.key == "participant":
            return self.participant_nav
        return self._nav

    @property
    def participant_nav(self):
        """The menu this persona sees while in the Participant workspace —
        base nav plus whatever upsells the contract says this user qualifies
        for there (org, HR-family position, and existing roles all matter)."""
        user = {"org": self.org, "position": self.position, "roles": self.role_keys}
        extra = [UPSELL_LABELS[k] for k in upsells_for(user, "participant", _POSITIONS_DOC)]
        return list(PARTICIPANT_NAV) + extra

    def __repr__(self):
        return "<Persona %s>" % self.key


PERSONAS = [
    Persona(
        key="participant",
        name="Dinda Pramesti",
        email="dinda.pramesti@gmail.com",
        role_label="Participant",
        nav=PARTICIPANT_NAV,
        roles=["Participant"],
        org=None,
        position="Freelance HR & Competency Consultant",
    ),
    Persona(
        key="corporate_admin",
        name="Ratna Wijayanti",
        email="ratna.w@sumbermakmur.co.id",
        role_label="Corporate Admin",
        nav=[
            "Dashboard",
            "Employees",
            "Internal Trainings",
            "Assign Training",
            "Certificates & CPD",
            "Verify Talent",
        ],
        roles=["Corporate Admin", "Participant"],
        org="PT Sumber Makmur",
        position="HR & L&D Manager",
    ),
    Persona(
        key="operator",
        name="Nadia Iskandar",
        email="nadia.iskandar@deacademy.id",
        role_label="Operator",
        nav=[
            "Dashboard",
            "Reports & Analytics",
            "Participants",
            "Trainings",
            "Corporate Accounts",
            "Staff Assignments",
            "CPD & Evidence",
            "Certificate Templates",
            "Talent Search",
            "Access Requests",
            "Certification Schemes",
            "Question Bank",
            "Exam Builder",
        ],
        roles=["Operator", "Participant"],
        org="DeAcademy Staff",
        position="Platform Operations Lead",
    ),
    Persona(
        key="verifier",
        name="Kevin Wijaya",
        email="kevin.wijaya@cakratech.co.id",
        role_label="Employer / Verifier",
        nav=["Dashboard", "Talent Search", "Billing", "Team Training"],
        roles=["Employer / Verifier", "Participant"],
        org="PT Cakra Teknologi Indonesia",
        position="Talent Acquisition Lead",
    ),
    Persona(
        key="tutor_examiner",
        name="Hendra Wijaya",
        email="hendra.wijaya@deacademy.id",
        role_label="Tutor / Examiner",
        nav=["Dashboard", "Grading Queue", "Exam Review", "Eligibility Verifications", "CPD & Evidence", "Tasks"],
        roles=["Tutor / Examiner", "Participant"],
        org="DeAcademy Staff",
        position="Senior Tutor & Certified Examiner",
    ),
    Persona(
        key="admin",
        name="Arya Wicaksono",
        email="arya.wicaksono@deacademy.id",
        role_label="Super Admin",
        nav=[
            "Overview",
            "User Directory",
            "Roles & Permissions",
            "Organizations",
            "Security & SSO",
            "Audit Log",
        ],
        roles=["Super Admin", "Participant"],
        org="DeAcademy Staff",
        position="IT Security & Compliance Lead",
    ),
    Persona(
        key="management",
        name="Surya Dharmawan",
        email="surya.dharmawan@deacademy.id",
        role_label="Management",
        nav=["Dashboard", "Reports"],
        roles=["Management", "Participant"],
        org="DeAcademy Staff",
        position="Head of Academy",
    ),
]

BY_KEY = {p.key: p for p in PERSONAS}
