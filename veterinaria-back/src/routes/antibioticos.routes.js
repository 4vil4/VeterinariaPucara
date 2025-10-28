// routes/antibioticos.routes.js
import { Router } from 'express';
import pool from '../db.js';
// import { authRequired, isAdmin } from '../middlewares/auth.middleware.js'; // si ya tienes middlewares

const router = Router();

/* ==================== Catálogo de antibióticos ==================== */

// GET /api/antibioticos?search=...&solo_activos=1
router.get('/', async (req, res) => {
    try {
        const { search = '', solo_activos } = req.query;
        const where = [];
        const params = [];
        if (search) {
            where.push('(a.nombre LIKE ? OR a.fabricante LIKE ? OR a.concentracion LIKE ?)');
            params.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        if (String(solo_activos) === '1') {
            where.push('a.activo_bool = 1');
        }
        const sql = `
      SELECT a.*
      FROM antibiotico a
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY a.activo_bool DESC, a.nombre ASC
      LIMIT 1000
    `;
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (e) {
        console.error('GET /api/antibioticos', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// POST /api/antibioticos  (crear en catálogo)
// router.post('/', authRequired, isAdmin, async (req, res) => {
router.post('/', async (req, res) => {
    try {
        const { nombre, forma = null, concentracion = null, via = null, fabricante = null, registro_isp = null, activo_bool = 1 } = req.body || {};
        if (!nombre) return res.status(400).json({ ok: false, msg: 'nombre es requerido' });
        const sql = `
      INSERT INTO antibiotico
        (nombre, forma, concentracion, via, fabricante, registro_isp, activo_bool, created_at)
      VALUES (?,?,?,?,?,?,?, NOW())
    `;
        const [r] = await pool.query(sql, [nombre, forma, concentracion, via, fabricante, registro_isp, Number(activo_bool) ? 1 : 0]);
        res.status(201).json({ ok: true, id: r.insertId });
    } catch (e) {
        console.error('POST /api/antibioticos', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// PUT /api/antibioticos/:id  (editar del catálogo)
// router.put('/:id', authRequired, isAdmin, async (req, res) => {
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { nombre, forma = null, concentracion = null, via = null, fabricante = null, registro_isp = null, activo_bool } = req.body || {};
        if (!nombre) return res.status(400).json({ ok: false, msg: 'nombre es requerido' });

        const sql = `
      UPDATE antibiotico
         SET nombre=?, forma=?, concentracion=?, via=?, fabricante=?, registro_isp=?, activo_bool=?, updated_at=NOW()
       WHERE id=?
    `;
        const [r] = await pool.query(sql, [nombre, forma, concentracion, via, fabricante, registro_isp, Number(activo_bool) ? 1 : 0, id]);
        res.json({ ok: true, affected: r.affectedRows });
    } catch (e) {
        console.error('PUT /api/antibioticos/:id', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// DELETE /api/antibioticos/:id  (soft delete = desactivar)
// router.delete('/:id', authRequired, isAdmin, async (req, res) => {
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [r] = await pool.query(`UPDATE antibiotico SET activo_bool=0, updated_at=NOW() WHERE id=?`, [id]);
        res.json({ ok: true, affected: r.affectedRows });
    } catch (e) {
        console.error('DELETE /api/antibioticos/:id', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

/* ==================== Usos / Envíos SAG ==================== */

// GET /api/antibioticos/usos?enviados=0|1|todos
router.get('/usos', async (req, res) => {
    try {
        const { enviados = 'todos' } = req.query;
        const where = [];
        const params = [];
        if (enviados === '0') where.push('ra.enviado_sag_bool = 0');
        if (enviados === '1') where.push('ra.enviado_sag_bool = 1');

        const sql = `
      SELECT
        ra.id,
        ra.receta_id,
        r.fecha AS receta_fecha,
        m.id AS mascota_id,
        m.nombre AS mascota_nombre,
        p.nombre AS propietario_nombre,
        a.id AS antibiotico_id,
        a.nombre AS antibiotico_nombre,
        a.forma,
        a.concentracion,
        ra.dosis,
        ra.duracion_dias,
        ra.notas,
        ra.enviado_sag_bool,
        ra.enviado_at
      FROM receta_antibiotico ra
      JOIN receta r  ON r.id = ra.receta_id
      JOIN mascota m ON m.id = r.mascota_id
      LEFT JOIN propietario p ON p.id = m.propietario_id
      JOIN antibiotico a ON a.id = ra.antibiotico_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY ra.enviado_sag_bool ASC, r.fecha DESC, ra.id DESC
      LIMIT 1000
    `;
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (e) {
        console.error('GET /api/antibioticos/usos', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// PATCH /api/antibioticos/usos/:id/enviar
router.patch('/usos/:id/enviar', async (req, res) => {
    try {
        const { id } = req.params;
        const [r] = await pool.query(
            `UPDATE receta_antibiotico SET enviado_sag_bool=1, enviado_at=NOW(), updated_at=NOW() WHERE id=?`,
            [id]
        );
        res.json({ ok: true, affected: r.affectedRows });
    } catch (e) {
        console.error('PATCH /api/antibioticos/usos/:id/enviar', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// (Opcional) Desmarcar
router.patch('/usos/:id/desmarcar', async (req, res) => {
    try {
        const { id } = req.params;
        const [r] = await pool.query(
            `UPDATE receta_antibiotico SET enviado_sag_bool=0, enviado_at=NULL, updated_at=NOW() WHERE id=?`,
            [id]
        );
        res.json({ ok: true, affected: r.affectedRows });
    } catch (e) {
        console.error('PATCH /api/antibioticos/usos/:id/desmarcar', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

export default router;
