import { Router } from 'express';
import pool from '../db.js';

const router = Router();
function isNonEmptyArray(a) { return Array.isArray(a) && a.length > 0; }

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

router.post('/', /*authRequired,*/ async (req, res) => {
    const conn = await pool.getConnection();
    try {
        await conn.beginTransaction();

        const body = req.body || {};
        const {
            mascota_id, fecha, diagnostico = null, indicaciones = null,
            medicamentos = null, firmado_por = null,
            veterinario_id = null,                  // <- por si lo quieres guardar
            antibiotico_bool = 0,
            antibioticos = []                       // [{antibiotico_id, dosis, duracion_dias, notas}]
        } = body;

        if (!mascota_id) {
            await conn.rollback(); conn.release();
            return res.status(400).json({ ok: false, msg: 'mascota_id es requerido' });
        }

        // 1) obtener propietario_id desde la mascota
        const [[pet]] = await conn.query(
            'SELECT propietario_id FROM mascota WHERE id = ?',
            [Number(mascota_id)]
        );
        const propietario_id = pet?.propietario_id || null;

        // Si tu columna receta.propietario_id es NOT NULL, valida:
        if (!propietario_id) {
            await conn.rollback(); conn.release();
            return res.status(400).json({
                ok: false,
                msg: 'La mascota seleccionada no tiene propietario asociado; no se puede crear la receta.'
            });
        }

        const fechaFinal = fecha ? new Date(fecha) : new Date();

        // 2) Insert receta (ahora incluye propietario_id y opcionalmente veterinario_id)
        const sqlRec = `
      INSERT INTO receta
        (mascota_id, propietario_id, fecha, diagnostico, indicaciones, medicamentos, firmado_por, veterinario_id, antibiotico_bool, created_at)
      VALUES (?,?,?,?,?,?,?,?,?, NOW())
    `;
        const [rRec] = await conn.query(sqlRec, [
            Number(mascota_id), Number(propietario_id), fechaFinal,
            diagnostico, indicaciones, medicamentos, firmado_por,
            veterinario_id ? Number(veterinario_id) : null,
            (Array.isArray(antibioticos) && antibioticos.length) || Number(antibiotico_bool) === 1 ? 1 : 0
        ]);
        const recetaId = rRec.insertId;

        // 3) Inserta usos de antibiótico (si vinieron)
        if (Array.isArray(antibioticos) && antibioticos.length) {
            const sqlUso = `
        INSERT INTO receta_antibiotico
          (receta_id, antibiotico_id, dosis, duracion_dias, notas, enviado_sag_bool, created_at)
        VALUES (?,?,?,?,?,0, NOW())
      `;
            for (const it of antibioticos) {
                if (!it || !it.antibiotico_id) continue;
                const dosis = it.dosis ?? null;
                const duracion = (it.duracion_dias != null && it.duracion_dias !== '') ? Number(it.duracion_dias) : null;
                const notas = it.notas ?? null;
                await conn.query(sqlUso, [recetaId, Number(it.antibiotico_id), dosis, duracion, notas]);
            }
        }

        await conn.commit();
        res.status(201).json({ ok: true, id: recetaId });
    } catch (e) {
        await conn.rollback();
        console.error('POST /api/recetas', e);
        res.status(500).json({ ok: false, msg: e.message });
    } finally {
        conn.release();
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
