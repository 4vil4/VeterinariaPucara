import { Router } from 'express';
import pool from '../db.js';

const router = Router();

/* Helpers */
function toNull(v) {
    if (v === undefined || v === null) return null;
    if (typeof v === 'string' && v.trim() === '') return null;
    return v;
}

router.get('/', async (req, res) => {
    try {
        const { search, mascota_id, propietario_id, from, to } = req.query;

        const where = [];
        const params = [];

        if (mascota_id) { where.push('r.mascota_id = ?'); params.push(Number(mascota_id)); }
        if (propietario_id) { where.push('r.propietario_id = ?'); params.push(Number(propietario_id)); }
        if (from) { where.push('DATE(r.fecha) >= ?'); params.push(from); }
        if (to) { where.push('DATE(r.fecha) <= ?'); params.push(to); }
        if (search) {
            where.push(`(
        m.nombre LIKE CONCAT('%', ?, '%') OR
        p.nombre LIKE CONCAT('%', ?, '%') OR
        r.diagnostico LIKE CONCAT('%', ?, '%') OR
        r.indicaciones LIKE CONCAT('%', ?, '%') OR
        r.medicamentos LIKE CONCAT('%', ?, '%')
      )`);
            params.push(search, search, search, search, search);
        }

        const sql = `
      SELECT
        r.*,
        m.nombre AS mascota_nombre,
        p.nombre AS propietario_nombre,
        p.movil  AS propietario_movil
      FROM receta r
      JOIN mascota m      ON m.id = r.mascota_id
      JOIN propietario p  ON p.id = r.propietario_id
      ${where.length ? 'WHERE ' + where.join(' AND ') : ''}
      ORDER BY r.fecha DESC, r.id DESC
      LIMIT 500
    `;
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (err) {
        console.error('GET /recetas error', err);
        res.status(500).json({ error: 'No se pudo listar recetas' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [rows] = await pool.query(
            `SELECT r.*, m.nombre AS mascota_nombre, p.nombre AS propietario_nombre, p.movil AS propietario_movil
       FROM receta r
       JOIN mascota m ON m.id = r.mascota_id
       JOIN propietario p ON p.id = r.propietario_id
       WHERE r.id = ?`,
            [id]
        );
        if (!rows.length) return res.status(404).json({ error: 'Receta no encontrada' });
        res.json(rows[0]);
    } catch (err) {
        console.error('GET /recetas/:id error', err);
        res.status(500).json({ error: 'No se pudo obtener la receta' });
    }
});

router.post('/', async (req, res) => {
    try {
        const {
            mascota_id,
            propietario_id,
            fecha,
            diagnostico,
            indicaciones,
            medicamentos,
            veterinario_id,
            firmado_por
        } = req.body || {};

        if (!mascota_id) return res.status(400).json({ error: 'mascota_id es obligatorio' });

        let propId = toNull(propietario_id);
        if (!propId) {
            const [[pet]] = await pool.query('SELECT propietario_id FROM mascota WHERE id = ?', [Number(mascota_id)]);
            if (!pet?.propietario_id) {
                return res.status(400).json({ error: 'La mascota no tiene propietario asociado' });
            }
            propId = pet.propietario_id;
        }

        const sql = `
      INSERT INTO receta (
        mascota_id, propietario_id, fecha,
        diagnostico, indicaciones, medicamentos,
        veterinario_id, firmado_por
      ) VALUES (?, ?, COALESCE(?, NOW()), ?, ?, ?, ?, ?)
    `;
        const params = [
            Number(mascota_id), Number(propId), toNull(fecha),
            toNull(diagnostico), toNull(indicaciones), toNull(medicamentos),
            toNull(veterinario_id), toNull(firmado_por)
        ];
        const [r] = await pool.query(sql, params);

        const [rows] = await pool.query(
            `SELECT r.*, m.nombre AS mascota_nombre, p.nombre AS propietario_nombre, p.movil AS propietario_movil
       FROM receta r
       JOIN mascota m ON m.id = r.mascota_id
       JOIN propietario p ON p.id = r.propietario_id
       WHERE r.id = ?`,
            [r.insertId]
        );
        res.status(201).json(rows[0] || { id: r.insertId });
    } catch (err) {
        console.error('POST /recetas error', err);
        res.status(500).json({ error: 'No se pudo crear la receta' });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const payload = {
            mascota_id: toNull(req.body.mascota_id),
            propietario_id: toNull(req.body.propietario_id),
            fecha: toNull(req.body.fecha),
            diagnostico: toNull(req.body.diagnostico),
            indicaciones: toNull(req.body.indicaciones),
            medicamentos: toNull(req.body.medicamentos),
            veterinario_id: toNull(req.body.veterinario_id),
            firmado_por: toNull(req.body.firmado_por)
        };

        if (!payload.propietario_id && payload.mascota_id) {
            const [[pet]] = await pool.query('SELECT propietario_id FROM mascota WHERE id = ?', [Number(payload.mascota_id)]);
            if (pet?.propietario_id) payload.propietario_id = pet.propietario_id;
        }

        const sets = [];
        const params = [];
        for (const [k, v] of Object.entries(payload)) {
            if (v !== undefined) { sets.push(`${k} = ?`); params.push(v); }
        }
        if (!sets.length) return res.status(400).json({ error: 'Nada para actualizar' });

        const sql = `UPDATE receta SET ${sets.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        params.push(id);
        await pool.query(sql, params);

        const [rows] = await pool.query(
            `SELECT r.*, m.nombre AS mascota_nombre, p.nombre AS propietario_nombre, p.movil AS propietario_movil
       FROM receta r
       JOIN mascota m ON m.id = r.mascota_id
       JOIN propietario p ON p.id = r.propietario_id
       WHERE r.id = ?`,
            [id]
        );
        res.json(rows[0] || { id });
    } catch (err) {
        console.error('PUT /recetas/:id error', err);
        res.status(500).json({ error: 'No se pudo actualizar la receta' });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [r] = await pool.query('DELETE FROM receta WHERE id = ?', [id]);
        if (r.affectedRows === 0) return res.status(404).json({ error: 'Receta no encontrada' });
        res.json({ ok: true });
    } catch (err) {
        console.error('DELETE /recetas/:id error', err);
        res.status(500).json({ error: 'No se pudo eliminar la receta' });
    }
});

export default router;
