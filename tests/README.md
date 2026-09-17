# LSP Unified App — Playwright Test Suite

End-to-end coverage for all seven roles in `lsp-unified-app.html`.

## Why Python Playwright

This machine has no Node.js/npm, so the suite uses the Python Playwright
bindings instead of `@playwright/test`. Same browser engine, equivalent API.

## Run

```bash
./run-tests.sh
```

That is the whole setup — the script creates `.venv`, installs Playwright and
Chromium on first run, starts `.claude/serve.py` on port 4173 if nothing is
listening, then runs pytest.

Useful flags (passed straight through to pytest):

- `./run-tests.sh -k operator` — one role only
- `./run-tests.sh --headed` — watch the browser
- `./run-tests.sh -k test_every_view_renders` — view smoke test only
- `./run-tests.sh -v` — full diffs on nav mismatches

Override the target with `LSP_BASE_URL`, or the port with `PORT`.

## Coverage — 92 tests, all passing

| Test | What it checks |
|---|---|
| `test_public.py` (3) | landing page, guest catalog browsing, guest talent search — all without login |
| `test_roles.py::test_login_renders_role_shell` (7) | each persona signs in and lands on its own workspace |
| `test_roles.py::test_nav_matches_role` (7) | sidebar menu matches that role's declared nav exactly |
| `test_roles.py::test_every_view_renders` (7) | every menu entry of every role opens without a crash or console error |
| `test_roles.py::test_sign_in_with_email_form` (7) | the credential form resolves each persona by email |
| `test_roles.py::test_role_switch` (6) | dual-role personas switch into Participant and back |
| `test_roles.py::test_sign_out` (7) | sign out tears the shell down and returns to the public landing |
| `test_upsell_matrix.py` (20) | upsell-targeting contract matrix + master-data integrity — all 20 pass; see status note below |
| `test_exam_module.py` (9) | v3.4 exam-decoupling: guest exam catalog, My Exams (3 registration states), start-exam-from-My-Exams, course player has no exam item, Examiner's split queues, eligibility approve; v3.5.1 Request More Info round-trip (Examiner → Participant → Examiner, same session); v3.6.1 responding with a re-uploaded document, not just text |
| `test_ux_filters_and_requests.py` (10) | v3.5 UX fixes: Exam Catalog filters (seat availability + derived options), Talent Search Position filter, Assign Training bulk-select-by-department with recurrence-cooldown skip, Access Requests queue (submit → Operator approve), upsell-modal request-type regression; v3.6 payment gates: Verifier Full Access (locked → activate → unlocked, independent of consent), messaging after activation, Operator `asOperator` bypass, Corporate activation fee (Unpaid → Mark as Paid) |
| `test_content_authoring.py` (3) | v3.7 content-authoring gaps: Corporate Admin adding a syllabus unblocks the "Manage Content" dead end; Operator adding a Certification Scheme reaches the guest Exam Catalog (proves shared state, not a local copy); Operator scheduling a new exam session for an existing scheme |
| `test_question_bank_and_exam_authoring.py` (4) | v3.8 Question Bank + Exam Authoring + Stable-ID Migration: Operator creates and publishes a question in the Question Bank; Operator builds an Exam Definition from bank questions in Exam Builder; adding a new scheme doesn't relabel existing eligibility verifications' scheme references (stable-id regression); deleting a scheme with dependents is blocked with a visible reason |
| `test_assign_training.py` (2) | v3.9 Assign Training → My Trainings: Corporate Admin assigning a training to an employee who's also a real login persona (Ratna Wijayanti) makes it appear in her own Participant-workspace My Trainings; Dinda's existing My Trainings list is unaffected (additive fix, no regression) |

Every view is asserted to be free of React error-boundary markers, non-empty,
and free of console errors / uncaught exceptions.

## Roles and personas

| Role | Persona | Menu items |
|---|---|---|
| Participant | Dinda Pramesti | 9 |
| Corporate Admin | Ratna Wijayanti | 6 |
| Operator | Nadia Iskandar | 13 |
| Employer / Verifier | Kevin Wijaya | 4 |
| Tutor / Examiner | Hendra Wijaya | 6 |
| Super Admin | Arya Wicaksono | 6 |
| Management | Surya Dharmawan | 2 |

Personas mirror the demo accounts in `Fd`; menus mirror the per-role nav map
`qp` in the app source. A few details are modelled explicitly in `roles.py`:

- The Participant menu gains locked upsell entries computed per user by the
  contract in `upsell_rules.py` / `Persona.participant_nav` — **Manage
  Clients** when `org === null` (Dinda only among the demo personas),
  **Team Training** when the user has a company and isn't already
  `corporate_admin`, and **Verify Talent** when the user has a company or an
  HR-family position and doesn't already hold `verifier`/`operator`. Most
  personas switching into Participant pick up one or both of the latter two.
- `Certificates` (Participant) and `Certificates & CPD` (Corporate Admin) share
  a nav key but render different labels.
- Management's two tabs (`Dashboard`, `Reports`) hold a self-contained
  executive workspace (24 months of sample data, KPI comparisons, filterable
  reports, rule-based "Perlu Perhatian" alerts) — added directly to the bundle
  on 2026-08-26, following the same role-map/nav-map/render-switch pattern as
  the other six roles. Its design reference (data model, filters, layout) was
  first validated as a standalone prototype, now archived at
  `docs/_archive-v2-20260824/management-dashboard-preview.html`.

Screenshots of every view land in `tests/artifacts/` (git-ignored).

## Upsell-targeting contract (2026-08-24)

`tests/upsell_rules.py` is the reference implementation of the agreed rules;
`data/positions.json` is the position master data (147 entries, 15 categories,
26 flagged `hrFamily`, plus `legacyAliases` for bare legacy titles).

- Position is a dropdown from master data, never free text. "Works in HR" is
  the position's `hrFamily` flag. Operators / Super Admins can add positions
  (`system: false`); deactivate rather than delete.
- Corporate upsell → users with a company who aren't corporate_admin.
- Talent Search upsell → companies AND HR individuals (not verifier/operator).
- Agency upsell → independent users (org null), unchanged.
- An HR individual without a company gets BOTH agency and Talent Search.
- Upsell copy interpolates the user's own org — never a hardcoded name.

**Status: fully implemented (2026-09-08).** The bundle's `Fh` shell component
now computes all three upsells dynamically per user (`org`, `roles`,
`position`) instead of the old static per-role entries — matching this
contract exactly, including the two previously-missing cases (independent HR
gets both upsells; company participants get the corporate upsell) and
org-interpolated copy. No `xfail` markers remain in `test_upsell_matrix.py`;
a regression here now fails outright. Both this and the Management role
addition live directly in the minified bundle — no separate source project
exists for it.

## Exam Module — decoupled from Training (2026-09-08, v3.4)

Insight from user testing (compared against PECB's real "Exam Events" flow): exam used
to be the last item inside a training's course player, so a candidate could never sit
the certification exam without first enrolling in that specific training. `tests/test_exam_module.py`
locks in the fix:

- Exam is a first-class module, reachable two ways: **training-path** (finish a training,
  land in My Exams already eligible, exam fee included) and **direct-path** (browse the
  Exam Catalog — guest-visible, no account needed — and register directly).
- Direct-path branches per scheme (`Ew` sample data): **open registration** (pay the exam
  fee, done) vs **eligibility-required** (pay a verification fee, submit evidence, wait
  for an Examiner to approve before the exam fee unlocks).
- The exam-taking UI itself (`bh` — intro, timer, questions, submit) is **reused**, not
  duplicated: it now opens from My Exams instead of from inside the course player.
- Examiner's queue split into **Exam Review** (decide Competent / Not Yet Competent) and
  **Eligibility Verifications** (approve/reject direct-path applications) — two different
  review responsibilities that used to be conflated.

Reference: `docs/PRD.md` §4.18, `docs/DATA-MODEL.md` §3a, `docs/PROCESS-FLOWS.md` §10–11.

## UX fixes from the lampiran review (2026-09-10, v3.5)

Follow-up review compared the mockup against real-world patterns again (PECB exam
events, position-based talent filtering) and surfaced 4 gaps. `tests/test_ux_filters_and_requests.py`
locks in the fixes:

- **Exam Catalog filters**: scheme, scheme type (BNSP/KAN/International/Other), language,
  exam date, seat availability (Open/Filling Fast/Full). Dropdown options are derived from
  the live `Ew` data (`[...new Set(...)]`), never a hardcoded list — a new scheme with a new
  type or language shows up as a filter option automatically.
- **Find Verified Talent gains a Position filter**, reusing the same derive-from-data pattern
  as the existing Certification/Experience filters.
- **Assign Training bulk-select-by-department**: the old "Select All Filtered" button compared
  array *lengths* rather than membership, so switching department filters and clicking it again
  silently discarded the previous department's selection. Fixed to a proper union/difference
  toggle, with a dynamic "Select All in {Department}" label. Trainings can now carry a
  `recurrenceMonths` cooldown (e.g. annual refresher) — bulk-select automatically skips anyone
  still inside that window for the selected training (shown as "Not Due Until ..."), while still
  allowing a manual override per employee.
- **Access Requests**: clicking "Request Corporate/Verifier/Agency Access" in the upsell modal
  used to be a local boolean with no persisted record anywhere — the request vanished the moment
  the modal closed, and no persona could ever see or act on it. It's now a shared list surfaced in
  a new Operator "Access Requests" tab (approve/reject, same pattern as Examiner's Eligibility
  Verifications queue) — deliberately **not** on Management, which stays strictly read-only.
  Fixing this also caught a pre-existing copy bug: the modal's request-type was never passed
  through from the sidebar nav item, so every confirmation message said "Corporate access"
  regardless of which upsell (Corporate/Verifier/Agency) was actually opened.

## Eligibility Verification — Request More Info (2026-09-10, v3.5.1)

User asked directly: when bukti kurang lengkap or unclear, does the Examiner
really have to Reject outright (which auto-triggers a 50% refund)? Answer was
no — this needed a third option. `tests/test_exam_module.py::test_examiner_can_request_more_info_and_participant_can_respond`
locks in the fix, and is deliberately the first test in this suite to prove a
record is genuinely *shared* across two personas in one browser session (sign
out, sign back in as the other persona, same page — not two independent
mocks):

- Examiner's Eligibility Verifications queue gains **Request More Info** next
  to Approve/Reject — opens a note field, sets `status=needs_more_info`, hides
  the decision buttons until the candidate responds.
- The candidate sees the note on **My Exams** (badge "Action Needed"), can
  type a response, which flips `status` back to `pending` — no refund, no new
  registration needed.
- Back in the Examiner's queue, both the original request and the candidate's
  response are visible, and Approve/Reject/Request More Info are available
  again.
- Gotcha carried over from the exam-catalog work: the Examiner queue's status
  badge uses the `O` component (title case, e.g. "Pending Review"), but My
  Exams' badge is a raw `<span>` with `text-transform:uppercase` — assertions
  against My Exams text must be lower/upper-cased before comparing, or they'll
  flakily fail on casing alone even though the feature works.

## Payment gates — Verifier Full Access & Corporate activation fee (2026-09-10, v3.6)

User tested the Access Requests feature and flagged the real gap directly: approval
alone isn't enough — two of these upgrades need payment, and each is independent of a
mechanism that already existed. `tests/test_ux_filters_and_requests.py` locks in both:

- **Verifier Full Access**: seeing a candidate's phone/email, and messaging them, is
  now paywalled — an annual flat fee (not pay-per-request), activated self-service from
  the Billing tab, no Operator approval needed. Critically, this gate is **separate from
  the candidate's own consent** (`portfolio_settings.consent_level`): a candidate who's
  already approved the Full Verification Report still hides their phone/email from a
  verifier who hasn't activated Full Access. `asOperator` (internal DeAcademy staff using
  the same search UI) bypasses the paywall entirely — they were never meant to pay for it.
- **Corporate activation fee**: approving a `request_type=corporate` Access Request still
  grants the role immediately (unchanged), but now also starts an `activationFeeStatus:
  "unpaid"` sub-step, shown as its own row in Operator's queue with a "Mark as Paid"
  button — mirroring the exact `pending_activation` + manual-invoice precedent that
  already existed for operator-provisioned companies (`Kv`/`Qv`), rather than inventing a
  new pattern. This is deliberately **not** wired into the Corporate Admin dashboard
  (`zv`) itself — that component takes no persona/company prop at all, and several
  existing tests depend on it rendering unconditionally; gating it would have been a much
  larger, riskier change for a gap that only actually existed on the approval side.

## Request More Info can carry a document, not just a note (2026-09-10, v3.6.1)

User reviewed the local build and noticed directly: the response form only had a
textarea — no way for Dinda to actually re-upload a document, even though "the
document I uploaded is unreadable" is exactly the kind of thing Examiners ask
for. `tests/test_exam_module.py::test_participant_can_attach_a_document_when_responding_to_more_info`
locks in the fix:

- The response form reuses the app's existing `fo` file-picker component (already
  used everywhere else — CV uploads, certificate proof, workshop submissions) rather
  than inventing a new one.
- Sending is enabled if **either** the note or the file is filled in — not both
  required.
- Caught and fixed a real display bug while writing this test: the Examiner-side
  "Participant response" line, and the participant's own "Your previous response"
  recap, were both gated on the *text* field alone (`v.participantResponse&&...`).
  A file-only response (empty string for the text) evaluated falsy and silently
  never rendered on either side, even though the record was saved correctly —
  fixed by gating on `(text||file)` instead of `text` alone.

## Content authoring gaps closed (2026-09-15, v3.7)

The user asked directly how training material, quizzes, and exams actually get
created, and who does it — a question that surfaced two real gaps once checked
against the live bundle instead of just the docs. `tests/test_content_authoring.py`
locks in both fixes:

- **Corporate Admin's Internal Trainings dead end**: "Create Internal Training"
  only ever collected a title and category, the resulting training object had no
  `syllabus` array, and there was no Edit button anywhere in that tab — so
  "Manage Content" permanently showed its empty-syllabus message with no way
  out. Fixed by reusing the exact module editor (`jv`) already built for
  Operator's own training form — a lightweight modal wrapper around it, launched
  from a new "Edit Syllabus" button next to "Manage Content".
- **Certification Schemes & Exam Events**: `docs/PRD.md` §4.18 has said since
  v3.4 that Operator should be able to manage certification schemes (toggle
  eligibility verification, set fees) and schedule exam events — but `Ew` (the
  schemes data) was a bare constant with zero setter anywhere in the bundle;
  the only UI was a read-only guest browse page. Fixed by lifting `Ew` into
  shared state at the top-level app component (same pattern as
  `eligibilityVerifications`/`accessRequests`) and building Operator a real
  screen: add+edit schemes, add+edit+remove exam sessions. Deliberately **no
  scheme delete** — schemes are referenced by array index elsewhere in the
  prototype (`Gw`, `ch`), and deleting one would shift indices and silently
  break those references; removing an *event* is safe since nothing stores a
  persistent reference to one outside its own render.
- Confirmed **out of scope, unchanged**: authoring the actual quiz/exam
  *question content* (text, options, correct answers) — that's still static
  seed data (`Od`, `hh`) with no setter anywhere, for any role. The user asked
  about the two gaps above specifically, not a full question-bank editor.

## Question Bank + Exam Authoring + Stable-ID Migration, Phase 1 (2026-09-16, v3.8)

Direct continuation of the "out of scope" line above — the user asked to
proceed with it after a user-supplied corrective-implementation document
(demanding production-backend features this client-side-only prototype can't
have) was assessed, discarded, and the underlying issue tackled with a scope
calibrated to what the prototype can actually support.
`tests/test_question_bank_and_exam_authoring.py` locks in the result:

- **Question Bank**: `Od`/`hh` (static seed questions with zero setter) are
  migrated into real shared state (`questionBanks`) as genuine initial
  records, not deleted. Operator gets a real authoring screen — 5 question
  types, per-type answer editors, explanation/difficulty/topic/tags/points,
  draft/published/retired status, and a "Preview as Candidate" that mirrors
  the actual exam-taking rendering.
- **Exam Builder**: a new `examDefinitions` shared-state layer sits between
  Question Bank and the exam-taking component (`bh`), which is rewired to
  read questions/passing-score/duration from a definition instead of the
  hardcoded `Od` constant — with a fallback to the old behavior for any
  scheme that doesn't have a published definition yet, so nothing regresses.
- **Stable-ID Migration**: `schemeIdx` (array-index references to
  `certification_schemes`, 9 call sites across the Examiner queue,
  participant My Exams, and two `Gd`-level seed arrays) is replaced with a
  real `schemeId` foreign-key lookup everywhere — the actual prerequisite
  that finally makes **deleting a certification scheme** safe. Delete is
  real now, blocked with a visible reason (dependent eligibility
  verifications, or sessions with taken seats) instead of the "no delete
  button at all" from v3.7.
- Gotcha hit while writing this: `get_by_role("textbox").first` inside a
  freshly-opened modal can resolve to an unrelated textbox earlier in the DOM
  (the page header's search box) rather than the modal's own first field —
  fixed by giving the Question stem and Exam name inputs real placeholders
  and targeting those directly, the same pattern already used for every other
  form in this suite.
- **Deliberately out of scope (Phase 2, documented not built)**: a separate
  review/approval workflow with distinct Reviewer/Approver actors, immutable
  question versioning with per-attempt snapshots, matching/ordering question
  types, bulk import/export, exam blueprints, a dedicated manual-scoring
  queue, and question/exam analytics. See `docs/DATA-MODEL.md` §3b.

## Assign Training → My Trainings (2026-09-16, v3.9)

User asked directly whether a Corporate Admin's internal training assignment
ends up merged into a participant's "My Trainings" (design answer: yes, one
unified list). Checking that answer against the live code surfaced a real
gap: the Assign button never wrote anything anywhere — it just flipped a
local boolean to show a success banner. `tests/test_assign_training.py`
locks in the fix:

- A new `assignedTrainings` array was lifted to `Gd` (same pattern as
  `schemes`/`questionBanks`), written by the Assign Training handler and read
  back by the participant's My Trainings render — **additive**, not a
  replacement of the existing `uo` mock array, so none of the other 90 tests'
  expectations about My Trainings content could regress.
- Only one of the ten sample employees corresponds to a real login persona:
  Ratna Wijayanti (Corporate Admin, id `2`), added to the employee list with
  a `personaId` field the other nine don't have — the only way to
  demonstrate "assign → that person sees it" end-to-end via an actual
  sign-in, since the other nine are pure fiction with no backing account.
- **A research mistake caught by manual verification, not by the
  balance-checker**: the first implementation targeted the wrong render
  branch. An Explore agent's report claimed the rich `uo`-based My Trainings
  view (progress bars, quiz/exercise/workshop trackers) was shown to every
  persona except Dinda — backwards. The actual condition is
  `Yt=l?.id===1` (true *only* for Dinda) guarding `if(!Yt){...simpler `Dt`
  branch...} return ...`uo`branch``, so the rich branch is Dinda-exclusive and
  every other persona (including Ratna-as-Participant) gets the simpler
  `Dt`-shaped list. Signing in as Ratna after the first pass still showed
  "Nothing enrolled yet" — caught by actually loading the page, not by
  re-reading the code. Fixed by moving the merge into the branch Ratna
  (and everyone else) genuinely renders.
- Locator gotcha: adding "Ratna Wijayanti" as an employee row makes her name
  ambiguous between that row and the account-menu button (`helpers.py`'s
  `account_button()` matches by name substring) — the test navigates off the
  Assign Training tab before calling `switch_role()` so the employee row is
  no longer in the DOM to conflict with the lookup.
