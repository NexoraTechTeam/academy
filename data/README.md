# Position Master Data — `positions.json`

Kontrak untuk dropdown **Position** (menggantikan free text) dan targeting
upsell. Disepakati 2026-08-24.

## Struktur

| Field | Arti |
|---|---|
| `id` | slug stabil, dipakai sebagai referensi di record user — jangan diubah |
| `label` | teks yang tampil di dropdown |
| `category` | grup di dropdown (15 kategori) |
| `hrFamily` | `true` = posisi rumpun HR → target upsell Talent Search |
| `active` | `false` = disembunyikan dari dropdown, record lama tetap resolve |
| `system` | `true` = bawaan app, tidak bisa dihapus; `false` = tambahan admin |
| `legacyAliases` | judul lama polos ("Manager", "Staff", "Supervisor") → id generik |

147 posisi, 26 ber-flag `hrFamily`. Semua posisi persona demo saat ini ter-cover
(diverifikasi oleh `tests/test_upsell_matrix.py`).

## Mekanisme tambah posisi (Operator / Super Admin) — spesifikasi UI

Harus dibangun di source project (bundle `lsp-unified-app.html` adalah artefak
build, tidak bisa dipatch):

1. Menu **Master Data → Positions** di workspace Operator dan Super Admin.
2. Tambah posisi: `label` + `category` (pilih dari daftar) + toggle `hrFamily`.
   `id` digenerate dari label; `system: false`.
3. Edit hanya untuk entri `system: false`; entri `system: true` hanya bisa
   di-nonaktifkan (`active: false`), tidak dihapus — record user lama harus
   tetap resolve.
4. Signup/profil user: dropdown menampilkan hanya `active: true`,
   dikelompokkan per `category`, dengan pencarian. Tanpa opsi "Other/free text".
5. Perubahan `hrFamily` langsung memengaruhi targeting upsell Talent Search.

## Aturan targeting upsell

Referensi eksekusinya: `tests/upsell_rules.py::upsells_for`.

- **Corporate (Team Training)** → punya perusahaan, belum corporate_admin.
- **Talent Search (Verify Talent)** → punya perusahaan ATAU posisi `hrFamily`;
  kecuali sudah verifier/operator.
- **Agency (Manage Clients)** → tanpa perusahaan, di workspace Participant.
- Individu HR tanpa perusahaan → dapat **keduanya** (Agency + Talent Search).
- Copy upsell menginterpolasi nama org user, tidak pernah hardcode.
