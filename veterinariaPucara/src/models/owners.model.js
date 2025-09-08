import { pool } from '../utils/db.js';

export async function getOwners() {
    const [rows] = await pool.query('SELECT * FROM users ORDER BY created_at DESC');
    return rows;
}
export async function getOwner(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id=?', [id]);
    return rows[0];
}
export async function createOwner({ name, email, fono }) {
    const [r] = await pool.query('INSERT INTO users (name,email,fono) VALUES (?,?,?)', [name, email, fono]);
    return r.insertId;
}
export async function updateOwner(id, { name, email, fono }) {
    await pool.query('UPDATE users SET name=?, email=?, fono=? WHERE id=?', [name, email, fono, id]);
}
export async function deleteOwner(id) {
    await pool.query('DELETE FROM users WHERE id=?', [id]);
}
