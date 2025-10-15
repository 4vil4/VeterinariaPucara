import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db.js';

const router = Router();

function signToken(user) {
    const payload = { id: user.id, nombre: user.nombre, email: user.email, rol: user.rol };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '7d' });
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body || {};
        if (!nombre || !email || !password) return res.status(400).json({ ok: false, msg: 'Faltan datos' });

        const [rows] = await pool.query('SELECT id FROM usuario WHERE email = ?', [email]);
        if (rows.length) return res.status(409).json({ ok: false, msg: 'Email ya registrado' });

        const hash = await bcrypt.hash(password, 10);
        const [r] = await pool.query(
            'INSERT INTO usuario (nombre, email, pass_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hash, 'admin'] 
        );

        const user = { id: r.insertId, nombre, email, rol: 'admin' };
        const token = signToken(user);
        res.status(201).json({ ok: true, token, user });
    } catch (e) {
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};
        const [[user]] = await pool.query(
            'SELECT id, nombre, email, password_hash, role FROM `user` WHERE email=?',
            [email]
        );
        if (!user) return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });

        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });

        const [[vet]] = await pool.query(
            'SELECT id FROM veterinario WHERE user_id = ? LIMIT 1',
            [user.id]
        );

        const token = jwt.sign(
            { sub: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES || '7d' }
        );

        res.json({
            ok: true,
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                role: user.role,
                veterinario_id: vet?.id || null
            }
        });
    } catch (e) {
        res.status(500).json({ ok: false, msg: e.message });
    }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        const h = req.headers.authorization || '';
        const token = h.startsWith('Bearer ') ? h.slice(7) : null;
        if (!token) return res.status(401).json({ ok: false, msg: 'Token requerido' });
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ ok: true, user: payload });
    } catch (e) {
        res.status(401).json({ ok: false, msg: 'Token inválido' });
    }
});

export default router;
