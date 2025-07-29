import rateLimit from 'express-rate-limit';

// limiter untuk tiap request per ip user, (1 user bisa mengakses sebuah API sebanyak x dalam y menit)
const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // waktu untuk limiter sebelum di refresh = 5menit
    max: 10, // Jumlah maksimum request dalam jendela waktu
    message: { message: 'Terlalu banyak permintaan dari alamat IP ini, silakan coba lagi nanti.' },
});

export = limiter