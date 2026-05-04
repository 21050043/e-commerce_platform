require('dotenv').config();
const mysql = require('mysql2/promise');
(async () => {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '21050043',
      database: process.env.DB_NAME || 'shop',
      port: parseInt(process.env.DB_PORT || '3306', 10),
    });
    const [tables] = await conn.query('SHOW TABLES');
    console.log('TABLES:', tables.map(r => Object.values(r)[0]).join(', '));
    const [rows] = await conn.query('SELECT MaDonHangNB, MaHoaDon, MaNguoiBan, TrangThai, TongTienNB FROM DonHangNguoiBan ORDER BY MaDonHangNB DESC LIMIT 20');
    console.log(JSON.stringify(rows, null, 2));
    await conn.end();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
