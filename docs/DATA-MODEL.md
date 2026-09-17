# DeAcademy — Data Model & Database Schema (v3.9)

**Changelog v3.9 (2026-09-16):** user tanya apakah internal training yang
dibuat Corporate Admin digabung ke "My Trainings" peserta (jawaban desain:
ya, satu list gabungan) — mengecek jawabannya ke kode membongkar gap nyata:
**belum tersambung sama sekali**. Tombol "Assign Training" cuma menampilkan
banner sukses lokal, tidak pernah menulis ke `enrollments` (atau padanan
client-side-nya). Diperbaiki: `assignedTrainings` state baru di `Gd` (pola
sama seperti `schemes`), ditulis oleh `qv` (Assign Training), dibaca oleh
`Bv` (My Trainings) — additive, tidak mengubah data contoh yang sudah ada.
Lihat §4 untuk detail dan keterbatasan data demo.

**Changelog v3.8 (2026-09-16):** Question Bank + Exam Authoring + Stable-ID
Migration, Phase 1. Ditemukan lewat user bertanya soal upload materi/quiz/exam
(v3.7), lalu ditindaklanjuti dengan permintaan eksplisit "lanjutkan ke Question
Bank + Exam Authoring + Stable ID migration" setelah draf dokumen kontrak
korektif eksternal dinilai dan **sengaja tidak dipakai literal** — prototipe ini
tidak punya backend sungguhan, jadi beberapa tuntutan dokumen itu (autorisasi
sisi-server, audit trail persisten, penyimpanan versi sungguhan) tidak bisa ada
di sini; scope Phase 1 diputuskan sendiri, dikalibrasi ke kapasitas prototipe.
(1) **Migrasi Stable-ID selesai** — `schemeIdx` (index array, 9 titik pakai)
diganti `schemeId` (FK sungguhan) di seluruh kode; `exam_events` yang tadinya
murni positional sekarang punya `id` stabil, menyusul field yang **sudah**
didokumentasikan di §3a sejak v3.4 tapi belum pernah diimplementasikan di kode
prototipe. Skema sekarang bisa **dihapus sungguhan** kalau tidak punya
dependent (lihat §3a) — sebelumnya delete skema sama sekali tidak tersedia.
(2) **Question Bank & Exam Authoring baru** (§3b) — `question_banks`/
`questions` menggantikan data seed statis (`Od`/`hh` di kode) yang sebelumnya
tidak punya authoring UI sama sekali; `exam_definitions` menggantikan array
soal yang di-hardcode langsung ke komponen exam-taking. Soal migrasi lama
dipertahankan sebagai record asli (bukan dihapus), diberi id stabil. Lihat §3b
untuk field lengkap dan daftar simplifikasi Phase 1 vs. target penuh (Phase 2).

**Changelog v3.7 (2026-09-15):** dua gap content-authoring ditutup, ditemukan
saat user bertanya siapa yang membuat materi/quiz/exam. (1) Corporate Admin
sekarang bisa mengedit syllabus training internal — sebelumnya form pembuatan
tidak pernah memberi syllabus, jadi "Manage Content" selalu buntu. (2)
`certification_schemes`/`exam_events` yang sebelumnya cuma stub PRD tanpa UI
sekarang punya CRUD penuh untuk Operator (add+edit skema, add+edit+remove
sesi) — lihat §3a. Ditegaskan eksplisit: soal quiz/exam masih data contoh
statis, authoring soal tetap di luar scope.

**Changelog v3.6.1 (2026-09-10):** `eligibility_verifications` dapat
`participant_response_file` — balasan kandidat atas "Request More Info" boleh
berupa dokumen yang di-upload ulang, bukan cuma teks. Ditemukan lewat review
user, yang perhatikan tidak ada cara upload dokumen di respons peserta. UI
memakai ulang komponen file-picker (`fo`) yang sudah ada di banyak tempat lain
di aplikasi.

**Changelog v3.6 (2026-09-10):** dua payment gate baru dari pertanyaan langsung
user setelah menguji Access Requests. (1) `verifier_accounts.plan` diganti dari
stub lama (`pay_per_request`/`subscription`, tidak pernah diimplementasikan) ke
**`basic`/`full_access`** — kontak (`users.phone` BARU/`.email`) dan direct
message sekarang gerbang berbayar tahunan, **independen dari**
`portfolio_settings.consent_level`. (2) `access_requests` dapat
`activation_fee_status`/`activation_fee_amount` — approve Corporate access
memberi role segera, tapi workspace-nya juga butuh biaya aktivasi terpisah dari
pembelian training. Lihat §6, §9c.

**Changelog v3.5.1 (2026-09-10):** `eligibility_verifications` dapat status ketiga
**`needs_more_info`** (+ `info_request_note`, `participant_response`) — Examiner
bisa minta dokumen tambahan/kontak verifikasi tanpa Reject (yang otomatis memicu
refund). Lihat §3a.

**Changelog v3.5 (2026-09-10):** 4 gap UX dari review lampiran (bandingkan dengan
PECB exam-events). (1) `certification_schemes` dapat `scheme_type` dan `language`
supaya Exam Catalog bisa difilter tanpa hardcode opsi. (2) `trainings` dapat
`recurrence_months` — dasar bulk-assign-per-department yang otomatis melewati
karyawan yang belum jatuh tempo retake. (3) Tabel baru §9a `access_requests` —
mencatat permintaan upgrade akses (Corporate/Verifier/Agency) dari modal upsell,
sebelumnya tidak pernah tersimpan sama sekali (hilang begitu modal ditutup).
(4) Talent search **tidak menambah field/tabel baru** — filter posisi memakai
`users.position_id` → `positions` (§1) yang sudah ada untuk dropdown signup;
`portfolio_settings.is_public` (§6) tetap syarat sebuah profil muncul di
pencarian. `headline` di kartu talent tetap teks bebas, terpisah dari posisi
struktural yang sekarang bisa difilter.

**Changelog v3.4 (2026-09-08):** **Exam diputus dari Training** — bukan lagi item
terakhir di course player. Skema baru §3a: `certification_schemes`,
`eligibility_verifications`, `exam_events` (sesi terjadwal), `exam_registrations`.
Dua jalur masuk exam: training-path (otomatis eligible, exam included) dan
direct-path (skema terbuka = bayar exam langsung; skema wajib verifikasi = bayar
verifikasi → review Examiner → lolos → bayar exam). `lessons.type` tidak lagi
punya nilai `exam`; `exam_attempts` kini FK ke `exam_registrations`; `trainings`
dan `certificates` dapat `certification_scheme_id` opsional.

**Changelog v3 (2026-08-24):** selaras dengan prototype unified app (`lsp-unified-app.html`) — menambah role `admin` (Super Admin), master data **positions** (menggantikan free-text `users.position`), tabel `audit_log` (first-class, bukan lagi rekomendasi), `sso_connections`, serta aturan derivasi **upsell** (§9). Referensi eksekusi aturan upsell: `tests/upsell_rules.py`; seed master data: `data/positions.json`.

Entitas inti, field kunci, dan relasi antar tabel — mencakup seluruh portal dalam satu unified app. PostgreSQL direkomendasikan (Row-Level Security untuk kebutuhan multi-tenant). Lihat `erd.mermaid` untuk diagram visual.

---

## 1. Identity & Access

### `users`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| full_name | text | |
| email | text unique | |
| password_hash | text | |
| user_type | enum | `individual`, `corporate_employee`, `staff`, `verifier_user` |
| company_id | uuid FK nullable | null jika individual |
| position_id | uuid FK → positions | jabatan dari master data — **bukan free text** (lihat §1.1) |
| department | text nullable | hanya relevan untuk corporate_employee |
| region | text | untuk analytics sebaran wilayah |
| years_experience | int nullable | untuk talent search & public verification page |
| **phone** | text nullable | **BARU (v3.6)** — hanya diserialize ke response `GET /talent-search` kalau verifier yang request punya `verifier_accounts.plan=full_access` (lihat §6) |
| created_at | timestamp | |

### `employee_profiles` (extension untuk corporate_employee)
| Field | Type | Note |
|---|---|---|
| user_id | uuid PK/FK | |
| employee_id | text | **unik per company_id**, bukan global — validasi saat create |
| status | enum | **BARU v3.1** — `active`, `offboarded` |
| offboarded_at | timestamp nullable | **BARU v3.1** — diisi saat seat dilepas |
| UNIQUE(company_id, employee_id) | constraint | mencegah duplikat ID dalam satu perusahaan |

### `positions` (BARU — master data jabatan)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| slug | text unique | id stabil, mis. `hr-manager` — direferensikan konfigurasi & analytics |
| label | text | teks di dropdown, mis. "HR Manager" |
| category | text | 15 kategori (Human Resources, Quality/Compliance, IT, dst) |
| is_hr_family | boolean | **penggerak targeting upsell Talent Search** (§9) |
| is_active | boolean | `false` = disembunyikan dari dropdown; record user lama tetap resolve |
| is_system | boolean | `true` = seed bawaan, tidak bisa dihapus — hanya dinonaktifkan |
| sort_order | int | |
| created_by | uuid FK → users nullable | operator/super admin yang menambahkan (null untuk seed) |
| created_at | timestamp | |

> Seed awal: 147 posisi / 15 kategori / 26 `is_hr_family=true` — lihat `data/positions.json`.
> **Signup & edit profil memakai dropdown ini, tanpa opsi free text.** Operator dan Super Admin
> dapat menambah posisi (`is_system=false`) dari layar Master Data → Positions, sehingga daftar
> extensible tanpa deploy. Jangan pernah menghapus baris yang pernah direferensikan `users.position_id`
> — nonaktifkan (`is_active=false`).

### `position_legacy_aliases` (BARU — migrasi data lama)
| Field | Type | Note |
|---|---|---|
| alias | text PK | judul lama polos, mis. "Manager", "Staff", "Supervisor" |
| position_id | uuid FK → positions | entri generik tujuan (mis. "Manager (General)") |

> Dipakai satu kali saat migrasi kolom lama `users.position` (text) → `users.position_id`.
> Judul yang tidak resolve ke `positions.label` maupun alias → fallback manual review.

### `roles` & `user_roles`
`participant`, `operator`, `tutor`, `examiner`, `corporate_admin`, `verifier`, **`admin` (Super Admin — BARU)**, **`management` (Head of Academy — BARU v3.2, read-only analytics)**.

> **Model multi-role (unified app):** satu user bisa memegang beberapa role sekaligus dan setiap
> pemegang role non-participant juga otomatis punya workspace Participant (belajar untuk dirinya
> sendiri). UI = satu login, satu shell, workspace switcher. `tutor` dan `examiner` tetap permission
> set terpisah di backend, tetapi berbagi satu workspace "Tutor / Examiner" di UI — antrian yang
> tampil ditentukan `staff_assignments` per training/cohort.

### `staff_assignments`
Sama seperti v1 (role tutor/examiner per training/cohort).

---

## 2. Companies (Multi-Tenant Core)

### `companies`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| name | text | |
| industry | text | |
| source | enum | `self_registered`, `operator_assigned` |
| status | enum | `pending_activation`, `active`, `suspended` |
| account_manager_id | uuid FK → users | |
| pic_name | text | |
| pic_email | text | |
| satisfaction_score | numeric nullable | dari survei periodik |

### `company_seats`
Sama seperti v1 (seats_purchased, seats_used).

---

## 3. Trainings & Curriculum

### `trainings`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| title, category, level, format, duration_label | text/enum | |
| price | numeric | 0 jika internal/free |
| cpd_hours | int | |
| description, objectives[], prerequisites, audience | text | |
| status | enum | `draft`, `published` |
| visibility | enum | `public`, `internal` |
| owner_company_id | uuid FK nullable | **wajib jika visibility=internal** |
| created_by | uuid FK → users | |
| next_batch_date | date nullable | |
| seats | int nullable | |
| **certification_scheme_id** | uuid FK nullable | **BARU (v3.4)** — skema sertifikasi yang training ini persiapkan (null untuk training umum tanpa sertifikasi formal, mis. "Effective Communication for Assessors") |
| **recurrence_months** | int nullable | **BARU (v3.5)** — training yang wajib diulang berkala (mis. refresher tahunan) diisi jumlah bulan siklusnya (mis. 12); `null` = sekali-jalan, tidak wajib retake. Dipakai Corporate Admin saat bulk-assign per department: karyawan yang `enrollments.completed_at` masih dalam window ini untuk training yang sama otomatis dilewati dari seleksi massal (tetap bisa ditambah manual) |

> **v3.4 — Exam diputus dari training** (lihat §3a): menyelesaikan training yang punya `certification_scheme_id` **tidak lagi otomatis membuka exam di dalam course player yang sama**. Sebaliknya, penyelesaian training memicu `exam_registrations` (source=`training_completion`) di modul Exam yang terpisah — peserta lalu memilih jadwal sendiri di sana. Training tanpa `certification_scheme_id` selesai seperti biasa (tidak ada exam sama sekali).

> **Multi-tenant kritis**: training `visibility=internal` HARUS difilter `owner_company_id = current_user.company_id` via RLS. Operator DeAcademy tidak diberi akses baca konten (description/objectives/syllabus/lesson content) untuk training internal — hanya metadata agregat (jumlah training, jumlah enrollment) untuk billing/kapasitas.

### `training_related_trainings` (BARU)
| Field | Type | Note |
|---|---|---|
| training_id | uuid FK → trainings | |
| related_training_id | uuid FK → trainings | |
| source | enum | `manual` (dipilih operator via search), `suggested_category` (auto-suggest, tetap perlu diklik/approve operator) |
| created_by | uuid FK → users | operator yang menambahkan |
| created_at | timestamp | |

> Self-referential many-to-many. Relasi ini **tidak otomatis dua arah** — kalau A dikaitkan ke B, tidak berarti B otomatis muncul terkait A, kecuali operator menambahkannya juga saat mengedit B. Basis untuk "Recommended for You" di dashboard peserta: query semua `training_related_trainings` di mana `training_id` = training yang sudah diselesaikan/di-enroll peserta, lalu tampilkan `related_training_id` yang belum mereka ambil.

### `syllabus_modules`, `syllabus_topics`
Sama seperti v1.

> **Siapa mengarang apa (v3.7, 2026-09-15)** — dikonfirmasi langsung ke prototype, bukan
> asumsi dari dokumen: **Operator** penuh mengarang metadata + syllabus + pilihan tipe
> konten (video vs slides+audio) untuk training katalog publik. **Corporate Admin**
> mengarang metadata + syllabus + konten untuk training internal miliknya sendiri —
> sebelumnya di prototype ini **tidak bisa** (form pembuatan cuma judul+kategori, tanpa
> editor syllabus, sehingga "Manage Content" selalu buntu) — diperbaiki v3.7 dengan
> menyamakan editor syllabus yang dipakai Operator (`jv` di kode). **Tutor/Examiner tidak
> pernah mengarang konten apa pun** — perannya murni review/grading (nilai Exercise/
> Workshop, keputusan Exam, approve/reject Eligibility Verification). **Isi soal quiz dan
> soal exam (teks pertanyaan, pilihan jawaban, kunci jawaban) TETAP data contoh statis di
> prototype ini, tidak ada UI authoring untuk siapa pun** — di luar scope v3.7, perlu
> keputusan produk terpisah (question bank + versioning) sebelum dibangun.

### `lessons`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| module_id | uuid FK | |
| type | enum | `lesson`, `quiz`, `exercise`, `workshop` — **`exam` dihapus di v3.4**, lihat §3a |
| content_type | enum nullable | `video`, `slides` (hanya type=lesson) |
| video_asset_url | text nullable | |

### `lesson_slides`
Sama seperti v1 (per-slide title, bullets, audio_asset_url).

### `quizzes` / `quiz_questions`
Sama seperti v1, dengan `pass_score`.

### `exercise_resources` / `workshop_resources`
Sama seperti v1 (reference PDF + template file).

---

## 3a. Certification Schemes & Exam Module (BARU v3.4 — Exam diputus dari Training)

**Keputusan produk 2026-09-08**: exam bukan lagi item terakhir di course player suatu
training. Exam sekarang modul tersendiri, bisa diakses dua jalur:

1. **Training-path**: selesaikan training yang mengarah ke suatu skema → otomatis
   eligible (training = buktinya, tanpa verifikasi/bayar tambahan) → pilih jadwal exam
   di modul Exam → ambil exam.
2. **Direct-path** (tanpa training, untuk kandidat berpengalaman): tergantung
   `certification_schemes.requires_eligibility_verification`:
   - **Skema terbuka**: daftar + bayar `exam_fee` langsung → pilih jadwal → ambil exam.
   - **Skema wajib verifikasi**: daftar + bayar `verification_fee` → upload bukti
     pengalaman/portofolio → Examiner review → **lolos** → bayar `exam_fee` → pilih
     jadwal → ambil exam. **Gagal** → tidak lanjut — **50% dari `verification_fee`
     dikembalikan otomatis** (keputusan 2026-09-08, lihat tabel `eligibility_verifications`
     di bawah).

Lihat alur visual di `PROCESS-FLOWS.md` §10–11.

### `certification_schemes`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| name | text | mis. "Competency Assessor Certification (BNSP)" |
| issuer | text | |
| **scheme_type** | enum | **BARU (v3.5)** — `BNSP`, `KAN`, `International`, `Other`. Basis filter "Scheme Type" di Exam Catalog; opsi dropdown di UI di-derive dari nilai yang benar-benar ada, bukan daftar hardcode — skema baru dengan `scheme_type` baru otomatis muncul sebagai opsi filter |
| **language** | text | **BARU (v3.5)** — bahasa pengantar ujian (mis. "Indonesian", "Bilingual (Indonesian/English)"); basis filter "Language" di Exam Catalog, derived sama seperti `scheme_type` |
| requires_eligibility_verification | boolean | **per-skema**, bukan per-training — beberapa skema terbuka, beberapa wajib verifikasi |
| verification_fee | numeric | 0 jika `requires_eligibility_verification=false` |
| **verification_refund_pct** | int | **BARU (2026-09-08)** — persen `verification_fee` yang dikembalikan kalau eligibility verification ditolak. Default **50** di seed data; per-skema, bukan hardcode di kode (sisa menutup biaya kerja review Examiner) |
| exam_fee | numeric | dibayar kandidat direct-path; kandidat training-path mendapat exam **included** dalam harga training (fee di-waive, lihat `exam_registrations.fee_status`) |
| requires_cpd, cpd_required_annual | boolean/int | dipakai saat sertifikat terbit dari skema ini |
| status | enum | `active`, `retired` |

> Satu `trainings` row punya `certification_scheme_id` opsional (§3). Satu skema bisa
> dipersiapkan oleh lebih dari satu training (mis. training reguler vs. training intensif
> untuk skema yang sama) — relasi one-to-many dari scheme ke trainings.
>
> **Dikelola Operator (v3.7, 2026-09-15)**: sebelumnya PRD §4.18 sudah menyebutkan Operator
> "kelola `certification_schemes` (toggle wajib-verifikasi, atur fee) dan jadwalkan
> `exam_events`" tapi belum pernah dibangun — hanya halaman baca-saja untuk guest yang ada.
> Sekarang Operator punya CRUD penuh: **create + edit** skema (semua field di atas kecuali
> `id`), **create + edit + remove** `exam_events` miliknya.
>
> **Delete skema didukung (v3.8, 2026-09-16)**: sebelumnya tidak ada tombol delete sama
> sekali karena `eligibility_verifications`/registrasi contoh lain mereferensikan skema
> lewat **index array** (`schemeIdx`) di kode prototipe, bukan `id` — menghapus skema akan
> menggeser index dan merusak referensi tsb. Migrasi Stable-ID sudah selesai: seluruh
> referensi (9 titik pakai) sekarang pakai `schemeId` (FK sungguhan), jadi menghapus satu
> skema tidak lagi mempengaruhi skema lain. Tombol Delete sekarang muncul dan berfungsi
> sungguhan, tapi **diblok dengan alasan yang ditampilkan** kalau skema masih punya
> dependent — eligibility verification yang mereferensikannya, atau sesi `exam_events`
> yang sudah ada peserta terdaftar (`seats < capacity`). Hanya bisa dihapus kalau nol
> dependent. Ini pola yang sama seperti "soft-delete dengan dependency check" yang diminta
> dokumen kontrak korektif (§4 dokumen itu), diimplementasikan sebagai hard-delete-jika-aman
> karena prototipe ini tidak punya konsep archive/retired terpisah untuk skema.

### `eligibility_verifications` (hanya untuk direct-path, skema wajib verifikasi)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| certification_scheme_id | uuid FK | |
| evidence_file_urls | jsonb | portofolio/bukti pengalaman kerja yang diunggah |
| verification_fee_payment_status | enum | `pending`, `paid`, `partially_refunded`, `refunded` |
| **refund_amount** | numeric nullable | **BARU (2026-09-08)** — dihitung otomatis: `verification_fee × certification_schemes.verification_refund_pct / 100` saat `status` menjadi `rejected`. Null selama belum ditolak |
| status | enum | `submitted`, `under_review`, `approved`, `rejected`, **`needs_more_info`** (BARU v3.5.1) |
| **info_request_note** | text nullable | **BARU (v3.5.1)** — catatan Examiner saat minta info tambahan (dokumen kurang, atau minta kontak pihak ketiga untuk verifikasi silang). Terisi saat `status` menjadi `needs_more_info` |
| **participant_response** | text nullable | **BARU (v3.5.1)** — balasan kandidat atas `info_request_note`. Mengisi field ini ATAU `participant_response_file` (salah satu cukup) otomatis mengembalikan `status` ke `under_review` (kembali ke antrian Examiner) |
| **participant_response_file** | text nullable | **BARU (v3.5.2)** — nama file dokumen yang di-re-upload kandidat sebagai bagian dari balasan (mis. sertifikat versi lebih jelas). Opsional dan independen dari `participant_response` teks — kandidat boleh kirim salah satu atau keduanya |
| reviewed_by | uuid FK → users nullable | Examiner yang mereview |
| reviewer_notes | text nullable | |
| submitted_at, reviewed_at | timestamp | |

> Training-path TIDAK pernah membuat baris di sini — penyelesaian training dianggap
> setara bukti kelayakan, tanpa proses review kedua.
>
> **`needs_more_info` (v3.5.1, 2026-09-10)**: opsi ketiga selain Approve/Reject.
> Dipakai saat bukti kurang lengkap/tidak jelas, atau Examiner butuh info tambahan
> (mis. kontak pihak ketiga untuk verifikasi silang) — **tanpa** perlu menolak
> aplikasi (yang otomatis memicu refund 50% lewat `verification_refund_pct`).
> Alur: Examiner set `status=needs_more_info` + isi `info_request_note` →
> kandidat lihat catatan itu di My Exams, isi `participant_response` → `status`
> otomatis kembali ke `under_review`, masuk lagi ke antrian Examiner dengan
> catatan asli + balasan kandidat sama-sama terlihat. Bisa berulang beberapa kali
> kalau perlu. `verification_fee_payment_status` **tidak berubah** selama siklus
> ini — bukan refund, hanya menunda keputusan.
>
> **Balasan boleh dokumen, bukan cuma teks (v3.5.2, 2026-09-10)**: ditemukan
> lewat review user — kadang Examiner memang minta dokumen diunggah ulang
> (bukan sekadar klarifikasi tertulis). Kandidat bisa isi `participant_response`
> (teks), `participant_response_file` (upload ulang dokumen), atau keduanya —
> minimal satu wajib terisi untuk mengaktifkan tombol kirim. UI memakai ulang
> komponen file-picker (`fo`) yang sudah dipakai di form upload lain (CV,
> sertifikat, dsb) di seluruh aplikasi — bukan komponen baru.
>
> **Kebijakan refund (keputusan 2026-09-08):** kalau Examiner menolak (`status=rejected`),
> `refund_amount` dihitung otomatis dan `verification_fee_payment_status` berubah ke
> `partially_refunded` setelah dana benar-benar dikembalikan lewat payment gateway. Sisa
> yang tidak dikembalikan menutup biaya kerja review yang sudah dilakukan Examiner —
> berlaku terlepas dari hasil review (approve maupun reject). Persentase diatur per skema
> (`certification_schemes.verification_refund_pct`, default 50), bukan hardcode di kode,
> supaya bisa disesuaikan per jenis sertifikasi tanpa deploy.

### `exam_events` (sesi terjadwal — BARU v3.4, model "Exam Events" ala PECB)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| certification_scheme_id | uuid FK | |
| scheduled_at | timestamp | tanggal & waktu sesi |
| mode | enum | `online`, `onsite` |
| location | text nullable | wajib jika mode=onsite |
| capacity | int | |
| seats_taken | int | computed dari jumlah `exam_registrations` berstatus confirmed pada event ini |

> **BARU (v3.5)** — Exam Catalog memfilter berdasarkan status kursi turunan dari
> `capacity`/`seats_taken`: **Full** (`seats_taken>=capacity`), **Filling Fast**
> (sisa kursi ≤30% dari `capacity`), **Open** (selebihnya). Dihitung di query,
> bukan kolom tersimpan.

### `exam_registrations` (penghubung kandidat ↔ jadwal exam)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| certification_scheme_id | uuid FK | |
| exam_event_id | uuid FK nullable | null sebelum kandidat memilih jadwal |
| source | enum | `training_completion`, `direct_verified`, `direct_open` |
| enrollment_id | uuid FK nullable | jejak audit training mana (jika source=training_completion) |
| eligibility_verification_id | uuid FK nullable | wajib terisi & approved jika source=direct_verified |
| exam_fee_payment_status | enum | `waived_included_in_training`, `pending`, `paid` |
| created_at | timestamp | |

> `exam_attempts` (§4) mereferensikan `exam_registration_id`, bukan lagi item lesson —
> satu attempt = satu kandidat mengambil exam pada satu sesi `exam_events` yang sudah
> mereka daftarkan.

---

## 3b. Question Bank & Exam Authoring (BARU v3.8, Phase 1)

Menggantikan dua kumpulan data seed statis yang sebelumnya tidak punya authoring
UI atau setter sama sekali di kode prototipe: `Od` (3 soal exam generik, dipakai
sama untuk semua skema) dan `hh` (soal quiz per lesson, hanya untuk satu training
demo). Keduanya dimigrasikan sebagai record asli ke `questions` (bukan dihapus),
diberi `id` stabil, tetap bisa ditelusuri kontennya.

### `question_banks`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| certification_scheme_id | uuid FK nullable | **null = bank umum**, lintas-skema (mis. bank hasil migrasi `Od`) |
| name | text | |
| language | text | |

> **Simplifikasi Phase 1**: satu bank per skema (plus satu bank umum). Target penuh
> (dokumen kontrak korektif §5) mengizinkan banyak bank per skema, dikelompokkan
> bebas berdasarkan subjek/modul/bahasa/tujuan — didokumentasikan sebagai arah
> Phase 2, belum diimplementasikan.

### `questions`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| question_bank_id | uuid FK | |
| type | enum | `single_choice`, `multi_choice`, `true_false`, `short_answer`, `essay` |
| stem | text | |
| options | jsonb nullable | array teks pilihan; null untuk `short_answer`/`essay` |
| correct_index | int nullable | untuk `single_choice`/`true_false` |
| correct_indexes | jsonb nullable | array int, untuk `multi_choice` |
| sample_answer | text nullable | referensi manual untuk `short_answer` — bukan auto-scored |
| explanation | text nullable | |
| difficulty | enum | `Easy`, `Medium`, `Hard` |
| topic | text nullable | |
| tags | jsonb | array teks |
| points | int | |
| status | enum | `draft`, `published`, `retired` |

> **Simplifikasi Phase 1 vs. dokumen kontrak korektif §6–8 (Phase 2, belum
> diimplementasikan)**: (1) tipe soal `matching`/`ordering` belum didukung —
> hanya 5 tipe di atas. (2) Tidak ada versioning sungguhan (published question
> versions immutable) — hanya field `status` tunggal; edit menimpa langsung,
> tidak membuat versi baru. Attempt kandidat di prototipe ini juga tidak
> nge-snapshot versi soal (lihat catatan `exam_attempts` di §4). (3) Tidak ada
> alur Review/Approval terpisah (Draft→Review→Approved→Published→Retired) —
> satu aktor (Operator) langsung set `status`, karena prototipe ini tidak
> memodelkan persona Reviewer/Approver terpisah. (4) Tidak ada bulk import/export.
> Semua ini didokumentasikan di sini sebagai target arsitektur penuh untuk
> backend produksi, bukan diimplementasikan di prototipe client-side ini.

### `exam_definitions`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| certification_scheme_id | uuid FK | |
| name | text | |
| version | int | |
| duration_minutes | int | |
| passing_score | int | persen |
| max_attempts | int | |
| selection_mode | enum | `fixed`, `random_topic` |
| question_ids | jsonb | array `questions.id`, dipakai kalau `selection_mode=fixed` |
| random_topic | text nullable | dipakai kalau `selection_mode=random_topic` |
| random_count | int nullable | dipakai kalau `selection_mode=random_topic` |
| status | enum | `draft`, `published` |

> Exam-taking component (`bh`) sekarang membaca soal lewat `exam_definitions` →
> `questions`, bukan lagi langsung dari konstanta `Od`. Setiap skema seed sudah
> diberi satu `exam_definitions` row (mode `fixed`, 3 soal hasil migrasi `Od`) —
> ini **membuktikan perilaku lama tetap terjaga** (jumlah soal/durasi/passing
> score sebelum dan sesudah migrasi identik) sebelum jalur lama sepenuhnya
> ditinggalkan, sesuai permintaan "verify migrated behavior before removing old
> seed-only access path" di dokumen kontrak korektif §22. Fallback tetap ada:
> kalau suatu skema belum punya `exam_definitions` yang published, exam-taking
> kembali ke soal generik lama.
>
> **Simplifikasi Phase 1 vs. dokumen §11–12 (Phase 2, belum diimplementasikan)**:
> tidak ada mode seleksi random-by-difficulty/module, tidak ada exam blueprint
> (section-based composition mis. "10 soal Easy dari Modul 1 + 15 soal Medium
> dari Modul 2"), tidak ada manual-scoring queue terpisah untuk `essay`/
> `short_answer` (soal tipe itu ditandai perlu manual review di UI authoring,
> tapi tidak ada layar antrian penilaian tersendiri), dan tidak ada analytics
> (item facility, pass rate, dsb).

---

## 4. Enrollment & Progress

### `enrollments`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| training_id | uuid FK | |
| status | enum | `upcoming`, `in_progress`, `completed` |
| assigned_by | uuid FK nullable | untuk assignment korporat |
| deadline | date nullable | |
| enrolled_at, completed_at | timestamp | |
| **completed_on_time** | boolean nullable | computed: `completed_at <= deadline` — basis analytics on-time vs late |

> **Assign Training kini benar-benar menulis ke sini (v3.9, 2026-09-16)**:
> sebelumnya tombol "Assign Training" di Corporate Admin (`qv`) cuma
> menampilkan banner sukses lokal — `assigned_by` di atas didokumentasikan
> sejak awal tapi tidak ada kode yang pernah menulisnya. Prototipe sekarang
> punya state client-side `assignedTrainings` (di `Gd`, pola sama seperti
> `schemes`/`questionBanks`) yang benar-benar terisi saat Assign Training
> diklik, dan participant's "My Trainings" membacanya kembali — additive
> terhadap data contoh yang sudah ada, bukan menggantikannya. **Simplifikasi
> prototipe**: hanya karyawan yang punya korespondensi ke persona login
> sungguhan (`personaId`) yang assignment-nya benar-benar terlihat di sisi
> participant — 9 dari 10 baris contoh karyawan (`Lr`) tidak punya
> korespondensi user sungguhan sama sekali (fiksi murni, sejak awal), jadi
> assignment ke mereka tercatat tapi tidak ada login persona yang bisa
> memverifikasinya. Ini murni keterbatasan data demo, bukan keterbatasan
> desain — di backend produksi setiap employee record adalah `users` row
> sungguhan dengan `user_id`, jadi masalah ini tidak akan ada.

### `lesson_progress`
Sama seperti v1.

### `quiz_attempts`
| Field | Type | Note |
|---|---|---|
| ... | | sama seperti v1 |
| is_practice | boolean | percobaan setelah lulus resmi tidak mengubah status |

### `exercise_submissions` / `workshop_submissions`
| Field | Type | Note |
|---|---|---|
| ... | | sama seperti v1 |
| status | enum | `submitted`, `reviewed`, `revision_requested` |
| replaced_at | timestamp nullable | untuk fitur "replace submission" sebelum direview |

### `exam_attempts`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| **exam_registration_id** | uuid FK → exam_registrations | **BARU (v3.4)** — ganti FK lama ke lesson item; satu attempt per sesi exam yang diambil |
| auto_score | numeric nullable | skor sistem, provisional |
| decision | enum | `competent`, `not_yet_competent` — keputusan manusia wajib, auto_score tidak final |
| examiner_id | uuid FK → users | |
| examiner_comment | text nullable | |
| started_at, submitted_at | timestamp | |

---

## 5. Certificates & CPD (Diperluas)

### `certificates`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| **certificate_number** | text unique | **BARU (v3.1)** — nomor human-readable (mis. `DA-2026-000123`), dicetak di sertifikat + di-encode dalam QR; kunci lookup verifikasi publik |
| user_id | uuid FK | |
| **certification_scheme_id** | uuid FK nullable | **BARU (v3.4)** — skema yang benar-benar diperoleh (via `exam_attempts.decision=competent`); null untuk sertifikat lama yang belum bermigrasi |
| training_id | uuid FK nullable | provenance opsional — training mana (jika ada) yang mengantar ke sertifikat ini; null jika direct-exam atau upload manual |
| name, issuer | text | |
| source | enum | `lms`, `manual`, `internal_corporate` |
| issued_at | date | |
| expires_at | date nullable | |
| requires_cpd | boolean | |
| cpd_required_annual | int nullable | |
| **status** | enum | `active`, `grace_period`, `suspended`, `lapsed` (jika requires_cpd) **atau** `active`, `attestation_due`, `dormant` (jika tidak) |
| grace_days_left | int nullable | |
| next_relevance_check_date | date nullable | untuk sertifikat non-CPD, siklus 3 tahun |

### `cpd_cycles` / `cpd_activities`
Sama seperti v1.

### `competency_currency_attestations` (BARU)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| certificate_id | uuid FK | |
| evidence_type | enum | `project_log`, `workload_letter`, `work_sample` |
| file_url | text | |
| note | text | |
| verified_by | enum | `self_attested`, `employer_verified`, `operator_verified` |
| cosigned_by_user_id | uuid FK nullable | PIC yang co-sign, jika employer_verified |
| submitted_at | timestamp | |
| verified_at | timestamp nullable | |

---

## 6. Membership, Billing & Verification Marketplace

### `memberships`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| plan | enum | `free`, `premium` |
| price, billing_cycle | numeric/enum | |
| renewal_date | date | |
| auto_renew | boolean | |
| payment_method_token | text | |

### `membership_invoices`
Sama seperti v1.

### `portfolio_settings`
| Field | Type | Note |
|---|---|---|
| user_id | uuid PK/FK | |
| is_public | boolean | |
| **consent_level** | enum | `full`, `partial`, `request_based` |
| public_slug | text unique | |

### `certificate_visibility`
Sama seperti v1 (per-certificate toggle untuk portfolio publik).

### `profile_views` (BARU)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| participant_user_id | uuid FK | |
| viewer_verifier_account_id | uuid FK nullable | null jika via public link tanpa akun |
| source | enum | `public_link`, `employer_search` |
| viewed_at | timestamp | |

> Basis untuk "Your Visibility" di dashboard peserta (views bulan ini, breakdown sumber) dan "Talent Profile Views" di dashboard employer.

### `verifier_accounts`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| company_name | text | |
| plan | enum | **`basic`, `full_access`** (v3.6, ganti dari `pay_per_request`/`subscription` yang tidak pernah diimplementasikan — lihat §9c) |
| full_access_price | numeric | default **Rp 5.000.000** — contoh/asumsi, mudah diubah, bukan hardcode di kode |
| full_access_expires_at | date nullable | null selama `plan=basic`. Diisi otomatis +1 tahun dari `activated_at` saat verifier mengaktifkan Full Access |

> **`plan=basic` (default, gratis)**: search + lihat profil publik kandidat (nama, headline,
> region, pengalaman, daftar sertifikasi) — persis seperti sebelumnya, tanpa perubahan.
> **`plan=full_access` (berbayar, tahunan)**: unlock **`talent_profiles.phone`/`.email`** dan
> fitur direct message, **unlimited selama masa aktif** — bukan per-aktivitas/pay-per-request.
> Diaktifkan sendiri oleh verifier (self-service, tidak butuh approval Operator — lihat §9c
> untuk urutannya relatif terhadap `access_requests`).

### `verification_requests`
Sama seperti v1 (status pending/approved/denied, payment_status).

> **Full Access vs consent — dua gerbang independen (v3.6)**: `verification_requests` (di atas)
> dan `portfolio_settings.consent_level` mengatur apakah verifier **boleh** melihat **Full
> Verification Report** seorang kandidat (skor ujian, riwayat CPD, transkrip) — itu murni
> keputusan/consent milik kandidat. **Kontak (`users.phone`/`.email`) dan direct message adalah
> gerbang TERPISAH**, dikontrol oleh `verifier_accounts.plan` verifier itu sendiri, **tidak
> pernah** diturunkan dari `consent_level`. Kandidat dengan `consent_level=full` (auto-approve
> laporan lengkap) tetap menyembunyikan kontaknya dari verifier yang belum `plan=full_access`.

### `verifier_search_history` (BARU)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| verifier_account_id | uuid FK | |
| competency_searched | text | |
| region_searched | text nullable | |
| experience_filter | text nullable | |
| results_count | int | |
| matched | boolean | `results_count > 0` |
| searched_at | timestamp | |

> Basis untuk "Search Match Rate & Skill Gap" — agregasi `matched=false` per `competency_searched` menghasilkan daftar skill gap di talent pool.

---

### `certificate_verification_events` (BARU v3.1 — log lookup publik)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| certificate_id | uuid FK | |
| channel | enum | `number_lookup`, `qr_scan`, `bulk_verify` |
| verifier_account_id | uuid FK nullable | terisi hanya untuk bulk_verify |
| ip_hash | text | anti-abuse / rate limiting, bukan identitas |
| looked_up_at | timestamp | |

> Verifikasi by-number/QR adalah **halaman publik gratis** yang menampilkan data minimal:
> nama pemegang, nama training, tanggal terbit, dan **status lifecycle** (Active/Lapsed/…).
> Detail kompetensi tetap consent-gated seperti biasa. **Bulk verify** (upload daftar
> `certificate_number`) adalah fitur berbayar di portal Verifier — endpoint yang sama,
> monetisasi berbeda.

### `training_waitlists` (BARU v3.1)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| training_id | uuid FK | |
| batch_date | date nullable | batch spesifik yang penuh |
| user_id | uuid FK nullable | null jika guest (pakai email) |
| email | text | |
| status | enum | `waiting`, `notified`, `converted`, `expired` |
| created_at, notified_at | timestamp | |

> Muncul saat seats habis ("Join Waitlist" menggantikan "Enroll"). Agregatnya =
> sinyal demand per training/batch untuk keputusan buka kelas baru; barisnya =
> daftar prospek hangat untuk follow-up.

### `upsell_impressions` (v3.1 — kini WAJIB, sebelumnya opsional)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| upsell_key | enum | `agency-upsell`, `corporate-upsell`, `verifier-upsell` |
| shown_at | timestamp | log saat entri sidebar dirender pertama kali per sesi |
| clicked_at | timestamp nullable | klik pembuka modal |
| converted_at | timestamp nullable | diisi saat user mengaktifkan produk terkait |

> Dasar evaluasi aturan targeting §9 (impression → click → conversion per segmen).

### `compliance_reminders` (BARU v3.1 — mesin reminder retensi)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK | |
| certificate_id | uuid FK nullable | |
| kind | enum | `cpd_deadline`, `attestation_due`, `grace_period`, `training_deadline` |
| due_date | date | |
| offset_days | int | jadwal kirim: 90 / 30 / 7 hari sebelum due |
| sent_at | timestamp nullable | |
| channel | enum | `email`, `push` |

> Digenerate otomatis dari lifecycle sertifikat & deadline enrollment. Participant juga
> dapat ekspor **`GET /me/compliance-calendar.ics`** (Google/Outlook). Corporate Admin
> menerima digest bulanan "karyawan yang akan lapse". Sertifikat lapse = churn —
> tabel ini adalah alat retensi utama.

### `orders` (BARU v3.2 — tulang punggung revenue penjualan training)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| buyer_user_id | uuid FK nullable | pembeli individu |
| buyer_company_id | uuid FK nullable | pembelian korporat (salah satu wajib terisi) |
| buyer_type | enum | `individual`, `corporate` |
| status | enum | `pending`, `paid`, `failed`, `refunded` |
| total_amount | numeric | |
| payment_method, payment_ref | text | |
| paid_at, created_at | timestamp | |

### `order_items` (BARU v3.2)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| order_id | uuid FK | |
| training_id | uuid FK | |
| delivery_format | enum | `public_training`, `self_study`, `in_house` — dasar breakdown revenue per aliran |
| unit_price, qty | numeric/int | qty = seats untuk korporat |

> Sebelum v3.2 model TIDAK punya tabel order — revenue training tidak bisa dihitung.
> Semua metrik revenue Management bersumber dari sini + `membership_invoices` + billing verifier.

### `catalog_search_events` (BARU v3.2 — menangkap demand yang tidak terpenuhi)
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| query | text | kata kunci pencarian katalog |
| user_id | uuid FK nullable | null jika guest |
| results_count | int | |
| clicked_training_id | uuid FK nullable | hasil yang diklik (jika ada) |
| searched_at | timestamp | |

> `results_count=0` teragregasi = "top pencarian training yang tidak dimiliki DeAcademy" —
> input langsung untuk keputusan pembuatan training baru (melengkapi Demand Engine §4.12
> yang bersumber dari sisi verifier).

## 7. Reporting

### `report_generations` (BARU — audit log untuk fitur "Generate Report")
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| generated_by_user_id | uuid FK | |
| portal | enum | `operator`, `corporate_admin`, `employer_verifier` |
| period | text | mis. "This Quarter" |
| sections | jsonb | array section key yang dipilih |
| file_url | text nullable | hasil PDF |
| generated_at | timestamp | |

---

## 8. Platform Administration (BARU — portal Super Admin)

### `audit_log`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| actor_user_id | uuid FK → users | |
| actor_role | text | role aktif saat aksi dilakukan |
| action | text | mis. `grade.approve`, `exam.decide`, `verification.approve`, `position.create`, `role.grant`, `report.generate`, `login.sso` |
| entity_type | text | tabel/objek terdampak |
| entity_id | uuid nullable | |
| company_id | uuid FK nullable | scoping tenant bila relevan |
| metadata | jsonb | payload ringkas (nilai lama/baru, alasan) |
| created_at | timestamp | |

> Di v2 baru berupa rekomendasi; kini first-class karena portal Super Admin punya layar **Audit Log**.
> Minimal yang wajib tercatat: semua approve/deny (grading, exam decision, verification request,
> attestation co-sign), `report_generations`, perubahan role/permission, perubahan master data
> positions, provisioning corporate account, dan konfigurasi SSO.

### `sso_connections`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| company_id | uuid FK → companies | SSO enterprise per tenant |
| provider | enum | `saml`, `oidc` |
| issuer_url, metadata_url | text | |
| status | enum | `active`, `disabled` |
| enforced | boolean | `true` = user tenant wajib login via SSO |
| created_at | timestamp | |

> Mendukung tombol "Sign in with SSO (enterprise)" di halaman login dan layar **Security & SSO**
> Super Admin. Detail protokol final ditentukan saat implementasi.

## 9. Upsell Targeting (BARU — derivasi runtime, tanpa tabel wajib)

Upsell adalah entri sidebar terkunci yang dihitung saat login/refresh dari atribut user —
**tidak butuh tabel sendiri**. Referensi eksekusi: `tests/upsell_rules.py::upsells_for`.

| Upsell | Target |
|---|---|
| `corporate-upsell` ("Team Training") | punya `company_id`, belum `corporate_admin` |
| `verifier-upsell` ("Verify Talent") | punya `company_id` **ATAU** `positions.is_hr_family=true`; kecuali sudah `verifier`/`operator` |
| `agency-upsell` ("Manage Clients") | `company_id` null, di workspace Participant |

Ketentuan:
1. Individu HR tanpa perusahaan mendapat **keduanya** (agency + verifier) — keputusan produk 2026-08-24.
2. Copy upsell **menginterpolasi nama perusahaan user** (`companies.name`) — dilarang hardcode.
3. Perubahan `is_hr_family` pada master data langsung mengubah targeting tanpa deploy.
4. Opsional (analytics): tabel `upsell_impressions` (user_id, upsell_key, shown_at, clicked_at) bila ingin mengukur konversi; bukan prasyarat v1.

## 9a. Access Requests (BARU v3.5)

Sebelum v3.5, klik "Request Corporate/Verifier/Agency Access" di modal upsell (§9)
tidak pernah tersimpan — hanya `useState` lokal di komponen modal, hilang begitu
modal ditutup, tidak ada persona manapun yang bisa melihatnya. Tabel ini
memberinya jejak nyata.

### `access_requests`
| Field | Type | Note |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK → users | pemohon |
| company_id | uuid FK nullable | perusahaan pemohon saat ini, jika ada |
| request_type | enum | `corporate`, `verifier`, `agency` — sesuai upsell mana yang diklik (§9) |
| status | enum | `pending`, `approved`, `rejected` |
| submitted_at | timestamp | |
| decided_by | uuid FK → users nullable | Operator yang memutuskan |
| decided_at | timestamp nullable | |
| **activation_fee_status** | enum nullable | **BARU (v3.6)** — `unpaid`, `paid`. Hanya terisi kalau `request_type=corporate`; null untuk verifier/agency (lihat §9c) |
| **activation_fee_amount** | numeric nullable | **BARU (v3.6)** — default **Rp 10.000.000**; contoh/asumsi per akun korporat, bukan hardcode |

> **Kepemilikan queue (keputusan 2026-09-09)**: approve/reject `access_requests`
> adalah wewenang **Operator**, bukan Management — konsisten dengan §11 (Management
> = read-only, tanpa operasi tulis apa pun). Operator sudah pemegang provisioning
> `companies` (§2) dan `staff_assignments`, jadi approving akses konsisten dengan
> tanggung jawabnya sehari-hari. Approve pada `request_type=corporate`/`verifier`
> menambahkan role terkait ke `user_roles` (§1); tidak ada efek data lain.

## 9c. Payment Gates — Verifier Full Access & Corporate Activation (BARU v3.6)

Ditemukan lewat pertanyaan langsung user setelah menguji Access Requests: approve
saja tidak cukup — dua akses ini butuh pembayaran, dan keduanya **terpisah dari
consent/approval yang sudah ada**.

1. **Verifier Full Access** (§6 `verifier_accounts`) — lihat catatan lengkap di
   tabel `verifier_accounts` dan `verification_requests` di atas. Ringkas:
   Approve `access_requests` (request_type=verifier) memberi role `verifier`
   dengan `plan=basic` (gratis, search saja). Upgrade ke `plan=full_access`
   (kontak + messaging, Rp 5.000.000/tahun, unlimited) adalah tindakan
   **self-service verifier sendiri**, kapan saja, tidak melibatkan Operator lagi
   — keputusan eksplisit user: approve dan bayar adalah dua langkah terpisah.
2. **Corporate activation fee** — Approve `access_requests` (request_type=corporate)
   memberi role `corporate_admin` **segera** (sama seperti sebelumnya), TAPI
   `activation_fee_status` dimulai dari `unpaid` (default Rp 10.000.000/tahun,
   angka contoh yang bisa diubah). Operator menandai `paid` setelah menerima
   pembayaran (invoice/transfer manual) — pola yang sama seperti
   `companies.status=pending_activation` yang sudah ada untuk akun yang
   diprovision manual oleh Operator (§2), bukan konsep baru dari nol. Ini
   **terpisah** dari pembelian training/seats (`orders`/`order_items`, §6) —
   activation fee adalah biaya berlangganan workspace Corporate Admin itu
   sendiri, training tetap dibayar terpisah seperti biasa.

Kedua pembayaran ini **tidak memblokir approval** — Operator tetap approve
duluan (role langsung aktif), pembayaran menyusul. Ini keputusan eksplisit user
(bukan asumsi saya) supaya alur approval tetap cepat.

## 10. Multi-Tenancy & Access Control Notes

1. Setiap tabel data spesifik korporat (`trainings` internal, `enrollments`, `employee_profiles`) wajib difilter `company_id` via **Row-Level Security**, bukan hanya filter aplikasi.
2. Konten training internal disimpan di storage bucket **terpisah per company**, signed URL bermasa berlaku pendek — Operator DeAcademy tidak diberi credential akses langsung.
3. `verification_requests`, `portfolio_settings.consent_level`, dan `competency_currency_attestations.verified_by` adalah kontrol privasi yang **wajib divalidasi di backend** sebelum data kompetensi detail di-serialize ke response API untuk verifier.
4. `employee_profiles.employee_id` unik per `company_id` — enforced via composite unique constraint, divalidasi di form "Add Employee".
5. `report_generations` menyimpan jejak audit siapa generate laporan apa, kapan — relevan untuk kepatuhan internal LSP.
6. `users.position_id` wajib mereferensikan `positions.id`; dropdown hanya menampilkan `is_active=true`, dan histori tetap utuh karena baris master data tidak pernah dihapus.
7. Endpoint yang mengubah `positions` atau `user_roles` hanya untuk role `operator`/`admin` dan wajib tercatat di `audit_log`.
8. **Alumni Portfolio (v3.1)**: offboard karyawan = transisi `users.user_type` → `individual` + `employee_profiles.status=offboarded` + cabut akses internal trainings; `certificates`, `cpd_*`, `portfolio_settings` TIDAK disentuh — melekat pada user. Jangan pernah meng-cascade-delete data kompetensi dari relasi company.

## 11. Management Analytics — Peta Metrik → Sumber (BARU v3.2)

Role `management` tidak butuh tabel operasional baru selain di atas — semua metrik derivable.
Rekomendasi: materialized views / rollup harian (`analytics_*`), refresh nightly.

**Aturan pembanding:** setiap metrik revenue/volume harus dapat menyajikan nilai bulan berjalan, bulan sebelumnya, dan bulan yang sama tahun sebelumnya — sehingga rollup wajib menyimpan minimal **24 bulan** berjalan.

| Metrik dashboard | Sumber |
|---|---|
| Revenue per aliran, MoM/YoY | `orders`+`order_items` (per delivery_format) ∪ `membership_invoices` ∪ verifier billing |
| **Corporate revenue** MoM/YoY | `orders` where `buyer_type='corporate'` — in-house **+** kursi public training oleh perusahaan |
| New participants MoM/YoY | `users` (created_at, role participant) |
| Kohor repeat-purchase 1/2/>3 thn | `orders` per user — jarak pembelian terakhir vs sekarang |
| Top/bottom 3 training | `order_items` (revenue) + `enrollments` (volume) |
| Top sertifikasi dicari | `verifier_search_history` (competency_searched, agregat) |
| Top pencarian tak terpenuhi | `catalog_search_events` (results_count=0) |
| Loyalty score | 40% jumlah training selesai (norm.) + 30% tenure + 30% on-time payment streak — formula awal, kalibrasi setelah 2 kuartal data |
| On-time payer | `membership_invoices` (paid_at ≤ due_date, streak) |
| On-time completer | `enrollments` (completed_on_time) + `exam_attempts` (first-attempt pass) |
| Upsell conversion | `upsell_impressions` |
| Corporate NRR / churn-risk | `company_seats` + `orders` korporat + renewal date + compliance |

Akses: R agregat lintas platform; drill-down individu hanya pada konteks leaderboard;
TIDAK ada akses konten training internal korporat (Prinsip isolasi tetap).
