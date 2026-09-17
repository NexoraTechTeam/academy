# Academy — AGENTS.md

> Klasifikasi: `nexora` — approval lebih ketat untuk push/merge/deploy.

## Stack
- Prototype: `lsp-unified-app.html` single-file, self-contained, tanpa build, tanpa server wajib.
- Referensi workspace: `src/*.jsx` (8 file) + `src/positions-master-data.js`.
- Data: `data/positions.json` (147 entri).
- Docs sumber kebenaran: `docs/PRD.md`, `docs/DATA-MODEL.md`, `docs/API-ENDPOINTS.md`, `docs/ROLES-PERMISSIONS-MATRIX.md`, `docs/PROCESS-FLOWS.md`, `docs/erd.mermaid`.
- Tes: Playwright + pytest di `tests/` (92 tes), runner `run-tests.sh`.

## Cara running lokal (dipakai di AI-Workspace)
```bash
# Opsi 1 — tanpa server (paling cepat):
open "lsp-unified-app.html"

# Opsi 2 — static server :4173 (untuk tes otomatis):
PORT=4173 python3 .claude/serve.py
# lalu buka http://127.0.0.1:4173/lsp-unified-app.html
# "/" otomatis redirect ke app.

# Opsi 3 — full tes:
./run-tests.sh
# pertama kali: buat .venv + download Chromium (~170MB). Harapan: 92 passed.
```

## Aturan kerja di repo ini
1. `lsp-unified-app.html` = bundle esbuild minify TANPA sourcemap. Jangan refactor manual skala besar.
   Sumber kebenaran = `docs/`. Tulis ulang dari docs, bukan salin bundle.
2. Role Management 100% read-only (prinsip dikunci v3.2). Access Requests = wewenang Operator.
3. Jangan commit `.venv/`, `tests/artifacts/` baru yang besar, `__pycache__/`, `.DS_Store` (sudah di `.gitignore`).
4. Branch kerja terisolasi, push hanya ke `dev`/`staging`, tidak pernah ke `main/master/production/prod`.
5. Verifikasi: `curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:4173/lsp-unified-app.html` harus `200`.

## Struktur
```
lsp-unified-app.html      # app utama
src/                      # referensi JSX per workspace
data/                     # master posisi
docs/                     # PRD, model, API, roles, flows + _archive-v2-20260824/
tests/                    # suite Playwright
.claude/serve.py          # static server :4173
run-tests.sh              # runner setup-free
README-HANDOFF.md         # panduan handoff asli v3.9
```
