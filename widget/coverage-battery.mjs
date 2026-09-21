/**
 * How many realistic reviewer questions can the assistant answer?
 *
 * Same lesson as accreditation, measured on 2026-09-21: of the 8 questions
 * ever asked here, **6 were asked on the signed-out landing page** and 2 of
 * those went unanswered. Coverage measured only on the screens behind the
 * sign-in misses where reviewers actually stand when they ask.
 *
 * The landing section is reported separately and has a floor, because an
 * overall average can hide a total failure at first contact.
 *
 * Run: node widget/coverage-battery.mjs   (exit 1 if a section is below floor)
 */
import { answerQuestion } from './knowledge.js';

const BATTERY = {
  'Halaman awal (belum login)': [
    'Aplikasi ini untuk apa?',
    'Apa itu DeAcademy?',
    'Siapa saja usernya?',
    'Siapa aja user nya?',
    'Ada akun demo?',
    'Login sebagai apa?',
    'Mulai dari mana?',
    'Persona apa saja yang tersedia?',
    'Bagaimana cara masuk?',
    'Daftar user nya apa saja?',
  ],
  'Orientasi modul': [
    'Ada menu apa saja?',
    'Modul apa saja yang tersedia?',
    'Fitur apa saja di aplikasi ini?',
    'Ada modul apa saja di sini?',
  ],
  'Alur dan aturan': [
    'Bagaimana alur signup?',
    'Bagaimana proses assign training?',
    'Apa saja prinsip kuncinya?',
    'Bagaimana data model-nya?',
  ],
};

const FLOOR = { 'Halaman awal (belum login)': 1.0 };

let overallOk = 0;
let overallTotal = 0;
let failed = false;

for (const [section, questions] of Object.entries(BATTERY)) {
  let ok = 0;
  const misses = [];
  for (const q of questions) {
    const r = answerQuestion(q, { route: 'landing', screen: 'Belum login' });
    if (r.classification === 'ANSWERED_FROM_SOURCE') ok += 1;
    else misses.push(q);
  }
  const pct = Math.round((ok / questions.length) * 100);
  overallOk += ok;
  overallTotal += questions.length;
  console.log(`${pct === 100 ? 'PASS' : 'WARN'}  ${section}: ${ok}/${questions.length} (${pct}%)`);
  for (const m of misses) console.log(`      belum terjawab: ${m}`);
  const floor = FLOOR[section];
  if (floor !== undefined && ok / questions.length < floor) {
    console.log(`FAIL  ${section} di bawah ambang ${Math.round(floor * 100)}%`);
    failed = true;
  }
}

const overallPct = Math.round((overallOk / overallTotal) * 100);
console.log(`\nTOTAL: ${overallOk}/${overallTotal} (${overallPct}%)`);
console.log(failed ? 'RED (ada section di bawah ambang)' : 'GREEN');
process.exit(failed ? 1 : 0);
