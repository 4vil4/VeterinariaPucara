import { Router } from 'express';
import pool from '../db.js';
import { authRequired } from '../middlewares/auth.middleware.js';

const router = Router();

// Listado (con búsqueda por nombre de mascota o ID)
router.get('/', async (req, res) => {
    try {
        const { search = '' } = req.query;
        const sql = `
      SELECT h.id, h.mascota_id, h.fecha_ingreso, h.motivo, h.estado, h.fecha_alta,
             m.nombre AS mascota_nombre
      FROM hospitalizacion h
      JOIN mascota m ON m.id = h.mascota_id
      ${search ? `WHERE m.nombre LIKE ? OR h.id LIKE ?` : ''}
      ORDER BY h.fecha_ingreso DESC
      LIMIT 500
    `;
        const params = search ? [`%${search}%`, `%${search}%`] : [];
        const [rows] = await pool.query(sql, params);
        res.json(rows);
    } catch (e) {
        console.error('GET /hospitalizacion error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// Obtener 1 (usado para calcular “día N”)
router.get('/:id', async (req, res) => {
    try {
        const id = Number(req.params.id);
        const [rows] = await pool.query(
            `SELECT id, mascota_id, fecha_ingreso, motivo, estado, fecha_alta
       FROM hospitalizacion WHERE id=?`, [id]
        );
        if (!rows.length) return res.status(404).json({ ok: false, msg: 'no encontrado' });
        res.json(rows[0]);
    } catch (e) {
        console.error('GET /hospitalizacion/:id error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// Crear hospitalización
router.post('/', authRequired, async (req, res) => {
    try {
        const b = req.body || {};
        if (!b.mascota_id) return res.status(400).json({ ok: false, msg: 'mascota_id requerido' });

        const peso = b.peso_kg;
        delete b.peso_kg;

        if (!b.fecha_ingreso) b.fecha_ingreso = new Date();
        if (typeof b.fecha_ingreso === 'string') {
            b.fecha_ingreso = b.fecha_ingreso.replace('T', ' ');
            if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(b.fecha_ingreso)) b.fecha_ingreso += ':00';
        }

        const allowed = [
            'mascota_id', 'fecha_ingreso', 'motivo', 'estado', 'observaciones',
            'veterinario_id', 'monto_total', 'cuidados', 'medicacion_json',
            'fecha_alta', 'atendido_por' 
        ];
        const cols = allowed.filter(k => b[k] !== undefined);
        const placeholders = cols.map(() => '?').join(',');
        const params = cols.map(k => b[k]);

        const [r] = await pool.query(
            `INSERT INTO hospitalizacion (${cols.join(',')}) VALUES (${placeholders})`,
            params
        );

        if (peso != null) {
            await pool.query(`UPDATE mascota SET peso_kg=? WHERE id=?`, [peso, b.mascota_id]);
        }

        res.status(201).json({ ok: true, id: r.insertId });
    } catch (e) {
        console.error('POST /api/hospitalizacion error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});


/* ============== Monitoreo diario (matriz por horas) ============== */

// Obtener monitoreo por fecha
router.get('/:id/monitoreo', async (req, res) => {
    try {
        const hospId = Number(req.params.id);
        const fecha = (req.query.fecha || new Date().toISOString().slice(0, 10));
        const sql = `
      SELECT id, hospitalizacion_id, fecha, TIME_FORMAT(hora, '%H:%i') AS hora,
             temperatura_c, lpm, fr, peso_kg, deshidratacion, tlc_seg,
             pa, pas, pad, pam, notas
      FROM hospitalizacion_monitoreo
      WHERE hospitalizacion_id=? AND fecha=?
      ORDER BY hora ASC
    `;
        const [rows] = await pool.query(sql, [hospId, fecha]);
        res.json(rows);
    } catch (e) {
        console.error('GET /hospitalizacion/:id/monitoreo error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// Inicializar horarios default o personalizados
router.post('/:id/monitoreo/init', async (req, res) => {
    try {
        const hospId = Number(req.params.id);
        const fecha = (req.body.fecha || new Date().toISOString().slice(0, 10));
        const horas = Array.isArray(req.body.horas) && req.body.horas.length
            ? req.body.horas
            : ['06:00', '10:00', '14:00', '18:00', '22:00'];

        const conn = await pool.getConnection();
        try {
            await conn.beginTransaction();
            for (const h of horas) {
                await conn.query(
                    `INSERT IGNORE INTO hospitalizacion_monitoreo (hospitalizacion_id, fecha, hora)
           VALUES (?,?,?)`, [hospId, fecha, h + ':00']
                );
            }
            await conn.commit();
        } catch (e) {
            await conn.rollback(); throw e;
        } finally { conn.release(); }

        res.json({ ok: true });
    } catch (e) {
        console.error('POST /hospitalizacion/:id/monitoreo/init error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// Guardar/actualizar una fila 
router.put('/:id/monitoreo', async (req, res) => {
    try {
        const hospId = Number(req.params.id);
        const {
            fecha, hora,
            temperatura_c, lpm, fr, peso_kg, deshidratacion, tlc_seg,
            pa, pas, pad, pam, notas
        } = req.body || {};
        if (!fecha || !hora) return res.status(400).json({ ok: false, msg: 'fecha y hora requeridas' });

        const sql = `
      INSERT INTO hospitalizacion_monitoreo
        (hospitalizacion_id, fecha, hora, temperatura_c, lpm, fr, peso_kg,
         deshidratacion, tlc_seg, pa, pas, pad, pam, notas)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      ON DUPLICATE KEY UPDATE
        temperatura_c=VALUES(temperatura_c),
        lpm=VALUES(lpm),
        fr=VALUES(fr),
        peso_kg=VALUES(peso_kg),
        deshidratacion=VALUES(deshidratacion),
        tlc_seg=VALUES(tlc_seg),
        pa=VALUES(pa),
        pas=VALUES(pas),
        pad=VALUES(pad),
        pam=VALUES(pam),
        notas=VALUES(notas)
    `;
        const params = [hospId, fecha, `${hora}:00`,
            temperatura_c ?? null, lpm ?? null, fr ?? null, peso_kg ?? null,
            deshidratacion ?? null, tlc_seg ?? null, pa ?? null, pas ?? null, pad ?? null, pam ?? null, notas ?? null
        ];
        await pool.query(sql, params);
        res.json({ ok: true });
    } catch (e) {
        console.error('PUT /hospitalizacion/:id/monitoreo error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// Eliminar una hora
router.delete('/:id/monitoreo', async (req, res) => {
    try {
        const hospId = Number(req.params.id);
        const { fecha, hora } = req.query;
        if (!fecha || !hora) return res.status(400).json({ ok: false, msg: 'fecha y hora requeridas' });
        await pool.query(
            `DELETE FROM hospitalizacion_monitoreo WHERE hospitalizacion_id=? AND fecha=? AND hora=?`,
            [hospId, fecha, `${hora}:00`]
        );
        res.json({ ok: true });
    } catch (e) {
        console.error('DEL /hospitalizacion/:id/monitoreo error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

/* ================== Observación diaria (texto libre) ================== */

router.get('/:id/observacion', async (req, res) => {
    try {
        const hospId = Number(req.params.id);
        const fecha = req.query.fecha || new Date().toISOString().slice(0, 10);
        const [rows] = await pool.query(
            `SELECT texto FROM hospitalizacion_observacion WHERE hospitalizacion_id=? AND fecha=?`,
            [hospId, fecha]
        );
        res.json(rows[0] || {});
    } catch (e) {
        console.error('GET /hospitalizacion/:id/observacion error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

router.put('/:id/observacion', async (req, res) => {
    try {
        const hospId = Number(req.params.id);
        const { fecha, texto } = req.body || {};
        if (!fecha) return res.status(400).json({ ok: false, msg: 'fecha requerida' });
        const sql = `
      INSERT INTO hospitalizacion_observacion (hospitalizacion_id, fecha, texto)
      VALUES (?,?,?)
      ON DUPLICATE KEY UPDATE texto=VALUES(texto)
    `;
        await pool.query(sql, [hospId, fecha, texto]);
        res.json({ ok: true });
    } catch (e) {
        console.error('PUT /hospitalizacion/:id/observacion error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

export default router;
