import { Router } from 'express';
import pool from '../db.js';
import bcrypt from 'bcryptjs';

const router = Router();

/* LISTAR */
router.get('/', async (req, res) => {
    try {
        const q = (req.query.search || '').trim();
        let sql = `SELECT id, nombre, rut, correo, movil, user_id, activo, created_at
               FROM veterinario`;
        const params = [];
        if (q) {
            sql += ` WHERE nombre LIKE ? OR rut LIKE ? OR correo LIKE ?`;
            params.push(`%${q}%`, `%${q}%`, `%${q}%`);
        }
        sql += ` ORDER BY nombre ASC`;
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (e) {
        console.error('GET /api/personal', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

/* CREAR */
router.post('/', async (req, res) => {
    const { nombre, rut, correo, movil, userEmail, userPass } = req.body || {};
    if (!nombre) return res.status(400).json({ ok: false, msg: 'nombre es obligatorio' });

    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        let userId = null;
        if (userEmail && userPass) {
            const hash = await bcrypt.hash(String(userPass), 10);
            const [u] = await conn.query(
                `INSERT INTO user (nombre, email, password_hash, role)
         VALUES (?,?,?, 'vet')`,
                [nombre, userEmail, hash]
            );
            userId = u.insertId;
        }

        const [r] = await conn.query(
            `INSERT INTO veterinario (nombre, rut, correo, movil, user_id, activo)
       VALUES (?,?,?,?,?,1)`,
            [nombre, rut || null, correo || null, movil || null, userId]
        );

        await conn.commit();
        res.json({ ok: true, id: r.insertId, user_id: userId });
    } catch (e) {
        await conn.rollback();
        console.error('POST /api/personal', e);
        res.status(500).json({ ok: false, msg: e.message });
    } finally {
        conn.release();
    }
});

/* EDITAR */
router.put('/:id', async (req, res) => {
    const { nombre, rut, correo, movil, activo } = req.body || {};
    try {
        await pool.query(
            `UPDATE veterinario
       SET nombre=?, rut=?, correo=?, movil=?, activo=IFNULL(?, activo)
       WHERE id=?`,
            [nombre, rut, correo, movil, activo, req.params.id]
        );
        res.json({ ok: true });
    } catch (e) {
        console.error('PUT /api/personal/:id', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

/* ELIMINAR */
router.delete('/:id', async (req, res) => {
    try {
        await pool.query(`UPDATE veterinario SET activo=0 WHERE id=?`, [req.params.id]);
        res.json({ ok: true });
    } catch (e) {
        console.error('DELETE /api/personal/:id', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

/* HISTÓRICO */
router.get('/:id/historico', async (req, res) => {
    try {
        const vetId = Number(req.params.id);
        const from = (req.query.from || '1900-01-01').slice(0, 10);
        const to = (req.query.to || '2999-12-31').slice(0, 10);

        const [resumen] = await pool.query(
            `SELECT veterinario_id, mes, cantidad_registros, total_bruto, total_comision
       FROM v_comision_mensual_vet
       WHERE veterinario_id = ?
         AND mes BETWEEN DATE_FORMAT(?, '%Y-%m') AND DATE_FORMAT(?, '%Y-%m')
       ORDER BY mes DESC`,
            [vetId, from, to]
        );

        const [detalle] = await pool.query(
            `SELECT fecha, tipo, registro_id, base_monto AS monto_total, porcentaje, comision_monto
       FROM registro_comision
       WHERE veterinario_id=? AND fecha BETWEEN ? AND ?
       ORDER BY fecha DESC, id DESC`,
            [vetId, from, to]
        );

        res.json({ resumen, detalle });
    } catch (e) {
        console.error('GET /api/personal/:id/historico', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

export default router;
