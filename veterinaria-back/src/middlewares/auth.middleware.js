import jwt from 'jsonwebtoken';
import pool from '../db.js';
import 'dotenv/config';

export async function authRequired(req, res, next) {
  try {
    const h = req.headers.authorization || '';
    const token = h.startsWith('Bearer ') ? h.slice(7) : null;
    if (!token) return res.status(401).json({ ok: false, msg: 'Token requerido' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub || payload.id, role: payload.role };

    const [rows] = await pool.query(
      'SELECT id FROM veterinario WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );
    req.user.veterinario_id = rows[0]?.id || null;

    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: 'Token inválido' });
  }
}
