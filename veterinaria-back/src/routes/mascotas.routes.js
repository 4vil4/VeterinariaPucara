import { Router } from 'express';
import multer from 'multer';
import pool from '../db.js';

const router = Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (_req, file, cb) => {
        const ok = ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype);
        cb(ok ? null : new Error('Tipo de imagen no permitido (jpeg/png/webp)'), ok);
    }
});

/** LISTA */
router.get('/', async (_req, res) => {
    const sql = `
    SELECT
      m.id, m.nombre, m.n_historial, m.especie, m.raza, m.sexo,
      m.esterilizado, m.nro_microchip,
      m.fecha_nacimiento, m.peso_kg, m.propietario_id, m.updated_at,
      p.nombre AS propietario_nombre
    FROM mascota m
    LEFT JOIN propietario p ON p.id = m.propietario_id
    ORDER BY m.id DESC
    LIMIT 500
  `;
    const [rows] = await pool.query(sql);
    res.json(rows);
});

/** DETALLE */
router.get('/:id', async (req, res) => {
    const { id } = req.params;
    const [rows] = await pool.query(`SELECT * FROM mascota WHERE id = ?`, [id]);
    if (!rows.length) return res.status(404).json({ ok: false, msg: 'No encontrada' });
    const m = rows[0];
    let foto_url = null;
    if (m.foto && m.foto_tipo) {
        const base64 = Buffer.from(m.foto).toString('base64');
        foto_url = `data:${m.foto_tipo};base64,${base64}`;
    }
    res.json({ ...m, foto_url });
});

/** GET /api/mascotas/:id/foto */
router.get('/:id/foto', async (req, res) => {
    const { id } = req.params;
    const [rows] = await pool.query(
        `SELECT foto, foto_tipo FROM mascota WHERE id = ?`,
        [id]
    );
    if (!rows.length || !rows[0].foto) return res.status(404).end();
    res.setHeader('Content-Type', rows[0].foto_tipo || 'image/jpeg');
    res.send(rows[0].foto);
});

/** CREAR */
router.post('/', upload.single('foto'), async (req, res) => {
    const {
        nombre, especie, raza, sexo,
        esterilizado, nro_microchip,
        n_historial, fecha_nacimiento, peso_kg,
        propietario_id
    } = req.body || {};

    if (!nombre) return res.status(400).json({ ok: false, msg: 'nombre es requerido' });

    const foto = req.file?.buffer || null;
    const foto_tipo = req.file?.mimetype || null;
    const foto_tamano = req.file?.size || null;

    const sql = `
    INSERT INTO mascota
    (nombre, especie, raza, sexo, esterilizado, nro_microchip,
     n_historial, fecha_nacimiento, peso_kg, propietario_id,
     foto, foto_tipo, foto_tamano, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
  `;
    const params = [
        nombre || null, especie || null, raza || null, sexo || null,
        (esterilizado === '1' || esterilizado === 1) ? 1 : (esterilizado === '0' || esterilizado === 0 ? 0 : null),
        nro_microchip || null,
        n_historial || null, fecha_nacimiento || null,
        (peso_kg !== undefined && peso_kg !== null && peso_kg !== '') ? Number(peso_kg) : null,
        propietario_id ?? null,
        foto, foto_tipo, foto_tamano
    ];
    const [r] = await pool.execute(sql, params);
    res.status(201).json({ ok: true, id: r.insertId });
});

/** EDITAR */
router.put('/:id', upload.single('foto'), async (req, res) => {
    const { id } = req.params;
    const {
        nombre, especie, raza, sexo,
        esterilizado, nro_microchip,
        n_historial, fecha_nacimiento, peso_kg,
        propietario_id
    } = req.body || {};

    let sql = `
    UPDATE mascota
       SET nombre=?, especie=?, raza=?, sexo=?,
           esterilizado=?, nro_microchip=?,
           n_historial=?, fecha_nacimiento=?,
           peso_kg=?, propietario_id=?, updated_at=NOW()
  `;
    const params = [
        nombre || null, especie || null, raza || null, sexo || null,
        (esterilizado === '1' || esterilizado === 1) ? 1 : (esterilizado === '0' || esterilizado === 0 ? 0 : null),
        nro_microchip || null,
        n_historial || null, fecha_nacimiento || null,
        (peso_kg !== undefined && peso_kg !== null && peso_kg !== '') ? Number(peso_kg) : null,
        propietario_id ?? null
    ];

    if (req.file) {
        sql += `, foto=?, foto_tipo=?, foto_tamano=?`;
        params.push(req.file.buffer, req.file.mimetype, req.file.size);
    }

    sql += ` WHERE id=?`;
    params.push(id);

    const [r] = await pool.execute(sql, params);
    res.json({ ok: true, affected: r.affectedRows });
});

/** ELIMINAR */
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const [r] = await pool.execute(`DELETE FROM mascota WHERE id = ?`, [id]);
    res.json({ ok: true, affected: r.affectedRows });
});

/** HISTORIAL combinando fuentes (se mantiene igual) */
router.get('/:id/historial', async (req, res) => {
    const mascotaId = Number(req.params.id);
    const LIM = Math.min(parseInt(req.query.limit || '500', 10) || 500, 2000);
    if (!mascotaId) return res.status(400).json({ error: 'mascota_id inválido' });

    const sources = [
        {
            tipo: 'Receta', tabla: 'receta', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(diagnostico,''), NULLIF(medicamentos,''), NULLIF(indicaciones,'')))"
        },
        {
            tipo: 'Consulta', tabla: 'consulta', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(motivo,''), NULLIF(diagnostico,'')))"
        },
        {
            tipo: 'Control', tabla: 'control', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(motivo,''), NULLIF(diagnostico,'')))"
        },
        {
            tipo: 'Cirugía', tabla: 'cirugia', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(procedimiento,''), NULLIF(observaciones,'')))"
        },
        {
            tipo: 'Vacuna', tabla: 'vacuna', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(vacuna,''), NULLIF(observaciones,'')))"
        },
        {
            tipo: 'Antiparasitario', tabla: 'antiparasitario', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(producto,''), NULLIF(observaciones,'')))"
        },
        {
            tipo: 'Antipulgas', tabla: 'antipulgas', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(producto,''), NULLIF(observaciones,'')))"
        },
        {
            tipo: 'Hospitalización', tabla: 'hospitalizacion', colFecha: 'fecha_ingreso',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(motivo,''), NULLIF(indicaciones,'')))"
        },
        {
            tipo: 'Triaje', tabla: 'triaje', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(motivo,''), NULLIF(observaciones,'')))"
        },
        {
            tipo: 'Profilaxis', tabla: 'profilaxis', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(procedimiento,''), NULLIF(observaciones,'')))"
        },
        {
            tipo: 'Defunción', tabla: 'defuncion', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(causa,''), NULLIF(observaciones,'')))"
        },
        {
            tipo: 'Dermatología', tabla: 'dermatologia', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(motivo,''), NULLIF(diagnostico,'')))"
        },
        {
            tipo: 'Orden de exámenes', tabla: 'orden_examenes', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(examenes,''), NULLIF(indicaciones,'')))"
        },
        {
            tipo: 'Oftalmología', tabla: 'oftalmologia', colFecha: 'fecha',
            resumen: "TRIM(CONCAT_WS(' — ', NULLIF(motivo,''), NULLIF(diagnostico,'')))"
        },
    ];

    const all = [];
    for (const s of sources) {
        try {
            const sql = `
        SELECT id, '${s.tipo}' AS tipo, mascota_id, ${s.colFecha} AS fecha,
               ${s.resumen} AS resumen
        FROM ${s.tabla}
        WHERE mascota_id = ?
        ORDER BY ${s.colFecha} DESC, id DESC
        LIMIT ?
      `;
            const [rows] = await pool.query(sql, [mascotaId, LIM]);
            all.push(...rows);
        } catch (_e) { }
    }

    all.sort((a, b) => new Date(b.fecha || 0) - new Date(a.fecha || 0) || (b.id - a.id));
    res.json(all.slice(0, LIM));
});

export default router;
