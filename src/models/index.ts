import { Sequelize } from "sequelize";
import * as dotenv from 'dotenv';
dotenv.config();

let sequelize = new Sequelize({
  dialect: "mysql",
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  logging: false
});

// Fungsi untuk menghubungkan ke database
const connectToDatabase = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      console.log(`🔄 Mencoba koneksi ke database (percobaan ${retries + 1})...`);
      await sequelize.authenticate();
      console.log("✅ Koneksi ke database berhasil!");

      await sequelize.sync({ alter: true });
      
      console.log("✅ Model-model disinkronkan dengan database.");
      break;
    } catch (error) {
      console.error("❌ Koneksi database gagal:", error.message || error);
      retries++;
      if (retries < maxRetries) {
        console.log("⏳ Menunggu 5 detik sebelum mencoba lagi...");
        await new Promise(res => setTimeout(res, 5000));
      } else {
        console.error("🚨 Gagal konek ke database setelah beberapa percobaan. Keluar.");
        process.exit(1);
      }
    }
  }
};

export { sequelize, connectToDatabase };