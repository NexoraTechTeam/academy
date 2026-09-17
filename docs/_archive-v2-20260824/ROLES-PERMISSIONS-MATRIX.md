# DeAcademy — Roles & Permissions Matrix (v2)

Legend: **C**reate · **R**ead · **U**pdate · **D**elete · **A**pprove/Decide · — (no access)

| Resource | Participant | Operator | Tutor | Examiner | Corporate Admin (PIC) | Employer/Verifier |
|---|---|---|---|---|---|---|
| Own profile & competency data | CRU | R (all users) | — | — | R (own company's employees only) | R (public/consented data only) |
| Training catalog (public) | R | CRUD | R | R | R | — |
| Internal trainings (own company) | — | **R metadata only, no content** | R (if assigned) | R (if assigned) | CRUD (own company only) | — |
| Internal trainings (other company) | — | — | — | — | — | — |
| Lesson content authoring (video/slides+audio) | — | CRUD (public catalog) | — | — | CRUD (own internal trainings) | — |
| Enrollments | R (own), C (self-enroll) | CRUD (all) | R (assigned cohort) | R (assigned cohort) | CRU (own employees) | — |
| Quiz attempts (incl. practice retakes) | CRU (own) | R (all) | R (own cohort, read-only) | — | R (own employees) | — |
| Exercise / Workshop submissions (incl. replace before review) | CRU (own) | R (all) | R + **A** (grade, request revision, **view in-app only, no download**) | — | R (own employees) | — |
| Exam attempts & decisions | C (own), R (own) | R (all) | — | R + **A** (Competent / Not Yet Competent) | R (own employees, result only) | R (if consented, via Full Report) |
| Certificates & status lifecycle | R (own) | CRUD (issue), U (status transitions) | — | — | R (own employees) | R (if consented / public) |
| Competency Currency Attestations | C (own), R (own) | R (all), **A** (operator_verified, if applicable) | — | — | **A** (employer_verified, own employees) | R (if consented, via Full Report) |
| CPD records | RU (own) | R (all) | — | — | R (own employees) | R (if consented, Full Report only) |
| Staff assignments (tutor/examiner) | — | CRUD | R (own) | R (own) | — | — |
| Corporate accounts | — | CRUD (incl. manual provisioning) | — | — | RU (own company profile) | — |
| Employees / seats (incl. Employee ID, department) | — | R (all) | — | — | CRUD (own company, ID unique per company) | — |
| Membership & billing (participant) | RU (own) | R (all, support) | — | — | — | — |
| Portfolio privacy / consent settings | CRU (own) | R (own, support only) | — | — | — | — |
| Profile view analytics (own) | R (own) | R (all) | — | — | — | — |
| Verification requests | R + **A** (approve/deny, own profile) | R (all, support) | — | — | — | C, R (own requests) |
| Verifier search history & match/gap analytics | — | R (all, aggregate) | — | — | — | R (own) |
| Verifier account & billing | — | R (all) | — | — | — | CRU (own) |
| Reports & analytics (business-wide) | — | R | — | — | R (own company scope only) | R (own account scope only) |
| Generate Report (export) | — | C (own portal scope) | — | — | C (own company scope) | C (own account scope) |

## Prinsip Kunci

1. **Isolasi Multi-Tenant**: Corporate Admin hanya boleh mengakses data perusahaannya sendiri (`company_id` scoping wajib). Operator DeAcademy boleh melihat *metadata* training internal (jumlah, status, enrollment count), tapi **tidak** boleh membaca konten aktual (deskripsi, syllabus, video, slide, audio).
2. **Consent-Gated Data**: Data kompetensi detail (skor ujian, riwayat CPD, transkrip, Competency Currency Attestation) ke Employer/Verifier hanya boleh diserialize backend setelah memvalidasi `portfolio_settings.consent_level` dan/atau `verification_requests.status = approved`. Validasi di server, bukan hanya disembunyikan di frontend.
3. **Separation of Duties**: Tutor dan Examiner adalah permission set berbeda. Untuk training bertipe sertifikasi resmi, sistem sebaiknya memperbolehkan (tidak wajib) menugaskan orang berbeda demi independensi.
4. **Employer-Verified Attestation**: Corporate Admin (PIC) punya kewenangan khusus meng-approve **Competency Currency Attestation** milik karyawannya sendiri — menghasilkan badge "Employer-Verified" yang lebih kuat daripada self-attested. Untuk peserta individu (non-corporate), atestasi tetap self-attested kecuali Operator memutuskan untuk memverifikasi manual (`operator_verified`) — kebijakan ini masih open question, lihat PRD §8.
5. **Report Generation Scope**: Setiap role manajemen (Operator, Corporate Admin, Employer/Verifier) hanya bisa generate laporan dalam scope data yang mereka punya akses baca — mis. Corporate Admin tidak bisa generate laporan lintas perusahaan.
6. **Employee ID Uniqueness**: divalidasi per `company_id`, bukan global — dua perusahaan boleh punya format/nilai Employee ID yang sama tanpa konflik.
7. **Audit Trail**: Setiap aksi approve/deny (grading, exam decision, verification request, attestation co-sign) dan setiap `report_generations` sebaiknya dicatat di tabel `audit_log` — penting untuk sertifikasi profesi yang bisa diaudit regulator.
