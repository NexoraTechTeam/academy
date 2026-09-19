#!/usr/bin/env node
/**
 * Generates widget/knowledge.generated.js from DeAcademy's own sources of
 * truth — mirror of accreditation's scripts/gen-knowledge.mjs, adapted to
 * this repo's shape.
 *
 * Why these inputs: `lsp-unified-app.html` is a minified, sourcemap-less
 * esbuild bundle and AGENTS.md forbids refactoring it, so the app's own
 * per-role nav map (`qp`) is not safely parseable. `tests/roles.py` is the
 * maintained mirror of exactly that map ("navigation labels come from the
 * per-role nav map (qp) in lsp-unified-app.html" — its own docstring), and
 * `docs/` is what AGENTS.md names as the source of truth. So the generator
 * reads the mirror and the docs, never the bundle.
 *
 * Run: node widget/gen-knowledge.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const read = (p) => readFileSync(path.join(ROOT, p), 'utf8');

// --- personas + per-role nav, from tests/roles.py -------------------------

function parsePersonas(src) {
  const navConsts = {};
  for (const m of src.matchAll(/^([A-Z_]+_NAV) = \[([\s\S]*?)\]/gm)) {
    navConsts[m[1]] = [...m[2].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
  }

  const personas = [];
  const block = src.match(/^PERSONAS = \[([\s\S]*?)\n\]/m)[1];
  // Split per `Persona(` entry so optional fields can't be skipped by a lazy
  // regex (the exact bug that silently emptied 5 of 6 role route lists on
  // accreditation's first generator pass).
  const starts = [...block.matchAll(/^    Persona\(/gm)].map((m) => m.index);
  for (let i = 0; i < starts.length; i++) {
    const chunk = block.slice(starts[i], starts[i + 1] ?? block.length);
    const pick = (field) => (chunk.match(new RegExp(`${field}="([^"]*)"`)) || [])[1];
    const key = pick('key');
    if (!key) continue;
    let nav = [];
    const navRef = (chunk.match(/nav=([A-Z_]+_NAV)/) || [])[1];
    if (navRef) nav = navConsts[navRef] || [];
    else {
      const inline = chunk.match(/nav=\[([\s\S]*?)\]/);
      if (inline) nav = [...inline[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
    }
    const rolesRaw = (chunk.match(/roles=\[([\s\S]*?)\]/) || [])[1] || '';
    personas.push({
      key,
      name: pick('name'),
      email: pick('email'),
      roleLabel: pick('role_label'),
      org: pick('org'),
      position: pick('position'),
      roles: [...rolesRaw.matchAll(/"([^"]+)"/g)].map((x) => x[1]),
      nav,
    });
  }
  return personas;
}

// --- numbered lists out of the docs ---------------------------------------

function parseNumberedPrinciples(src) {
  const section = src.split('## Prinsip Kunci')[1] || '';
  const out = [];
  for (const m of section.matchAll(/^(\d+)\.\s+\*\*(.+?)\*\*:\s*([\s\S]*?)(?=\n\d+\.\s+\*\*|\n## |\n*$)/gm)) {
    out.push({ n: Number(m[1]), title: m[2].trim(), body: m[3].replace(/\s+/g, ' ').trim() });
  }
  return out;
}

function parseFlows(src) {
  return [...src.matchAll(/^## (\d+)\.\s+(.+)$/gm)].map((m) => ({ n: Number(m[1]), title: m[2].trim() }));
}

function parseEntities(src) {
  return [...new Set([...src.matchAll(/^### `([a-z_]+)`/gm)].map((m) => m[1]))];
}

const personas = parsePersonas(read('tests/roles.py'));
const principles = parseNumberedPrinciples(read('docs/ROLES-PERMISSIONS-MATRIX.md'));
const flows = parseFlows(read('docs/PROCESS-FLOWS.md'));
const entities = parseEntities(read('docs/DATA-MODEL.md'));

if (personas.length === 0 || principles.length === 0 || flows.length === 0) {
  console.error('gen-knowledge: parsed 0 personas/principles/flows — source shape changed, refusing to emit a broken KB');
  process.exit(1);
}

// --- rules ----------------------------------------------------------------

const esc = (s) => s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
const rules = [];

rules.push({
  id: 'gen-personas-overview',
  match: ['persona apa saja', 'akun demo', 'demo account', 'siapa saja user', 'daftar persona', 'login sebagai apa', 'persona', 'siapa saja role', 'daftar user'],
  sources: ['ROLES'],
  answerText: `${personas.length} persona demo: ` +
    personas.map((p) => `${p.name} (${p.roleLabel}${p.org ? `, ${p.org}` : ''}) — ${p.nav.length} menu`).join(' · ') +
    `. Setiap pemegang role non-participant otomatis punya workspace Participant juga (Prinsip 8). Sumber: tests/roles.py.`,
});

// The union of every persona's nav = the app's actual module list. Derived, not
// hand-listed, so it can never drift from tests/roles.py.
const allNav = [...new Set(personas.flatMap((p) => p.nav))];

/* Orientation rules. Added 2026-09-19 after a real reviewer asked "Ada
 * menu/modul apa saja?" and got CLARIFICATION_NEEDED: the KB only had
 * PERSONA-QUALIFIED menu rules ("menu operator", ...) and the words
 * "modul"/"fitur" existed nowhere, so the single most basic orientation
 * question scored 0 against every rule. Pushed BEFORE the per-persona rules so
 * a generic tie resolves to the overview, while a persona-qualified question
 * still outscores it on the persona name/label. */
rules.push({
  id: 'gen-modules-overview',
  match: ['menu', 'modul', 'module', 'fitur', 'feature', 'daftar menu', 'menu apa saja',
          'modul apa saja', 'navigasi', 'sitemap', 'halaman apa saja'],
  sources: ['ROLES'],
  answerText: `DeAcademy punya ${allNav.length} modul/menu unik (gabungan semua persona): ${allNav.join(', ')}. ` +
    `Yang TERLIHAT tergantung persona: ${personas.map((p) => `${p.roleLabel} ${p.nav.length}`).join(' · ')}. ` +
    `Menu yang tampil = hak akses persona itu, bukan sekadar tampilan (Prinsip 8/11). ` +
    `Tanya "menu <persona>" untuk daftar spesifik per peran. Sumber: tests/roles.py.`,
});

rules.push({
  id: 'gen-app-overview',
  match: ['deacademy', 'aplikasi', 'platform ini', 'apa itu deacademy', 'tentang aplikasi',
          'sistem ini', 'gambaran umum', 'overview'],
  sources: ['ROLES'],
  answerText: `DeAcademy = platform training & sertifikasi kompetensi (LSP). Peserta mengambil training/ujian dan ` +
    `membangun portfolio; korporat mengelola karyawan + verifikasi; operator mengelola skema & jadwal ujian; ` +
    `tutor/examiner menangani materi & penilaian; management memantau READ-ONLY. ` +
    `Cakupan prototipe: ${personas.length} persona, ${allNav.length} modul, ${principles.length} Prinsip Kunci, ` +
    `${flows.length} alur proses, ${entities.length} entitas data. ` +
    `Sumber: tests/roles.py + docs/ROLES-PERMISSIONS-MATRIX.md + docs/PROCESS-FLOWS.md + docs/DATA-MODEL.md.`,
});

rules.push({
  id: 'gen-getting-started',
  match: ['mulai dari mana', 'harus mulai', 'mulai darimana', 'darimana', 'langkah pertama',
          'saya harus review apa', 'panduan review', 'cara review'],
  sources: ['ROLES'],
  answerText: `Mulai dari persona: Sign In sebagai salah satu dari ${personas.length} akun demo ` +
    `(${personas.map((p) => p.roleLabel).join(', ')}), lalu telusuri ${allNav.length} modul yang ada. ` +
    `Untuk review terstruktur: pakai tab Readiness di widget ini — centang tiap area setelah Anda mengujinya — ` +
    `dan catat apa pun yang janggal di tab Findings supaya jadi structured evidence, bukan opini. ` +
    `Tanya "menu <persona>" untuk tahu apa yang dilihat tiap peran. Sumber: tests/roles.py.`,
});

for (const p of personas) {
  rules.push({
    id: `gen-persona-${p.key}`,
    match: [p.key.replace(/_/g, ' '), p.name.toLowerCase(), p.roleLabel.toLowerCase(), `menu ${p.roleLabel.toLowerCase()}`],
    sources: ['ROLES'],
    answerText: `${p.name} — ${p.roleLabel}${p.org ? ` di ${p.org}` : ''}, ${p.position}. ` +
      `${p.nav.length} menu: ${p.nav.join(', ')}. Role aktif: ${p.roles.join(' + ')}. ` +
      `Pindah workspace mengubah konteks, tidak menambah hak (Prinsip 8). Sumber: tests/roles.py.`,
  });
}

/* One rule per module. Academy had none -- so "apa itu Question Bank / CPD /
 * Grading Queue / Talent Search" all scored 0 while accreditation answered the
 * equivalent from its per-screen rules (measured 2026-09-19: academy 63% vs
 * accreditation 92% on a realistic question battery). Access facts come from
 * tests/roles.py and related flows from docs/PROCESS-FLOWS.md; the screen's
 * BEHAVIOUR is deliberately not invented -- unknown behaviour is steered into a
 * finding, which is the point of this widget. */
for (const mod of allNav) {
  const lower = mod.toLowerCase();
  const seenBy = personas.filter((p) => p.nav.includes(mod)).map((p) => p.roleLabel);
  const related = flows.filter((f) => f.title.toLowerCase().includes(lower.split(' / ')[0]));
  const modTokens = [...new Set(lower.match(/[a-z0-9]{3,}/g) || [])];
  rules.push({
    id: `gen-module-${lower.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`,
    // Also index each word of the module name, plus an "apa itu <word>" phrase.
    // A bare short word (<=4 chars, e.g. "cpd") only scores 1 and is diluted
    // when several modules share it, so the phrase form is what actually lifts
    // "apa itu CPD" over MIN_SCORE; the phrase also keeps precision (it cannot
    // fire from an unrelated sentence that merely contains the word).
    match: [lower, `apa itu ${lower}`, `modul ${lower}`, `layar ${lower}`, `menu ${lower}`,
      ...modTokens, ...modTokens.map((t) => `apa itu ${t}`)],
    sources: ['ROLES'],
    answerText: `${mod} — salah satu dari ${allNav.length} modul DeAcademy. ` +
      `Terlihat oleh ${seenBy.length}/${personas.length} persona: ${seenBy.length ? seenBy.join(', ') : '(tidak ada persona demo)'}. ` +
      (related.length ? `Alur terkait: ${related.map((f) => `§${f.n} ${f.title}`).join(' · ')}. ` : '') +
      `Perilaku detail layar ini tidak didokumentasikan di luar hak akses di atas — kalau yang Anda lihat menyimpang, catat sebagai finding supaya jadi requirement, bukan tebakan. Sumber: tests/roles.py.`,
  });
}

for (const pr of principles) {
  rules.push({
    id: `gen-principle-${pr.n}`,
    match: [`prinsip ${pr.n}`, `principle ${pr.n}`, pr.title.toLowerCase()],
    sources: ['ROLES'],
    answerText: `Prinsip ${pr.n} — ${pr.title}: ${pr.body.slice(0, 700)}`,
  });
}

rules.push({
  id: 'gen-principles-index',
  match: ['prinsip kunci', 'key principles', 'aturan yang tidak boleh dilanggar', 'batasan sistem'],
  sources: ['ROLES'],
  answerText: `${principles.length} Prinsip Kunci (docs/ROLES-PERMISSIONS-MATRIX.md): ` +
    principles.map((p) => `${p.n}. ${p.title}`).join(' · ') +
    `. Tanya "prinsip <n>" untuk isi lengkapnya.`,
});

rules.push({
  id: 'gen-flows-index',
  match: ['alur proses', 'process flow', 'business process', 'alur kerja', 'daftar alur'],
  sources: ['FLOWS'],
  answerText: `${flows.length} alur terdokumentasi (docs/PROCESS-FLOWS.md): ` +
    flows.map((f) => `${f.n}. ${f.title}`).join(' · '),
});

for (const f of flows) {
  rules.push({
    id: `gen-flow-${f.n}`,
    // Title words (>=5 chars) as their own keywords: "bagaimana alur signup
    // peserta" must reach flow 1 even though the full title phrase
    // ("Signup dengan Position Dropdown") is not contiguous in the question.
    match: [`alur ${f.n}`, `flow ${f.n}`, f.title.toLowerCase().replace(/\s+—.*$/, ''),
      ...[...new Set(f.title.toLowerCase().match(/[a-z0-9]{5,}/g) || [])]],
    sources: ['FLOWS'],
    answerText: `Alur ${f.n}: ${f.title}. Detail lengkap ada di docs/PROCESS-FLOWS.md §${f.n} — widget ini tidak menyalin ulang isinya supaya tidak pernah basi terhadap dokumen.`,
  });
}

rules.push({
  id: 'gen-data-model',
  match: ['data model', 'entitas', 'tabel apa saja', 'skema database', 'erd'],
  sources: ['DATA_MODEL'],
  answerText: `${entities.length} tabel terdokumentasi di docs/DATA-MODEL.md, mis.: ` +
    entities.slice(0, 18).join(', ') + `, … Diagram relasinya di docs/erd.mermaid.`,
});

// --- emit -----------------------------------------------------------------

const header = `/**
 * AUTO-GENERATED by widget/gen-knowledge.mjs from tests/roles.py +
 * docs/{ROLES-PERMISSIONS-MATRIX,PROCESS-FLOWS,DATA-MODEL}.md — do not
 * hand-edit. Re-run \`node widget/gen-knowledge.mjs\` when those change.
 *
 * The manual KB (widget/knowledge.js) wins over this file on any tie or
 * higher score: this fills persona/principle/flow lookups the manual KB
 * leaves empty, it does not compete with it.
 */
`;

const body = `export const GENERATED_RULES = [\n${rules.map((r) => `  {\n` +
  `    id: '${r.id}',\n` +
  `    match: [${r.match.map((k) => `'${esc(k)}'`).join(', ')}],\n` +
  `    classification: 'ANSWERED_FROM_SOURCE',\n` +
  `    sources: [${r.sources.map((s) => `'${s}'`).join(', ')}],\n` +
  `    answer: () => \`${esc(r.answerText)}\`,\n` +
  `  },\n`).join('')}];\n`;

writeFileSync(path.join(ROOT, 'widget/knowledge.generated.js'), header + '\n' + body);
console.log(`gen-knowledge: wrote ${rules.length} rules ` +
  `(${personas.length} persona, ${principles.length} principle, ${flows.length} flow) to widget/knowledge.generated.js`);
