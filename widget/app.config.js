/**
 * AI Assistant widget — DeAcademy's own app config.
 * Mirror of accreditation's widget/app.config.js: the per-app values that
 * widget/core/* is generic over. widget/core/ itself is synced verbatim from
 * the accreditation repo by ops/prototypes/sync-widget.sh and must never be
 * edited here.
 */
export const PROJECT_ID = 'deacademy';
export const PROTOTYPE_VERSION = '3.9.0-pilot.1';
export const WIDGET_VERSION = '0.1.0';

// Ops-level published app name — matches ops/prototypes/refresh.sh and the
// nginx /academy/ location. NOT the same namespace as PROJECT_ID (which keys
// localStorage + context). The feedback collector groups NDJSON by this.
export const FEEDBACK_APP = 'academy';

/**
 * Review areas for THIS domain — deliberately not accreditation's nine.
 * Each one is anchored to a numbered principle in
 * docs/ROLES-PERMISSIONS-MATRIX.md §Prinsip Kunci, so a reviewer checking the
 * box is confirming a documented rule actually holds in the prototype.
 */
export const CHECK_AREAS = [
  ['roleAccess', 'Role & workspace switching',
    'Satu login satu shell; pindah workspace mengubah konteks, tidak menambah hak (Prinsip 8).'],
  ['multiTenant', 'Isolasi multi-tenant',
    'Corporate Admin hanya data perusahaannya; Operator lihat metadata training internal, bukan isinya (Prinsip 1).'],
  ['consentGating', 'Consent-gated competency data',
    'Skor ujian, CPD, transkrip ke Employer/Verifier hanya setelah consent/verification divalidasi (Prinsip 2).'],
  ['dutySeparation', 'Separation of duties',
    'Tutor ≠ Examiner untuk sertifikasi resmi; Super Admin ≠ Operator (Prinsip 3, 10).'],
  ['managementReadOnly', 'Management read-only',
    'Role management 100% read-only lintas platform, tanpa pengecualian — termasuk Access Requests (Prinsip 11, 13).'],
  ['paymentGates', 'Dua gerbang pembayaran terpisah',
    'Gerbang Corporate dan Verifier independen, tidak memblokir approval/consent, dan tidak boleh digabung validasinya (Prinsip 14).'],
  ['examEligibility', 'Exam & gate kelayakan',
    'Exam modul independen dari training; direct-path tergantung requires_eligibility_verification per skema (Prinsip 12).'],
  ['edgeStates', 'Empty/error/edge states',
    'Belum login, data kosong, permintaan ditolak, akses kedaluwarsa, pembayaran tertunda.'],
];

export const QUICK_PROMPTS = [
  { label: '🧭 Guide my review', question: 'Apa saja yang harus saya review di layar ini?' },
  { label: '🔐 Cek batas peran', question: 'Apa yang boleh dan tidak boleh dilakukan role ini?' },
  { label: '🧪 Test edge case', question: 'Apa yang terjadi kalau consent belum diberikan?' },
  { label: '✅ Cek kesiapan', question: 'Apakah versi ini sudah siap untuk development?' },
];
