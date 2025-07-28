# Virutal Lab Microteaching

Virtual lab microteaching adalah sebuah website virtual tour yang ditujukan untuk pembelajaran FKIP Universitas Terbuka.

## Prasyarat

Sebelum memulai, pastikan Anda telah menginstal semua prasyarat berikut:

- Node.js v.20 (belum di test untuk versi lain)
- Mysql

## Menjalankan Program

Aplikasi ini dapat dijalankan dalam dua mode: `development mode` dan `production mode`. Dan jangan lupa minta .env ke yang bersangkutan

### Development Mode

Mode ini digunakan selama proses pengembangan menggunakan Typescript. Aplikasi akan dijalankan dengan hot-reloading memungkinkan perubahan kode diterapkan secara langsung tanpa perlu me-restart server.

1. Buat database dengan nama "virtual-lab"

2. Clone repositori ini:

    ```bash
    git clone https://github.com/FestivoGo/microteaching-lab-UT.git
    cd microteaching-lab-UT
    // pastikan kamu berada di branch dev-assami
    ```
    atau kamu bisa mendownload zip repositori ini dari branch dev-assami

3. Instal dependensi:

    ```bash
    npm install
    ```

    atau

    ```bash
    yarn install
    ```

4. Jalankan aplikasi dalam mode pengembangan:

    ```bash
    npm run dev
    ```

    atau

    ```bash
    yarn dev
    ```

5. Jalankan tailwind:

    ```bash
    npm run tailwind
    ```

    atau

    ```bash
    yarn tailwind
    ```

6. Buka browser dan akses aplikasi di `http://localhost:8000`.

### Production Mode

Mode ini digunakan untuk menjalankan aplikasi di lingkungan produksi hasil build typescript. Kode akan dioptimalkan dan tidak akan ada hot-reloading.

1. Buat database dengan nama "virtual-lab"

2. Clone repositori ini:

    ```bash
    git clone https://github.com/FestivoGo/microteaching-lab-UT.git
    cd microteaching-lab-UT
    // pastikan kamu berada di branch dev-assami
    ```
    atau kamu bisa mendownload zip repositori ini dari branch dev-assami

3. Instal dependensi:

    ```bash
    npm install
    ```

    atau

    ```bash
    yarn install
    ```

4. Build aplikasi untuk produksi:

    ```bash
    npm run build
    ```

    atau

    ```bash
    yarn build
    ```

5. Jalankan aplikasi dalam mode produksi:

    ```bash
    npm start
    ```

    atau

    ```bash
    yarn start
    ```

6. Buka browser dan akses aplikasi di `http://localhost:8000`.

## Kontribusi

Kontribusi sangat diterima! Silakan fork repositori ini dan ajukan pull request dengan perubahan Anda.

1. Fork repositori ini.
2. Buat branch fitur baru (`git checkout -b fitur/fiturBaru`).
3. Commit perubahan Anda (`git commit -m 'Menambahkan fitur baru'`).
4. Push ke branch (`git push origin fitur/fiturBaru`).
5. Ajukan pull request.

## Lisensi

Proyek ini dilisensikan di bawah lisensi Assami Muzaki - lihat [LINK](https://assamimuzaki.site/) untuk detail lebih lanjut.
