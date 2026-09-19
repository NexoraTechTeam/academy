/**
 * AI Assistant widget — DeAcademy knowledge (manual KB).
 *
 * Guardrails, same contract as accreditation's: answer ONLY from the approved
 * sources below; no approved source -> CLARIFICATION_NEEDED plus a nudge to
 * record a finding; never present an assumption as an approved requirement;
 * never approve, never assign blame, never decide.
 *
 * Two DeAcademy-specific rules on top of that, straight out of the PRD:
 * "Analisa" in Management and "Recommended for You" are DELIBERATELY not AI
 * (PRD §4.17/§5), and AI proctoring is explicitly out of scope (§7). This
 * assistant positions itself as a guide over the documented model — it does
 * not claim either of those is AI, and does not offer proctoring.
 *
 * The matcher itself lives in widget/core/engine.js, shared verbatim with
 * accreditation, so the two apps cannot drift apart in how they match.
 */
import { GENERATED_RULES } from './knowledge.generated.js';
import { createAnswerEngine } from './core/engine.js';

export const SOURCES = {
  PRD: 'docs/PRD.md',
  DATA_MODEL: 'docs/DATA-MODEL.md',
  ROLES: 'docs/ROLES-PERMISSIONS-MATRIX.md',
  FLOWS: 'docs/PROCESS-FLOWS.md',
  API: 'docs/API-ENDPOINTS.md',
  ERD: 'docs/erd.mermaid',
  APP: 'runtime application state',
  WIDGET: 'docs/widget-readiness-ai-assistant.md (experiment)',
};

const RULES = [
  {
    id: 'multi-tenant',
    match: ['multi tenant', 'multitenant', 'isolasi', 'company id', 'tenant', 'lintas perusahaan', 'data perusahaan lain', 'corporate admin lihat apa'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['ROLES', 'DATA_MODEL'],
    answer: () =>
      `Isolasi multi-tenant (Prinsip 1) wajib di-scope lewat company_id: Corporate Admin HANYA data perusahaannya sendiri. ` +
      `Operator DeAcademy boleh melihat METADATA training internal korporat (jumlah, status, enrollment count) tapi TIDAK boleh membaca kontennya (deskripsi, syllabus, video, slide, audio) — ` +
      `dan Super Admin pun tidak (Prinsip 10: akses konten internal korporat bukan bagian dari identity/security). ` +
      `Employee ID unik per company_id, bukan global (Prinsip 6), jadi dua perusahaan boleh punya nilai sama tanpa konflik.`,
  },
  {
    id: 'consent-gating',
    match: ['consent', 'persetujuan', 'portfolio settings', 'verification request', 'lihat skor orang', 'data kompetensi', 'transkrip', 'attestation'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['ROLES', 'FLOWS'],
    answer: () =>
      `Data kompetensi detail (skor ujian, riwayat CPD, transkrip, Competency Currency Attestation) hanya boleh diserialize ke Employer/Verifier SETELAH backend memvalidasi ` +
      `portfolio_settings.consent_level dan/atau verification_requests.status = approved (Prinsip 2). Validasi di server — menyembunyikan di frontend saja tidak cukup. ` +
      `Alurnya di PROCESS-FLOWS §5 (Verifikasi Talent, consent-gated). ` +
      `Corporate Admin (PIC) bisa meng-approve attestation karyawannya sendiri → badge "Employer-Verified", lebih kuat dari self-attested (Prinsip 4).`,
  },
  {
    id: 'management-readonly',
    match: ['management', 'read only', 'readonly', 'baca saja', 'boleh menulis', 'management bisa apa', 'surya'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['ROLES'],
    answer: () =>
      `Role management = READ-ONLY strategis, 100%, TANPA PENGECUALIAN (Prinsip 11): agregat lintas platform + leaderboard, tanpa satu pun operasi tulis pada data operasional. ` +
      `Berbeda dari Operator (menjalankan bisnis) dan Super Admin (identity & keamanan). ` +
      `Konsekuensi yang sering disalahpahami: approve/reject Access Request ada di OPERATOR, bukan Management (Prinsip 13, keputusan 2026-09-09) — justru supaya Prinsip 11 tidak bocor. ` +
      `Kalau Anda menemukan satu saja tombol tulis di workspace Management, itu finding.`,
  },
  {
    id: 'duty-separation',
    match: ['tutor', 'examiner', 'separation of duties', 'pemisahan tugas', 'super admin', 'operator beda', 'independensi'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['ROLES'],
    answer: () =>
      `Dua pemisahan berbeda. (1) Tutor dan Examiner adalah permission set BERBEDA (Prinsip 3); untuk training sertifikasi resmi sistem sebaiknya MEMPERBOLEHKAN — tidak mewajibkan — orang berbeda, demi independensi. ` +
      `(2) Super Admin ≠ Operator (Prinsip 10): Operator memegang operasi bisnis (trainings, participants, corporate accounts, laporan); Super Admin memegang identity, access, keamanan, audit. ` +
      `Super Admin TIDAK mendapat akses konten training internal korporat.`,
  },
  {
    id: 'payment-gates',
    match: ['payment', 'pembayaran', 'bayar', 'gerbang pembayaran', 'billing', 'aktivasi corporate', 'verifier full access'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['ROLES', 'FLOWS'],
    answer: () =>
      `DUA gerbang pembayaran INDEPENDEN (Prinsip 14, keputusan 2026-09-10) — dan keduanya TIDAK memblokir langkah yang sudah ada: ` +
      `(a) Corporate: approve access_requests tetap memberi role corporate_admin segera; pembayaran mengaktifkan kapasitas/seat, bukan role-nya. ` +
      `(b) Verifier: pembayaran membuka full access; consent/verification tetap jalur terpisah. ` +
      `Jangan pernah menggabungkan validasi keduanya, dan jangan menjadikan pembayaran prasyarat approval atau consent. Alur lengkap: PROCESS-FLOWS §14.`,
  },
  {
    id: 'exam-eligibility',
    match: ['exam', 'ujian', 'eligibility', 'kelayakan', 'direct path', 'training path', 'certification scheme', 'skema sertifikasi'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['FLOWS', 'DATA_MODEL'],
    answer: () =>
      `Sejak v3.4 exam DIPUTUS dari training — bukan lagi item di course player, tapi modul independen dengan dua jalur masuk (Prinsip 12): ` +
      `training-path (otomatis eligible setelah training selesai, PROCESS-FLOWS §10) dan direct-path (tanpa training, tergantung certification_schemes.requires_eligibility_verification, §11). ` +
      `Kalau skema menuntut verifikasi kelayakan, direct-path harus melewati Eligibility Verification dulu — itu antrean milik Tutor/Examiner.`,
  },
  {
    id: 'workspace-switching',
    match: ['workspace', 'pindah role', 'switch role', 'switching', 'role switching', 'ganti workspace', 'multi role', 'satu login', 'role aktif'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['ROLES'],
    answer: (ctx) =>
      `Satu login, satu shell (Prinsip 8): setiap pemegang role non-participant OTOMATIS punya workspace Participant juga. ` +
      `Permission dievaluasi per role AKTIF — berpindah workspace MENGUBAH KONTEKS, TIDAK MENAMBAH HAK. ` +
      `Jadi kalau pindah workspace membuat sesuatu yang tadinya terlarang jadi mungkin, itu finding.` +
      (ctx?.reviewer?.role ? ` Sesi ini Anda sedang sebagai ${ctx.reviewer.role}.` : ''),
  },
  {
    id: 'not-ai',
    match: ['apakah ai', 'pakai ai', 'ai beneran', 'machine learning', 'rekomendasi', 'recommended for you', 'analisa management', 'proctoring'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['PRD'],
    answer: () =>
      `Penting dan sering salah paham: "Analisa" di Management dan "Recommended for You" SENGAJA BUKAN AI (PRD §4.17/§5) — keduanya rule-based di atas data yang sudah ada. ` +
      `AI proctoring ujian eksplisit OUT OF SCOPE (PRD §7). ` +
      `Widget ini sendiri juga bukan AI generatif: jawabannya deterministik dari docs/ + state runtime, dan kalau tidak ada sumbernya saya bilang tidak tahu, bukan mengarang.`,
  },
  {
    id: 'audit-trail',
    match: ['audit log', 'audit trail', 'jejak audit', 'tercatat', 'siapa approve', 'report generations'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['ROLES', 'DATA_MODEL'],
    answer: () =>
      `Setiap aksi approve/deny (grading, exam decision, verification request, attestation co-sign) dan setiap report_generations sebaiknya tercatat di tabel audit_log (Prinsip 7) — ` +
      `penting karena ini sertifikasi profesi yang bisa diaudit regulator. ` +
      `Scope laporan juga dibatasi: tiap role manajemen hanya bisa generate laporan dalam scope data yang boleh ia baca (Prinsip 5) — Corporate Admin tidak bisa lintas perusahaan.`,
  },
  {
    id: 'ui-only-enforcement',
    match: ['enforcement', 'server side', 'ui only', 'aman', 'keamanan prototipe', 'bypass', 'question bank otorisasi'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['ROLES', 'APP'],
    answer: () =>
      `Diakui sendiri oleh dokumennya (Prinsip 16, v3.8 Phase 1): seluruh CRUD Question Bank / Exam Definitions dibatasi HANYA lewat routing nav per-persona di client — TIDAK ada penegakan backend. ` +
      `Jadi di prototipe ini otorisasi adalah UI-only. Itu status yang diketahui, bukan temuan baru; yang layak jadi finding adalah kalau ada tempat LAIN yang diam-diam juga UI-only padahal dokumennya mengklaim server-side.`,
  },
  {
    id: 'positions-master',
    match: ['position', 'jabatan', 'master data', 'is hr family', 'upsell', 'talent search targeting'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['DATA_MODEL', 'FLOWS'],
    answer: () =>
      `Jabatan dipilih dari master data, TANPA free text (Prinsip 9). Flag is_hr_family per posisi yang menggerakkan targeting upsell Talent Search (DATA-MODEL §9). ` +
      `Operator/Super Admin boleh menambah posisi (is_system=false); entri bawaan sistem tidak bisa diubah sembarangan. ` +
      `Evaluasi upsell-nya jalan saat login/refresh profil (PROCESS-FLOWS §3).`,
  },
  {
    id: 'widget-purpose',
    match: ['widget', 'asisten ini', 'pilot', 'review surface', 'buat apa ini', 'kenapa ada widget', 'versi'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['WIDGET'],
    answer: (ctx) =>
      `Ini review surface: saya bantu Anda menguji prototipe DeAcademy terhadap dokumennya sendiri, dan mengubah pertanyaan/kejanggalan jadi structured finding — bukan chatbot umum. ` +
      `Jawaban saya hanya dari docs/ (PRD, Data Model, Roles & Permissions, Process Flows) + state layar yang sedang terbuka. ` +
      `Versi prototipe sesi ini: ${ctx?.prototypeVersion || 'tak tercatat'} — finding terikat ke versi itu selamanya. ` +
      `Pertanyaan, finding, dan layar yang Anda buka direkam untuk melengkapi requirement sebelum sprint development.`,
  },
  {
    id: 'gate',
    match: ['gate', 'sign-off', 'signoff', 'baseline', 'siap development', 'approval', 'persetujuan', 'change request'],
    classification: 'ANSWERED_FROM_SOURCE',
    sources: ['WIDGET'],
    answer: () =>
      `Prototype Ready ≠ Requirement Ready ≠ Development Ready. Gate widget ini: 8 area review DeAcademy 100% dicentang + 0 open blocker. ` +
      `Status: PENDING / APPROVED / APPROVED_WITH_EXCEPTIONS / REJECTED — selalu terhadap VERSI SPESIFIK. ` +
      `Sign-off DITOLAK selama gate belum lolos, dengan alasan persis (coverage N%, M open blocker). ` +
      `Pasca-baseline, finding baru otomatis jadi CHANGE_REQUEST — bukan perubahan scope diam-diam.`,
  },
];

const NOT_FOUND = (candidates) => {
  const suggestion = candidates.length
    ? ` Maksud Anda salah satu topik ini — ${candidates.join(' / ')}? Coba pertanyaan yang lebih spesifik.`
    : '';
  return (
    `Saya tidak menemukan approved source untuk pertanyaan itu di dokumentasi DeAcademy ` +
    `(PRD / Data Model / Roles & Permissions / Process Flows) atau di state layar ini — ` +
    `jadi saya tidak akan mengarang expected behavior.${suggestion} Saran: catat sebagai finding ` +
    `di tab Findings, lalu minta triage manusia. Itu justru guna widget ini: mengubah pertanyaan ` +
    `menjadi structured evidence, bukan jawaban karangan.`
  );
};

export const answerQuestion = createAnswerEngine({
  manualRules: RULES,
  generatedRules: GENERATED_RULES,
  sources: SOURCES,
  notFound: NOT_FOUND,
});
