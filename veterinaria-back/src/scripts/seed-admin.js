// src/scripts/seed-admin.js
import 'dotenv/config.js';
import pool from '../db.js';            // ajusta la ruta según dónde esté tu db.js
import bcrypt from 'bcryptjs';

async function main() {
  const email = 'admin@pucara.cl';
  const nombre = 'Admin';
  const password = 'admin123';

  const [rows] = await pool.query('SELECT id FROM user WHERE email=?', [email]);
  if (rows.length) {
    console.log('✅ Usuario admin ya existe');
    process.exit(0);
  }

  const hash = await bcrypt.hash(password, 10);  // bcryptjs soporta el mismo API
  const [r] = await pool.query(
    `INSERT INTO user (nombre, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')`,
    [nombre, email, hash]
  );
  console.log('✅ Admin creado con id:', r.insertId);
  process.exit(0);
}

main().catch(err => {
  console.error('❌ Seed admin falló:', err);
  process.exit(1);
});
