import { pool } from '../utils/db.js';

export async function getPetsByOwner(ownerId) {
    const [rows] = await pool.query('SELECT * FROM pets WHERE user_id=? ORDER BY created_at DESC', [ownerId]);
    return rows;
}

export async function getPet(id) {
    const [rows] = await pool.query('SELECT * FROM pets WHERE id=?', [id]);
    return rows[0];
}

export async function createPet(payload) {
    const {
        user_id, name_pet, especie, raza, age,
        historia = null, sexo = null, esterilizado = null,
        fecha_nac = null, foto_url = null, estado = 'Activo', tags = null
    } = payload;

    const [r] = await pool.query(
        `INSERT INTO pets (user_id, name_pet, especie, raza, age, historia, sexo, esterilizado, fecha_nac, foto_url, estado, tags)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [user_id, name_pet, especie, raza, age ?? null, historia, sexo, esterilizado, fecha_nac, foto_url, estado, tags]
    );
    return r.insertId;
}

export async function updatePet(petId, data) {
    const fields = [
        'name_pet = ?', 'especie = ?', 'raza = ?', 'age = ?',
        'historia = ?', 'sexo = ?', 'esterilizado = ?',
        'fecha_nac = ?', 'estado = ?', 'tags = ?', 'foto_url = ?',
        'observaciones = ?'       
    ];
    const values = [
        data.name_pet, data.especie, data.raza, data.age ?? null,
        data.historia, data.sexo, (data.esterilizado ?? null),
        data.fecha_nac, data.estado, data.tags, data.foto_url,
        data.observaciones || null      
    ];

    if (data.foto && Buffer.isBuffer(data.foto) && data.foto.length) {
        fields.push('foto = ?');
        values.push(data.foto);
    }

    values.push(petId);
    const sql = `UPDATE pets SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(sql, values);
}

export async function deletePet(id) { await pool.query('DELETE FROM pets WHERE id=?', [id]); }

export async function getPetWithOwner(petId) {
    const [rows] = await pool.query(`
    SELECT p.*, u.id AS owner_id, u.name AS owner_name, u.fono AS owner_fono
    FROM pets p
    JOIN users u ON u.id = p.user_id
    WHERE p.id = ?
    LIMIT 1
  `, [petId]);
    return rows[0] || null;
}