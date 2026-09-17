# DeAcademy — Process Flows (v3.9, terakhir diperbarui 2026-09-16)

Alur proses kunci untuk implementasi backend. Diagram dalam mermaid — render di GitHub/VS Code/artifact viewer. Referensi silang: `PRD.md`, `DATA-MODEL.md`, `API-ENDPOINTS.md`.

---

## 1. Signup dengan Position Dropdown

```mermaid
flowchart TD
    A[Guest membuka Sign Up] --> B["GET /positions?active=true<br/>(dikelompokkan per category, searchable)"]
    B --> C[User isi form:<br/>nama, email, password, position dropdown]
    C --> D{position_id valid &<br/>is_active=true?}
    D -- tidak --> C
    D -- ya --> E[POST /auth/register]
    E --> F[users.position_id tersimpan<br/>role default: participant]
    F --> G["GET /me → upsells[] dievaluasi<br/>(lihat flow #3)"]
    G --> H[Masuk workspace Participant]
```

Tanpa opsi "Other/free text". Kalau posisi user tidak ada di daftar → user memilih yang terdekat; penambahan posisi baru adalah wewenang Operator/Super Admin (flow #2).

---

## 2. Kelola Master Data Posisi (Operator / Super Admin)

```mermaid
flowchart TD
    A[Operator/Super Admin buka<br/>Master Data → Positions] --> B{Aksi}
    B -- Tambah --> C[Isi label + category + toggle is_hr_family]
    C --> D[POST /admin/positions<br/>slug digenerate, is_system=false]
    D --> E[audit_log: position.create]
    B -- Edit --> F{is_system?}
    F -- "false" --> G[PATCH label/category/is_hr_family]
    F -- "true" --> H[Hanya toggle is_active]
    G --> I[audit_log: position.update]
    H --> I
    B -- Hapus --> J{"is_system=false DAN<br/>usage count = 0?"}
    J -- ya --> K[DELETE → audit_log: position.delete]
    J -- tidak --> L[Tolak — tawarkan nonaktifkan]
    E & I & K --> M[Dropdown signup/profil langsung<br/>mencerminkan perubahan]
    M --> N[Perubahan is_hr_family →<br/>targeting upsell berubah tanpa deploy]
```

---

## 3. Evaluasi Upsell saat Login / Refresh Profil

```mermaid
flowchart TD
    A[GET /me] --> B[Muat user: company_id,<br/>position_id → is_hr_family, roles]
    B --> C{workspace Participant?}
    C -- ya --> D{company_id null?}
    D -- ya --> E[+ agency-upsell 'Manage Clients']
    D -- tidak --> F{sudah corporate_admin?}
    F -- tidak --> G[+ corporate-upsell 'Team Training']
    C & F --> H{"company_id ada ATAU<br/>position.is_hr_family?"}
    H -- ya --> I{sudah verifier / operator?}
    I -- tidak --> J[+ verifier-upsell 'Verify Talent']
    E & G & J --> K["Response me.upsells[]<br/>copy diinterpolasi companies.name"]
```

Aturan lengkap + edge case (12 kombinasi teruji): `tests/upsell_rules.py` dan `tests/test_upsell_matrix.py`. Keputusan kunci: **individu HR tanpa perusahaan mendapat agency + verifier sekaligus**.

---

## 4. Alur Belajar: Enroll → Course Player → Selesai Training

**v3.4:** flow ini berhenti di training selesai — exam bukan lagi item course player.
Lanjutannya ada di §10 (training-path masuk modul Exam terpisah).

```mermaid
flowchart TD
    A[Enroll: beli sendiri /<br/>di-assign Corporate Admin] --> B[Course Player:<br/>Module → Lesson/Quiz/Exercise/Workshop]
    B --> C{Quiz lulus<br/>pass_score?}
    C -- tidak --> B
    C -- ya --> D[Unlock item berikutnya<br/>retake = practice saja]
    D --> E[Exercise/Workshop submit<br/>boleh replace sebelum direview]
    E --> F[Tutor: grade in-app<br/>Approve / Request Revision]
    F -- revisi --> E
    F -- approve --> G{Semua modul selesai?}
    G -- tidak --> B
    G -- ya --> H[enrollments.status = completed]
    H --> I{Training punya<br/>certification_scheme_id?}
    I -- tidak --> J[Selesai — tidak ada exam<br/>mis. training umum non-sertifikasi]
    I -- ya --> K["Lanjut ke §10<br/>(exam_registrations dibuat otomatis)"]
```

---

## 5. Verifikasi Talent (Consent-Gated)

```mermaid
flowchart TD
    A[Guest/Verifier cari talent] --> B[Hasil: hanya profil opt-in publik<br/>info dasar + sertifikat aktif gratis]
    B --> C[Verifier request full report]
    C --> D{consent_level participant?}
    D -- full --> E[Auto-approve]
    D -- request_based --> F[Notifikasi ke participant<br/>approve / deny]
    D -- partial --> G[Full report tidak tersedia<br/>hanya ringkasan publik]
    F -- deny --> H[Ditolak — kebijakan refund:<br/>open question PRD §8]
    E & F --> I{status = approved?}
    I -- ya --> J[Backend validasi consent LALU serialize<br/>Full Verification Report + PDF]
    J --> K[audit_log + profile_views tercatat]
```

---

## 6. Lifecycle Sertifikat

```mermaid
stateDiagram-v2
    state "requires_cpd = true" as cpd {
        Active --> GracePeriod: CPD kurang saat cutoff
        GracePeriod --> Active: CPD terpenuhi dalam grace
        GracePeriod --> Suspended: grace habis
        Suspended --> Lapsed: tenggat lewat
        Lapsed --> Active: re-assessment (bukan sekadar susul CPD)
    }
    state "requires_cpd = false" as noncpd {
        Aktif --> AttestationDue: tiap 3 tahun
        AttestationDue --> Aktif: Competency Currency Evidence<br/>(self / employer_verified / operator_verified)
        AttestationDue --> Dormant: tidak direspons
        Dormant --> Aktif: attestation menyusul
    }
```

---

## 7. Verifikasi Sertifikat (Nomor / QR / Bulk) — v3.1

```mermaid
flowchart TD
    A[Sertifikat terbit] --> B[certificate_number unik<br/>dicetak + QR encode URL /verify/:number]
    B --> C{Pintu verifikasi}
    C -- "HR ketik nomor" --> D[GET /public/verify/:number]
    C -- "HR scan QR" --> D
    C -- "Verifier upload daftar" --> E[POST /verifier/bulk-verify<br/>berbayar, butuh akun verifier]
    D & E --> F[Tampilkan: pemegang, training,<br/>issued_at, STATUS lifecycle]
    F --> G[Log certificate_verification_events<br/>+ rate limiting]
    F -.-> H[Detail kompetensi? TIDAK di sini —<br/>jalur consent verification_requests]
```

## 8. Demand Engine — Skill Gap ke Katalog — v3.1

```mermaid
flowchart TD
    A[Verifier mencari kompetensi X] --> B{Ada kandidat?}
    B -- tidak --> C[verifier_search_history<br/>matched=false]
    C --> D[Agregasi periodik per<br/>kompetensi & wilayah]
    D --> E[Operator: widget Demand Signals<br/>→ Training Portfolio Decision Matrix]
    D --> F[Katalog: badge 'N perusahaan<br/>mencari kompetensi ini']
    D --> G[Notifikasi tertarget ke peserta<br/>yang hampir memenuhi prasyarat]
    E --> H[Buka/revisi training] --> I[Talent pool terisi] --> B
```

## 9. Alumni Offboarding — Portfolio Milik Individu — v3.1

```mermaid
flowchart TD
    A[Corporate Admin: offboard karyawan<br/>POST .../offboard] --> B[employee_profiles.status = offboarded<br/>seat dilepas]
    B --> C[users.user_type: corporate_employee → individual<br/>company_id di-null-kan]
    C --> D[CABUT: akses internal trainings korporat]
    C --> E[UTUH: certificates, CPD, portfolio,<br/>enrollment publik yang sedang berjalan]
    E --> F[Notifikasi: 'akunmu berlanjut sebagai akun pribadi'<br/>+ tawaran membership Premium]
    F --> G[Alumni tetap di talent pool<br/>opt-in publik tetap berlaku]
    B --> H[audit_log: employee.offboard]
```

## 10. Exam — Training-Path — v3.4

```mermaid
flowchart TD
    A["Training selesai (§4) dengan<br/>certification_scheme_id"] --> B[exam_registrations dibuat otomatis<br/>source=training_completion<br/>exam_fee_payment_status=waived_included_in_training]
    B --> C[My Exams: peserta lihat<br/>'Lanjut ke Exam →' sudah eligible]
    C --> D[Pilih exam_events: tanggal,<br/>mode online/onsite, kapasitas]
    D --> E[Sesi tiba — kandidat submit exam]
    E --> F[exam_attempts: auto_score = provisional]
    F --> G[Examiner exam-queue: keputusan<br/>Competent / Not Yet Competent]
    G -- competent --> H[Certificate diterbitkan<br/>certification_scheme_id terisi]
    G -- not yet --> I[Peserta diberi tahu<br/>jalur remediasi]
    H --> J[audit_log: exam.decide, certificate.issue]
```

## 11. Exam — Direct-Path (Tanpa Training) — v3.4

```mermaid
flowchart TD
    A[Guest/Participant browse<br/>Exam Catalog / Exam Events] --> B{"Skema requires_<br/>eligibility_verification?"}
    B -- tidak --> C[Daftar + bayar exam_fee langsung]
    B -- ya --> D[Daftar + bayar verification_fee]
    D --> E[Upload bukti pengalaman/portofolio<br/>eligibility_verifications: submitted]
    E --> F[Examiner eligibility-queue: review]
    F -- reject --> G["Tidak lanjut ke exam<br/>50% verification_fee dikembalikan otomatis"]
    F -- approve --> H[Bayar exam_fee<br/>exam_registrations: source=direct_verified]
    F -- "minta info tambahan" --> F2["status=needs_more_info<br/>+ info_request_note (v3.5.1)"]
    F2 --> F3[Kandidat lihat catatan di My Exams<br/>isi participant_response]
    F3 --> F["kembali ke antrian<br/>(status=under_review, verification_fee tidak berubah)"]
    C --> I[exam_registrations: source=direct_open]
    H --> J[Pilih exam_events: tanggal,<br/>mode, kapasitas]
    I --> J
    J --> K[Sesi tiba — kandidat submit exam]
    K --> L[exam_attempts: auto_score = provisional]
    L --> M[Examiner exam-queue: keputusan<br/>Competent / Not Yet Competent]
    M -- competent --> N[Certificate diterbitkan]
    M -- not yet --> O[Kandidat diberi tahu<br/>jalur remediasi/reapply]
```

## 12. Bulk Assign Training per Department (v3.5)

```mermaid
flowchart TD
    A[Corporate Admin buka Assign Training<br/>pilih training dari katalog] --> B[Filter department, mis. HSE]
    B --> C{Training punya<br/>recurrence_months?}
    C -- tidak --> D["Select All in {Department}<br/>pilih semua karyawan di department"]
    C -- ya --> E["Server hitung per karyawan:<br/>enrollments.completed_at + recurrence_months &gt; today?"]
    E -- "ya (belum jatuh tempo)" --> F["Not Due Until {tanggal}<br/>dikecualikan dari bulk-select"]
    E -- "tidak (jatuh tempo / belum pernah)" --> D
    F -.-> G[Tetap bisa ditambah manual<br/>oleh Corporate Admin]
    D --> H[Ganti filter ke department lain<br/>+ Select All lagi]
    H --> I["Seleksi digabung (union)<br/>bukan replace — regresi dari bug lama"]
    I --> J[Submit → POST .../assign-training<br/>department atau employee_ids[]]
    G --> J
    J --> K[enrollments dibuat + notifikasi<br/>response sertakan skipped_count]
```

Menjawab dua kasus dari review lampiran: (1) assign ke department 50 orang tanpa
klik satu-satu, (2) karyawan yang sudah training tahun ini untuk training
recurring tidak otomatis ke-assign ulang, tapi tetap bisa ditambah manual kalau
memang disengaja.

> **Node J ("enrollments dibuat") kini benar-benar diimplementasikan di
> prototipe (v3.9, 2026-09-16)**: sebelumnya diagram ini menggambarkan
> perilaku yang DIDOKUMENTASIKAN tapi tidak pernah dikodekan — klik "Assign
> Training" di kode hanya menampilkan banner sukses lokal, tanpa menulis
> apa pun. Diperbaiki dengan state client-side `assignedTrainings` (pola
> sama seperti `schemes`), ditulis oleh Assign Training, dibaca balik oleh
> participant "My Trainings" — training yang di-assign muncul **digabung**
> dengan training lain milik karyawan tsb, bukan section/tab terpisah,
> sesuai desain `enrollments` yang satu tabel untuk semua sumber
> (`DATA-MODEL.md` §4). Karena data karyawan (`Lr`) di prototipe ini murni
> contoh tanpa korespondensi ke akun login sungguhan (kecuali satu: Ratna
> Wijayanti, Corporate Admin yang juga persona Participant), hanya
> assignment ke beliau yang bisa diverifikasi end-to-end lewat login nyata.

## 13. Access Request — Upsell ke Approval (v3.5)

```mermaid
flowchart TD
    A["Participant klik nav terkunci<br/>(Team Training / Verify Talent / Manage Clients)"] --> B[Modal upsell terbuka<br/>menampilkan upsellTitle sesuai key yang diklik]
    B --> C[Klik Request ... Access]
    C --> D["POST /me/access-requests<br/>request_type diturunkan dari key upsell, bukan input bebas"]
    D --> E[access_requests: status=pending]
    E --> F[Operator: Access Requests queue]
    F --> G{Keputusan}
    G -- approve --> H[user_roles bertambah<br/>role sesuai request_type]
    G -- reject --> I[status=rejected<br/>tidak ada perubahan role]
    H & I --> J[decided_by, decided_at tercatat]
    H -- "request_type=corporate" --> K["activation_fee_status=unpaid<br/>(v3.6, lihat §14)"]
```

Sebelum v3.5, langkah D-J ini tidak ada sama sekali — klik "Request ... Access"
hanya mengubah state lokal di modal (hilang saat modal ditutup), sehingga tidak
ada persona yang bisa melihat atau menindaklanjuti permintaan tsb. Kepemilikan
queue ada di Operator, bukan Management — lihat `ROLES-PERMISSIONS-MATRIX.md`
Prinsip 13.

## 14. Payment Gates — Verifier Full Access & Corporate Activation (v3.6)

User menguji flow §13 lalu bertanya langsung: approve saja tidak menyelesaikan
kebutuhan bisnis — dua akses ini butuh pembayaran, terpisah dari consent
kandidat (untuk Verifier) dan terpisah dari pembelian training (untuk
Corporate).

```mermaid
flowchart TD
    subgraph "Verifier — Full Access (self-service, kapan saja)"
    A1[Role verifier aktif<br/>plan=basic, gratis] --> A2[Search + lihat profil publik<br/>TANPA phone/email]
    A2 --> A3{Klik Activate Full Access<br/>di Billing}
    A3 -- ya --> A4["POST /verifier/full-access/activate<br/>plan=full_access, expires = +1 tahun"]
    A4 --> A5["phone/email + Send Message<br/>terbuka — independen dari consent kandidat"]
    end
    subgraph "Corporate — Activation Fee (Operator-mediated)"
    B1["access_requests approved (§13)<br/>activation_fee_status=unpaid"] --> B2[corporate_admin role AKTIF SEGERA<br/>tidak menunggu pembayaran]
    B2 --> B3[Operator terima pembayaran<br/>invoice/transfer manual]
    B3 --> B4["PATCH .../activation-fee<br/>activation_fee_status=paid"]
    end
```

Keputusan eksplisit user (bukan asumsi): (1) model tahunan unlimited untuk
Verifier, bukan pay-per-request atau campuran; (2) approve dan bayar adalah dua
langkah terpisah untuk keduanya — role/akses aktif duluan, pembayaran menyusul,
supaya alur approval Operator tetap cepat. Lihat `DATA-MODEL.md` §6, §9c.

## 15. Content Authoring — Siapa Mengarang Apa (v3.7)

Ditulis untuk menjawab langsung pertanyaan "siapa yang upload materi, buat quiz,
buat exam" — dan menutup gap yang ditemukan saat mengeceknya ke prototype.

```mermaid
flowchart TD
    A[Training katalog publik] --> B["Operator: metadata + syllabus<br/>(Gv) + pilih tipe konten per modul (sm/Hv)"]
    C[Training internal korporat] --> D["Corporate Admin: metadata (Op)<br/>+ syllabus (v3.7, BARU — dulu buntu)<br/>+ pilih tipe konten per modul (sm/Hv)"]
    B & D --> E["Upload video/slide/audio<br/>(placeholder nama file di prototype)"]
    F[Certification scheme + exam events] --> G["Operator (v3.7, BARU — dulu cuma dokumen)<br/>add+edit+**delete** skema (v3.8), add/edit/remove sesi"]
    H["Isi soal quiz & soal exam<br/>(teks pertanyaan, pilihan, kunci jawaban)"] --> I["Operator — Question Bank + Exam Builder<br/>(v3.8, BARU — dulu data contoh statis tanpa authoring UI)"]
    J[Grading & keputusan exam] --> K["Tutor/Examiner — murni review<br/>tidak pernah mengarang konten"]
```

`Tutor`/`Examiner` sengaja tidak muncul di jalur otoring manapun kecuali node K —
perannya adalah menilai hasil kerja peserta (Exercise/Workshop/Exam/Eligibility
Verification), bukan membuat materi. Detail alur node I ada di §16.

---

## 16. Question Bank + Exam Authoring + Stable-ID Migration (Phase 1, v3.8)

Ditulis setelah user meminta lanjutan langsung dari temuan §15 (soal quiz/exam
masih data contoh statis). Dokumen kontrak korektif eksternal yang sempat
diupload sengaja **tidak dipakai literal** — beberapa tuntutannya (autorisasi
server, audit trail persisten) tidak bisa ada di prototipe client-side-only
ini; scope Phase 1 dikalibrasi sendiri ke kapasitas prototipe, sisanya
didokumentasikan sebagai Phase 2 (lihat `DATA-MODEL.md` §3b).

```mermaid
flowchart TD
    A[Operator buka Question Bank] --> B[Pilih bank per skema<br/>atau bank umum lintas-skema]
    B --> C["+ Add Question — pilih tipe<br/>(single/multi choice, true/false, short answer, essay)"]
    C --> D[Isi stem, opsi + kunci jawaban,<br/>explanation, difficulty, topic, tags, points]
    D --> E{Status?}
    E -- draft --> F[Tersimpan, belum bisa dipakai Exam Builder<br/>hanya terlihat via bank]
    E -- published --> G[Siap dirujuk Exam Definition]
    G --> H[Operator buka Exam Builder]
    H --> I[Pilih skema → + Add Exam Definition]
    I --> J{Selection mode?}
    J -- fixed --> K[Centang soal published dari bank<br/>yang relevan ke skema ini]
    J -- random_topic --> L[Set topic + jumlah soal<br/>diambil acak saat exam dimulai]
    K & L --> M[Set duration, passing score, max attempts, status]
    M --> N["Exam Definition published"]
    N --> O["Peserta klik Start Exam (bh)<br/>→ resolve soal dari Exam Definition + Question Bank"]
    O -.fallback jika belum ada Exam Definition published.-> P["Soal generik lama (3 soal migrasi)"]
```

**Migrasi Stable-ID yang menyertainya** (prasyarat sebelum delete skema bisa
didukung dengan aman — lihat Prinsip 15/16 di `ROLES-PERMISSIONS-MATRIX.md`):

```mermaid
flowchart LR
    A["Sebelum: schemeIdx (index array)<br/>9 titik pakai — Examiner queue, My Exams,<br/>seed eligibility_verifications & registrations"] --> B["Migrasi: schemeId (FK id sungguhan)<br/>di seluruh 9 titik, perilaku dipertahankan"]
    B --> C["exam_events dapat id stabil<br/>(sebelumnya positional-only)"]
    C --> D["Delete Certification Scheme sekarang aman<br/>— diblok dengan alasan kalau ada dependent"]
```

**Yang sengaja belum dibangun (Phase 2, didokumentasikan bukan diimplementasikan)**:
review/approval workflow terpisah (Draft→Review→Approved→Published→Retired
dengan aktor berbeda), question versioning immutable + attempt snapshot,
tipe soal matching/ordering, bulk import/export, exam blueprint (section-based
composition), manual-scoring queue tersendiri untuk essay/short-answer, dan
analytics performa soal. Lihat `DATA-MODEL.md` §3b untuk daftar lengkap.
