import { pool } from '../utils/db.js';

export async function getPetsByOwner(ownerId) {
    const [rows] = await pool.query('SELECT * FROM pets WHERE user_id=? ORDER BY created_at DESC', [ownerId]);
    return rows;
}
export async function getPet(id) {
    const [rows] = await pool.query('SELECT * FROM pets WHERE id=?', [id]);
    return rows[0];
}
export async function createPet({ user_id, name_pet, especie, raza, age }) {
    const [r] = await pool.query(
        'INSERT INTO pets (user_id, name_pet, especie, raza, age) VALUES (?,?,?,?,?)',
        [user_id, name_pet, especie, raza, age ?? null]
    );
    return r.insertId;
}
export async function updatePet(id, { name_pet, especie, raza, age }) {
    await pool.query('UPDATE pets SET name_pet=?, especie=?, raza=?, age=? WHERE id=?',
        [name_pet, especie, raza, age ?? null, id]);
}
export async function deletePet(id) { await pool.query('DELETE FROM pets WHERE id=?', [id]); }
