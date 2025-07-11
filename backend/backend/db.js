const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',                // 🔁 Replace with your MySQL username if different
  password: 'root',    // 🔁 Replace with your MySQL password
  database: 'rating_system',   // 🔁 Make sure this DB exists in MySQL
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;