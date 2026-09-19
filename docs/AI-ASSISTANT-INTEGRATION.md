# AI Assistant — bagaimana ia terpasang di DeAcademy

Dokumen ini menjelaskan asisten yang muncul sebagai tombol mengambang di pojok
aplikasi: apa yang ia lakukan, dari mana jawabannya berasal, dan apa yang **tidak**
ia lakukan. Ditujukan untuk siapa pun yang membuka repo ini dan bertanya "ini
benda apa, dan apakah ia mengirim data kami ke suatu tempat?".

Terakhir diperbarui: 2026-09-19.

## Ringkas

- Asisten ini **bukan** chatbot yang memanggil model bahasa. Ia mesin pencocokan
  aturan yang di-generate dari dokumentasi produk, berjalan sepenuhnya di
  peramban pengguna.
- Karena itu ia tidak bisa mengarang. Bila sebuah pertanyaan tidak tercakup, ia
  menjawab bahwa ia belum tahu — dan pertanyaan itu dicatat sebagai celah
  pengetahuan untuk diperbaiki.
- Ia hanya membaca. Tidak ada satu pun jalur di dalamnya yang mengubah data
  aplikasi.

## Dari mana jawabannya berasal

Basis pengetahuannya dibangkitkan, bukan ditulis tangan: `widget/gen-knowledge.mjs`
membaca struktur aplikasi dan dokumentasi produk, lalu menghasilkan
`widget/knowledge.generated.js`. Setiap jawaban menunjuk ke sumber di dalam berkas
itu, sehingga jawaban yang tidak punya sumber tidak akan pernah muncul.

Konsekuensi praktisnya: **memperbaiki jawaban berarti memperbaiki generator atau
dokumentasinya**, bukan menambal teks jawaban satu per satu.

## Bagaimana ia dipasang ke aplikasi

Aplikasi ini adalah satu berkas HTML yang harus tetap bisa dibuka dengan klik
ganda (`lsp-unified-app.html`, lihat `README-HANDOFF.md`). Karena itu:

- Widget-nya di-bundel menjadi satu IIFE sebaris dan disisipkan **saat publikasi**,
  bukan disimpan di dalam berkas HTML yang ada di git. Berkas HTML di repo ini
  tidak pernah diubah oleh proses tersebut.
- Widget hidup di dalam *shadow root*-nya sendiri, jadi ia tidak menambah satu pun
  elemen ke DOM aplikasi yang bisa mengacaukan suite pengujian.
- Asisten tampil **sejak halaman pertama**, termasuk sebelum pengguna masuk.

Gerbang mutu sebelum dan sesudah perubahan apa pun: `./run-tests.sh` harus hijau
seluruhnya, dan berkas yang dipublikasikan harus identik dengan yang diuji.

## Data apa yang dikirim

Asisten mencatat peristiwa penggunaan — pertanyaan yang diajukan, apakah
terjawab, dan layar tempat pertanyaan itu muncul — lalu mengirimkannya ke
pengumpul internal di infrastruktur Nexora. Tujuannya satu: mengetahui pertanyaan
apa yang belum terjawab, supaya basis pengetahuannya bisa ditutup celahnya.

Tiga hal yang membatasi ini secara desain:

1. Pengiriman hanya dilakukan di lingkungan yang memang punya pengumpul. Di
   lingkungan lain, peristiwa mengendap di penyimpanan lokal peramban dan tidak
   pernah dikirim ke mana pun.
2. Identitas pengguna diambil dari sesi terautentikasi oleh sisi server; nilai
   apa pun yang dikirim peramban tidak dipercaya.
3. Kegagalan pengiriman tidak pernah mengganggu aplikasi maupun memunculkan galat
   di konsol.

## Batasnya

Asisten tidak dapat mengubah data, membuat akun, memproses transaksi, atau
bertindak atas nama pengguna. Semua permintaan semacam itu harus diteruskan ke
tim terkait. Bila suatu saat model bahasa sungguhan dipasang di belakangnya,
itu akan menjadi keputusan tersendiri dengan anggaran dan peninjauan tersendiri —
dan dokumen ini akan diperbarui saat itu terjadi.
