import { pool } from '../utils/db.js';

export async function getConsultasByPet(petId) {
    const [rows] = await pool.query('SELECT * FROM consultas WHERE pet_id=? ORDER BY fecha DESC', [petId]);
    return rows;
}
export async function createConsulta({ pet_id, fecha, motivo, diagnostico, tratamiento, vacunas }) {
    const [r] = await pool.query(
        'INSERT INTO consultas (pet_id, fecha, motivo, diagnostico, tratamiento, vacunas) VALUES (?,?,?,?,?,?)',
        [pet_id, fecha, motivo, diagnostico, tratamiento, vacunas]
    );
    return r.insertId;
}
