import { Router } from 'express';
import pool from '../db.js';

const router = Router();

/** GET /api/propietarios */
router.get('/', async (req, res) => {
  const q = (req.query.search || '').trim();
  let sql = `SELECT id, nombre, rut, correo, movil FROM propietario`;
  let params = [];
  if (q) {
    sql += ` WHERE nombre LIKE ? OR rut LIKE ?`;
    params = [`%${q}%`, `%${q}%`];
  }
  sql += ` ORDER BY nombre ASC LIMIT 500`;
  const [rows] = await pool.query(sql, params);
  res.json(rows);
});

/** POST /api/propietarios */
router.post('/', async (req, res) => {
  const { nombre, rut, correo, movil, direccion } = req.body || {};
  if (!nombre) return res.status(400).json({ ok: false, msg: 'nombre es requerido' });

  const [r] = await pool.execute(
    `INSERT INTO propietario (nombre, rut, correo, movil, direccion, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
    [nombre || null, rut || null, correo || null, movil || null, direccion || null]
  );
  res.status(201).json({ ok: true, id: r.insertId });
});

// EDITAR
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, rut, correo, movil, direccion } = req.body || {};
  if (!nombre) return res.status(400).json({ ok: false, msg: 'nombre es requerido' });

  const [r] = await pool.execute(
    `UPDATE propietario
        SET nombre=?, rut=?, correo=?, movil=?, direccion=?, updated_at=NOW()
      WHERE id=?`,
    [nombre || null, rut || null, correo || null, movil || null, direccion || null, id]
  );
  res.json({ ok: true, affected: r.affectedRows });
});

// ELIMINAR
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const [r] = await pool.execute(`DELETE FROM propietario WHERE id = ?`, [id]);
  res.json({ ok: true, affected: r.affectedRows });
});


export default router;
