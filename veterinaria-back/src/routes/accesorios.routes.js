import { Router } from 'express';
import multer from 'multer';
import pool from '../db.js';
import { requireAuth, isAdmin } from '../middlewares/auth.middleware.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

// === PÚBLICO ===
router.get('/', async (req, res) => {
    try {
        const q = (req.query.search || '').trim();
        const sql = `
      SELECT id, nombre, descripcion, precio, stock, activo, created_at, updated_at
      FROM accesorios
      ${q ? 'WHERE nombre LIKE ? OR descripcion LIKE ?' : ''}
      ORDER BY updated_at DESC`;
        const params = q ? [`%${q}%`, `%${q}%`] : [];
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// === PÚBLICO ===
router.get('/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM accesorios WHERE id=?', [req.params.id]);
        if (!rows.length) return res.status(404).json({ error: 'No encontrado' });
        res.json(rows[0]);
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// === PÚBLICO ===
router.get('/:id/foto', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT foto_mime, foto_blob FROM accesorios WHERE id=?', [req.params.id]);
        if (!rows.length || !rows[0].foto_blob) return res.status(404).end();
        res.set('Content-Type', rows[0].foto_mime || 'image/jpeg');
        res.send(rows[0].foto_blob);
    } catch (e) { res.status(500).end(); }
});

// === ADMIN ===
router.post('/', requireAuth, isAdmin, upload.single('foto'), async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, activo } = req.body;
        if (!nombre) return res.status(400).json({ error: 'nombre requerido' });
        const [r] = await pool.query(
            'INSERT INTO accesorios (nombre, descripcion, precio, stock, activo, foto_mime, foto_blob) VALUES (?,?,?,?,?,?,?)',
            [nombre, descripcion || null, Number(precio) || 0, Number(stock) || 0, Number(activo ?? 1), req.file?.mimetype || null, req.file?.buffer || null]
        );
        res.status(201).json({ id: r.insertId });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// === ADMIN ===
router.put('/:id', requireAuth, isAdmin, upload.single('foto'), async (req, res) => {
    try {
        const { nombre, descripcion, precio, stock, activo, foto_clear } = req.body;
        const sets = [], vals = [];
        if (nombre !== undefined) { sets.push('nombre=?'); vals.push(nombre); }
        if (descripcion !== undefined) { sets.push('descripcion=?'); vals.push(descripcion || null); }
        if (precio !== undefined) { sets.push('precio=?'); vals.push(Number(precio) || 0); }
        if (stock !== undefined) { sets.push('stock=?'); vals.push(Number(stock) || 0); }
        if (activo !== undefined) { sets.push('activo=?'); vals.push(Number(activo) ? 1 : 0); }
        if (req.file) { sets.push('foto_mime=?', 'foto_blob=?'); vals.push(req.file.mimetype, req.file.buffer); }
        else if (String(foto_clear || '') === '1') { sets.push('foto_mime=NULL', 'foto_blob=NULL'); }
        if (!sets.length) return res.json({ ok: true, changed: 0 });
        vals.push(req.params.id);
        const [r] = await pool.query(`UPDATE accesorios SET ${sets.join(', ')} WHERE id=?`, vals);
        res.json({ ok: true, changed: r.affectedRows });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

// === ADMIN ===
router.delete('/:id', requireAuth, isAdmin, async (req, res) => {
    try {
        const [r] = await pool.query('DELETE FROM accesorios WHERE id=?', [req.params.id]);
        res.json({ ok: true, deleted: r.affectedRows });
    } catch (e) { res.status(500).json({ error: e.message }); }
});

export default router;
