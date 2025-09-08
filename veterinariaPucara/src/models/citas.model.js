import { pool } from '../utils/db.js';

export async function getSlotsConfig() {
  const [rows] = await pool.query('SELECT * FROM agenda_config ORDER BY dia_semana ASC');
  return rows;
}

export async function getCitas() {
  const [rows] = await pool.query(`
    SELECT 
      c.id, c.fecha, c.tipo, c.observaciones, c.urgencia,
      p.id AS pet_id,        -- agregado
      p.name_pet AS mascota,
      u.name AS propietario
    FROM citas c
    LEFT JOIN citas_mascotas cm ON cm.cita_id = c.id
    LEFT JOIN pets p ON p.id = cm.pet_id
    LEFT JOIN users u ON u.id = p.user_id
    ORDER BY c.fecha DESC
  `);
  return rows;
}

export async function createCita({ fecha, tipo, observaciones, urgencia, pet_ids }) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      'INSERT INTO citas (fecha, tipo, observaciones, urgencia) VALUES (?,?,?,?)',
      [fecha, tipo, observaciones, !!urgencia]
    );
    const citaId = r.insertId;
    for (const pid of pet_ids) {
      await conn.query('INSERT INTO citas_mascotas (cita_id, pet_id) VALUES (?,?)', [citaId, pid]);
    }
    await conn.commit();
    return citaId;
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

export async function getCitasWindow(hoursAhead = 24, minutesTolerance = 5, which = '24') {
  const flag = which === '24' ? 'reminder_24_sent' : 'reminder_2_sent';
  const [rows] = await pool.query(
    `
    SELECT c.id, c.fecha, c.tipo, c.observaciones, c.${flag} AS sent
    FROM citas c
    WHERE c.${flag} = 0
      AND c.fecha BETWEEN (NOW() + INTERVAL ? HOUR) AND (NOW() + INTERVAL ? HOUR + INTERVAL ? MINUTE)
    ORDER BY c.fecha ASC
    `,
    [hoursAhead, hoursAhead, minutesTolerance]
  );
  return rows;
}

export async function getPetsByCita(citaId) {
  const [rows] = await pool.query(
    `
    SELECT p.id, p.name_pet
    FROM citas_mascotas cm
    JOIN pets p ON p.id = cm.pet_id
    WHERE cm.cita_id = ?
    ORDER BY p.name_pet
    `,
    [citaId]
  );
  return rows;
}

export async function getOwnerPhonesByPetIds(petIds = []) {
  if (!petIds.length) return [];
  const placeholders = petIds.map(() => '?').join(',');
  const [rows] = await pool.query(
    `
    SELECT DISTINCT u.fono AS fono
    FROM pets p
    JOIN users u ON u.id = p.user_id
    WHERE p.id IN (${placeholders})
      AND u.fono IS NOT NULL AND u.fono <> ''
    `,
    petIds
  );
  return rows.map(r => r.fono);
}

export async function markReminderSent(citaId, which = '24') {
  const col = which === '24' ? 'reminder_24_sent' : 'reminder_2_sent';
  await pool.query(`UPDATE citas SET ${col} = 1 WHERE id = ?`, [citaId]);
}

export async function getCitaById(id) {
  const [rows] = await pool.query(
    'SELECT id, fecha, tipo, observaciones, urgencia FROM citas WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}
