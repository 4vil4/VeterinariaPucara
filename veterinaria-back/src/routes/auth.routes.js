import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import pool from '../db.js';

const router = Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 },
});

function createToken(id, role) {
    return jwt.sign(
        { sub: id, role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES || '7d' }
    );
}

router.post('/register', async (req, res) => {
    try {
        const { nombre, email, password } = req.body || {};
        if (!nombre || !email || !password)
            return res.status(400).json({ ok: false, msg: 'Faltan datos' });

        const [rows] = await pool.query('SELECT id FROM usuario WHERE email = ?', [
            email,
        ]);
        if (rows.length)
            return res.status(409).json({ ok: false, msg: 'Email ya registrado' });

        const hash = await bcrypt.hash(password, 10);
        const [r] = await pool.query(
            'INSERT INTO usuario (nombre, email, pass_hash, rol) VALUES (?, ?, ?, ?)',
            [nombre, email, hash, 'admin']
        );

        const user = { id: r.insertId, nombre, email, rol: 'admin' };
        const token = createToken(user.id, 'admin');
        res.status(201).json({ ok: true, token, user });
    } catch (e) {
        console.error('REGISTER admin error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {};

        const [[user]] = await pool.query(
            'SELECT id, nombre, email, password_hash, role FROM `user` WHERE email=?',
            [email]
        );
        if (!user)
            return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });

        const ok = await bcrypt.compare(password, user.password_hash || '');
        if (!ok)
            return res.status(401).json({ ok: false, msg: 'Credenciales inválidas' });

        const [[vet]] = await pool.query(
            'SELECT id FROM veterinario WHERE user_id = ? LIMIT 1',
            [user.id]
        );

        const token = createToken(user.id, user.role);

        res.json({
            ok: true,
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                role: user.role,
                veterinario_id: vet?.id || null,
            },
        });
    } catch (e) {
        console.error('LOGIN error:', e);
        res.status(500).json({ ok: false, msg: e.message });
    }
});

router.post(
    '/register-full',
    upload.single('pet_foto'),
    async (req, res) => {
        let conn; 

        try {
            conn = await pool.getConnection();

            const {
                owner_nombre,
                owner_rut,
                owner_email,
                owner_movil,
                owner_direccion,
                pet_especie,
                pet_nombre,
                pet_raza,
                pet_sexo,
                pet_fecha_nacimiento,
                password,
                password2,
            } = req.body || {};

            if (
                !owner_nombre ||
                !owner_rut ||
                !owner_email ||
                !owner_movil ||
                !owner_direccion ||
                !pet_especie ||
                !pet_nombre ||
                !pet_raza ||
                !pet_sexo ||
                !pet_fecha_nacimiento ||
                !password ||
                !password2
            ) {
                return res.status(400).json({
                    ok: false,
                    msg: 'Todos los campos son obligatorios (excepto la foto).',
                });
            }

            if (password !== password2) {
                return res
                    .status(400)
                    .json({ ok: false, msg: 'Las contraseñas no coinciden.' });
            }

            const [exists] = await conn.query(
                'SELECT id FROM `user` WHERE email = ?',
                [owner_email]
            );
            if (exists.length) {
                return res
                    .status(409)
                    .json({ ok: false, msg: 'Ya existe una cuenta con ese correo.' });
            }

            await conn.beginTransaction();

            const hash = await bcrypt.hash(password, 10);
            const [uRes] = await conn.query(
                `INSERT INTO user (nombre, email, password_hash, role, created_at, updated_at)
         VALUES (?,?,?,?,NOW(),NOW())`,
                [owner_nombre, owner_email, hash, 'user']
            );
            const userId = uRes.insertId;

            const [pRes] = await conn.query(
                `INSERT INTO propietario (nombre, rut, correo, movil, direccion, created_at, updated_at)
         VALUES (?,?,?,?,?,NOW(),NOW())`,
                [
                    owner_nombre,
                    owner_rut,
                    owner_email,
                    owner_movil,
                    owner_direccion,
                ]
            );
            const propietarioId = pRes.insertId;

            let foto = null;
            let foto_nombre = null;
            let foto_tamano = null;
            let foto_tipo = null;

            if (req.file) {
                foto = req.file.buffer;
                foto_nombre = req.file.originalname;
                foto_tamano = req.file.size;
                foto_tipo = req.file.mimetype;
            }

            await conn.query(
                `INSERT INTO mascota
          (nombre, especie, raza, sexo, fecha_nacimiento,
           propietario_id, foto, foto_nombre, foto_tamano, foto_tipo,
           created_at, updated_at)
         VALUES (?,?,?,?,?,?,?,?,?,?,NOW(),NOW())`,
                [
                    pet_nombre,
                    pet_especie,
                    pet_raza,
                    pet_sexo,
                    pet_fecha_nacimiento || null,
                    propietarioId,
                    foto,
                    foto_nombre,
                    foto_tamano,
                    foto_tipo,
                ]
            );

            await conn.commit();

            const user = {
                id: userId,
                nombre: owner_nombre,
                email: owner_email,
                role: 'user',
            };
            const token = createToken(userId, 'user');

            return res.status(201).json({ ok: true, token, user });
        } catch (e) {
            console.error('REGISTER-FULL error:', e);

            if (conn) {
                try {
                    await conn.rollback();
                } catch (rbErr) {
                    console.error('Error en rollback:', rbErr);
                }
            }

            if (e.code === 'ER_DUP_ENTRY') {
                return res
                    .status(409)
                    .json({ ok: false, msg: 'Correo ya registrado.' });
            }

            return res.status(500).json({
                ok: false,
                msg: e.message || 'Error al crear la cuenta.',
            });
        } finally {
            if (conn) {
                try {
                    conn.release();
                } catch (relErr) {
                    console.error('Error al liberar conexión:', relErr);
                }
            }
        }
    }
);

router.get('/me', async (req, res) => {
    try {
        const h = req.headers.authorization || '';
        const token = h.startsWith('Bearer ') ? h.slice(7) : null;
        if (!token)
            return res.status(401).json({ ok: false, msg: 'Token requerido' });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        res.json({ ok: true, user: payload });
    } catch (e) {
        console.error('ME error:', e);
        res.status(401).json({ ok: false, msg: 'Token inválido' });
    }
});

export default router;
