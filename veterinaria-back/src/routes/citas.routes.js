import { Router } from 'express';
import pool from '../db.js';

const router = Router();

async function hayCruceDeCitas(fecha_inicio, excluirId = null) {
  const fechaNorm = (typeof fecha_inicio === 'string' && fecha_inicio)
    ? fecha_inicio.replace('T', ' ')
    : fecha_inicio;

  let sql = `
    SELECT COUNT(*) AS total
    FROM cita
    WHERE estado <> 'cancelada'
      AND ABS(TIMESTAMPDIFF(MINUTE, fecha_inicio, ?)) < 60
  `;
  const params = [fechaNorm];

  if (excluirId != null) {
    sql += ' AND id <> ?';
    params.push(excluirId);
  }

  const [rows] = await pool.query(sql, params);
  const row = rows[0];
  return (row && row.total > 0);
}

/** GET /api/citas */
router.get('/', async (req, res) => {
  try {
    let { from, to, search = '', urgencia, estado, order } = req.query;

    let sql = `
      SELECT c.*,
             p.nombre AS propietario_nombre
      FROM cita c
      LEFT JOIN propietario p ON p.id = c.propietario_id
    `;
    const where = [];
    const params = [];

    if (from && to) {
      where.push('c.fecha_inicio >= ? AND c.fecha_inicio < ?');
      params.push(from, to);
    } else if (from) {
      where.push('c.fecha_inicio >= ?');
      params.push(from);
    } else if (to) {
      where.push('c.fecha_inicio < ?');
      params.push(to);
    }

    if (search) {
      const s = `%${search}%`;
      where.push('(p.nombre LIKE ? OR c.tipo LIKE ? OR c.estado LIKE ?)');
      params.push(s, s, s);
    }

    if (typeof urgencia !== 'undefined') {
      where.push('c.urgencia = ?');
      params.push(Number(urgencia) ? 1 : 0);
    }

    // Estado exacto (programada | confirmada | atendida | cancelada)
    if (estado) {
      where.push('c.estado = ?');
      params.push(estado);
    }

    if (where.length) sql += ' WHERE ' + where.join(' AND ');

    const ord = String(order || '').toLowerCase() === 'desc' ? 'DESC' : 'ASC';
    sql += ` ORDER BY c.fecha_inicio ${ord}`;

    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (e) {
    console.error('GET /api/citas', e);
    res.status(500).json({ ok: false, msg: e.message });
  }
});

/** POST /api/citas */
router.post('/', async (req, res) => {
  try {
    const {
      propietario_id = null,
      fecha_inicio,
      fecha_fin = null,
      tipo,
      estado = 'programada',
      urgencia = 0,
      observaciones = null,
      created_by = null
    } = req.body || {};

    if (!fecha_inicio || !tipo)
      return res.status(400).json({ ok: false, msg: 'fecha_inicio y tipo son requeridos' });

    const fechaInicioNorm = (typeof fecha_inicio === 'string' && fecha_inicio)
      ? fecha_inicio.replace('T', ' ')
      : fecha_inicio;

    if (await hayCruceDeCitas(fechaInicioNorm)) {
      return res
        .status(409)
        .json({ ok: false, msg: 'Ya existe una cita en el rango de 1 hora para ese horario.' });
    }

    const [r] = await pool.execute(
      `INSERT INTO cita (propietario_id, fecha_inicio, fecha_fin, tipo, estado, urgencia, observaciones, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [propietario_id, fechaInicioNorm, fecha_fin, tipo, estado, urgencia ? 1 : 0, observaciones, created_by]
    );

    res.status(201).json({ ok: true, id: r.insertId });
  } catch (e) {
    console.error('POST /api/citas', e);
    res.status(500).json({ ok: false, msg: e.message });
  }
});

/** PUT /api/citas/:id */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const b = req.body || {};

    const normDT = s => (typeof s === 'string' && s) ? s.replace('T', ' ') : undefined;

    const allowed = {
      propietario_id: (b.propietario_id !== '' && b.propietario_id != null) ? Number(b.propietario_id) : undefined,
      fecha_inicio: normDT(b.fecha_inicio),
      fecha_fin: (b.fecha_fin === '' || b.fecha_fin == null) ? null : normDT(b.fecha_fin),
      tipo: (typeof b.tipo === 'string' && b.tipo.trim() !== '') ? b.tipo.trim() : undefined,
      estado: (typeof b.estado === 'string' && b.estado.trim() !== '') ? b.estado.trim() : undefined,
      urgencia: (b.urgencia == null ? undefined : (Number(b.urgencia) ? 1 : 0)),
      observaciones: (typeof b.observaciones === 'string') ? b.observaciones : undefined,
    };

    const keys = Object.keys(allowed).filter(k => allowed[k] !== undefined);
    if (!keys.length) return res.status(400).json({ ok: false, msg: 'Sin campos para actualizar' });

    if (allowed.fecha_inicio) {
      const hayChoque = await hayCruceDeCitas(allowed.fecha_inicio, id);
      if (hayChoque) {
        return res
          .status(409)
          .json({ ok: false, msg: 'Ya existe una cita en el rango de 1 hora para ese horario.' });
      }
    }

    const setSQL = keys.map(k => `\`${k}\` = ?`).join(', ') + ', `updated_at` = NOW()';
    const params = keys.map(k => allowed[k]); params.push(id);

    const [r] = await pool.execute(`UPDATE \`cita\` SET ${setSQL} WHERE \`id\` = ?`, params);
    if (!r.affectedRows) return res.status(404).json({ ok: false, msg: 'Cita no encontrada' });

    res.json({ ok: true, affected: r.affectedRows });
  } catch (e) {
    if (e?.code === 'ER_TRUNCATED_WRONG_VALUE_FOR_FIELD' || e?.errno === 1366) {
      return res.status(400).json({ ok: false, msg: 'Valor de estado inválido para la BD (ENUM).' });
    }
    console.error('PUT /api/citas/:id', e);
    res.status(500).json({ ok: false, msg: e.message });
  }
});

/** DELETE /api/citas/:id */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const [r] = await pool.execute('DELETE FROM cita WHERE id=?', [id]);
    res.json({ ok: true, affected: r.affectedRows });
  } catch (e) {
    console.error('DELETE /api/citas/:id', e);
    res.status(500).json({ ok: false, msg: e.message });
  }
});

export default router;
