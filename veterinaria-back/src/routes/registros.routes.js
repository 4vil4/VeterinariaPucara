import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const MAP = {
  consulta: {
    table: 'consulta',
    order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'motivo', 'diagnostico', 'created_at'],
    insert: ['mascota_id', 'fecha', 'motivo', 'diagnostico', 'indicaciones', 'atendido_por', 'veterinario_id', 'monto_total', 'anestesia_bool']
  },

  control: {
    table: 'control', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'motivo', 'peso_kg', 'temperatura_c', 'diagnostico', 'created_at'],
    insert: ['mascota_id', 'fecha', 'motivo', 'peso_kg', 'temperatura_c', 'fc', 'fr', 'examen_fisico', 'diagnostico', 'indicaciones', 'atendido_por', 'veterinario_id', 'monto_total']
  },

  cirugia: {
    table: 'cirugia', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'procedimiento', 'asa', 'cirujano', 'created_at'],
    insert: ['mascota_id', 'fecha', 'procedimiento', 'cirujano', 'anestesia', 'asa', 'materiales', 'complicaciones', 'notas', 'consent_firmado', 'atendido_por', 'veterinario_id', 'monto_total']
  },

  vacuna: {
    table: 'vacuna', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'vacuna', 'lote', 'proxima_fecha', 'created_at'],
    insert: ['mascota_id', 'fecha', 'vacuna', 'lote', 'fabricante', 'fecha_venc', 'proxima_fecha', 'observaciones', 'atendido_por', 'veterinario_id', 'monto_total']
  },

  antiparasitario: {
    table: 'antiparasitario', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'producto', 'via', 'dosis', 'unidad', 'proxima_fecha', 'created_at'],
    insert: ['mascota_id', 'fecha', 'producto', 'via', 'dosis', 'unidad', 'peso_referencia', 'proxima_fecha', 'observaciones', 'atendido_por', 'veterinario_id', 'monto_total']
  },

  antipulgas: {
    table: 'antipulgas', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'producto', 'via', 'dosis', 'proxima_fecha', 'created_at'],
    insert: ['mascota_id', 'fecha', 'producto', 'via', 'dosis', 'unidad', 'proxima_fecha', 'observaciones', 'atendido_por', 'veterinario_id', 'monto_total']
  },

  triaje: {
    table: 'triaje', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'nivel', 'notas', 'created_at'],
    insert: ['mascota_id', 'fecha', 'nivel', 'signos_vitales', 'notas', 'atendido_por', 'veterinario_id', 'monto_total']
  },

  profilaxis: {
    table: 'profilaxis', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'tipo', 'created_at'],
    insert: ['mascota_id', 'fecha', 'tipo', 'hallazgos', 'procedimiento', 'anestesia', 'recomendaciones', 'atendido_por', 'veterinario_id', 'monto_total']
  },

  defuncion: {
    table: 'defuncion', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'tipo', 'causa', 'certificado', 'created_at'],
    insert: ['mascota_id', 'fecha', 'tipo', 'causa', 'responsable', 'certificado', 'observaciones', 'veterinario_id', 'monto_total']
  },

  dermatologia: {
    table: 'dermatologia', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'motivo', 'diagnostico', 'created_at'],
    insert: ['mascota_id', 'fecha', 'motivo', 'lesiones', 'pruebas', 'diagnostico', 'tratamiento', 'fecha_control', 'atendido_por', 'veterinario_id', 'monto_total']
  },

  orden_examen: {
    table: 'orden_examen', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'tipo_examen', 'laboratorio', 'estado', 'created_at'],
    insert: ['mascota_id', 'fecha', 'tipo_examen', 'laboratorio', 'muestras', 'estado', 'resultados_url', 'observaciones', 'veterinario_id', 'monto_total']
  },

  oftalmologia: {
    table: 'oftalmologia', order: 'fecha DESC',
    select: ['id', 'mascota_id', 'fecha', 'motivo', 'diagnostico', 'created_at'],
    insert: ['mascota_id', 'fecha', 'motivo', 'test_schirmer_mm', 'fluoresceina', 'pio_mmHg', 'hallazgos', 'diagnostico', 'tratamiento', 'atendido_por', 'veterinario_id', 'monto_total']
  },
};


function cfg(tipo) {
  const c = MAP[tipo];
  if (!c) throw Object.assign(new Error('Tipo no soportado'), { status: 404 });
  return c;
}

router.get('/:tipo', async (req, res) => {
  try {
    const { tipo } = req.params;
    const { search = '' } = req.query;
    const c = cfg(tipo);
    const cols = c.select.map(x => `r.${x}`).join(', ');
    const sql = `
      SELECT ${cols}, m.nombre AS mascota_nombre
      FROM ${c.table} r
      JOIN mascota m ON m.id = r.mascota_id   -- ← singular
      ${search ? `WHERE m.nombre LIKE ? OR r.id LIKE ?` : ''}
      ORDER BY ${c.order}
      LIMIT 500
    `;
    const params = search ? [`%${search}%`, `%${search}%`] : [];
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('GET /api/registros error:', e);
    res.status(e.status || 500).json({ ok: false, msg: e.message });
  }
});

function calcCommission(tipo, anestesia_bool, monto_total) {
  const pct = (tipo === 'consulta' && Number(anestesia_bool) === 1) ? 50 : 40;
  const com = Number(monto_total || 0) * (pct / 100);
  return { pct, com };
}

async function insertCommission(poolOrConn, { tipo, registro_id, veterinario_id, monto_total, fecha, anestesia_bool }) {
  if (!veterinario_id || !monto_total) return;
  const { pct, com } = calcCommission(tipo, anestesia_bool, monto_total);
  const sql = `
    INSERT INTO registro_comision
      (tipo, registro_id, veterinario_id, porcentaje, base_monto, comision_monto, fecha)
    VALUES (?,?,?,?,?,?,?)
  `;
  const params = [tipo, registro_id, veterinario_id, pct, monto_total, com, String(fecha).slice(0, 10)];
  await poolOrConn.query(sql, params);
}

import { authRequired } from '../middlewares/auth.middleware.js';

router.post('/:tipo', authRequired, async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const { tipo } = req.params;
    const body = req.body || {};
    const c = cfg(tipo);

    if (req.user?.role === 'vet') {
      body.veterinario_id = req.user.veterinario_id || null;
    }

    if (!body.mascota_id) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ ok: false, msg: 'mascota_id es requerido' });
    }

    if (!body.fecha && c.table === 'hospitalizacion' && !body.fecha_ingreso) {
      body.fecha_ingreso = new Date();
    } else if (!body.fecha && c.table !== 'hospitalizacion') {
      body.fecha = new Date();
    }

    if (body.veterinario_id !== undefined) body.veterinario_id = body.veterinario_id || null;
    if (body.monto_total !== undefined) body.monto_total = Number(body.monto_total) || 0;
    if (tipo === 'consulta') body.anestesia_bool = body.anestesia_bool ? 1 : 0;

    const keys = c.insert.filter(k => body[k] !== undefined);
    if (keys.length === 0) {
      await conn.rollback(); conn.release();
      return res.status(400).json({ ok: false, msg: 'sin datos para insertar' });
    }

    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${c.table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const params = keys.map(k => body[k]);
    const [r] = await conn.execute(sql, params);

    await insertCommission(conn, {
      tipo,
      registro_id: r.insertId,
      veterinario_id: body.veterinario_id,
      monto_total: body.monto_total,
      fecha: body.fecha || body.fecha_ingreso || new Date(),
      anestesia_bool: body.anestesia_bool
    });

    if (body.peso_kg !== undefined && body.peso_kg !== null && !Number.isNaN(Number(body.peso_kg))) {
      const nuevoPeso = Number(body.peso_kg);
      await conn.execute(
        `UPDATE mascota SET peso_kg = ?, updated_at = NOW() WHERE id = ?`,
        [nuevoPeso, body.mascota_id]
      );
    }

    await conn.commit();
    res.status(201).json({ ok: true, id: r.insertId });
  } catch (e) {
    await conn.rollback();
    console.error('POST /api/registros error:', e);
    res.status(e.status || 500).json({ ok: false, msg: e.message });
  } finally {
    conn.release();
  }
});

export default router;
