/**
 * DeAcademy knowledge regression set (TDD).
 *
 * Born from a real reviewer failure (2026-09-19): "Ada menu/modul apa saja?" —
 * the most basic orientation question — returned CLARIFICATION_NEEDED, because
 * the generated KB only had PERSONA-QUALIFIED menu rules ("menu operator", …)
 * and never the words "modul"/"fitur"/a generic menu overview. An assistant that
 * cannot list the app's own modules is not an assistant.
 *
 * Two things are asserted, not one: that a question is answered AT ALL, and that
 * it is answered by the RIGHT rule (content hint) — otherwise closing a gap just
 * moves the mismatch somewhere else.
 *
 * Run: node widget/knowledge.smoke.mjs   (exit 0 = GREEN)
 */
import { answerQuestion } from './knowledge.js';

let failures = 0;
const check = (name, ok, detail = '') => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
  if (!ok) failures += 1;
};

function answered(q, hint, ctx = {}) {
  const r = answerQuestion(q, ctx);
  const ok = r.classification === 'ANSWERED_FROM_SOURCE';
  check(`"${q}" -> ANSWERED_FROM_SOURCE`, ok, ok ? '' : `got ${r.classification}`);
  if (ok && hint) {
    check(`  ...routed to the right rule (mentions "${hint}")`,
      r.answer.toLowerCase().includes(hint.toLowerCase()),
      `answer: ${r.answer.slice(0, 90).replace(/\n/g, ' ')}…`);
  }
}
function clarify(q) {
  const r = answerQuestion(q);
  check(`"${q}" -> CLARIFICATION_NEEDED (genuinely out of scope)`,
    r.classification === 'CLARIFICATION_NEEDED', `got ${r.classification}`);
}

// --- the exact reviewer failure that forced this fix --------------------
answered('Ada menu/modul apa saja?', 'menu');
answered('menu apa saja', 'menu');
answered('ada modul apa saja', 'menu');
answered('modul apa saja yang ada', 'menu');
answered('daftar menu', 'menu');
answered('apa saja fitur di aplikasi ini', 'menu');
answered('what modules are there?', 'menu');
answered('navigasi aplikasi ini seperti apa', 'menu');

// --- orientation: what is this, where do I start -----------------------
answered('apa itu DeAcademy?', 'deacademy');
answered('aplikasi ini tentang apa', 'deacademy');
answered('saya harus mulai dari mana', 'persona');

// --- REGRESSION: persona-specific must still beat the generic overview --
answered('menu operator apa saja?', 'operator');
answered('menu participant', 'participant');
answered('apa saja menu management?', 'management');
answered('persona apa saja yang tersedia', 'persona');

// --- REGRESSION: manual rules still win --------------------------------
answered('apakah management bisa menulis data?', 'read-only');
answered('bagaimana gerbang pembayaran bekerja?', 'pembayaran');
answered('apakah ini pakai AI beneran?', 'ai');
answered('bagaimana isolasi multi tenant?', 'tenant');
answered('apa itu workspace switching?', 'workspace');

// --- REGRESSION: generated principles / flows --------------------------
answered('apa itu prinsip 11?', 'read-only');
answered('prinsip 14 tentang apa', 'pembayaran');
answered('ada berapa process flow?', 'flow');

// --- genuinely out of scope: stay honest -------------------------------
clarify('bagaimana cuaca hari ini di Jakarta?');
clarify('tolong buatkan resep nasi goreng');
clarify('berapa harga saham BBCA sekarang?');

console.log(failures === 0 ? '\nGREEN (academy knowledge)' : `\nRED (academy knowledge) — ${failures} failing`);
process.exit(failures === 0 ? 0 : 1);
