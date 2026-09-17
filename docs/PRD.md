# DeAcademy — Product Requirements Document

**Version:** 3.9 (Full Handoff Draft — unified app)
**Owner:** [Nama Anda / LSP]
**Status:** For development scoping — pending technical review

**Changelog v3.9 (2026-09-16):** user bertanya langsung apakah training
internal yang dibuat Corporate Admin akan digabung dengan "My Trainings"
peserta DeAcademy — jawaban desain memang **ya, satu list gabungan** (§4.1,
§4.6), tapi mengecek jawabannya ke kode langsung membongkar gap nyata:
**Assign Training belum tersambung sama sekali**. Tombol itu cuma
menampilkan banner sukses lokal (`useState` boolean), tidak pernah menulis
ke state apa pun — assignment hilang begitu modal/tab ditutup, tidak ada
karyawan yang benar-benar melihatnya di My Trainings mereka. Diperbaiki:
state client-side baru `assignedTrainings` (pola sama seperti
`schemes`/`questionBanks` dari v3.8) yang benar-benar ditulis saat Assign
Training diklik dan dibaca balik oleh My Trainings — additive terhadap data
contoh yang sudah ada (tidak ada regresi). Lihat `DATA-MODEL.md` §4 untuk
detail dan keterbatasan data demo (hanya Ratna Wijayanti yang bisa
diverifikasi end-to-end lewat login sungguhan).

**Changelog v3.8 (2026-09-16):** Question Bank + Exam Authoring + Stable-ID
Migration, Phase 1 — lanjutan langsung dari gap yang ditegaskan di v3.7 ("soal
quiz/exam tetap data contoh, belum ada authoring UI"). User sempat mengupload
dokumen kontrak korektif eksternal yang mendetailkan spesifikasi produksi
penuh; dokumen itu **sengaja tidak dipakai literal** (beberapa tuntutannya —
autorisasi server, audit trail persisten — tidak mungkin ada di prototipe
client-side-only ini) dan dihapus setelah dinilai, tapi user secara eksplisit
meminta lanjut ke isu aslinya dengan scope yang dikalibrasi sendiri. Yang
dibangun: (1) **Question Bank** — Operator bisa membuat/mengedit/
mempublikasikan soal (5 tipe: single/multi choice, true/false, short answer,
essay), menggantikan data contoh statis lama, yang tetap dipertahankan sebagai
record migrasi bukan dihapus. (2) **Exam Builder** — rakit Exam Definition dari
soal published (mode fixed atau random-by-topic). (3) **Stable-ID Migration**
selesai — referensi skema lewat index array (`schemeIdx`, 9 titik pakai)
diganti FK `schemeId` sungguhan; ini yang akhirnya mengizinkan **delete
Certification Scheme** (diblok dengan alasan kalau masih ada dependent) —
sebelumnya (v3.7) tombol delete sama sekali tidak ada. Lihat `DATA-MODEL.md`
§3b untuk field lengkap dan daftar simplifikasi vs. target Phase 2 (versioning,
review/approval workflow, exam blueprint, bulk import, manual-scoring queue,
analytics).

**Changelog v3.7 (2026-09-15):** user bertanya langsung siapa yang mengarang
materi/quiz/exam — jawabannya membongkar 2 gap nyata di prototype (bukan
cuma dokumen). (1) **Internal Trainings** Corporate Admin (§4.6) sebelumnya
tidak bisa punya syllabus sama sekali — "Manage Content" selalu buntu,
diperbaiki dengan editor syllabus yang sama seperti Operator. (2)
**Certification Schemes & Exam Events** (§4.5, §4.18) yang sejak v3.4 cuma
tertulis di dokumen ini tanpa UI, sekarang punya layar sungguhan untuk
Operator. Ditegaskan: soal quiz/exam (teks pertanyaan, jawaban) tetap data
contoh, belum ada authoring UI untuk siapa pun — di luar scope perbaikan
ini.

**Changelog v3.6.1 (2026-09-10):** balasan "Request More Info" (§4.4) sekarang
bisa berupa dokumen yang di-upload ulang, tidak cuma catatan teks — user
memperhatikan langsung dari hasil uji lokal bahwa peserta tidak punya cara
mengirim dokumen baru saat Examiner memintanya.

**Changelog v3.6 (2026-09-10):** dua payment gate baru dari pertanyaan langsung
user setelah menguji Access Requests (§4.5). **Verifier Full Access** (§4.7) —
kontak (no. telp/email) & direct message berbayar tahunan unlimited, aktivasi
self-service, **independen dari consent kandidat** yang sudah ada. **Corporate
activation fee** (§4.5) — approve access request tetap memberi akses segera,
biaya aktivasi workspace ditagih & dikonfirmasi Operator terpisah, tidak
memblokir approval. Lihat §9 Resolved untuk 3 keputusan yang mendasarinya.

**Changelog v3.5.1 (2026-09-10):** Eligibility Verifications dapat opsi ketiga
**Request More Info** (§4.4) — Examiner minta dokumen tambahan/kontak verifikasi
tanpa Reject (yang otomatis memicu refund 50%); kandidat membalas dari My Exams,
permohonan kembali ke antrian dengan histori catatan+balasan terlihat.

**Changelog v3.5 (2026-09-10):** 4 perbaikan UX dari review lampiran (dibandingkan
lagi dengan pola PECB). **Exam Catalog** kini bisa difilter — scheme, tipe
akreditasi (BNSP/KAN/International/Other), bahasa, tanggal, status kursi —
semua opsi di-derive dari data aktif, bukan hardcode (§4.2, §4.18). **Find
Verified Talent** (guest) tambah filter Posisi, memakai master data posisi yang
sudah ada (§4.10). **Assign Training** Corporate Admin bisa bulk-select satu
department sekaligus, otomatis melewati karyawan yang belum jatuh tempo retake
untuk training recurring (§4.6). **Access Requests** (BARU) — permintaan
upgrade Corporate/Verifier/Agency access dari modal upsell sekarang benar-benar
tersimpan dan bisa di-approve/reject, oleh **Operator** (§4.5) — sebelumnya
hilang tanpa jejak begitu modal ditutup, tidak ada yang bisa menindaklanjuti.

**Changelog v3.4 (2026-09-08):** **Exam diputus dari Training** — insight dari
user testing mockup (dibandingkan dengan alur PECB: exam events terpisah dari
katalog training). Exam sekarang modul independen (§4.3, §4.18) dengan dua
jalur masuk: training-path (otomatis eligible) dan direct-path (per-skema:
terbuka atau wajib verifikasi kelayakan berbayar). Guest landing dapat CTA
ketiga (§4.10). Lihat §9 untuk ringkasan keputusan.

**Changelog v3.2 (2026-08-25):** role baru **Management (Head of Academy)** — Executive Workspace 2 menu (Dashboard + Reports berfilter), §4.17, dengan aturan pembanding MoM/YoY wajib; tabel baru `orders`/`order_items` (tulang punggung revenue yang sebelumnya belum ada) dan `catalog_search_events` (menangkap pencarian katalog tanpa hasil).

**Changelog v3.1 (2026-08-24, sesi lanjutan):** lima fitur baru disetujui owner — **Demand Engine dari skill-gap** (§4.12), **Verifikasi sertifikat by-number/QR/bulk** (§4.13), **Waitlist batch penuh** (§4.14), **Compliance reminder & kalender** (§4.15), **Alumni Portfolio** (§4.16); **bundling harga** masuk Business Rules; `upsell_impressions` kini wajib.

**Changelog v3 (2026-08-24):**
- Prototype acuan kini **satu unified app** (`lsp-unified-app.html`): satu login, satu shell, workspace switcher antar role — menggantikan 8 prototype portal terpisah (file `.jsx` per portal tetap berlaku sebagai referensi detail fitur per workspace).
- Role baru: **Super Admin** (identity, access, security, audit) — §4.9.
- **Akses guest tanpa akun**: browse katalog & talent search sebelum signup — §4.10.
- **Position = master data** (dropdown, bukan free text), dikelola Operator/Super Admin — §4.11.
- **Upsell targeting** lintas role berbasis atribut user — §5a.

---

## 1. Background

DeAcademy adalah LMS (Learning Management System) milik sebuah Lembaga Sertifikasi Profesi (LSP), yang berkembang menjadi platform dengan tiga fungsi utama:

1. **LMS pelatihan bersertifikasi** — dijual ke individu maupun korporat, dengan proses assessment lengkap (kuis, exercise, workshop, ujian akhir) dan dua role penilai terpisah: **Tutor** dan **Examiner**.
2. **Portfolio kompetensi & marketplace verifikasi** — peserta membangun rekam jejak kompetensi permanen yang bisa dijadikan referensi melamar kerja, dengan model membership berbayar dan kontrol privasi bertingkat; perusahaan pencari kerja/talent dapat memverifikasi kompetensi kandidat lewat model freemium (info dasar gratis, laporan lengkap berbayar + consent).
3. **LMS-as-a-Service untuk korporat** — perusahaan klien dapat mengelola kompetensi karyawan mereka sepenuhnya di DeAcademy, termasuk membuat **training internal privat** (induction, SOP, kompetensi internal) yang terisolasi penuh dari korporat lain maupun dari staf DeAcademy sendiri.

## 2. Goals & Success Metrics

| Goal | Metric |
|---|---|
| Adopsi platform | Active participants (MoM, YoY), jumlah corporate accounts aktif |
| Revenue (3 aliran) | Training sales, participant memberships, verifier subscriptions |
| Kepatuhan sertifikasi | % CPD compliance, % training compliance korporat, % on-time vs late completion |
| Kepuasan | Satisfaction score — dipisah per segmen (individual vs corporate) |
| Adopsi marketplace verifikasi | Jumlah profile views, verification request, match rate pencarian employer |
| Efisiensi operasional | Turnaround time review tutor/examiner |

## 3. User Roles & Portals

| Role | Deskripsi | Portal (file referensi) |
|---|---|---|
| **Participant** | Individu peserta (mandiri atau karyawan korporat) | `lsp-participant-dashboard.jsx` |
| — | Menjelajah & membeli pelatihan | `lsp-training-catalog.jsx` |
| — | Menjalani pelatihan | `lsp-course-player.jsx` |
| **Tutor** | Menilai Exercise, Workshop; memonitor Quiz (auto-graded) | `lsp-tutor-examiner-review.jsx` |
| **Examiner** | Menilai **hanya** Ujian Akhir Sertifikasi | `lsp-tutor-examiner-review.jsx` |
| **Operator** | Staf internal LSP — kelola seluruh operasi platform | `lsp-operator-dashboard.jsx` |
| **Corporate Admin (PIC)** | HR/L&D perusahaan klien | `lsp-corporate-admin-portal.jsx` |
| **Employer/Verifier** | Perusahaan pihak ketiga pencari/verifikasi kompetensi | `lsp-employer-verifier-portal.jsx` |
| **Management (Head of Academy)** | Pimpinan bisnis DeAcademy — analitik & keputusan strategis, read-only | unified app (workspace "Management", **live**) — 2 menu: Dashboard + Reports |
| **Super Admin** | Staf internal LSP — identity, access, keamanan platform, audit | unified app (workspace "Super Admin") |
| **Public (tanpa login)** | Guest: browse katalog & talent search; siapa saja dengan link portfolio peserta | unified app (landing) + `lsp-public-verification-page.jsx` |

> **Model multi-role (unified app):** satu orang bisa memegang beberapa role sekaligus (mis. Tutor + Examiner; Operator + Participant). Setiap pemegang role non-participant otomatis punya workspace **Participant** untuk belajar bagi dirinya sendiri. UI: satu login → shell dengan workspace switcher; permission dievaluasi per role aktif — lihat `ROLES-PERMISSIONS-MATRIX.md`.

## 4. Feature Scope per Portal

### 4.1 Participant Dashboard
- **Dashboard**: skor kompetensi, ringkasan pelatihan & sertifikat, pengingat
- **My Trainings**: berjalan (breakdown kuis/exercise/workshop belum selesai), akan diikuti, rekomendasi. **Tidak lagi memuat exam** — training yang mengarah ke sertifikasi berakhir di modul terakhir dengan CTA "Lanjut ke Exam →" yang membawa ke **My Exams** (§4.18), bukan item exam di dalam course player yang sama.
- **My Exams** (BARU v3.4): status kelayakan, jadwal exam yang tersedia untuk didaftar, exam yang sudah dibooking, riwayat hasil — lihat §4.18 untuk detail lengkap
- **Certificates**: 
  - Sumber: LMS-issued / manual upload
  - **Status lifecycle CPD**: Active → Grace Period → Suspended → Lapsed (butuh re-assessment)
  - **Status lifecycle non-CPD**: Active → Attestation Due (tiap 3 tahun) → Dormant — peserta submit **Competency Currency Evidence** (project log/workload letter/work sample), opsional **co-sign dari employer** untuk badge "Employer-Verified"
- **CPD/CPE**: per sertifikasi, kategori dengan cap tahunan, submit aktivitas baru
- **Membership**: plan Free/Premium, harga, **tombol Renew manual**, auto-renew toggle, riwayat tagihan
- **Portfolio & Sharing**:
  - Link publik + toggle publik/privat
  - **3 tingkat consent**: Full Access (auto-approve) / Partial (ringkasan publik saja, tidak pernah full report) / Request-Based (approve manual per request)
  - Visibilitas per sertifikat
  - **Your Visibility**: profile views bulan ini (vs bulan lalu), breakdown via public link vs via employer search
- **Verifier Requests**: daftar & approve/deny permintaan akses laporan lengkap

### 4.2 Training Catalog & Purchase
- Catalog dengan filter kategori, search; detail lengkap (deskripsi, learning objectives, syllabus per modul, prerequisites, audience)
- Cart & checkout: Individual vs Corporate (assign seat ke karyawan setelah checkout)
- **Exam Catalog terpisah** (BARU v3.4): katalog serupa tapi untuk skema sertifikasi yang bisa diambil exam-nya langsung tanpa training — lihat §4.18. Guest bisa browse tanpa akun (§4.10)
- **Filter Exam Catalog** (BARU v3.5): Certification Scheme, Scheme Type (BNSP/KAN/International/Other), Language, Exam Date, Seat Availability (Open/Filling Fast/Full). Semua opsi filter **di-derive dari skema yang benar-benar aktif** — menambah skema baru otomatis menambah opsi filter, tidak perlu sentuh kode

### 4.3 Course Player
- Struktur: Module → Item (Lesson, Quiz, Exercise, Workshop) — **Exam bukan lagi item di sini, lihat §4.18 (v3.4)**
- **Lesson**: dua tipe konten — **Video** (single file) atau **Slides + Audio** (paginated, narasi per slide, dibuat dari syllabus topics)
- **Quiz**: instant scoring, harus lulus untuk lanjut; setelah lulus → **Review Mode** (read-only) + **Retake for Practice** (tidak mengubah status resmi)
- **Exercise/Workshop**: reference PDF + downloadable template (xlsx/docx/pptx) + upload hasil kerja; **replace submission** sebelum direview; tutor review **in-app view** (bukan download, hemat storage)
- **Selesai training** (yang punya `certification_scheme_id`): layar penutup training menampilkan CTA "Lanjut ke Exam →" ke modul My Exams — **bukan** unlock item exam di course player yang sama (v3.4)
- Materi tetap bisa diakses ulang setelah lulus (refresh knowledge)

### 4.4 Tutor & Examiner Workspace
- Role switcher (satu akun bisa dua-duanya, tergantung penugasan & tipe training)
- **Tutor**: grading queue (Exercise/Workshop) — skor + feedback + Approve/Request Revision; Quiz Results read-only
- **Examiner**: dua antrian terpisah (v3.4) —
  1. **Exam Review**: kandidat yang sudah mengambil exam (dari jalur mana pun) — skor provisional sistem, keputusan final Competent/Not Yet Competent + komentar
  2. **Eligibility Verifications** (BARU v3.4): permohonan direct-path pada skema wajib verifikasi — review bukti pengalaman/portofolio yang diunggah kandidat, tiga aksi: Approve, Reject, atau **Request More Info** (BARU v3.5.1 — dokumen kurang jelas/lengkap, atau butuh info tambahan mis. kontak pihak ketiga untuk verifikasi silang, tanpa perlu Reject yang otomatis memicu refund). Kandidat membalas lewat My Exams dengan **teks dan/atau dokumen baru** (BARU v3.6.1 — upload ulang, bukan cuma catatan tertulis), permohonan kembali ke antrian dengan catatan Examiner + balasan kandidat sama-sama terlihat — bisa berulang. Approve membuka jalur bayar exam fee bagi kandidat

### 4.5 Operator Console
- **Dashboard**: revenue per aliran (training sales, participant memberships, verifier subscriptions) dengan forecast; active participants (bulan/tahun/3 tahun); **Platform Health** (active corporate accounts + pending activation, **Corporate Satisfaction** dan **Individual Satisfaction dipisah**, verifier accounts, premium members)
- **Reports & Analytics**: filter (period/category/segment); Training Portfolio Decision Matrix (Keep/Revise/Discontinue per training + rationale); Competitive Pricing; sebaran wilayah & posisi peserta; Client Concentration (Pareto risk)
- **Participants**, **Trainings** (content editor: deskripsi/objectives/syllabus + **lesson content setup** video/slides+audio; **Related Trainings picker** — searchable multi-select + auto-suggest berbasis kategori yang sama, untuk mengisi rekomendasi "Recommended for You" di sisi peserta tanpa perlu AI di tahap ini)
- **Corporate Accounts**: self-registered vs **provisioning manual oleh operator** (status Pending Activation)
- **Staff Assignments**: penugasan Tutor/Examiner per training/cohort
- **Certificates & CPD**: breakdown per training, active/expiring/no-expiry, jumlah peserta perlu update CPD
- **Generate Report**: pilih periode + section (Revenue, Participants, Training Performance, Corporate Summary, Certificates & CPD, Staff Performance) → export PDF
- **Access Requests** (BARU v3.5): queue approve/reject untuk permintaan upgrade Corporate/Verifier/Agency access yang dikirim peserta dari modal upsell (§5a) — sebelumnya tidak tersimpan sama sekali, tidak ada persona yang bisa menindaklanjutinya. Wewenang ada di Operator, bukan Management, karena Management sengaja tetap read-only murni (§4.17) — lihat `ROLES-PERMISSIONS-MATRIX.md` Prinsip 13. **Activation fee Corporate** (BARU v3.6): approve tetap memberi akses segera, Operator menandai "Mark as Paid" terpisah setelah menerima pembayaran — tidak memblokir approval
- **Certification Schemes** (BARU v3.7): sebelumnya cuma didokumentasikan (lihat §4.18), sekarang punya layar sungguhan — add + edit skema (nama, issuer, tipe skema, bahasa, toggle wajib-verifikasi, fee) dan add + edit + remove `exam_events` (jadwal sesi) per skema. **Tidak ada delete skema** — direferensikan lewat index array di beberapa tempat, hapus skema akan merusak referensi lama (lihat `ROLES-PERMISSIONS-MATRIX.md` Prinsip 15). Perubahan Operator langsung terlihat di Exam Catalog guest, My Exams peserta, dan antrian Examiner — bukan salinan lokal

### 4.6 Corporate Admin Portal (PIC)
- **Dashboard**: training & CPD compliance, satisfaction, progress distribution, **on-time vs late completion breakdown** (dengan warning kalau late >25%)
- **Employees**: **Employee ID unik** + **Department** untuk disambiguasi nama kembar; status training history (sudah ambil training X atau belum, untuk keputusan assign baru vs refresher)
- **Internal Trainings**: builder training privat (deskripsi/kategori + **syllabus editor**, BARU v3.7 — sebelumnya form pembuatan cuma judul+kategori tanpa cara menambah syllabus sama sekali, jadi "Manage Content" selalu buntu; sekarang pakai editor modul yang sama seperti punya Operator + lesson content setup) — **tidak muncul di catalog publik, tidak bisa diakses korporat lain, konten tidak bisa dilihat operator DeAcademy** (hanya metadata enrollment/completion yang sync)
- **Assign Training**: dropdown gabungan catalog DeAcademy + internal trainings; search by nama/Employee ID/department; badge riwayat training per karyawan. **Bulk-select per department** (BARU v3.5) — tombol "Select All in {Department}" memilih semua karyawan department yang sedang difilter sekaligus (bukan klik satu-satu), seleksi dari department berbeda **digabung** bukan saling menimpa. Untuk training dengan siklus wajib ulang (`recurrence_months`), karyawan yang belum jatuh tempo retake otomatis **dikecualikan** dari bulk-select (badge "Not Due Until ...") — tetap bisa ditambah manual kalau memang disengaja. **Assignment kini benar-benar tersambung ke "My Trainings" karyawan** (BARU v3.9 — sebelumnya klik "Assign Training" cuma banner sukses lokal, tidak pernah tersimpan; training yang di-assign muncul digabung dengan training lain karyawan tsb, bukan section terpisah, lihat §4.1)
- **Certificates & CPD**: scoped ke karyawan sendiri
- **Generate Report**: Training Compliance Summary, Employee CPD Status, Internal Training Progress, Certificates Issued

### 4.7 Employer / Verifier Portal
- **Dashboard**: talent profile views (bulan ini, YoY), **Search Match Rate & Skill Gap** (berapa % pencarian menemukan kandidat vs tidak, daftar kompetensi yang dicari tapi tidak ada di talent pool), consent requests (approved/pending/denied)
- **Talent Search**: filter kompetensi, wilayah, **pengalaman kerja** (Entry/Mid/Senior); hanya menampilkan participant yang opt-in publik. Nama, headline, region, pengalaman, daftar sertifikasi selalu gratis untuk siapa pun dengan akses Verifier
- Request full report → notifikasi ke participant → menunggu consent (kecuali Full Access) → **Full Verification Report** (viewable in-platform, plus tombol Download PDF terpisah)
- **Contact Info & Direct Message** (BARU v3.6, revisi dari model lama): melihat nomor telepon/email kandidat dan mengirim pesan langsung **berbayar tahunan unlimited** ("Full Access", bukan lagi per-request) — dan **independen dari consent kandidat**: kandidat yang sudah memberi Full Access consent untuk laporan lengkapnya tetap tidak menyingkap kontak ke verifier yang belum bayar Full Access. Dua gerbang terpisah yang mudah tertukar kalau tidak eksplisit didokumentasikan
- **Billing**: **Basic (gratis, default)** — search & profil publik saja. **Full Access (Rp 5.000.000/tahun, contoh harga)** — aktivasi self-service kapan saja dari tab Billing, tidak perlu approval Operator, unlock kontak + messaging untuk semua kandidat selama masa aktif. Model lama "subscription vs pay-per-request" digantikan model ini (keputusan 2026-09-10)
- **Generate Report**: Talent Search Activity, Match Rate & Skill Gaps, Verification Requests, Billing Summary

### 4.8 Public Verification Page
- Info publik gratis: nama, headline, **pengalaman kerja**, sertifikat aktif + badge verified
- Laporan lengkap berbayar + consent-gated (simulasi toggle auto-approve vs manual approve untuk demo)

### 4.9 Super Admin Portal (BARU)
- **Overview**: kesehatan identity & access platform
- **User Directory**: semua user lintas tenant — cari, lihat role, status, last login
- **Roles & Permissions**: grant/revoke role per user (setiap perubahan → audit log)
- **Organizations**: semua tenant (corporate accounts, DeAcademy staff org) — status, suspend
- **Security & SSO**: konfigurasi SSO enterprise per tenant (SAML/OIDC), enforcement
- **Audit Log**: read-only, filter per actor/aksi/entitas/periode
- Pemisahan tugas dengan Operator: Operator = operasi bisnis; Super Admin = identity/keamanan/audit. Super Admin **tetap tidak bisa** membaca konten training internal korporat (isolasi tenant berlaku untuk semua role internal).

### 4.10 Guest / Public Experience (BARU, +1 kartu di v3.4)
- Landing tanpa login, tiga pilihan:
  1. **Browse Training Catalog** — semua course, harga, jadwal, format Public Training / Self-Study / In-house
  2. **Find Verified Talent** — profil opt-in publik + sertifikat aktif, gratis. Filter: Certification/Competency, Experience Level, dan **Position** (BARU v3.5, memakai master data posisi §4.11 — bukan taksonomi baru)
  3. **Take a Certification Exam** (BARU v3.4, model "Exam Events" ala PECB) — browse skema sertifikasi yang bisa diambil exam-nya langsung tanpa training, lihat jadwal exam events mendatang, ketahui apakah skema tsb wajib verifikasi kelayakan atau terbuka
- Enroll, checkout, registrasi exam, dan full verification report tetap membutuhkan akun
- CTA signup/sign-in melekat di ketiga alur guest

### 4.11 Position Master Data (BARU — keputusan 2026-08-24)
- Field jabatan (`position`) di signup dan profil adalah **dropdown dari master data**, bukan free text — konsistensi analytics (sebaran posisi peserta, §4.5) dan targeting upsell
- Seed awal: **147 posisi, 15 kategori** (`data/positions.json`); 26 di antaranya ber-flag **`is_hr_family`** (rumpun HR: HR/People Ops, Talent Acquisition, L&D, Comp & Ben, IR, assessor, dsb)
- **Kelola posisi**: Operator dan Super Admin dapat menambah posisi baru dari layar Master Data → Positions (`is_system=false`); entri bawaan tidak bisa dihapus, hanya dinonaktifkan — record user historis tetap resolve
- Judul legacy polos ("Manager", "Staff", "Supervisor") dipetakan via alias ke entri generik saat migrasi

### 4.12 Demand Engine — Skill Gap → Katalog & Peserta (BARU v3.1)
Sumber data sudah ada: `verifier_search_history.matched=false` (kompetensi dicari employer, tidak ada di talent pool). Dua konsumen:
- **Operator — Reports & Analytics**: widget "Demand Signals" — kompetensi paling dicari yang tidak terpenuhi (per periode/wilayah), tersambung ke Training Portfolio Decision Matrix ("buat/revisi training di sini")
- **Participant — notifikasi & katalog**: badge pada training yang menutup gap ("N perusahaan mencari kompetensi ini bulan lalu") + notifikasi tertarget ke peserta yang hampir memenuhi prasyaratnya
- Privasi: hanya agregat (jumlah pencarian), tidak pernah mengungkap identitas verifier ke peserta

### 4.13 Verifikasi Sertifikat — Nomor, QR, Bulk (BARU v3.1)
Setiap sertifikat terbit dengan **`certificate_number`** unik (dicetak + di-encode QR). Tiga pintu ke satu record:
1. **Lookup nomor** di halaman publik `/verify` — gratis, data minimal: pemegang, training, tanggal terbit, **status lifecycle** (pembeda dari sertifikat kertas: status Lapsed/Revoked terlihat)
2. **QR scan** → URL verifikasi yang sama — gratis
3. **Bulk verify** (upload daftar nomor, hasil tabel + export) — fitur **berbayar** portal Verifier
Detail kompetensi (skor, CPD, transkrip) tetap consent-gated; halaman verify tidak menembusnya. Rate limiting + log `certificate_verification_events` untuk anti-abuse.

### 4.14 Waitlist Batch Penuh (BARU v3.1)
Saat `seats` habis, CTA "Enroll" berubah "Join Waitlist" (login maupun guest via email). Peserta waitlist dinotifikasi saat batch baru dibuka / kursi batal. Agregat waitlist tampil di Operator (per training/batch) sebagai sinyal buka kelas.

### 4.15 Compliance Reminder & Kalender (BARU v3.1)
Reminder berjenjang **90/30/7 hari** sebelum: CPD cutoff, attestation due, akhir grace period, deadline training korporat. Kanal email/push + ekspor **ICS** (`/me/compliance-calendar.ics`). Corporate Admin menerima digest bulanan karyawan berisiko lapse. Posisi produk: mesin retensi — sertifikat yang lapse adalah member yang churn.

### 4.16 Alumni Portfolio — Sertifikat Milik Individu (BARU v3.1)
Prinsip: **resign tidak memutus hubungan user dengan platform.** Sertifikat, rekam CPD, dan portfolio melekat pada individu, bukan perusahaan.
- Saat Corporate Admin melepas seat (offboard): `user_type` bertransisi `corporate_employee` → `individual`; sertifikat/CPD/portfolio utuh; `employee_profiles` diarsip (`offboarded`); akses internal trainings korporat dicabut seketika (isolasi tenant tetap)
- User dinotifikasi: "Akun DeAcademy-mu berlanjut sebagai akun pribadi — sertifikatmu tetap milikmu" + tawaran membership Premium (momentum konversi alami)
- Efek strategis: (1) mengisi talent pool marketplace dengan kandidat pre-verified; (2) funnel konversi premium individu; (3) selling point rekrutmen bagi klien korporat — "training di sini = aset karier permanen karyawan"

### 4.17 Management — Executive Workspace (BARU v3.2)

Role `management` (Head of Academy): **read-only, agregat**, tanpa fungsi operasional — terpisah dari Operator (operasi harian) dan Super Admin (identity/keamanan). Karena Head umumnya juga memegang workspace lain (Participant, kadang Operator), navigasinya sengaja dibuat **ramping: hanya 2 menu**.

**Aturan pembanding (wajib):** setiap metrik revenue dan volume **selalu** menampilkan dua pembanding beserta nilainya — **MoM** (vs bulan sebelumnya) dan **YoY** (vs bulan yang sama tahun sebelumnya). Persentase saja tidak cukup; nilai pembandingnya harus terlihat. Konsekuensi teknis: seluruh query analitik minimal menyediakan rentang 24 bulan.

**Definisi Corporate Revenue:** seluruh `orders.buyer_type = 'corporate'` — mencakup in-house training **dan** kursi public training yang dibeli perusahaan. Bukan sekadar in-house.

#### Menu 1 — Dashboard (satu layar)
- **Baris KPI**: Total Revenue · **Revenue Corporate** · Peserta Baru · Repeat Rate · Membership Churn — semuanya dengan pembanding MoM & YoY
- **Grafik revenue 12 bulan** per aliran (Public Training / Self-Study / In-house / Membership / Verifier)
- **"Perlu Perhatian"** — kartu insight yang terbit otomatis dari ambang batas (bukan daftar statis): akun korporat berisiko churn, penurunan repeat rate antar kohor, permintaan tak terlayani, porsi recurring rendah. Tiap kartu menautkan ke report terkait.

Prinsip: dashboard hanya memuat yang **mengubah keputusan minggu ini**; sisanya di Reports.

#### Menu 2 — Reports (berfilter + analisa)
Satu modul dengan pemilih report + filter bar. Filter yang tidak relevan untuk suatu report **dinonaktifkan**, bukan disembunyikan.

| Report | Isi | Filter aktif |
|---|---|---|
| **Revenue** | Total & per aliran; bulan berjalan vs bulan sebelumnya vs bulan sama tahun lalu; porsi corporate & recurring; rincian bulanan | Periode, Segmen |
| **Growth** | Peserta baru MoM/YoY, akun corporate & verifier baru | Periode |
| **Retention** | Kohor repeat-purchase (≤1 / 1–2 / 2–3 / >3 tahun), churn, ketepatan bayar, lapse sertifikat, member dorman | — |
| **Trainings** | Top 3 paling laku & paling tidak laku (enrollment + revenue), completion, median durasi, pass rate percobaan pertama, waitlist | Kategori |
| **Market Demand** | Top 3 sertifikasi paling dicari; top 3 pencarian katalog tanpa hasil; funnel verifier; konversi upsell | — |
| **Leaderboards** | Paling loyal, paling tepat waktu bayar, paling tepat waktu selesai sertifikasi, kesehatan akun korporat (NRR & churn-risk) | — |

- Setiap report diakhiri blok **"Analisa"** — narasi **berbasis aturan** yang dihitung dari angka yang sedang tampil (bukan AI, konsisten dengan keputusan human-curated di §5; dapat ditingkatkan kelak tanpa mengubah UX)
- Tombol **Export PDF** → tercatat di `report_generations`, sama seperti 3 portal manajemen lain

Live di `lsp-unified-app.html` (persona demo: Surya Dharmawan). Referensi desain awal: `docs/_archive-v2-20260824/management-dashboard-preview.html` (standalone, data sampel — superseded).

### 4.18 Exam Module — Diputus dari Training (BARU v3.4, keputusan 2026-09-08)

**Latar belakang**: user testing terhadap mockup menemukan bahwa exam terkubur di dalam
course player suatu training (lihat §4.3 lama) — kandidat berpengalaman yang ingin
langsung ambil sertifikasi tanpa training tidak punya jalan masuk. Dibandingkan dengan
praktik nyata LSP/badan sertifikasi (BNSP maupun PECB — lihat referensi
[pecb.com/en/exam-events](https://pecb.com/en/exam-events)), exam selalu jadi entitas
independen yang bisa dimasuki dari dua arah: lewat training, atau langsung.

**Dua jalur masuk exam:**

| Jalur | Syarat | Biaya |
|---|---|---|
| **Training-path** | Selesaikan training yang `certification_scheme_id`-nya terisi | Exam **included** dalam harga training — tidak ada biaya exam tambahan |
| **Direct-path, skema terbuka** | `certification_schemes.requires_eligibility_verification = false` | Bayar `exam_fee` langsung saat registrasi |
| **Direct-path, skema wajib verifikasi** | `requires_eligibility_verification = true` — submit bukti pengalaman/portofolio, **lolos review Examiner** | Bayar `verification_fee` saat submit → jika lolos, bayar `exam_fee` untuk lanjut. Jika gagal, tidak lanjut ke exam — **50% dari `verification_fee` dikembalikan** (keputusan 2026-09-08, lihat §9) |

Flag `requires_eligibility_verification` melekat di **level skema sertifikasi**, bukan
training — beberapa skema terbuka, sebagian lain wajib verifikasi, tergantung tingkat
formalitas sertifikasinya (keputusan eksplisit owner 2026-09-08).

**Exam Events (terjadwal, bukan self-paced)**: mengikuti model PECB — kandidat yang
sudah eligible (lewat jalur mana pun) memilih **sesi terjadwal** (tanggal, mode
online/onsite, kapasitas) dari `exam_events`, bukan langsung mulai exam kapan saja.
Lebih realistis untuk ujian sertifikasi resmi yang butuh pengawasan (proctoring).

**Layar per role:**
- **Participant** — **My Exams** (§4.1): status kelayakan (kalau lagi direct-path
  verifikasi), daftar exam events yang bisa dibooking, exam yang sudah terjadwal,
  riwayat hasil
- **Guest** — **Exam Catalog** (§4.10): browse skema + jadwal exam events yang tersedia,
  tanpa akun; registrasi & bayar tetap butuh akun
- **Examiner** — antrian **Eligibility Verifications** terpisah dari antrian **Exam
  Review** (§4.4)
- **Operator** — kelola `certification_schemes` (toggle wajib-verifikasi, atur fee) dan
  jadwalkan `exam_events` (tanggal, kapasitas, mode) — layar sungguhan sejak v3.7 (§4.5),
  sebelumnya cuma tertulis di dokumen ini tanpa UI

**Skema data**: `certification_schemes`, `eligibility_verifications`, `exam_events`,
`exam_registrations` — lihat `DATA-MODEL.md` §3a. Alur visual: `PROCESS-FLOWS.md` §10–11.

### 4.19 Question Bank & Exam Authoring (BARU v3.8, Phase 1, keputusan 2026-09-16)

**Latar belakang**: §4.18 di atas menjadwalkan *kapan* exam berlangsung, tapi *isi*
soalnya (teks pertanyaan, pilihan jawaban, kunci jawaban) tetap data contoh statis
tanpa authoring UI sejak awal — ditegaskan sebagai gap terbuka di v3.7 (§9). User
sempat mengupload dokumen kontrak korektif eksternal yang mendetailkan spesifikasi
Question Bank + Exam Authoring produksi penuh (termasuk versioning, workflow
review/approval multi-aktor, exam blueprint, bulk import, backend authorization).
Assessment pra-implementasi (dipersyaratkan dokumen itu sendiri) menemukan
dokumen itu mengasumsikan backend server sungguhan yang tidak ada di prototipe
ini — user memutuskan **membuang dokumen tsb** dan melanjutkan isu aslinya dengan
scope yang dikalibrasi sendiri ke kapasitas prototipe (keputusan 2026-09-16,
lihat §9).

**Dibangun (Phase 1):**
- **Question Bank** — Operator create/edit soal per bank (satu bank per skema, plus
  satu bank umum lintas-skema). 5 tipe soal: single choice, multiple response,
  true/false, short answer (manual reference, bukan auto-scored), essay (selalu
  manual review). Tiap soal: explanation, difficulty, topic, tags, points, dan
  status `draft`/`published`/`retired`. Preview menampilkan persis seperti yang
  akan dilihat kandidat.
- **Exam Builder** — rakit `exam_definitions` dari soal published: mode `fixed`
  (pilih soal eksplisit) atau `random_topic` (ambil acak N soal dari suatu topic
  saat exam dimulai). Atur duration, passing score, max attempts, status.
- **Exam-taking (`bh`, My Exams §4.1) terhubung ke data ini** — bukan lagi
  konstanta statis. Setiap skema seed diberi satu Exam Definition published
  berisi soal migrasi, membuktikan perilaku sebelum/sesudah migrasi identik
  sebelum jalur lama ditinggalkan.
- **Stable-ID Migration** menyertai fitur ini sebagai prasyarat — referensi skema
  lewat index array (`schemeIdx`) di 9 titik pakai diganti FK `schemeId`
  sungguhan; `exam_events` mendapat `id` stabil. Ini juga yang akhirnya
  mengizinkan **delete Certification Scheme** (§4.5) — diblok dengan alasan
  tampil kalau skema masih punya dependent.

**Sengaja belum dibangun (Phase 2 — didokumentasikan sebagai target arsitektur,
bukan diimplementasikan)**: review/approval workflow multi-aktor (Draft→Review→
Approved→Published→Retired dengan Reviewer/Approver terpisah dari Author — prototipe
ini hanya satu aktor, Operator, langsung set status), question versioning immutable +
snapshot per attempt kandidat, tipe soal matching/ordering, bulk import/export,
exam blueprint (section-based composition per modul/difficulty), manual-scoring
queue tersendiri, dan analytics performa soal (item facility, pass rate). Corporate
Admin **tidak** mendapat akses Question Bank/Exam Builder di Phase 1 — internal
training belum punya konsep exam/quiz sama sekali, jadi mendukungnya berarti
merancang konsep baru dulu, bukan sekadar menambah bank.

**Otorisasi**: seperti seluruh fitur lain di prototipe ini, pembatasan akses
Question Bank/Exam Builder ke Operator murni **routing UI berdasarkan persona**,
bukan penegakan server sungguhan — lihat `ROLES-PERMISSIONS-MATRIX.md` Prinsip 16.

**Skema data**: `question_banks`, `questions`, `exam_definitions` — lihat
`DATA-MODEL.md` §3b. Alur visual: `PROCESS-FLOWS.md` §16.

## 5. Business Rules Kunci

- **CPD**: 1 jam CPD = 50 menit aktivitas efektif; target tahunan + akumulasi siklus 3 tahun; kategori tertentu (Webinar, Mentoring) punya cap jam/tahun
- **Status Sertifikat (CPD)**: Active → Grace Period (mis. 90 hari) → Suspended → Lapsed (butuh re-assessment, bukan sekadar susul CPD)
- **Status Sertifikat (non-CPD)**: Active → Attestation Due (tiap 3 tahun) → Dormant jika tidak direspons. Bukti: project log / workload letter / work sample, opsional co-sign employer untuk badge lebih kuat
- **Kelulusan Quiz**: threshold skor per quiz, wajib lulus untuk unlock item berikutnya; retake pasca-lulus = practice, tidak mengubah status resmi
- **Ujian akhir**: skor sistem hanya provisional, keputusan final wajib oleh Examiner manusia
- **Exam diputus dari training (v3.4)**: exam adalah modul independen (§4.18), bukan item course player. Training-path = otomatis eligible + exam included. Direct-path bergantung `certification_schemes.requires_eligibility_verification` (per-skema): terbuka = bayar exam fee langsung; wajib verifikasi = bayar verification fee → review Examiner → lolos → bayar exam fee. Exam selalu diambil lewat **exam event terjadwal**, tidak self-paced kapan saja
- **Tutor vs Examiner**: untuk sertifikasi resmi (mis. BNSP), disarankan orang berbeda demi independensi; untuk training internal boleh sama. Examiner kini juga mereview **eligibility verifications** (direct-path), terpisah dari antrian Exam Review
- **Consent visibility** (participant): Full Access / Partial / Request-Based — sejalan dengan UU PDP
- **Multi-tenancy**: training internal korporat terisolasi penuh — tidak terlihat korporat lain maupun staf Operator DeAcademy (hanya metadata agregat)
- **Employee ID**: unik per company (bukan global) — wajib divalidasi saat Add Employee untuk disambiguasi nama kembar
- **Report Generation**: setiap laporan yang di-generate (Operator/Corporate/Employer) sebaiknya dicatat di audit log (siapa, kapan, section apa)
- **Management read-only (v3.2)**: role `management` tidak pernah memodifikasi data operasional; drill-down ke individu dibatasi konteks leaderboard/analitik internal, tetap tanpa akses konten training internal korporat
- **Revenue backbone (v3.2)**: setiap transaksi pembelian training WAJIB tercatat di `orders`/`order_items` — sumber tunggal seluruh metrik revenue; membership & verifier billing tetap di tabelnya masing-masing dan di-union pada layer pelaporan
- **Alumni continuity (v3.1)**: sertifikat & CPD tidak pernah ikut terhapus/tersuspend karena status kepegawaian; hanya akses konten internal korporat yang dicabut saat offboard
- **Bundling membership (v3.1)**: pembelian training sertifikasi menyertakan **1 tahun membership Premium** — menormalkan pemakaian portfolio sebelum penagihan pertama; renewal tahun ke-2 mengikuti harga normal dengan reminder
- **Verifikasi publik vs consent (v3.1)**: halaman verify by-number/QR hanya menampilkan fakta penerbitan + status; segala detail kompetensi tetap lewat jalur consent §4.8
- **Training Recommendations**: "Recommended for You" di dashboard peserta bersumber dari relasi `related_trainings` yang dikurasi Operator (manual search + auto-suggest kategori sama) — **bukan** rekomendasi berbasis AI di v1. Model ini sengaja human-curated karena rekomendasi salah punya konsekuensi biaya bagi peserta; upgrade ke similarity search/embedding bisa menggantikan mekanisme auto-suggest di kemudian hari tanpa mengubah UX (operator tetap approve setiap link)
- **Opsi filter tidak hardcode (v3.5)**: dropdown filter yang basisnya data yang bisa bertambah (Scheme Type/Language di Exam Catalog, Position di Talent Search) WAJIB di-derive dari nilai yang benar-benar ada (`SELECT DISTINCT` atau setara), bukan enum tetap di kode — skema/posisi baru harus otomatis muncul sebagai opsi tanpa deploy
- **Bulk-assign training menghormati siklus retake (v3.5)**: kalau `trainings.recurrence_months` terisi, bulk-select per department WAJIB mengecualikan karyawan yang `enrollments.completed_at` untuk training yang sama masih dalam window siklus tsb — mencegah re-assign training tahunan ke orang yang baru saja menyelesaikannya. Pengecualian ini default, bukan larangan — admin tetap bisa menambah orang tsb secara manual
- **Access Requests bukan wewenang Management (v3.5)**: approve/reject permintaan upgrade Corporate/Verifier/Agency access ada di Operator — Management tetap 100% read-only (§4.17) tanpa pengecualian untuk fitur baru
- **Payment gates tidak memblokir approval/consent yang sudah ada (v3.6)**: approve Corporate access tetap memberi akses segera — activation fee ditagih & dikonfirmasi Operator terpisah, bukan syarat approve. Full Access Verifier (kontak + messaging, tahunan, unlimited) adalah aktivasi self-service verifier sendiri, **independen dari** `portfolio_settings.consent_level` kandidat — dua validasi terpisah, tidak boleh digabung jadi satu kondisi di backend

## 5a. Upsell Targeting (BARU — keputusan 2026-08-24)

Entri sidebar terkunci (ikon gembok) yang membuka modal penawaran; dihitung dari atribut user, **bukan** dari role semata. Referensi eksekusi: `tests/upsell_rules.py`; skema: `DATA-MODEL.md` §9.

| Upsell | Label | Target |
|---|---|---|
| Agency | "Manage Clients" | tanpa perusahaan (`company_id` null), workspace Participant |
| Corporate | "Team Training" | punya perusahaan, belum Corporate Admin |
| Talent Search | "Verify Talent" | punya perusahaan **ATAU** posisi ber-flag `is_hr_family`; kecuali sudah Verifier/Operator |

Ketentuan:
1. **Individu HR tanpa perusahaan mendapat keduanya** (Agency + Talent Search) — keputusan produk eksplisit.
2. Copy upsell **menginterpolasi nama perusahaan user** — dilarang hardcode. Diperbaiki 2026-09-08: `Fh` di bundle kini menghitung ketiga upsell secara dinamis dari `org`/`roles`/`position` user (bukan lagi entri statis per role), dengan body teks mengambil nama perusahaan dari `${e.org}` alih-alih ditulis tetap.
3. Mengubah flag `is_hr_family` di master data langsung mengubah targeting tanpa deploy.
4. **Klik "Request ... Access" kini tersimpan** (v3.5) — lihat Access Requests (§4.5). Bug yang ditemukan sebelum diperbaiki: identifier upsell mana yang di-trigger tidak ikut diteruskan dari sidebar ke modal, jadi modal "Verify Talent" salah menampilkan konfirmasi "Corporate access". Diperbaiki dengan meneruskan identifier upsell apa adanya, bukan menebak dari label/teks.

## 6. Non-Functional Requirements

- **Keamanan & Multi-tenancy**: row-level access control berbasis `company_id`; isolasi storage konten training internal
- **Kepatuhan Data**: UU PDP — consent eksplisit untuk berbagi data kompetensi ke pihak ketiga; validasi consent di backend, bukan hanya UI
- **File Storage**: video, audio narasi, PPTX, dokumen exercise/workshop, evidence CPD/currency attestation — object storage + signed URL
- **Konversi Media**: PPTX → slide images/HTML (server-side), transcoding video/audio
- **PDF Generation**: untuk Full Verification Report dan Generate Report di 3 portal manajemen — idealnya render HTML-to-PDF dengan watermark + QR code verifikasi ulang
- **Payment Gateway**: individual, corporate invoicing, subscription recurring (membership peserta & verifier plan)
- **Notifikasi**: email/push untuk reminder CPD, deadline training, verifier request, hasil review, aktivasi corporate account

## 7. Out of Scope (v1)

- Mobile native app
- Integrasi payroll/HRIS korporat
- AI-based proctoring ujian
- Feedback loop "marked as hired" di sisi employer (disebutkan sebagai rekomendasi masa depan, belum diimplementasi di prototype)

## 8. Open Questions

- Default consent level untuk peserta baru: Request-Based atau Partial?
- Apakah Operator DeAcademy butuh modul "Internal Training" terpisah untuk pelatihan staf mereka sendiri (paralel dengan Corporate Admin)?
- Kebijakan refund untuk verifier request yang di-deny peserta?
- Siapa yang berwenang memverifikasi Competency Currency Attestation untuk peserta individu (non-corporate) — Operator, atau tetap self-attested?
- Detail protokol SSO enterprise (SAML vs OIDC, provisioning JIT vs SCIM) — layar Security & SSO sudah ada di prototype Super Admin.
- **Berapa lama kandidat boleh mencoba ulang eligibility verification setelah ditolak** (v3.4)? Langsung boleh, atau ada jeda/batas jumlah percobaan?

## 9. Resolved (2026-08-24, +2026-09-08, +2026-09-10, +2026-09-10b, +2026-09-10c, +2026-09-10d, +2026-09-15, +2026-09-16)

- ~~Apakah field posisi cukup free text?~~ → **Master data dropdown** (§4.11), dikelola Operator/Super Admin.
- ~~Siapa target upsell tiap fitur?~~ → matriks §5a; individu HR tanpa perusahaan dapat **dua** upsell.
- ~~Apakah exam boleh diambil tanpa training?~~ → **Ya** (§4.18) — dua jalur, tergantung `certification_schemes.requires_eligibility_verification` per skema.
- ~~Exam self-paced atau terjadwal?~~ → **Terjadwal** (`exam_events`), mengikuti model "Exam Events" PECB — bukan kapan saja seperti quiz.
- ~~Exam direct-path harganya sama dengan yang lewat training?~~ → **Tidak** — direct-path bayar `exam_fee` (+ `verification_fee` kalau skemanya wajib verifikasi); training-path dapat exam included dalam harga training.
- ~~Kebijakan refund `verification_fee` untuk eligibility verification yang gagal review?~~ → **Dikembalikan sebagian: 50%** dari `verification_fee` (keputusan 2026-09-08). Sisa 50% menutup biaya kerja review yang sudah dilakukan Examiner, terlepas dari hasilnya. Persentase ini asumsi default yang bisa disesuaikan — satu angka di `certification_schemes.verification_refund_pct` (lihat `DATA-MODEL.md` §3a), tidak hardcode di kode.
- ~~Siapa yang approve/reject permintaan upgrade Corporate/Verifier/Agency access dari modal upsell?~~ → **Operator** (keputusan 2026-09-09), bukan Management — supaya Management tetap 100% read-only tanpa pengecualian (§4.17, `ROLES-PERMISSIONS-MATRIX.md` Prinsip 13). Dua alternatif lain (taruh di Management, atau duplikasi read-only summary di kedua tempat) ditolak agar prinsip read-only-nya tidak punya celah untuk fitur berikutnya.
- ~~Kalau bukti eligibility verification kurang lengkap/tidak jelas, apa Examiner harus langsung Reject?~~ → **Tidak** — opsi ketiga **Request More Info** (2026-09-10), lihat §4.4. Reject tetap ada untuk kasus yang memang tidak layak (dan tetap memicu refund 50%); Request More Info untuk kasus dokumen kurang/perlu klarifikasi, tanpa refund, tanpa kehilangan slot verifikasi kandidat.
- ~~Bagaimana bulk-assign training menghindari re-assign ke karyawan yang belum jatuh tempo retake?~~ → training dapat field opsional `recurrence_months` (§5); bulk-select per department otomatis mengecualikan karyawan dalam window retake, admin tetap bisa override manual per orang (2026-09-10).
- ~~Bagaimana Exam Catalog difilter tanpa hardcode saat skema sertifikasi bertambah?~~ → skema sertifikasi dapat field `scheme_type` dan `language`; semua opsi filter (termasuk Position di Talent Search) di-derive dari data aktif, bukan enum tetap di kode (2026-09-10, lihat §5).
- ~~Apakah lihat kontak (no. telp/email) & kirim pesan ke kandidat gratis begitu jadi Verifier, dan apakah bisa dipakai per-aktivitas (bayar per lihat)?~~ → **Tidak gratis, dan bukan per-aktivitas** — berbayar tahunan unlimited ("Full Access", Rp 5.000.000/tahun contoh harga), aktivasi self-service verifier sendiri, tidak perlu approval Operator (keputusan 2026-09-10). Model lama di dokumen ("pay-per-request" / "subscription") tidak pernah diimplementasikan dan sekarang resmi digantikan.
- ~~Apakah gerbang kontak/messaging itu sama dengan consent kandidat (Full Access consent) yang sudah ada?~~ → **Tidak — dua gerbang independen** (keputusan 2026-09-10, eksplisit ditekankan user). Consent kandidat mengatur Full Verification Report; billing plan verifier mengatur kontak & messaging. Kandidat full-consent tetap tersembunyi kontaknya dari verifier yang belum bayar Full Access.
- ~~Payment untuk Corporate access itu untuk apa, dan kapan terjadi relatif terhadap approval Operator?~~ → **Biaya aktivasi/subscription workspace Corporate Admin** (Rp 10.000.000/tahun contoh harga), terpisah dari pembelian training (`orders`). **Approve dulu, bayar terpisah** — role aktif segera saat Operator approve, Operator menandai lunas belakangan setelah menerima pembayaran (keputusan 2026-09-10).
- ~~Balasan "Request More Info" cuma bisa teks — bagaimana kalau Examiner memang minta dokumen baru diunggah?~~ → **Bisa** — kandidat sekarang bisa lampirkan dokumen (dan/atau teks) saat membalas, minimal satu wajib diisi (2026-09-10, ditemukan langsung oleh user saat uji lokal).
- ~~Siapa yang upload materi training, buat quiz, dan buat exam — Operator, Tutor/Examiner, atau Corporate Admin?~~ → **Operator & Corporate Admin** mengarang metadata+syllabus+pilihan tipe konten untuk training masing-masing (katalog publik vs internal); **Corporate Admin sebelumnya tidak bisa** (diperbaiki v3.7, lihat §4.6). **Tutor/Examiner tidak pernah mengarang konten** — murni review/grading. **Isi soal quiz/exam** sebelumnya data contoh statis tanpa authoring UI — **sekarang punya Question Bank + Exam Builder sungguhan untuk Operator** (v3.8, Phase 1, lihat §4.19); Corporate Admin tidak dapat akses ini (internal training belum punya konsep exam/quiz sama sekali, di luar scope Phase 1).
- ~~Operator "kelola certification_schemes & jadwalkan exam_events" di §4.18 — itu benar-benar bisa diklik, atau cuma rencana?~~ → **Sebelumnya cuma rencana** (tidak ada UI sama sekali) — sekarang layar sungguhan sejak v3.7. **Delete skema sekarang juga didukung** (v3.8, sebelumnya v3.7 sengaja tidak ada tombol delete sama sekali) — Stable-ID Migration menghapus akar masalahnya (`schemeIdx` → `schemeId`), delete diblok dengan alasan tampil kalau skema masih punya dependent (lihat `ROLES-PERMISSIONS-MATRIX.md` Prinsip 15).
- ~~Dokumen kontrak korektif eksternal yang user upload untuk Question Bank/Exam Authoring — dipakai persis sesuai spesifikasinya?~~ → **Tidak** (keputusan 2026-09-16, eksplisit dari user: "lupakan dokumen... lanjutkan saja ke issue awal"). Assessment pra-implementasi (wajib menurut dokumen itu sendiri, §26) menemukan mismatch fundamental: dokumen mengasumsikan backend produksi sungguhan (autorisasi server, audit trail persisten, versioning tersimpan) yang tidak mungkin ada di `lsp-unified-app.html` (mockup client-side murni, tanpa database/server). Dokumen dihapus dari project folder; isu aslinya (Question Bank + Exam Authoring + Stable-ID) tetap dikerjakan, dengan scope Phase 1 yang dikalibrasi ke kapasitas prototipe — lihat §4.19 dan `DATA-MODEL.md` §3b untuk pembagian Phase 1 (dibangun) vs. Phase 2 (didokumentasikan, belum diimplementasikan).
- ~~Training internal yang dibuat Corporate Admin — nanti muncul di mana saat peserta melakukan pelatihan mandirinya, digabung dengan "My Training" DeAcademy atau terpisah?~~ → **Digabung, satu list, bukan section terpisah** (2026-09-16) — itu memang desainnya sejak awal (§4.1, §4.6; satu tabel `enrollments` menaungi keduanya, dibedakan hanya lewat `training.visibility`). Menjawab pertanyaan ini dengan mengecek kode langsung (bukan cuma dokumen) menemukan gap nyata: **Assign Training belum benar-benar tersambung** — tombol itu cuma banner sukses lokal, assignment tidak pernah tersimpan. Diperbaiki sekaligus (v3.9) — lihat `DATA-MODEL.md` §4.
