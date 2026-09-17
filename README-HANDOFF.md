# DeAcademy — Handoff Package v3.9 (2026-09-16)

## Uji manual (paling cepat)

Buka `lsp-unified-app.html` langsung di browser (double-click). File ini
self-contained — tidak butuh server. Dari layar Sign In, klik salah satu
kartu akun demo:

| Persona | Role |
|---|---|
| Dinda Pramesti | Participant (individu, HR, tanpa perusahaan) |
| Ratna Wijayanti | Corporate Admin (PIC) |
| Nadia Iskandar | Operator |
| Kevin Wijaya | Employer / Verifier |
| Hendra Wijaya | Tutor / Examiner |
| Arya Wicaksono | Super Admin |
| **Surya Dharmawan** | **Management (Head of Academy)** — baru, lihat di bawah |

**Workspace Management** — dua menu:
- **Dashboard** — 5 KPI dengan pembanding MoM & YoY, grafik revenue 12 bulan,
  dan kartu "Perlu Perhatian" yang menautkan ke report terkait (klik salah satu →
  lompat ke Reports dengan report yang sesuai sudah terpilih)
- **Reports** — 6 report (Revenue, Growth, Retention, Trainings, Market Demand,
  Leaderboards) dengan filter periode/segmen/kategori, blok Analisa, dan Export PDF.
  Coba ubah Segmen ke Corporate pada report Revenue — angkanya ikut berubah.

Surya juga punya workspace Participant (org bukan null, jadi tanpa upsell
Manage Clients) — coba "Switch to Participant View". Data dashboard/reports
adalah data sampel fiksi 24 bulan (Sep 2024–Agu 2026), bukan koneksi database.

Uji juga: tombol menu akun (kiri bawah) → switch antar workspace; landing
tanpa login (Browse Training Catalog / Find Verified Talent / **Take a
Certification Exam** — baru); entri sidebar bergembok (upsell).

**Exam kini modul terpisah dari training** (v3.4) — cek dari sisi Participant
(Dinda): menu **My Exams** (terpisah dari My Trainings) menampilkan 3 skenario
sekaligus — sudah eligible lewat training (tinggal pilih jadwal & "Start Exam"),
sedang direview Examiner (jalur langsung, skema wajib verifikasi), dan belum
daftar (jalur langsung, skema terbuka). Dari sisi Hendra (Tutor/Examiner), menu
**Eligibility Verifications** terpisah dari **Exam Review** — coba klik Approve.
Landing tanpa login juga punya katalog exam sendiri (kartu ketiga "Take a
Certification Exam") sebelum login.

**4 perbaikan UX dari review lampiran** (v3.5) — lihat catatan implementasi di
bawah untuk detail: filter di Exam Catalog & Find Verified Talent, bulk-assign
training per department di Corporate Admin, dan module baru **Access
Requests** di Operator.

**2 payment gate baru** (v3.6) — coba dari sisi Kevin Wijaya (Employer/Verifier):
buka Talent Search, klik kandidat manapun → kontak (no. telp/email) & tombol
"Send Message" terkunci di balik "Unlock with Full Access". Pergi ke tab
Billing → "Activate Full Access" → kembali ke kandidat yang sama, kontak & Send
Message sudah terbuka. Dari sisi Nadia Iskandar (Operator): buka Access
Requests → request "Budi Santoso · Corporate access" sudah approved tapi
menampilkan "Activation fee: Unpaid" + tombol "Mark as Paid".

**2 gap content-authoring ditutup** (v3.7) — dari sisi Ratna Wijayanti (Corporate
Admin): Internal Trainings → training "Factory Safety SOP Refresher" (Draft,
"Content Incomplete") → "Edit Syllabus" → tambah modul → "Manage Content" yang
dulu selalu buntu sekarang berfungsi. Dari sisi Nadia Iskandar (Operator): menu
baru **Certification Schemes** → "Add Scheme" untuk skema baru, atau klik skema
yang ada untuk edit fee/toggle verifikasi dan "+ Schedule Session" menambah
jadwal exam — perubahannya langsung terlihat di Exam Catalog guest tanpa reload.

**Question Bank + Exam Authoring + Stable-ID Migration** (v3.8) — dari sisi
Nadia Iskandar (Operator): dua menu baru **Question Bank** (buat/edit soal per
skema, 5 tipe pertanyaan, status draft/published/retired, preview persis
tampilan kandidat) dan **Exam Builder** (rakit Exam Definition dari soal
published, mode fixed atau random-by-topic). Certification Schemes sekarang
juga bisa **Delete** — coba pada skema yang punya eligibility verification
(mis. "Competency Assessor Certification (BNSP)") untuk melihat dialog alasan
kenapa diblok, vs. skema tanpa dependent yang berhasil terhapus. Coba juga My
Exams (Dinda) → Start Exam — soal yang tampil sekarang berasal dari Question
Bank/Exam Definition yang baru, bukan lagi konstanta statis.

**Assign Training kini benar-benar sampai ke My Trainings** (v3.9) — dari sisi
Ratna Wijayanti (Corporate Admin): Assign Training → centang "Ratna Wijayanti"
di daftar karyawan (satu-satunya karyawan contoh yang juga persona login
sungguhan) → Assign Training. Buka menu akun → Participant → My Trainings —
training yang baru di-assign muncul digabung dengan training lain (bukan
section terpisah), sesuai desain "My Trainings" yang selalu satu list
gabungan katalog publik + internal.

## Uji otomatis (Playwright)

```bash
./run-tests.sh
```

Sekali jalan pertama akan membuat `.venv` + mengunduh Chromium (~170 MB).
Hasil yang diharapkan: **92 passed** — semua lulus. Termasuk tes modul Exam
yang diputus dari training (v3.4, +1 Request More Info v3.5.1, +1 upload
dokumen di respons v3.6.1), 10 tes untuk perbaikan UX v3.5 + payment gates
v3.6, 3 tes untuk gap content-authoring v3.7, 4 tes untuk Question Bank +
Exam Authoring + Stable-ID Migration v3.8, 2 tes untuk Assign Training →
My Trainings v3.9, dan kontrak upsell v3.1 yang sudah tuntas diimplementasi
(lihat `tests/README.md`).

## Isi paket

- `lsp-unified-app.html` — prototype terintegrasi: 7 role (Participant,
  Corporate Admin, Operator, Employer/Verifier, Tutor/Examiner, Super Admin,
  **Management**) + guest landing, satu file, tanpa server
- 8 file `.jsx` — referensi detail per workspace (header v3)
- `src/positions-master-data.js` + `data/positions.json` — master data posisi
  (147 entri, 15 kategori, 26 ber-flag HR family)
- `docs/PRD.md`, `docs/DATA-MODEL.md`, `docs/erd.mermaid`,
  `docs/ROLES-PERMISSIONS-MATRIX.md`, `docs/API-ENDPOINTS.md`,
  `docs/PROCESS-FLOWS.md` — dokumen teknis v3.9
- `docs/DeAcademy-Concept-Overview-v3.pptx` — deck 17 slide (belum termasuk
  slide Exam Module v3.4 atau perbaikan UX v3.5/v3.5.1/v3.6/v3.6.1/v3.7/v3.8/v3.9 — lihat catatan di bawah)
- `tests/` + `run-tests.sh` — suite Playwright (92 tes)
- `docs/_archive-v2-20260824/` — versi v2 (27 Jul 2026) dan draf desain awal
  Management dashboard (`management-dashboard-preview.html`, superseded —
  fiturnya kini live di `lsp-unified-app.html`)

## Catatan penting — status kode `lsp-unified-app.html`

File ini adalah **prototype/mockup interaktif**, bukan kode yang dimaksudkan
untuk diteruskan apa adanya ke produksi. Ia adalah output ter-minify dari
esbuild (variabel 1-2 huruf, tanpa sourcemap, tanpa project sumber terpisah di
paket ini) — gaya penulisan ini murni hasil compiler, bukan pilihan gaya
manual, dan sengaja tidak diberi nama variabel deskriptif supaya konsisten
dengan sisa bundle yang sudah begitu sejak awal. **Sumber kebenaran untuk
implementasi asli ada di dokumen** (`PRD.md`, `DATA-MODEL.md`,
`API-ENDPOINTS.md`, `ROLES-PERMISSIONS-MATRIX.md`, `PROCESS-FLOWS.md`,
`erd.mermaid`) — developer sebaiknya menulis ulang fitur dari nol berdasarkan
dokumen tsb dengan clean code sungguhan, bukan menyalin/meneruskan bundle ini.

## Catatan implementasi — role Management

`lsp-unified-app.html` adalah bundle esbuild ter-minify tanpa sourcemap
(tidak ada project sumber terpisah di paket ini). Role Management ditambahkan
langsung ke bundle dengan pola yang sama seperti 6 role lain: entri di peta
label role, peta navigasi, dan satu komponen render yang di-switch berdasarkan
role aktif. Data sampel (24 bulan) dan seluruh logika laporan (chart SVG,
tabel, filter, blok Analisa) ada dalam satu komponen self-contained di bundle
— tidak bergantung pada file eksternal.

## Catatan implementasi — Exam Module (v3.4)

Sama seperti Management, modul Exam ditambahkan langsung ke bundle (bukan
lewat file terpisah): data sampel skema sertifikasi (`Ew`), komponen Exam
Catalog untuk guest (`Fw`), komponen My Exams peserta (`Gw`, memakai ulang
komponen exam-taking `bh` yang sama persis dengan yang dulu ada di course
player — bukan duplikat), dan queue Eligibility Verifications di workspace
Tutor/Examiner. Course player (`Nh`) tidak lagi merender item exam; kurikulum
training berakhir di modul konten terakhir dengan CTA "Continue to
Certification Exam" yang mengarah peserta ke My Exams.

## Catatan implementasi — 4 Perbaikan UX (v3.5, 2026-09-10)

Review lampiran (dibandingkan lagi dengan pola PECB) menemukan 4 gap. Semua
diperbaiki langsung di bundle, mengikuti pola yang sama seperti fitur
sebelumnya (edit minified JS, tanpa file sumber terpisah):

1. **Exam Catalog filter** — skema `Ew` dapat field `schemeType`/`language`,
   event dapat `capacity`; `Fw` di-rewrite dengan 5 filter (Scheme, Scheme
   Type, Language, Date, Seat Availability), semua opsi dropdown di-derive
   dari data lewat `[...new Set(...)]` — pola yang sudah terbukti dipakai di
   "Find Verified Talent".
2. **Find Verified Talent — filter Position** — talent (`Aa`) dapat field
   `position`; `Jv` dapat filter dropdown ke-3 dengan pola identik 2 filter
   yang sudah ada.
3. **Assign Training bulk per department** — `qv`'s "Select All Filtered"
   diperbaiki dari bug lama (bandingkan `length`, bukan keanggotaan — bisa
   menghapus seleksi department lain saat ganti filter) jadi union/difference
   sungguhan, dengan label dinamis "Select All in {Department}". Katalog
   training (`Xp`) dapat field `recurrenceMonths` opsional — kalau terisi,
   karyawan yang belum lewat siklus tsb sejak training terakhir otomatis
   dikecualikan dari bulk-select (badge "Not Due Until ...", tetap bisa
   ditambah manual).
4. **Access Requests** — sebelumnya klik "Request ... Access" di modal upsell
   (`Ah`) cuma `useState` lokal, tidak pernah tersimpan. Sekarang state
   digeser ke komponen App teratas (`Gd`), diteruskan turun ke `Ah` (submit)
   dan ke workspace Operator `Yv` (tab baru "Access Requests", approve/reject
   memakai pola yang sama seperti Eligibility Verifications milik Examiner).
   Perbaikan ini juga menangkap bug lama: identifier upsell (`key`) tidak
   pernah diteruskan dari komponen sidebar (`Ph`) ke modal, jadi konfirmasi
   selalu salah bilang "Corporate access" — sekarang benar mengikuti upsell
   mana yang diklik (Corporate/Verifier/Agency).

Keputusan produk: Access Requests jadi wewenang **Operator**, bukan
Management — Management tetap 100% read-only sesuai prinsip yang sudah
dikunci sejak v3.2 (lihat `ROLES-PERMISSIONS-MATRIX.md` Prinsip 13).

## Catatan implementasi — Eligibility Verification "Request More Info" (v3.5.1, 2026-09-10)

User bertanya langsung: kalau bukti eligibility verification kurang lengkap
atau tidak jelas, apa Examiner harus Reject langsung (yang otomatis memicu
refund 50%)? Jawabannya belum — sampai perbaikan ini. Ditambahkan opsi ketiga
di antrian Eligibility Verifications: **Request More Info**.

Implementasi menyentuh 4 fungsi di bundle: state `eligibilityVerifications`
yang sebelumnya lokal di komponen Examiner (`ch`) **dipindah ke komponen App
teratas** (`Gd`) supaya benar-benar dibagikan antara Examiner dan Participant
— sebelumnya keduanya adalah dua mock array terpisah yang tidak pernah
tersambung (Examiner approve/reject tidak pernah mengubah apa yang dilihat
peserta). Diturunkan ke `ch` (Examiner) lewat `Bv` (workspace peserta) ke `Gw`
(My Exams). Alur: Examiner isi catatan → `status=needs_more_info` → peserta
lihat catatan itu di My Exams (badge "Action Needed") → peserta balas →
`status` otomatis kembali ke antrian Examiner dengan catatan asli + balasan
peserta sama-sama terlihat.

Diverifikasi manual lintas-persona dalam satu sesi browser (sign out/sign in
bergantian, bukan reload halaman — supaya state `Gd` yang dibagikan tetap
utuh) sebelum dianggap selesai, plus 1 test Playwright baru yang melakukan
round-trip yang sama.

## Catatan implementasi — Payment Gates: Verifier Full Access & Corporate Activation Fee (v3.6, 2026-09-10)

User menguji fitur Access Requests (v3.5) lalu langsung menemukan gap bisnis
nyata: approve saja tidak cukup — dua akses ini butuh pembayaran, dan
keduanya harus **independen** dari mekanisme yang sudah ada (consent kandidat
untuk Verifier; approval Operator untuk Corporate).

**Verifier Full Access** (`Yp`, `ah`, `Aa`): talent data (`Aa`) dapat field
`phone`/`email` baru. State `hasFullAccess`/`fullAccessRenewsOn` di level `Yp`
(dipakai oleh tab "search" dan "billing" sekaligus, tidak perlu diangkat ke
`Gd` karena ini data per-sesi verifier sendiri, bukan lintas-persona). Tab
Billing di-rewrite total: dari kartu statis "Verifier Pro" yang tidak pernah
dibaca kode apa pun, jadi model 2-tingkat sungguhan — Basic (gratis, default)
vs Full Access (Rp 5.000.000/tahun, aktivasi 1-klik, unlimited setahun).
Komponen detail kandidat (`ah`) dapat section baru "Contact Information",
**sengaja terpisah** dari section "Full Verification Report" yang sudah ada
(gerbang consent kandidat) — diverifikasi manual: kandidat dengan laporan
lengkap sudah approved tetap menyembunyikan kontaknya sampai verifier
mengaktifkan Full Access sendiri. `asOperator` (staf DeAcademy internal)
bypass paywall ini sepenuhnya.

**Corporate activation fee** (`Gd`, `Yv`): record `access_requests` dapat
field `activationFeeStatus` (`unpaid`/`paid`, hanya relevan untuk
`requestType==="corporate"`). Approve tetap memberi akses segera seperti
sebelumnya — activation fee adalah sub-step tambahan yang muncul di baris
terpisah pada antrian Operator, dengan tombol "Mark as Paid". Pola ini
**sengaja meniru** konsep `pending_activation` + copy invoice manual yang
sudah ada untuk perusahaan yang diprovision langsung oleh Operator (`Kv`/`Qv`)
— bukan konsep baru dari nol.

**Keputusan scope yang sengaja dibuat**: dashboard Corporate Admin (`zv`)
**tidak disentuh sama sekali** — komponen ini tidak menerima prop
persona/company apa pun (selalu merender data demo Ratna Wijayanti yang sudah
mapan), dan banyak test yang sudah ada bergantung padanya render langsung
tanpa gate. Menambahkan gating di sana butuh restrukturisasi jauh lebih besar
(alirkan company/persona dari `Gd` ke `zv`) untuk gap yang sebenarnya hanya
ada di sisi Access Request/approval — bukan di dalam workspace Ratna yang
sudah established. Diverifikasi manual end-to-end di browser untuk kedua alur
(bukan cuma lulus test) sebelum dianggap selesai.

## Catatan implementasi — Upload Dokumen di Respons "Request More Info" (v3.6.1, 2026-09-10)

User menguji lokal dan langsung memperhatikan: form balasan Dinda cuma ada
kotak teks, tidak ada cara mengunggah dokumen — padahal salah satu alasan
Examiner minta info tambahan memang sering "dokumen yang diunggah tidak
terbaca, mohon upload ulang".

Perbaikan memakai ulang komponen file-picker (`fo`) yang **sudah ada** dan
dipakai di banyak tempat lain di aplikasi (upload CV, sertifikat, dokumen
workshop, dsb) — bukan komponen baru. `Gw` (My Exams) dapat state file
terpisah dari teks; tombol Kirim aktif kalau **salah satu** (teks atau file)
terisi, tidak keduanya wajib.

Sambil menulis test untuk ini, ketemu bug nyata: baris "Participant response"
di sisi Examiner (dan "Your previous response" di sisi peserta sendiri)
ternyata hanya muncul kalau field TEKS terisi (`v.participantResponse&&...`)
— kalau peserta kirim file TANPA teks, responsnya tersimpan dengan benar di
data tapi tidak pernah tampil di layar mana pun. Diperbaiki jadi mengecek
teks ATAU file, bukan teks saja. Diverifikasi manual (upload file lewat
simulasi File API karena dialog native OS tidak bisa didorong otomatis) dan
lewat test Playwright memakai `set_input_files` asli sebelum dianggap
selesai.

## Catatan implementasi — Content Authoring: Syllabus Corporate Admin & Certification Schemes Operator (v3.7, 2026-09-15)

User bertanya langsung: bagaimana proses upload materi, buat quiz, buat exam,
siapa yang melakukannya (Operator, Tutor/Examiner, atau Corporate Admin)?
Menjawabnya lewat pengecekan langsung ke bundle (bukan cuma dokumen) membongkar
dua gap nyata:

1. **Corporate Admin — Internal Trainings selalu buntu.** Form "Create Internal
   Training" (`Op`, generic quick-add modal) cuma pernah mengumpulkan 2 field
   (judul, kategori); hasilnya tidak pernah punya `syllabus`, dan tidak ada
   tombol Edit/Add Module di mana pun di tab ini — jadi "Manage Content"
   (`sm`→`Hv`→`fo`) selalu menampilkan pesan "belum ada syllabus" tanpa jalan
   keluar. Diperbaiki dengan modal baru (`Xw`) yang membungkus editor modul
   yang **sama persis** dengan yang sudah dipakai Operator di form training
   katalog publik (`jv`) — bukan komponen baru dari nol. Tombol "Edit Syllabus"
   baru muncul di setiap baris training internal, bersebelahan dengan "Manage
   Content" yang sudah ada.
2. **Operator — Certification Schemes & Exam Events cuma janji di dokumen.**
   `docs/PRD.md` §4.18 sejak v3.4 menyebutkan Operator "kelola
   `certification_schemes` (toggle wajib-verifikasi, atur fee) dan jadwalkan
   `exam_events`" — tapi `Ew` (data skema) adalah konstanta polos tanpa setter
   di mana pun di bundle; satu-satunya UI adalah halaman baca-saja untuk guest
   (`Fw`). Diperbaiki dengan mengangkat `Ew` menjadi state bersama di `Gd`
   (pola yang sama seperti `eligibilityVerifications`/`accessRequests`
   sebelumnya) dan diteruskan ke `th`/`Fw` (guest), `Bv`/`Gw` (peserta), `ch`
   (Examiner), dan tab baru Operator "Certification Schemes" (`Yw` = modal Add
   Scheme, `Zw` = modal edit skema + kelola nested exam events). Perubahan
   Operator langsung terlihat di ketiga persona lain tanpa reload — dibuktikan
   lewat test yang benar-benar sign-out dari Operator lalu cek Exam Catalog
   guest.

**Batasan yang sengaja diambil**: skema sertifikasi **tidak bisa dihapus**
(hanya add + edit) karena direferensikan lewat index array (`schemeIdx`) di
beberapa tempat pada prototype (`Gw`, `ch`) — hapus skema akan menggeser index
dan merusak referensi contoh yang sudah ada. `exam_events` di dalam satu skema
**aman dihapus** (add + edit + remove) karena tidak ada yang menyimpan
referensi ke index event tertentu di luar rendernya sendiri. Ditegaskan juga:
**isi soal quiz/exam (teks pertanyaan, pilihan jawaban) tetap data contoh
statis** untuk semua role — tidak ada authoring UI untuk itu, di luar scope
perbaikan ini, butuh keputusan produk terpisah soal question bank & versioning
sebelum dibangun.

## Catatan implementasi — Question Bank + Exam Authoring + Stable-ID Migration (v3.8, 2026-09-16, Phase 1)

Lanjutan langsung dari batasan yang ditulis di atas (v3.7). User sempat
mengupload dokumen "Corrective Implementation Prompt" eksternal yang
mendetailkan spesifikasi Question Bank + Exam Authoring produksi penuh —
termasuk tuntutan non-negotiable seperti backend authorization sungguhan,
audit trail persisten, dan question versioning immutable. Dokumen itu sendiri
mewajibkan assessment pra-implementasi sebelum kode disentuh (§26); assessment
itu menyimpulkan **mismatch fundamental**: `lsp-unified-app.html` adalah
mockup client-side murni tanpa backend/database sama sekali (didokumentasikan
sejak awal di paket ini), jadi beberapa tuntutan dokumen itu tidak mungkin
dipenuhi literal di artifact ini, apa pun effort yang dicurahkan. User
memutuskan (2026-09-16): **buang dokumennya** ("lupakan dokumen... delete dari
folder"), **tunda terpisah** isu lain yang sempat disinggung (menyambungkan
"Manage Content" ke Course Player sungguhan), dan **lanjutkan isu aslinya**
(Question Bank + Exam Authoring + Stable-ID) dengan scope yang dikalibrasi
sendiri, bukan mengikuti dokumen kata-per-kata.

**Yang dibangun (Phase 1):**

1. **Stable-ID Migration** — `schemeIdx` (index array, 9 titik pakai di `ch`,
   `Gw`, dan seed `Gd`) diganti `schemeId` (lookup by `id` sungguhan) di
   seluruh titik, perilaku dipertahankan (diverifikasi manual lintas-persona:
   Operator, Participant, Examiner — semua tetap menampilkan skema yang benar
   untuk record yang sudah ada, bahkan setelah menambah skema baru).
   `exam_events` yang sebelumnya murni positional sekarang punya `id` stabil.
   Ini **mengizinkan delete Certification Scheme yang sebenarnya** — tombol
   Delete baru di `Zw` (modal edit skema) yang diblok dengan dialog alasan
   (jumlah eligibility verification yang mereferensikannya, atau sesi dengan
   kursi terisi) kalau skema masih punya dependent, dan berhasil menghapus
   kalau nol dependent.
2. **Question Bank** (`questionBanks`, state baru di `Gd`) — dua komponen
   baru: `Uq` (editor soal — stem, 5 tipe pertanyaan dengan editor jawaban
   spesifik per tipe, explanation, difficulty, topic, tags, points, status
   draft/published/retired, tombol "Preview as Candidate") dan tab Operator
   baru "Question Bank" (list bank per skema → drill ke daftar soal → editor).
   Data lama (`Od`, 3 soal exam generik; `hh`, 4 soal quiz modul BNSP)
   dimigrasikan sebagai record asli ke bank `qb-general`/`qb-bnsp-quiz` —
   bukan dihapus, diberi id stabil.
3. **Exam Builder** (`examDefinitions`, state baru di `Gd`) — komponen `Vq`
   (editor exam — nama, duration, passing score, max attempts, mode seleksi
   fixed/random-by-topic dengan question picker, status, preview) dan tab
   Operator baru "Exam Builder". Tiap skema seed sudah diberi satu Exam
   Definition published (mode fixed, referensi 3 soal migrasi dari
   `qb-general`) — komponen exam-taking (`bh`) di-rewire untuk membaca dari
   sini via prop baru (`questions`/`passingScore`/`durationMinutes`), dengan
   **fallback ke `Od` kalau suatu skema belum punya Exam Definition
   published** — memastikan tidak ada regresi ke skema yang belum di-setup.
4. **Audit Log jadi state sungguhan** (`Zp` statis → `auditLog`/`setAuditLog`
   di `Gd`) — aksi create/publish soal, create/update exam definition, dan
   add/edit/delete skema sekarang benar-benar menulis entry baru, terlihat
   langsung di Audit Log Super Admin. Aksi lama yang sudah ada (approve/reject
   eligibility, access request) belum diinstrumentasi — di luar scope
   dibatasi supaya fase ini tetap terkendali.

**Yang sengaja belum dibangun (Phase 2 — didokumentasikan di `DATA-MODEL.md`
§3b sebagai target arsitektur, bukan diimplementasikan di sini)**: workflow
review/approval multi-aktor terpisah dari Author, question versioning
immutable + snapshot per attempt kandidat, tipe soal matching/ordering, bulk
import/export, exam blueprint (section-based composition), manual-scoring
queue tersendiri untuk essay/short-answer, dan analytics performa soal.
Corporate Admin tidak mendapat akses Question Bank/Exam Builder — internal
training belum punya konsep exam/quiz sama sekali.

**Metode edit** (dicatat karena `lsp-unified-app.html` adalah satu file
minified tanpa source map): setiap perubahan dilakukan lewat Python
string-replace pada bundle, divalidasi dengan brace/paren/bracket balance
checker custom (aware terhadap string dan template literal `${}` bersarang)
sebelum ditulis, lalu diverifikasi di tab browser baru (bukan tab lama yang
dipakai berulang — tab lama terbukti memberi error `new Function()` palsu).

## Catatan implementasi — Assign Training → My Trainings (v3.9, 2026-09-16)

User bertanya langsung: training internal yang dibuat Corporate Admin, saat
peserta menjalankannya, apakah digabung dengan "My Training" dari DeAcademy?
Jawaban desainnya memang **ya** (satu `enrollments` menaungi keduanya, lihat
`DATA-MODEL.md` §3/§4) — tapi mengecek jawaban itu ke kode langsung
membongkar gap nyata: **Assign Training tidak pernah benar-benar
tersambung**. Tombol itu (`qv`) cuma flip `useState` boolean lokal untuk
menampilkan banner sukses — tidak ada state yang ditulis, jadi assignment
hilang begitu modal ditutup dan tidak ada karyawan yang benar-benar
melihatnya.

**Kenapa belum pernah ketahuan sebelumnya**: daftar 9 karyawan contoh (`Lr`)
di Assign Training murni fiksi — tidak satu pun cocok dengan persona login
mana pun (`Fd`), jadi tidak ada cara mendemokan "assign ke karyawan X → X
melihatnya" sama sekali, bahkan sebelum tombolnya diperbaiki.

**Fix**: state baru `assignedTrainings` diangkat ke `Gd` (pola sama seperti
`schemes`/`questionBanks` di v3.8) — **additive**, bukan menggantikan array
mock `uo` yang sudah ada, supaya nol risiko regresi ke 90 test yang sudah
lulus. `Lr` dapat entri ke-10: **Ratna Wijayanti** sendiri (Corporate Admin,
sekaligus persona Participant) dengan field `personaId:2` yang tidak
dimiliki 9 entri lain — satu-satunya cara membuat fitur ini benar-benar
demoable end-to-end lewat login sungguhan. Klik Assign Training menulis satu
record per karyawan terpilih ke `assignedTrainings`; participant My Trainings
membaca balik, difilter ke `assignedToPersonaId===persona.id`.

**Bug riset yang ditemukan & diperbaiki di tengah jalan**: eksplorasi awal
salah menyimpulkan cabang render mana yang dipakai persona non-Dinda di My
Trainings — laporan awal bilang semua persona selain Dinda memakai array
`uo` yang kaya (progress bar, quiz/exercise/workshop). Setelah implementasi
pertama, verifikasi manual di browser (bukan cuma balance-check) menunjukkan
Ratna tetap melihat "Nothing enrolled yet". Ternyata kondisinya terbalik:
`Yt=l?.id===1` (true HANYA untuk Dinda), dan struktur `if(!Yt){...cabang
Dt...} return ...cabang uo...` berarti cabang `uo` yang kaya HANYA untuk
Dinda; semua persona lain (termasuk Ratna sebagai Participant) memakai
cabang `Dt` yang lebih sederhana (self-enroll only, item shape
`{title,status,color,continue}`). Fix dipindah ke cabang yang benar-benar
dipakai Ratna. Pelajaran yang sama seperti sesi-sesi sebelumnya: **verifikasi
render sungguhan di browser sebelum menganggap fitur selesai** — riset kode
statis (bahkan oleh agent eksplorasi) bisa salah baca kondisi boolean yang
namanya membingungkan (`Yt`/`!Yt`), dan itu tidak akan ketahuan dari
balance-check atau console-error check saja.

Test baru: `tests/test_assign_training.py` (2 test) — assign lalu verifikasi
muncul di My Trainings Ratna (cross-persona via switch-workspace in-app,
bukan reload); regresi memastikan My Trainings Dinda (cabang `uo`) tidak
berubah sama sekali. Gotcha locator: menambahkan "Ratna Wijayanti" ke daftar
karyawan membuat locator generik `get_by_role("button").filter(has_text=...)`
ambigu (cocok baris karyawan DAN tombol menu akun) — perlu locator lebih
spesifik (`name="Ratna Wijayanti EMP-1001"`), dan test harus pindah tab
sebelum membuka menu akun supaya baris karyawan tidak lagi ada di DOM saat
`switch_role()` mencari tombol menu akun by name-match. Suite: **92 passed**.
Dokumen diupdate ke v3.9 (PRD §4.6/§9 Resolved, DATA-MODEL §4, PROCESS-FLOWS
§12) + tests/README.md + README-HANDOFF.md.
