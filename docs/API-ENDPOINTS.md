# DeAcademy — API Endpoint Draft (High-Level, v3.8)

**Changelog v3.8 (2026-09-16):** Question Bank + Exam Authoring + Stable-ID
Migration, Phase 1 (see `DATA-MODEL.md` §3b for the data model and its
documented Phase 1/Phase 2 split). New Operator-only endpoints:
`GET/POST /operator/question-banks`, `GET/PATCH /operator/question-banks/:id/questions/:question_id`
(create/edit/publish/retire), `GET/POST /operator/exam-definitions`,
`PATCH /operator/exam-definitions/:id`. `DELETE /operator/certification-schemes/:id`
is now real (previously undocumented as unsupported) — returns `409` with a
`blockers[]` array naming what's still referencing the scheme
(eligibility verifications, exam events with taken seats) instead of a plain
403; succeeds only when `blockers` would be empty. All `certification_scheme_id`
references across existing endpoints now assume a stable id end-to-end — no
endpoint change there, since the API draft was always id-based; the fix was
entirely in the prototype's own client-side code (see `DATA-MODEL.md` §3a).

**Changelog v3.7 (2026-09-15):** `certification-schemes`/`exam-events` admin
endpoints were documented since v3.4 but never had a UI — Operator now has a
real screen for both (add+edit schemes, add+edit+remove sessions; no scheme
delete, see `DATA-MODEL.md` §3a). New
`PATCH /companies/:id/internal-trainings/:training_id/syllabus` closes a real
dead end: internal trainings previously could never get a syllabus, so
"Manage Content" was unreachable.

**Changelog v3.6.1 (2026-09-10):** `POST /me/eligibility-verifications/:id/respond`
menerima `response_file` — balasan "Request More Info" boleh dokumen re-upload,
bukan cuma teks. Lihat `DATA-MODEL.md` §3a.

**Changelog v3.6 (2026-09-10):** dua payment gate baru. `GET /talent-search`
kini menyembunyikan `phone`/`email` di server kecuali verifier punya
`plan=full_access` (`POST /verifier/full-access/activate`, self-service,
independen dari consent kandidat) + endpoint baru
`POST /talent-search/:id/message`. `PATCH /operator/access-requests/:id/decide`
untuk `request_type=corporate` tidak lagi berarti "selesai" — endpoint baru
`PATCH .../activation-fee` untuk Operator menandai biaya aktivasi lunas. Lihat
`DATA-MODEL.md` §6, §9c.

**Changelog v3.5.1 (2026-09-10):** action `request_more_info` di
`POST /examiner/eligibility-verifications/:id/decide`, endpoint baru
`POST /me/eligibility-verifications/:id/respond` — Examiner bisa minta info
tambahan tanpa Reject (yang otomatis memicu refund), kandidat membalas dari My
Exams.

**Changelog v3.5 (2026-09-10):** 4 perbaikan UX dari review lampiran. Exam Catalog
& Talent Search dapat query param filter baru (scheme type/language/date/seat
status; position). Assign Training menerima `department` sebagai shortcut
bulk-select, server yang menghitung siapa `not_yet_due`. Endpoint baru untuk
modul **Access Requests** (Operator) — sebelumnya klik "Request Corporate/
Verifier/Agency Access" tidak pernah tersimpan di server sama sekali.

**Changelog v3.4 (2026-09-08):** modul **Exam** dipisah dari Course Player — endpoint baru untuk certification schemes, eligibility verification, exam events (terjadwal), dan exam registrations. `POST /exams/:id/submit` pindah dari Course Player ke modul Exam baru.

**Changelog v3 (2026-08-24):** modul **Positions (master data)**, **Super Admin**, **Public/Guest**, field `upsells` di `GET /me`, dan penyesuaian signup memakai `position_id`.

Ini bukan spesifikasi OpenAPI lengkap — tujuannya membantu developer melakukan estimasi & scoping teknis sebelum menentukan struktur API final (REST/GraphQL, versioning, dsb). Dikelompokkan per modul, mengikuti alur yang sudah divalidasi di prototype UI.

---

## Auth & Identity
- `POST /auth/register` — body wajib menyertakan `position_id` (dari master data, bukan free text)
- `POST /auth/login`, `POST /auth/logout`, `POST /auth/refresh`
- `POST /auth/sso/:company_slug` — SSO enterprise (lihat `sso_connections`)
- `GET /me` — profile + roles aktif + **`upsells[]`** (hasil evaluasi aturan `DATA-MODEL.md` §9, dihitung server-side agar konsisten lintas client)
- `PATCH /me` — edit profil; `position_id` divalidasi terhadap `positions.is_active=true`

## Positions — Master Data (BARU)
- `GET /positions?active=true&category=&search=` — untuk dropdown signup/profil (akses publik, karena dipakai form register)
- `POST /admin/positions` — Operator/Super Admin; body: label, category, is_hr_family → `is_system=false`, tercatat di audit_log
- `PATCH /admin/positions/:id` — edit entri non-system, atau toggle `is_active` untuk entri apa pun
- `DELETE /admin/positions/:id` — hanya entri non-system yang belum pernah direferensikan user
- `GET /admin/positions/:id/usage` — jumlah user yang memakai (guard sebelum nonaktif/hapus)

## Certificate Verification (BARU v3.1)
- `GET /public/verify/:certificate_number` — gratis: pemegang, training, issued_at, status lifecycle; rate-limited, log ke `certificate_verification_events`
- `POST /verifier/bulk-verify` — body: certificate_numbers[] → tabel hasil + export; **berbayar** (plan verifier)

## Waitlist (BARU v3.1)
- `POST /trainings/:id/waitlist` — user login atau guest (email); saat seats habis
- `GET /admin/waitlists?training_id=` — agregat + daftar prospek (Operator)

## Demand Engine (BARU v3.1)
- `GET /admin/demand-insights?period=&region=` — agregasi verifier_search_history matched=false (Operator)
- Badge demand di `GET /public/trainings` & `GET /trainings` (field `demand_count_30d`)

## Compliance Reminders (BARU v3.1)
- `GET /me/compliance-calendar.ics` — ekspor kalender CPD/attestation/deadline
- `GET /companies/:id/lapse-risk-digest` — Corporate Admin, bulanan

## Upsell Analytics (v3.1 — wajib)
- `POST /me/upsell-events` — body: upsell_key, event (shown|clicked); conversion diisi server saat aktivasi produk terkait

## Public / Guest (BARU — tanpa autentikasi)
- `GET /public/trainings?category=&search=` — katalog publik: judul, harga, jadwal, format
- `GET /public/trainings/:id`
- `GET /public/talent-search?competency=&region=&experience=&position=` (param `position` BARU v3.5 — filter by `users.position_id`, opsi dropdown di-derive dari master data `positions`, bukan hardcode) — hanya profil opt-in publik; ringkasan gratis
- `GET /public/portfolio/:slug` — sudah ada di v2, tetap
- `GET /public/certification-schemes?search=&scheme_type=&language=` (param `scheme_type`/`language` BARU v3.5) — skema yang bisa diambil exam-nya langsung, termasuk flag `requires_eligibility_verification` dan `exam_fee`/`verification_fee`
- `GET /public/exam-events?scheme_id=&date=&seat_status=` (param `date`/`seat_status` BARU v3.5 — `seat_status` dihitung server dari `capacity`/`seats_taken`: `open`/`filling_fast`/`full`) — jadwal sesi mendatang (tanggal, mode, kapasitas) — model "Exam Events" ala PECB; registrasi & bayar tetap butuh akun

## Catalog & Purchase
- `GET /trainings?visibility=public&category=&search=`
- `GET /trainings/:id` — detail lengkap (objectives, syllabus)
- `POST /cart/checkout` — body: items, buyer_type (individual/corporate)

## Course Player
- `GET /enrollments/:id/curriculum` — modules → lessons/quiz/exercise/workshop + status lock/unlock per item (**tidak lagi termasuk exam, v3.4** — lihat modul Exam)
- `POST /lessons/:id/complete` (video/slides)
- `POST /quizzes/:id/attempt` — body: answers, is_practice
- `POST /exercises/:id/submit` — file_url; `PATCH /exercises/:id/submit` untuk replace sebelum direview
- `POST /enrollments/:id/complete` — dipanggil saat modul terakhir selesai; jika training punya `certification_scheme_id`, otomatis membuat `exam_registrations` (source=training_completion, exam_fee_payment_status=waived_included_in_training)

## Exam Module (BARU v3.4 — independen dari Course Player)
- `GET /certification-schemes/:id` — detail skema, termasuk `requires_eligibility_verification`, fee
- `GET /exam-events?scheme_id=&from=&to=` — jadwal sesi tersedia untuk dibooking
- `POST /eligibility-verifications` — direct-path skema wajib verifikasi: body evidence_file_urls[], bayar `verification_fee`
- `GET /me/eligibility-verifications` — status permohonan milik sendiri, termasuk `info_request_note` kalau `status=needs_more_info`
- `POST /me/eligibility-verifications/:id/respond` (BARU v3.5.1, body `response_file` ditambah v3.6.1) — kandidat membalas permintaan info tambahan: body `response_text` dan/atau `response_file` (dokumen re-upload) — minimal satu wajib. Mengisi `participant_response`/`participant_response_file`, `status` otomatis kembali ke `under_review`
- `POST /exam-registrations` — daftar untuk suatu skema; jika direct-path skema wajib verifikasi, wajib referensi `eligibility_verification_id` berstatus approved; body memicu pembayaran `exam_fee` kecuali source=training_completion
- `PATCH /exam-registrations/:id` — pilih/ubah `exam_event_id` (booking jadwal)
- `GET /me/exam-registrations` — daftar exam yang sudah dibooking + riwayat hasil (My Exams, participant)
- `POST /exam-registrations/:id/submit` — mulai & submit exam pada jadwal yang sudah dibooking (ganti `POST /exams/:id/submit` lama)

## Tutor & Examiner
- `GET /tutor/queue?type=exercise|workshop`
- `POST /tutor/submissions/:id/grade` — score, feedback, action (approve/request_revision)
- `GET /examiner/exam-queue` — exam attempts menunggu keputusan (dari jalur mana pun, v3.4 rename dari `/examiner/queue`)
- `POST /examiner/exam-attempts/:id/decide` — decision, comment
- `GET /examiner/eligibility-queue` (BARU v3.4) — permohonan eligibility verification menunggu review
- `POST /examiner/eligibility-verifications/:id/decide` (BARU v3.4, action `request_more_info` ditambah v3.5.1) — action (`approve`/`reject`/`request_more_info`), reviewer_notes. Action `reject` otomatis menghitung `refund_amount` (`verification_fee × scheme.verification_refund_pct / 100`) dan memicu refund lewat payment gateway — jangan terima `refund_amount` dari client. Action `request_more_info` **tidak** menyentuh field refund/pembayaran sama sekali — cuma set `status=needs_more_info` + `info_request_note` dari body, hanya valid kalau `status` sedang `submitted`/`under_review`

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
- `GET /talent-search?competency=&region=&experience=` — response **tidak menyertakan** `phone`/`email` kecuali requesting verifier punya `verifier_accounts.plan=full_access` (BARU v3.6) — server-side, jangan andalkan sembunyi di client. Gerbang ini independen dari `portfolio_settings.consent_level` kandidat
- `GET /verifier/search-history` — untuk match rate & skill gap analytics
- `GET/POST /verifier/billing`
- `POST /verifier/full-access/activate` (BARU v3.6) — self-service, tidak butuh approval Operator; set `plan=full_access`, `full_access_expires_at = now + 1 tahun`. Harga default Rp 5.000.000/tahun di `verifier_accounts.full_access_price`, bukan hardcode
- `POST /talent-search/:candidate_id/message` (BARU v3.6) — kirim direct message ke kandidat; 403 kalau `plan≠full_access`

## Corporate Admin Portal
- `GET/POST /companies/:id/employees` — termasuk employee_id (unique per company), department
- `POST /companies/:id/internal-trainings` — CRUD scoped ke company_id
- `PATCH /companies/:id/internal-trainings/:training_id/syllabus` (BARU v3.7) — tambah/edit/hapus module syllabus (title + topics[]). Sebelum v3.7, training internal tidak pernah punya syllabus sama sekali karena form pembuatan cuma title+category — "Manage Content" jadi buntu permanen. Reuse validasi yang sama dengan `Operator Console`'s training syllabus editor
- `POST /companies/:id/assign-training` — training_id, deadline, dan **salah satu** dari `employee_ids[]` (pilih manual) atau `department` (BARU v3.5 — shortcut bulk-select satu department). Kalau `department` dipakai dan training punya `recurrence_months`, server mengecualikan karyawan yang `enrollments.completed_at` masih dalam window retake (response menyertakan `skipped_count` + alasan); tetap bisa ditambah manual via `employee_ids[]` tambahan
- `GET /companies/:id/dashboard` — compliance, on-time vs late, satisfaction

## Alumni Offboarding (BARU v3.1)
- `POST /companies/:id/employees/:user_id/offboard` — Corporate Admin: lepas seat, arsip employee_profile, transisi user_type → individual, cabut akses internal trainings, kirim notifikasi kontinuitas + tawaran Premium; tercatat di audit_log

## Access Requests (BARU v3.5)
Sebelumnya klik "Request Corporate/Verifier/Agency Access" di modal upsell tidak
pernah tersimpan di server — hanya state lokal di komponen modal, hilang begitu
modal ditutup, dan tidak ada persona yang bisa melihatnya. Lihat `DATA-MODEL.md`
§9a.
- `POST /me/access-requests` — body: `request_type` (corporate/verifier/agency), diturunkan otomatis dari upsell mana yang diklik, bukan diketik user
- `GET /me/access-requests` — status permohonan milik sendiri
- `GET /operator/access-requests?status=` — queue Operator (**bukan** Management — lihat catatan kepemilikan di `DATA-MODEL.md` §9a)
- `PATCH /operator/access-requests/:id/decide` — action (approve/reject); approve menambahkan role terkait ke `user_roles`. Approve pada `request_type=corporate` **tidak menunggu pembayaran** — role aktif segera, `activation_fee_status` mulai dari `unpaid` (lihat endpoint berikutnya)
- `PATCH /operator/access-requests/:id/activation-fee` (BARU v3.6) — Operator menandai `activation_fee_status=paid` setelah menerima pembayaran (invoice/transfer manual); hanya valid untuk `request_type=corporate` yang sudah `status=approved`. Lihat `DATA-MODEL.md` §9c

## Operator Console
- `GET /admin/dashboard`, `GET /admin/reports?filters=`
- `POST /admin/companies` — manual provisioning (status=pending_activation)
- `POST /admin/trainings/:id/lesson-content` — set contentType per module
- `GET /admin/staff-assignments`, `POST /admin/staff-assignments`
- `POST/PATCH /admin/certification-schemes` (BARU v3.4, **UI benar-benar dibangun v3.7** — sebelumnya endpoint ini cuma didokumentasikan, tanpa layar sama sekali) — atur `name`, `issuer`, `scheme_type`, `language`, `requires_eligibility_verification`, `verification_fee`, `exam_fee`, `verification_refund_pct` (**BARU 2026-09-08** — persentase refund kalau eligibility verification ditolak; default 50, diatur Operator per skema, BUKAN hardcode di kode).
- `DELETE /admin/certification-schemes/:id` (**BARU v3.8** — sebelumnya sama sekali tidak ada, lihat Catatan Developer #14 versi lama) — sekarang nyata sejak Stable-ID Migration selesai (`DATA-MODEL.md` §3a). Server harus menghitung dependent (`eligibility_verifications` yang mereferensikan skema ini, `exam_events` dengan `seats_taken>0`) sebelum menghapus: kosong → `204`; ada dependent → `409` + `{blockers: string[]}` berisi alasan dalam bahasa manusia, ditampilkan langsung di dialog UI (bukan pesan error generik).
- `POST/PATCH/DELETE /admin/exam-events` (BARU v3.4, **UI dibangun v3.7**) — jadwalkan/ubah/batalkan sesi (tanggal, mode, lokasi jika onsite, kapasitas) per skema. `DELETE` aman (tidak ada referensi tersimpan ke index event, beda dengan skema)
- `GET/POST /operator/question-banks` (**BARU v3.8**) — daftar/ buat question bank; tiap bank punya `certification_scheme_id` opsional (null = bank umum)
- `GET/POST/PATCH /operator/question-banks/:id/questions` / `.../questions/:question_id` (**BARU v3.8**) — CRUD soal (stem, tipe, opsi, jawaban benar, explanation, difficulty, topic, tags, points), termasuk transisi `status` (`draft`→`published`→`retired`). Lihat `DATA-MODEL.md` §3b untuk field lengkap dan simplifikasi Phase 1 (tidak ada versioning/review-approval sungguhan di endpoint ini)
- `GET/POST/PATCH /operator/exam-definitions` / `.../exam-definitions/:id` (**BARU v3.8**) — rakit exam dari soal published di question bank (`selection_mode=fixed` referensi `question_ids[]` eksplisit, atau `random_topic`). `GET /exam/:exam_definition_id/questions` (dipakai exam-taking component) resolve daftar soal aktual saat exam dimulai — **belum snapshot per-attempt** (didokumentasikan sebagai gap Phase 2 di `DATA-MODEL.md` §3b, exam_attempts belum imun dari edit soal setelahnya)

## Management — Executive Analytics (BARU v3.2, semua read-only)
- `GET /management/overview` — **agregat satu panggilan untuk layar Dashboard**: 5 KPI (total revenue, corporate revenue, peserta baru, repeat rate, churn) masing-masing dengan nilai bulan berjalan + bulan sebelumnya + bulan sama tahun lalu, deret revenue 12 bulan per aliran, dan daftar kartu "Perlu Perhatian" hasil evaluasi ambang batas server-side
- `GET /management/revenue?period=&granularity=month` — per aliran (public_training, self_study, in_house, membership, verifier) + MoM/YoY + recurring vs one-off
- `GET /management/growth?metric=participants|corporates|verifiers` — new per periode, MoM/YoY
- `GET /management/retention/repeat-purchase` — kohor 1 / 2 / >3 tahun sejak pembelian terakhir
- `GET /management/retention/membership` — churn, on-time payment rate
- `GET /management/trainings/ranking?by=revenue|enrollment&order=top|bottom&limit=3`
- `GET /management/demand/competencies?limit=3` — dari verifier_search_history
- `GET /management/demand/unmet-searches?limit=3` — dari catalog_search_events results_count=0
- `GET /management/leaderboards?type=loyalty|on_time_payer|on_time_completer&limit=10`
- `GET /management/corporate-health` — NRR, seat utilization, churn-risk (<90 hari renewal)
- `GET /management/upsell-conversion` — funnel per segmen dari upsell_impressions
- `POST /reports/generate` — portal `management`, section eksekutif (sudah ada, tambah enum portal)

Parameter filter bersama untuk seluruh endpoint report: `period` (12m | ytd | quarter | 24m), `segment` (all | corporate | individual), `category`. Endpoint mengabaikan filter yang tidak relevan dan mengembalikan `applicable_filters[]` agar UI dapat menonaktifkan kontrolnya.

## Catalog Search Logging (BARU v3.2)
- Pencarian di `GET /public/trainings` & `GET /trainings` otomatis menulis `catalog_search_events` (query, results_count, clicked_training_id)

## Checkout → Orders (BARU v3.2 — revisi)
- `POST /cart/checkout` kini WAJIB membuat `orders` + `order_items` (delivery_format per item) — bukan hanya enrollment; seluruh metrik revenue bergantung pada ini

## Super Admin (BARU)
- `GET /admin/users?role=&search=` — User Directory
- `PATCH /admin/users/:id/roles` — grant/revoke role → audit_log
- `GET /admin/organizations`, `PATCH /admin/organizations/:id` — status/suspend
- `GET/POST/PATCH /admin/sso-connections`
- `GET /admin/audit-log?actor=&action=&entity=&period=` — read-only, paginated

## Reporting (semua 3 portal manajemen)
- `POST /reports/generate` — body: portal, period, sections[] → returns file_url + report_generations log entry

---

## Catatan untuk Developer

1. Endpoint bertanda **consent-gated** (certificates detail, CPD, exam scores untuk verifier) wajib validasi `portfolio_settings.consent_level` dan/atau `verification_requests.status` di server — lihat `ROLES-PERMISSIONS-MATRIX.md` §2.
2. Endpoint training internal wajib scoped `owner_company_id` via RLS — lihat `DATA-MODEL.md` §8.
3. Rekomendasikan versioning API sejak awal (`/v1/...`) mengingat kompleksitas 8 portal yang akan terus berkembang.
4. `GET /me.upsells[]` wajib dihitung **server-side** dari aturan `DATA-MODEL.md` §9 — jangan diduplikasi di client. Copy upsell menginterpolasi `companies.name` milik user; dilarang hardcode nama perusahaan.
5. Semua endpoint `/admin/positions*` dan `/admin/users/:id/roles` menulis entri `audit_log`.
6. **Aturan pembanding (v3.2)**: setiap metrik revenue/volume pada respons `/management/*` WAJIB menyertakan `value`, `prev_month` (nilai + label), dan `same_month_last_year` (nilai + label) — bukan hanya persentase. Query analitik karenanya minimal mencakup rentang **24 bulan**.
7. **Corporate revenue (v3.2)** dihitung dari `orders.buyer_type='corporate'` (in-house + kursi public training oleh perusahaan), bukan dari `delivery_format='in_house'` saja.
8. **Exam gating (v3.4)**: `POST /exam-registrations` WAJIB validasi di server — source=training_completion hanya valid jika enrollment terkait sudah `status=completed` pada training dengan `certification_scheme_id` yang cocok; source=direct_verified hanya valid jika `eligibility_verification_id` berstatus `approved` PADA skema yang sama. Jangan percaya field ini dari client.
9. **Refund verifikasi kelayakan (2026-09-08)**: refund untuk `eligibility_verifications` yang ditolak WAJIB dihitung di server dari `certification_schemes.verification_refund_pct` (default 50) — dilarang hardcode atau terima nilai refund dari client. Lihat `DATA-MODEL.md` §3a.
10. **Filter opsi tidak hardcode (2026-09-10)**: opsi dropdown "Scheme Type"/"Language" di Exam Catalog dan "Position" di Talent Search WAJIB di-derive dari nilai yang benar-benar ada di data (`SELECT DISTINCT`), bukan enum tetap di client — skema/posisi baru harus otomatis muncul sebagai opsi filter tanpa deploy.
11. **`request_type` pada `POST /me/access-requests` WAJIB diturunkan server-side** dari upsell mana yang di-trigger (identifier upsell yang dikirim client, bukan label bebas) — bug yang pernah terjadi di prototype: modal "Verify Talent" salah menampilkan konfirmasi "Corporate access" karena field pembeda upsell tidak ikut dikirim dari komponen sidebar ke modal. Jangan percaya `request_type` bebas dari body request tanpa validasi terhadap upsell yang sedang aktif untuk user tsb.
12. **Full Access ≠ consent, validasi keduanya terpisah (v3.6)**: `GET /talent-search` dan endpoint detail kandidat WAJIB mengecek `verifier_accounts.plan=full_access` DI SERVER sebelum menyertakan `phone`/`email` di response — terlepas dari status `portfolio_settings.consent_level`/`verification_requests` kandidat yang bersangkutan. Dua pengecekan independen, jangan digabung jadi satu kondisi.
13. **`activation_fee_status` tidak pernah mem-block approve (v3.6)**: `PATCH /operator/access-requests/:id/decide` untuk `request_type=corporate` WAJIB tetap memberi role `corporate_admin` terlepas dari status pembayaran — activation fee ditagih & ditandai lunas belakangan lewat endpoint terpisah, bukan syarat approve. Jangan tambahkan validasi yang memblokir approve karena unpaid.
14. **`DELETE /admin/certification-schemes/:id` WAJIB cek dependent di server, bukan cuma di UI (v3.8)**: Stable-ID Migration (v3.8) menghapus masalah array-index yang tadinya memblokir delete sama sekali (v3.7), tapi itu tidak membuat delete otomatis aman — server tetap wajib menghitung `eligibility_verifications`/`exam_events` (seat terisi) yang mereferensikan skema via `certification_scheme_id` sebelum menghapus, dan menolak (`409` + alasan) kalau ada. Jangan andalkan client untuk memutuskan boleh-tidaknya delete.
15. **Soal published TIDAK immutable di endpoint ini (v3.8, gap yang diketahui)**: `PATCH /operator/question-banks/:id/questions/:question_id` mengizinkan edit langsung pada soal berstatus `published`, termasuk soal yang sudah dipakai di `exam_definitions` yang sudah pernah diambil kandidat. Backend produksi WAJIB menambah versioning (soal published immutable, edit membuat versi baru) dan snapshot pertanyaan per `exam_attempts` sebelum go-live — didokumentasikan sebagai gap Phase 2 di `DATA-MODEL.md` §3b, sengaja belum diimplementasikan di prototipe ini.
