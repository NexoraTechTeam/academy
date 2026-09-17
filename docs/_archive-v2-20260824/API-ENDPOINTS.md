# DeAcademy — API Endpoint Draft (High-Level)

Ini bukan spesifikasi OpenAPI lengkap — tujuannya membantu developer melakukan estimasi & scoping teknis sebelum menentukan struktur API final (REST/GraphQL, versioning, dsb). Dikelompokkan per modul, mengikuti alur yang sudah divalidasi di prototype UI.

---

## Auth & Identity
- `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- `GET /me` — profile + roles aktif

## Catalog & Purchase
- `GET /trainings?visibility=public&category=&search=`
- `GET /trainings/:id` — detail lengkap (objectives, syllabus)
- `POST /cart/checkout` — body: items, buyer_type (individual/corporate)

## Course Player
- `GET /enrollments/:id/curriculum` — modules → lessons/quiz/exercise/workshop/exam + status lock/unlock per item
- `POST /lessons/:id/complete` (video/slides)
- `POST /quizzes/:id/attempt` — body: answers, is_practice
- `POST /exercises/:id/submit` — file_url; `PATCH /exercises/:id/submit` untuk replace sebelum direview
- `POST /exams/:id/submit`

## Tutor & Examiner
- `GET /tutor/queue?type=exercise|workshop`
- `POST /tutor/submissions/:id/grade` — score, feedback, action (approve/request_revision)
- `GET /examiner/queue`
- `POST /examiner/exams/:id/decide` — decision, comment

## Certificates & CPD
- `GET /certificates?user_id=` — termasuk field `status`
- `POST /certificates/:id/currency-attestation` — evidence_type, file_url, note, request_employer_cosign
- `POST /cpd/activities` — cycle_id, category, hours, evidence_file_url

## Membership & Portfolio (Participant)
- `GET/PATCH /membership` — plan, auto_renew
- `POST /membership/renew`
- `GET/PATCH /portfolio-settings` — is_public, consent_level
- `PATCH /certificates/:id/visibility`
- `GET /portfolio/views?period=this_month`

## Verification Marketplace
- `GET /public/portfolio/:slug` — data sesuai consent_level
- `POST /verification-requests` — dari verifier, ke participant
- `PATCH /verification-requests/:id` — approve/deny (oleh participant)
- `GET /verification-requests/:id/full-report` — hanya jika status=approved

## Employer/Verifier Portal
- `GET /talent-search?competency=&region=&experience=`
- `GET /verifier/search-history` — untuk match rate & skill gap analytics
- `GET/POST /verifier/billing`

## Corporate Admin Portal
- `GET/POST /companies/:id/employees` — termasuk employee_id (unique per company), department
- `POST /companies/:id/internal-trainings` — CRUD scoped ke company_id
- `POST /companies/:id/assign-training` — training_id, employee_ids[], deadline
- `GET /companies/:id/dashboard` — compliance, on-time vs late, satisfaction

## Operator Console
- `GET /admin/dashboard`, `GET /admin/reports?filters=`
- `POST /admin/companies` — manual provisioning (status=pending_activation)
- `POST /admin/trainings/:id/lesson-content` — set contentType per module
- `GET /admin/staff-assignments`, `POST /admin/staff-assignments`

## Reporting (semua 3 portal manajemen)
- `POST /reports/generate` — body: portal, period, sections[] → returns file_url + report_generations log entry

---

## Catatan untuk Developer

1. Endpoint bertanda **consent-gated** (certificates detail, CPD, exam scores untuk verifier) wajib validasi `portfolio_settings.consent_level` dan/atau `verification_requests.status` di server — lihat `ROLES-PERMISSIONS-MATRIX.md` §2.
2. Endpoint training internal wajib scoped `owner_company_id` via RLS — lihat `DATA-MODEL.md` §8.
3. Rekomendasikan versioning API sejak awal (`/v1/...`) mengingat kompleksitas 8 portal yang akan terus berkembang.
