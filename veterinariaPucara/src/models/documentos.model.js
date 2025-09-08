import { pool } from '../utils/db.js';

// Documentos por mascota
export async function getDocsByPet(petId) {
    const [rows] = await pool.query(
        'SELECT * FROM documentos WHERE pet_id = ? ORDER BY created_at DESC',
        [petId]
    );
    return rows.map(r => ({
        ...r,
        datos: typeof r.datos === 'string' ? JSON.parse(r.datos) : r.datos,
    }));
}

// Crear documento
export async function createDocumento({ pet_id, tipo, datos, archivo_path = null, creado_por = 'sistema' }) {
    const [result] = await pool.query(
        'INSERT INTO documentos (pet_id, tipo, datos, archivo_path, creado_por) VALUES (?, ?, ?, ?, ?)',
        [pet_id, tipo, JSON.stringify(datos || {}), archivo_path, creado_por]
    );
    return result.insertId;
}

// Obtener documento por id
export async function getDocById(id) {
    const [rows] = await pool.query('SELECT * FROM documentos WHERE id = ?', [id]);
    if (!rows[0]) return null;
    const r = rows[0];
    return { ...r, datos: typeof r.datos === 'string' ? JSON.parse(r.datos) : r.datos };
}

// Mascota
export async function getPetById(petId) {
    const [rows] = await pool.query('SELECT * FROM pets WHERE id = ?', [petId]);
    return rows[0] || null;
}

// Dueño de la mascota
export async function getOwnerByPetId(petId) {
    const [rows] = await pool.query(`
    SELECT u.* FROM users u
    JOIN pets p ON p.user_id = u.id
    WHERE p.id = ?
    LIMIT 1
  `, [petId]);
    return rows[0] || null;
}

// Documentos por propietario
export async function getDocsByOwner(ownerId) {
    const [rows] = await pool.query(`
    SELECT d.*, p.name_pet, p.id AS pet_id, u.id AS owner_id, u.name AS owner_name, u.fono AS owner_phone
    FROM documentos d
    JOIN pets p ON p.id = d.pet_id
    JOIN users u ON u.id = p.user_id
    WHERE u.id = ?
    ORDER BY d.created_at DESC
  `, [ownerId]);
    return rows.map(r => ({
        ...r,
        datos: typeof r.datos === 'string' ? JSON.parse(r.datos) : r.datos,
    }));
}

export async function getOwnerById(ownerId) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id=? LIMIT 1', [ownerId]);
    return rows[0] || null;
}

export async function createPresupuesto({ pet_id, datos, creado_por = 'sistema' }) {
    const [result] = await pool.query(
        'INSERT INTO documentos (pet_id, tipo, datos, creado_por) VALUES (?, "presupuesto", ?, ?)',
        [pet_id, JSON.stringify(datos || {}), creado_por]
    );
    return result.insertId;
}