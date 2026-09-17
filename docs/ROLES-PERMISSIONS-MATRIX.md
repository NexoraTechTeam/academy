# DeAcademy — Roles & Permissions Matrix (v3.8)

**Changelog v3.8 (2026-09-16):** baris resource baru **Question Bank** dan
**Exam Definitions** (Operator CRUD penuh — lihat `DATA-MODEL.md` §3b).
Certification Schemes row sekarang **CRUD penuh** (Delete ditambahkan,
diblok dengan alasan tampil kalau ada dependent) — Prinsip 15 direvisi
setelah Stable-ID Migration selesai. Semua baris ini **UI-only authorization**
di prototipe (tombol disembunyikan per persona), bukan enforcement
server-side sungguhan — lihat catatan di bawah tabel.

**Changelog v3.7 (2026-09-15):** baris resource baru **Certification Schemes**
(Operator CU, tanpa Delete — Prinsip 15 baru). Baris "Lesson content
authoring" dan "Exam Events" diperbarui — keduanya sekarang benar-benar
punya UI (sebelumnya sebagian cuma dokumen/dead-end).

**Changelog v3.6 (2026-09-10):** baris resource baru **Verifier Full Access**;
Access Requests row diperbarui (Operator juga menandai activation fee lunas).
Prinsip 14 baru — payment gates independen dari approval/consent.

**Changelog v3.5.1 (2026-09-10):** baris Eligibility Verifications — Examiner
dapat aksi ketiga (Request More Info), peserta dapat RU (own) untuk membalas
permintaan tsb.

**Changelog v3.5 (2026-09-10):** baris resource baru **Access Requests** — Operator
memegang approve/reject penuh, Management sengaja tanpa akses sama sekali
(Prinsip 13) supaya prinsip read-only Management (Prinsip 11) tidak punya
pengecualian.

**Changelog v3.4 (2026-09-08):** exam diputus dari training — 3 baris resource baru (Eligibility Verifications, Exam Events, Exam Registrations); Examiner kini punya kewenangan approve/reject eligibility verification, terpisah dari Exam Review; Prinsip 12 baru.

**Changelog v3.2:** kolom **Management** (Head of Academy) — read-only agregat.

**Changelog v3 (2026-08-24):** kolom **Super Admin** (baru), baris **Position master data**, **Audit log**, **SSO config**, dan **Public/Guest** (browsing tanpa akun); prinsip multi-role unified app (§Prinsip 8–10).

Legend: **C**reate · **R**ead · **U**pdate · **D**elete · **A**pprove/Decide · — (no access)

| Resource | Participant | Operator | Tutor | Examiner | Corporate Admin (PIC) | Employer/Verifier | Super Admin | Management |
|---|---|---|---|---|---|---|------|
| Own profile & competency data | CRU | R (all users) | — | — | R (own company's employees only) | R (public/consented data only) | CRUD (all users, identity only) | R (agregat + leaderboard) |
| Training catalog (public) | R | CRUD | R | R | R | — | R (all) | R (agregat) |
| Internal trainings (own company) | — | **R metadata only, no content** | R (if assigned) | R (if assigned) | CRUD (own company only) | — | — (konten); R metadata | — (konten); R metadata agregat |
| Internal trainings (other company) | — | — | — | — | — | — | — (konten); R metadata | — (konten); R metadata agregat |
| Lesson content authoring (video/slides+audio+syllabus) | — | CRUD (public catalog) | — | — | CRUD (own internal trainings, **syllabus editor UI dibangun v3.7** — dulu tidak ada, "Manage Content" buntu) | — | — | — (konten); R metadata agregat |
| Certification Schemes — skema, fee, eligibility toggle (BARU v3.7) | R | CRUD (Delete diblok kalau ada dependent, **v3.8** — lihat Prinsip 15) | — | R | — | — | R (all) | R (agregat) |
| Question Bank — soal exam/quiz (BARU v3.8) | — | CRUD | — | R (soal exam miliknya, read-only) | — | — | R (all) | — |
| Exam Definitions — rakit exam dari Question Bank (BARU v3.8) | R (saat exam-taking, tanpa lihat jawaban benar) | CRUD | — | R | — | — | R (all) | R (agregat) |
| Enrollments | R (own), C (self-enroll) | CRUD (all) | R (assigned cohort) | R (assigned cohort) | CRU (own employees) | — | R (all) | R (agregat) |
| Quiz attempts (incl. practice retakes) | CRU (own) | R (all) | R (own cohort, read-only) | — | R (own employees) | — | R (all, audit only) | R (agregat) |
| Exercise / Workshop submissions (incl. replace before review) | CRU (own) | R (all) | R + **A** (grade, request revision, **view in-app only, no download**) | — | R (own employees) | — | R (all, audit only) | R (agregat) |
| Exam attempts & decisions | C (own), R (own) | R (all) | — | R + **A** (Competent / Not Yet Competent) | R (own employees, result only) | R (if consented, via Full Report) | R (all, audit only) | R (agregat) |
| Eligibility Verifications (direct-path, BARU v3.4) | C (own), RU (own — balas Request More Info, v3.5.1) | R (all) | — | R + **A** (Approve/Reject/Request More Info + catatan) | — | — | R (all) | R (agregat) |
| Exam Events / jadwal (BARU v3.4) | R (untuk booking) | CRUD (jadwalkan sesi, **UI dibangun v3.7** — dulu cuma didokumentasikan) | — | R (sesi miliknya) | — | — | R (all) | R (agregat) |
| Exam Registrations & fee status (BARU v3.4) | CR (own — daftar & bayar) | R (all) | — | R (antrian miliknya) | R (own employees, status only) | — | R (all) | R (agregat) |
| Access Requests — upgrade Corporate/Verifier/Agency (BARU v3.5) | C (own), R (own) | R (all) + **A** (Approve/Reject + tandai activation fee lunas, v3.6) | — | — | — | — | R (all) | — (lihat Prinsip 13) |
| Verifier Full Access — billing plan (BARU v3.6) | — | R (all, support only) | — | — | — | CRU (own — activate, lihat status) | R (all) | — |
| Certificates & status lifecycle | R (own) | CRUD (issue), U (status transitions) | — | — | R (own employees) | R (if consented / public) | R (all) | R (agregat) |
| Competency Currency Attestations | C (own), R (own) | R (all), **A** (operator_verified, if applicable) | — | — | **A** (employer_verified, own employees) | R (if consented, via Full Report) | R (all) | R (agregat) |
| CPD records | RU (own) | R (all) | — | — | R (own employees) | R (if consented, Full Report only) | R (all) | R (agregat) |
| Staff assignments (tutor/examiner) | — | CRUD | R (own) | R (own) | — | — | R (all) | R (agregat) |
| Corporate accounts | — | CRUD (incl. manual provisioning) | — | — | RU (own company profile) | — | R (all) | R (agregat) |
| Employees / seats (incl. Employee ID, department) | — | R (all) | — | — | CRUD (own company, ID unique per company) | — | R (all) | R (agregat) |
| Membership & billing (participant) | RU (own) | R (all, support) | — | — | — | — | R (all, support) | R (agregat) |
| Portfolio privacy / consent settings | CRU (own) | R (own, support only) | — | — | — | — | R (support only) | R (agregat) |
| Profile view analytics (own) | R (own) | R (all) | — | — | — | — | R (all) | R (agregat) |
| Verification requests | R + **A** (approve/deny, own profile) | R (all, support) | — | — | — | C, R (own requests) | R (all) | R (agregat) |
| Verifier search history & match/gap analytics | — | R (all, aggregate) | — | — | — | R (own) | R (all) | R (agregat) |
| Verifier account & billing | — | R (all) | — | — | — | CRU (own) | R (all) | R (agregat) |
| Reports & analytics (business-wide) | — | R | — | — | R (own company scope only) | R (own account scope only) | R (all) | R (agregat) |
| Generate Report (export) | — | C (own portal scope) | — | — | C (own company scope) | C (own account scope) | C (platform scope) | C (scope eksekutif) |
| Position master data (dropdown jabatan) | R (pilih saat signup/edit profil) | CRU (tambah `is_system=false`, nonaktifkan) | — | — | R | R | CRU + D (hanya entri non-system tak terpakai) | R |
| Roles & permissions assignment | — | — | — | — | — | — | CRUD | — |
| Organizations (semua tenant) | — | CRUD (provisioning) | — | — | RU (own) | — | CRUD | R (agregat) |
| Security & SSO config | — | — | — | — | R (own company) | — | CRUD | — |
| Audit log | — | R (scope operasional) | — | — | — | — | R (all) | R (ringkasan) |
| Certificate verify by number/QR (data minimal + status) | R (public) | R | R (public) | R (public) | R (public) | R + **bulk verify (berbayar)** | R | R (agregat) |
| Training waitlist | C (join), R (own) | CRUD + agregat | — | — | — | — | R (all) | R (agregat) |
| Demand insights (skill-gap agregat) | R (badge di katalog) | R (full, Operator) | — | — | — | — | R (all) | R (agregat) |
| Offboard employee (alumni transition) | — (subjek, dinotifikasi) | R (all) | — | — | C (own employees) | — | R (all) | R (agregat) |

### Akses Publik / Guest (tanpa login)

| Resource | Guest |
|---|---|
| Training catalog (public) — daftar, harga, jadwal, format | R |
| Talent search — profil yang opt-in publik + sertifikat aktif | R |
| Full verification report | — (wajib akun verifier + consent) |
| Enroll / checkout | — (wajib akun) |

## Prinsip Kunci

1. **Isolasi Multi-Tenant**: Corporate Admin hanya boleh mengakses data perusahaannya sendiri (`company_id` scoping wajib). Operator DeAcademy boleh melihat *metadata* training internal (jumlah, status, enrollment count), tapi **tidak** boleh membaca konten aktual (deskripsi, syllabus, video, slide, audio).
2. **Consent-Gated Data**: Data kompetensi detail (skor ujian, riwayat CPD, transkrip, Competency Currency Attestation) ke Employer/Verifier hanya boleh diserialize backend setelah memvalidasi `portfolio_settings.consent_level` dan/atau `verification_requests.status = approved`. Validasi di server, bukan hanya disembunyikan di frontend.
3. **Separation of Duties**: Tutor dan Examiner adalah permission set berbeda. Untuk training bertipe sertifikasi resmi, sistem sebaiknya memperbolehkan (tidak wajib) menugaskan orang berbeda demi independensi.
4. **Employer-Verified Attestation**: Corporate Admin (PIC) punya kewenangan khusus meng-approve **Competency Currency Attestation** milik karyawannya sendiri — menghasilkan badge "Employer-Verified" yang lebih kuat daripada self-attested. Untuk peserta individu (non-corporate), atestasi tetap self-attested kecuali Operator memutuskan untuk memverifikasi manual (`operator_verified`) — kebijakan ini masih open question, lihat PRD §8.
5. **Report Generation Scope**: Setiap role manajemen (Operator, Corporate Admin, Employer/Verifier) hanya bisa generate laporan dalam scope data yang mereka punya akses baca — mis. Corporate Admin tidak bisa generate laporan lintas perusahaan.
6. **Employee ID Uniqueness**: divalidasi per `company_id`, bukan global — dua perusahaan boleh punya format/nilai Employee ID yang sama tanpa konflik.
7. **Audit Trail**: Setiap aksi approve/deny (grading, exam decision, verification request, attestation co-sign) dan setiap `report_generations` sebaiknya dicatat di tabel `audit_log` — penting untuk sertifikasi profesi yang bisa diaudit regulator.
8. **Multi-Role Unified App**: satu login, satu shell; setiap pemegang role non-participant otomatis punya workspace Participant. Permission dievaluasi per role aktif — berpindah workspace tidak menambah hak, hanya mengganti konteks.
9. **Master Data Positions**: jabatan dipilih dari master data (tanpa free text). Flag `is_hr_family` per posisi menggerakkan targeting upsell Talent Search (lihat `DATA-MODEL.md` §9). Operator/Super Admin menambah posisi (`is_system=false`); entri bawaan hanya bisa dinonaktifkan agar record historis tetap resolve.
10. **Super Admin ≠ Operator**: Operator memegang operasi bisnis (trainings, participants, corporate accounts, laporan); Super Admin memegang identity, access, keamanan, dan audit. Super Admin **tidak** mendapat akses konten training internal korporat — isolasi tenant tetap berlaku (Prinsip 1).
11. **Management = read-only strategis (v3.2)**: role `management` melihat agregat lintas platform + leaderboard, tanpa satu pun operasi tulis pada data operasional. Berbeda dari Operator (menjalankan bisnis) dan Super Admin (identity & keamanan). Semua metriknya bersumber dari `orders`, `membership_invoices`, `enrollments`, `verifier_search_history`, `catalog_search_events`, `upsell_impressions` — lihat `DATA-MODEL.md` §11.
12. **Exam diputus dari training, gate kelayakan per skema (v3.4)**: exam bukan lagi item course player — modul independen dengan dua jalur masuk (training-path otomatis eligible; direct-path tergantung `certification_schemes.requires_eligibility_verification`). Wewenang approve/reject eligibility verification ada di **Examiner** (bukan Operator) — konsisten dengan perannya sebagai penilai kompetensi ahli, bukan administrator. Operator tetap yang menjadwalkan `exam_events` dan mengatur `verification_fee`/`exam_fee`/`verification_refund_pct` per skema — termasuk persentase refund kalau eligibility verification ditolak (default 50%, bisa diubah Operator per skema tanpa deploy, lihat `API-ENDPOINTS.md` catatan #9).
13. **Access Requests → Operator, bukan Management (v3.5, keputusan 2026-09-09)**: approve/reject permintaan upgrade Corporate/Verifier/Agency access ada di **Operator** — konsisten dengan Prinsip 11 (Management tetap 100% read-only, tanpa pengecualian untuk fitur baru) dan karena Operator sudah pemegang provisioning `companies`/`staff_assignments`. Dua opsi lain sempat dipertimbangkan (taruh di Management, atau duplikasi read-only di kedua tempat) — ditolak supaya prinsip read-only Management tidak punya pengecualian yang bisa melebar ke fitur berikutnya.
14. **Payment gates independen dari approval & consent (v3.6, keputusan 2026-09-10)**: dua akses baru butuh pembayaran, dan keduanya **tidak memblokir** langkah yang sudah ada. (a) Corporate: approve `access_requests` tetap memberi role `corporate_admin` segera — biaya aktivasi (`activation_fee_status`) ditagih & ditandai lunas Operator belakangan, terpisah dari pembelian training (`orders`). (b) Verifier: upgrade ke Full Access (kontak + messaging, tahunan, unlimited) adalah tindakan **self-service verifier sendiri** — tidak butuh approval Operator sama sekali, dan **independen dari consent kandidat** (`portfolio_settings.consent_level`) — kandidat yang sudah full-consent tetap tidak menyingkap kontaknya ke verifier yang belum bayar. Dua gerbang berbeda, jangan digabung validasinya.
15. **Certification Schemes delete sekarang didukung, dengan dependency check (v3.8, direvisi dari v3.7)**: v3.7 sempat melarang delete skema sama sekali karena skema dan `exam_events`-nya direferensikan lewat array index (`schemeIdx`) di beberapa tempat pada prototype, bukan `id` murni. Stable-ID Migration (v3.8) menghapus akar masalah itu — 9 titik pakai `schemeIdx` sekarang jadi `schemeId` (FK sungguhan) — sehingga delete skema sudah aman dari sisi referential integrity. Tapi delete **tetap diblok** kalau skema masih punya dependent bisnis: eligibility verification yang mereferensikannya, atau sesi `exam_events` yang sudah ada peserta terdaftar — UI menampilkan alasan spesifiknya, bukan sekadar menyembunyikan tombol. `exam_events` sendiri tetap aman dihapus individual tanpa syarat (tidak ada yang menyimpan referensi ke index/id event tertentu di luar sesi booking-nya).
16. **Question Bank & Exam Definitions — otorisasi di prototipe ini adalah UI-only, bukan penegakan server (v3.8, Phase 1)**: seluruh CRUD Question Bank/Exam Definitions di atas hanya dibatasi lewat routing nav per-persona di client — **tidak ada backend sungguhan di prototipe ini untuk menegakkannya**. Dokumen kontrak korektif yang jadi pemicu fitur ini eksplisit meminta "Use backend authorization. Hidden UI controls are not security." — itu tetap benar dan **wajib** untuk backend produksi (setiap endpoint Question Bank/Exam Definitions di `API-ENDPOINTS.md` harus re-validasi role di server, bukan percaya header/token client), tapi tidak bisa dipenuhi literal di artifact client-side-only ini. Berlaku juga untuk seluruh baris tabel di atas, bukan cuma dua ini — dicatat eksplisit di sini karena inilah fitur yang memicu pertanyaan ini.
