import { pool } from '../utils/db.js';

export const TIPOS_VALIDOS = ['accesorios', 'alimentos', 'medicamentos'];
export const esTipoValido = (t) => TIPOS_VALIDOS.includes(String(t).toLowerCase());

export async function listByTipo(tipo) {
    if (!esTipoValido(tipo)) throw new Error('Tipo no válido');
    const [rows] = await pool.query(
        'SELECT * FROM galeria_items WHERE tipo=? ORDER BY created_at DESC',
        [tipo]
    );
    return rows;
}

export async function findById(tipo, id) {
    if (!esTipoValido(tipo)) throw new Error('Tipo no válido');
    const [[row]] = await pool.query(
        'SELECT * FROM galeria_items WHERE id=? AND tipo=?',
        [id, tipo]
    );
    return row || null;
}

export async function create(tipo, { nombre, descripcion, precio, imagen_url }) {
    if (!esTipoValido(tipo)) throw new Error('Tipo no válido');
    const [res] = await pool.query(
        'INSERT INTO galeria_items (tipo, nombre, descripcion, precio, imagen_url) VALUES (?,?,?,?,?)',
        [tipo, nombre, descripcion || null, precio || null, imagen_url || null]
    );
    return res.insertId;
}

export async function update(tipo, id, { nombre, descripcion, precio, imagen_url }) {
    if (!esTipoValido(tipo)) throw new Error('Tipo no válido');
    await pool.query(
        'UPDATE galeria_items SET nombre=?, descripcion=?, precio=?, imagen_url=? WHERE id=? AND tipo=?',
        [nombre, descripcion || null, precio || null, imagen_url || null, id, tipo]
    );
}

export async function remove(tipo, id) {
    if (!esTipoValido(tipo)) throw new Error('Tipo no válido');
    await pool.query('DELETE FROM galeria_items WHERE id=? AND tipo=?', [id, tipo]);
}
