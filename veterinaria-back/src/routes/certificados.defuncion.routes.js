import { Router } from 'express';
import path from 'path';
import fs from 'fs';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import pool from '../db.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

const LOGO_PATH = path.join(process.cwd(), 'assets', 'logoCert.PNG');

function loadLogoBytes() {
    return fs.readFileSync(LOGO_PATH);
}

dayjs.locale('es');
const router = Router();

/* ========= helpers DB ========= */
async function getRowById(id) {
    const [rows] = await pool.query(
        'SELECT * FROM certificados_defuncion WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

async function snapshotFromIds({ mascota_id, propietario_id, veterinario_id }) {
    const [[mas], [prop], [vet]] = await Promise.all([
        pool.query(
            'SELECT id, nombre, especie, fecha_nacimiento, raza, peso_kg, sexo, propietario_id FROM mascota WHERE id = ?',
            [mascota_id]
        ),
        pool.query(
            'SELECT id, nombre, rut, movil, direccion FROM propietario WHERE id = ?',
            [propietario_id]
        ),
        pool.query(
            'SELECT id, nombre, rut FROM veterinario WHERE id = ?',
            [veterinario_id]
        ),
    ]);

    const mascota = mas[0];
    const propietario = prop[0];
    const veterinario = vet[0];

    if (!mascota || !propietario || !veterinario) {
        throw new Error('Mascota, propietario o veterinario no encontrado');
    }

    return {
        mascota,
        propietario,
        veterinario,
    };
}

/* ========= LISTAR =========*/
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const args = [];
        let where = 'WHERE 1=1 ';

        if (search) {
            where +=
                'AND (mas_nombre LIKE ? OR prop_nombre LIKE ? OR vet_nombre LIKE ?)';
            const q = `%${search}%`;
            args.push(q, q, q);
        }

        const [rows] = await pool.query(
            `
      SELECT
        id,
        fecha_cert,
        mas_nombre,
        prop_nombre,
        vet_nombre
      FROM certificados_defuncion
      ${where}
      ORDER BY id DESC
    `,
            args
        );

        res.json(rows);
    } catch (err) {
        console.error('LIST defuncion', err);
        res.status(500).json({ error: 'Error al listar certificados' });
    }
});

/* ========= OBTENER UNO ========= */
router.get('/:id', async (req, res) => {
    try {
        const row = await getRowById(req.params.id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch (err) {
        console.error('GET defuncion', err);
        res.status(500).json({ error: 'Error al obtener certificado' });
    }
});

/* ========= CREAR =========*/
router.post('/', async (req, res) => {
    const {
        mascota_id,
        propietario_id,
        veterinario_id,
        fecha_defuncion,
        lugar_defuncion,
        motivo_defuncion,
        color,
        fecha_cert,
    } = req.body || {};

    try {
        if (!mascota_id || !propietario_id || !veterinario_id || !fecha_defuncion) {
            return res
                .status(400)
                .json({ error: 'Faltan campos obligatorios (mascota, propietario, vet, fecha defunción)' });
        }

        const { mascota, propietario, veterinario } = await snapshotFromIds({
            mascota_id,
            propietario_id,
            veterinario_id,
        });

        const fCert = fecha_cert || dayjs().format('YYYY-MM-DD');

        const [r] = await pool.query(
            `
      INSERT INTO certificados_defuncion (
        mascota_id, propietario_id, veterinario_id,
        prop_nombre, prop_rut, prop_movil, prop_direccion,
        mas_nombre, mas_especie, mas_fecha_nacimiento, mas_raza, mas_peso_kg, mas_sexo,
        color, fecha_defuncion, lugar_defuncion, motivo_defuncion,
        fecha_cert,
        vet_nombre, vet_rut
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
    `,
            [
                mascota.id,
                propietario.id,
                veterinario.id,
                propietario.nombre,
                propietario.rut,
                propietario.movil,
                propietario.direccion,
                mascota.nombre,
                mascota.especie,
                mascota.fecha_nacimiento,
                mascota.raza,
                mascota.peso_kg,
                mascota.sexo,
                color || null,
                fecha_defuncion,
                lugar_defuncion || null,
                motivo_defuncion || null,
                fCert,
                veterinario.nombre,
                veterinario.rut,
            ]
        );

        const created = await getRowById(r.insertId);
        res.json(created);
    } catch (err) {
        console.error('POST defuncion', err);
        res.status(500).json({ error: 'Error al crear certificado' });
    }
});

/* ========= EDITAR ========= */
router.put('/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const exists = await getRowById(id);
        if (!exists) return res.status(404).json({ error: 'No encontrado' });

        const {
            mascota_id,
            propietario_id,
            veterinario_id,
            fecha_defuncion,
            lugar_defuncion,
            motivo_defuncion,
            color,
            fecha_cert,
        } = req.body || {};

        let snap = {
            mascota: {
                nombre: exists.mas_nombre,
                especie: exists.mas_especie,
                fecha_nacimiento: exists.mas_fecha_nacimiento,
                raza: exists.mas_raza,
                peso_kg: exists.mas_peso_kg,
                sexo: exists.mas_sexo,
            },
            propietario: {
                nombre: exists.prop_nombre,
                rut: exists.prop_rut,
                movil: exists.prop_movil,
                direccion: exists.prop_direccion,
            },
            veterinario: {
                nombre: exists.vet_nombre,
                rut: exists.vet_rut,
            },
        };

        let mId = exists.mascota_id;
        let pId = exists.propietario_id;
        let vId = exists.veterinario_id;

        if (mascota_id || propietario_id || veterinario_id) {
            const { mascota, propietario, veterinario } = await snapshotFromIds({
                mascota_id: mascota_id || mId,
                propietario_id: propietario_id || pId,
                veterinario_id: veterinario_id || vId,
            });
            mId = mascota.id;
            pId = propietario.id;
            vId = veterinario.id;
            snap = { mascota, propietario, veterinario };
        }

        const fCert = fecha_cert || exists.fecha_cert;

        await pool.query(
            `
      UPDATE certificados_defuncion SET
        mascota_id = ?, propietario_id = ?, veterinario_id = ?,
        prop_nombre = ?, prop_rut = ?, prop_movil = ?, prop_direccion = ?,
        mas_nombre = ?, mas_especie = ?, mas_fecha_nacimiento = ?, mas_raza = ?, mas_peso_kg = ?, mas_sexo = ?,
        color = ?, fecha_defuncion = ?, lugar_defuncion = ?, motivo_defuncion = ?,
        fecha_cert = ?,
        vet_nombre = ?, vet_rut = ?
      WHERE id = ?
    `,
            [
                mId,
                pId,
                vId,
                snap.propietario.nombre,
                snap.propietario.rut,
                snap.propietario.movil,
                snap.propietario.direccion,
                snap.mascota.nombre,
                snap.mascota.especie,
                snap.mascota.fecha_nacimiento,
                snap.mascota.raza,
                snap.mascota.peso_kg,
                snap.mascota.sexo,
                color ?? exists.color,
                fecha_defuncion || exists.fecha_defuncion,
                lugar_defuncion ?? exists.lugar_defuncion,
                motivo_defuncion ?? exists.motivo_defuncion,
                fCert,
                snap.veterinario.nombre,
                snap.veterinario.rut,
                id,
            ]
        );

        const updated = await getRowById(id);
        res.json(updated);
    } catch (err) {
        console.error('PUT defuncion', err);
        res.status(500).json({ error: 'Error al actualizar certificado' });
    }
});

/* ========= ELIMINAR ========= */
router.delete('/:id', async (req, res) => {
    try {
        const [r] = await pool.query(
            'DELETE FROM certificados_defuncion WHERE id = ?',
            [req.params.id]
        );
        if (r.affectedRows === 0)
            return res.status(404).json({ error: 'No encontrado' });
        res.json({ ok: true });
    } catch (err) {
        console.error('DEL defuncion', err);
        res.status(500).json({ error: 'Error al eliminar certificado' });
    }
});

/* ========= PDF =========*/
router.get('/:id/pdf', async (req, res) => {
    try {
        const row = await getRowById(req.params.id);
        if (!row) return res.status(404).send('No encontrado');

        const pdfBytes = await buildPDFDefuncion(row);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="certificado-defuncion-${row.id}.pdf"`
        );
        res.send(Buffer.from(pdfBytes));
    } catch (err) {
        console.error('PDF defuncion', err);
        res.status(500).send('Error al generar PDF');
    }
});

/* ========= Generador PDF ========= */
async function buildPDFDefuncion(c) {
    const A4_W = 595.28;
    const A4_H = 841.89;
    const LEFT = 60;
    const BLACK = rgb(0, 0, 0);

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([A4_W, A4_H]);

    const font = await pdf.embedFont(StandardFonts.TimesRoman);
    const bold = await pdf.embedFont(StandardFonts.TimesRomanBold);

    const logoBytes = loadLogoBytes();
    const logoImage = await pdf.embedPng(logoBytes);

    const { width: pageW, height: pageH } = page.getSize();
    const logoWidth = 80;
    const logoScale = logoWidth / logoImage.width;
    const logoHeight = logoImage.height * logoScale;

    page.drawImage(logoImage, {
        x: pageW - logoWidth - 20,
        y: pageH - logoHeight - 20,
        width: logoWidth,
        height: logoHeight,
    });

    let y = A4_H - 80;

    const draw = (text, { x = LEFT, size = 11, f = font, center = false } = {}) => {
        const t = String(text || '');
        const w = f.widthOfTextAtSize(t, size);
        const xx = center ? (A4_W - w) / 2 : x;
        page.drawText(t, { x: xx, y, size, font: f, color: BLACK });
        y -= size + 4;
    };

    // Encabezado
    draw('VETERINARIA "PUCARÁ"', { f: bold, size: 10 });
    draw('ESMERALDA #97', { size: 9 });
    draw('FONO: 22 859 5840', { size: 9 });
    draw('SAN BERNARDO   SANTIAGO / CHILE', { size: 9 });
    y -= 20;

    // Título
    draw('Certificado de Defunción', { f: bold, size: 16, center: true });
    y -= 12;

    const fechaNac = c.mas_fecha_nacimiento
        ? dayjs(c.mas_fecha_nacimiento).format('DD-MM-YYYY')
        : '';
    const fechaDef = c.fecha_defuncion
        ? dayjs(c.fecha_defuncion).format('DD-MM-YYYY')
        : '';

    // Propietario
    draw(`Nombre del Dueño(a): ${c.prop_nombre || ''}`);
    draw(`Rut / Pasaporte: ${c.prop_rut || ''}`);
    draw(`Teléfono: ${c.prop_movil || ''}`);
    draw(`Dirección: ${c.prop_direccion || ''}`);
    y -= 4;

    // Mascota
    draw(`Nombre Mascota: ${c.mas_nombre || ''}`);
    draw(`Especie: ${c.mas_especie || ''}`);
    draw(`Fecha de Nacimiento: ${fechaNac}`);
    draw(`Raza: ${c.mas_raza || ''}`);
    draw(`Peso: ${c.mas_peso_kg != null ? c.mas_peso_kg + ' kg' : ''}`);
    draw(`Color: ${c.color || ''}`);
    draw(`Sexo: ${c.mas_sexo || ''}`);
    y -= 4;

    // Defunción
    draw(`Fecha de Defunción: ${fechaDef}`);
    draw(`Lugar de Defunción: ${c.lugar_defuncion || ''}`);
    draw(`Motivo de Defunción: ${c.motivo_defuncion || ''}`);

    // Firma
    y = 180;
    draw('______________________________', { center: true, size: 10 });
    draw(c.vet_nombre || '', { center: true, size: 11, f: bold });
    draw('MÉDICO VETERINARIO', { center: true, size: 10 });
    draw(`RUT: ${c.vet_rut || ''}`, { center: true, size: 10 });

    // Nota
    y = 90;
    draw(
        'SE EXTIENDE EL PRESENTE CERTIFICADO PARA SER PRESENTADO A LOS ORGANISMOS PERTINENTES A PETICIÓN DEL PROPIETARIO.',
        { center: true, size: 8 }
    );

    return pdf.save();
}

export default router;
