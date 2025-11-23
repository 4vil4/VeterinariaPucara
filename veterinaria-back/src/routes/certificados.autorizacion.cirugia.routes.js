import { Router } from 'express';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import pool from '../db.js';
import fs from 'fs';
import path from 'path';

const LOGO_PATH = path.join(process.cwd(), 'assets', 'logoCert.PNG');

function loadLogoBytes() {
    return fs.readFileSync(LOGO_PATH);
}

dayjs.locale('es');
const router = Router();

/* ===== Helpers ===== */

async function getById(id) {
    const [rows] = await pool.query(
        'SELECT * FROM certificados_autorizacion_cirugia WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

async function snapshotFromIds({ mascota_id, propietario_id, veterinario_id }) {
    const [[M]] = await pool.query('SELECT * FROM mascota WHERE id = ?', [mascota_id]);
    const [[P]] = await pool.query('SELECT * FROM propietario WHERE id = ?', [propietario_id]);
    const [[V]] = await pool.query('SELECT * FROM veterinario WHERE id = ?', [veterinario_id]);

    if (!M || !P || !V) {
        throw new Error('Mascota, propietario o veterinario no encontrado');
    }

    return { M, P, V };
}

/* ===== LISTAR ===== */
router.get('/', async (req, res) => {
    try {
        const { search } = req.query;
        const args = [];
        let where = 'WHERE 1=1 ';

        if (search) {
            const q = `%${search}%`;
            where += `
        AND (mas_nombre LIKE ? OR prop_nombre LIKE ? OR vet_nombre LIKE ?)`;
            args.push(q, q, q);
        }

        const [rows] = await pool.query(
            `
      SELECT id, fecha_cert, mas_nombre, prop_nombre, vet_nombre
      FROM certificados_autorizacion_cirugia
      ${where}
      ORDER BY id DESC
      `,
            args
        );

        res.json(rows);
    } catch (err) {
        console.error('LIST autorizacion cirugia', err);
        res.status(500).json({ error: 'Error al listar certificados' });
    }
});

/* ===== OBTENER UNO ===== */
router.get('/:id', async (req, res) => {
    try {
        const row = await getById(req.params.id);
        if (!row) return res.status(404).json({ error: 'No encontrado' });
        res.json(row);
    } catch (err) {
        console.error('GET autorizacion cirugia', err);
        res.status(500).json({ error: 'Error al obtener certificado' });
    }
});

/* ===== CREAR ===== */
router.post('/', async (req, res) => {
    try {
        const {
            mascota_id,
            propietario_id,
            veterinario_id,
            color,
            fecha_autorizacion,
            procedimientos,
            examenes_pre,
            aranceles,
            fecha_cert,
        } = req.body || {};

        if (!mascota_id || !propietario_id || !veterinario_id || !fecha_autorizacion) {
            return res.status(400).json({
                error:
                    'Faltan campos obligatorios (mascota_id, propietario_id, veterinario_id, fecha_autorizacion)',
            });
        }

        const { M, P, V } = await snapshotFromIds({
            mascota_id,
            propietario_id,
            veterinario_id,
        });

        const fCert = fecha_cert || dayjs().format('YYYY-MM-DD');

        const [r] = await pool.query(
            `
      INSERT INTO certificados_autorizacion_cirugia (
        mascota_id, propietario_id, veterinario_id,
        prop_nombre, prop_rut, prop_movil, prop_direccion, prop_correo,
        mas_nombre, mas_especie, mas_raza, mas_fecha_nacimiento, mas_peso_kg, mas_sexo,
        color, fecha_autorizacion, procedimientos, examenes_pre, aranceles,
        fecha_cert,
        vet_nombre, vet_rut
      )
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
      `,
            [
                M.id,
                P.id,
                V.id,
                P.nombre,
                P.rut,
                P.movil,
                P.direccion,
                P.correo || null,
                M.nombre,
                M.especie,
                M.raza,
                M.fecha_nacimiento,
                M.peso_kg,
                M.sexo,
                color || null,
                fecha_autorizacion,
                procedimientos || null,
                examenes_pre === 'SI' ? 'SI' : 'NO',
                aranceles || null,
                fCert,
                V.nombre,
                V.rut,
            ]
        );

        const created = await getById(r.insertId);
        res.status(201).json(created);
    } catch (err) {
        console.error('POST autorizacion cirugia', err);
        res.status(500).json({ error: 'Error al crear certificado' });
    }
});

/* ===== EDITAR ===== */
router.put('/:id', async (req, res) => {
    try {
        const current = await getById(req.params.id);
        if (!current) return res.status(404).json({ error: 'No encontrado' });

        const {
            mascota_id,
            propietario_id,
            veterinario_id,
            color,
            fecha_autorizacion,
            procedimientos,
            examenes_pre,
            aranceles,
            fecha_cert,
        } = req.body || {};

        let M = null,
            P = null,
            V = null;

        if (mascota_id || propietario_id || veterinario_id) {
            const snap = await snapshotFromIds({
                mascota_id: mascota_id || current.mascota_id,
                propietario_id: propietario_id || current.propietario_id,
                veterinario_id: veterinario_id || current.veterinario_id,
            });
            M = snap.M;
            P = snap.P;
            V = snap.V;
        }

        const data = {
            mascota_id: M ? M.id : current.mascota_id,
            propietario_id: P ? P.id : current.propietario_id,
            veterinario_id: V ? V.id : current.veterinario_id,

            prop_nombre: P ? P.nombre : current.prop_nombre,
            prop_rut: P ? P.rut : current.prop_rut,
            prop_movil: P ? P.movil : current.prop_movil,
            prop_direccion: P ? P.direccion : current.prop_direccion,
            prop_correo: P ? P.correo : current.prop_correo,

            mas_nombre: M ? M.nombre : current.mas_nombre,
            mas_especie: M ? M.especie : current.mas_especie,
            mas_raza: M ? M.raza : current.mas_raza,
            mas_fecha_nacimiento: M
                ? M.fecha_nacimiento
                : current.mas_fecha_nacimiento,
            mas_peso_kg: M ? M.peso_kg : current.mas_peso_kg,
            mas_sexo: M ? M.sexo : current.mas_sexo,

            color: color ?? current.color,
            fecha_autorizacion: fecha_autorizacion || current.fecha_autorizacion,
            procedimientos: procedimientos ?? current.procedimientos,
            examenes_pre:
                examenes_pre === 'SI' || examenes_pre === 'NO'
                    ? examenes_pre
                    : current.examenes_pre,
            aranceles: aranceles ?? current.aranceles,
            fecha_cert: fecha_cert || current.fecha_cert,

            vet_nombre: V ? V.nombre : current.vet_nombre,
            vet_rut: V ? V.rut : current.vet_rut,
        };

        await pool.query(
            'UPDATE certificados_autorizacion_cirugia SET ? WHERE id = ?',
            [data, req.params.id]
        );

        const updated = await getById(req.params.id);
        res.json(updated);
    } catch (err) {
        console.error('PUT autorizacion cirugia', err);
        res.status(500).json({ error: 'Error al actualizar certificado' });
    }
});

/* ===== ELIMINAR ===== */
router.delete('/:id', async (req, res) => {
    try {
        const [r] = await pool.query(
            'DELETE FROM certificados_autorizacion_cirugia WHERE id = ?',
            [req.params.id]
        );
        if (!r.affectedRows)
            return res.status(404).json({ error: 'No encontrado' });
        res.json({ ok: true });
    } catch (err) {
        console.error('DEL autorizacion cirugia', err);
        res.status(500).json({ error: 'Error al eliminar certificado' });
    }
});

/* ===== PDF ===== */
router.get('/:id/pdf', async (req, res) => {
    try {
        const c = await getById(req.params.id);
        if (!c) return res.status(404).send('No encontrado');

        const bytes = await buildPDFAutorizacion(c);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
            'Content-Disposition',
            `inline; filename="Autorizacion-Cirugia-Anestesia-${c.id}.pdf"`
        );
        res.send(Buffer.from(bytes));
    } catch (err) {
        console.error('PDF autorizacion cirugia', err);
        res.status(500).send('Error al generar PDF');
    }
});

/* ===== Generador PDF ===== */

function calcEdad(fechaNac, ref) {
    if (!fechaNac) return '';
    const dN = dayjs(fechaNac);
    const dR = dayjs(ref || new Date());
    if (!dN.isValid()) return '';
    const y = dR.diff(dN, 'year');
    const m = dR.diff(dN.add(y, 'year'), 'month');
    const ys = y > 0 ? `${y} año${y > 1 ? 's' : ''}` : '';
    const ms = m > 0 ? `${m} mes${m > 1 ? 'es' : ''}` : '';
    return [ys, ms].filter(Boolean).join(' ');
}

async function buildPDFAutorizacion(c) {
    const A4_W = 595.28;
    const A4_H = 841.89;
    const LEFT = 60;
    const RIGHT = 60;
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
    const LINE = 4;
    const MAX_W = A4_W - LEFT - RIGHT;

    // ---------- helpers base ----------
    const draw = (text, { x = LEFT, size = 11, f = font, center = false } = {}) => {
        const t = String(text || '');
        if (!t) {
            y -= size + LINE;
            return;
        }
        if (center) {
            const w = f.widthOfTextAtSize(t, size);
            const xx = (A4_W - w) / 2;
            page.drawText(t, { x: xx, y, size, font: f, color: BLACK });
            y -= size + LINE;
            return;
        }
        page.drawText(t, { x, y, size, font: f, color: BLACK });
        y -= size + LINE;
    };

    const drawWrapped = (text, { size = 11, f = font } = {}) => {
        const t = String(text || '');
        if (!t.trim()) {
            y -= size + LINE;
            return;
        }
        const words = t.split(/\s+/);
        let line = '';

        for (const word of words) {
            const test = line ? line + ' ' + word : word;
            const w = f.widthOfTextAtSize(test, size);
            if (w > MAX_W && line) {
                page.drawText(line, {
                    x: LEFT,
                    y,
                    size,
                    font: f,
                    color: BLACK,
                });
                y -= size + LINE;
                line = word;
            } else {
                line = test;
            }
        }
        if (line) {
            page.drawText(line, {
                x: LEFT,
                y,
                size,
                font: f,
                color: BLACK,
            });
            y -= size + LINE;
        }
    };

    const drawNumberedWrapped = (
        num,
        text,
        { size = 11, fText = font, fNum = bold } = {}
    ) => {
        const body = String(text || '');
        const prefix = `${num}. `;
        const words = body.split(/\s+/);

        const prefixWidth = fNum.widthOfTextAtSize(prefix, size);

        page.drawText(prefix, {
            x: LEFT,
            y,
            size,
            font: fNum,
            color: BLACK,
        });

        let currentX = LEFT + prefixWidth;
        let line = '';

        for (const word of words) {
            const candidate = line ? line + ' ' + word : word;
            const w = fText.widthOfTextAtSize(candidate, size);

            if (currentX + w > LEFT + MAX_W && line) {
                page.drawText(line, {
                    x: currentX,
                    y,
                    size,
                    font: fText,
                    color: BLACK,
                });
                y -= size + LINE;
                currentX = LEFT;
                line = word;
            } else {
                line = candidate;
            }
        }

        if (line) {
            page.drawText(line, {
                x: currentX,
                y,
                size,
                font: fText,
                color: BLACK,
            });
            y -= size + LINE;
        }
    };

    const calcEdad = (fechaNac, ref) => {
        if (!fechaNac) return '';
        const dN = dayjs(fechaNac);
        const dR = dayjs(ref || new Date());
        if (!dN.isValid()) return '';
        const yDiff = dR.diff(dN, 'year');
        const mDiff = dR.diff(dN.add(yDiff, 'year'), 'month');
        const ys = yDiff > 0 ? `${yDiff} año${yDiff > 1 ? 's' : ''}` : '';
        const ms = mDiff > 0 ? `${mDiff} mes${mDiff > 1 ? 'es' : ''}` : '';
        return [ys, ms].filter(Boolean).join(' ');
    };

    // ---------- Encabezado ----------
    draw('VETERINARIA "PUCARÁ"', { f: bold, size: 10 });
    draw('ESMERALDA #97', { size: 9 });
    draw('FONO: 22 859 5840', { size: 9 });
    draw('SAN BERNARDO   SANTIAGO / CHILE', { size: 9 });
    y -= 20;

    draw(
        'Autorización de Hospital, Sedación, Anestesia y/o Procedimiento,',
        { f: bold, size: 14, center: true }
    );
    draw('Cirugía', { f: bold, size: 14, center: true });
    y -= 10;

    const edad = calcEdad(c.mas_fecha_nacimiento, c.fecha_autorizacion);

    // ---------- Datos Paciente / Propietario ----------
    draw(`Paciente: ${c.mas_nombre || ''}`);
    draw(`Especie: ${c.mas_especie || ''}`);
    draw(`Color: ${c.color || ''}`);
    draw(`Edad: ${edad || ''}`);
    draw(
        `Fecha: ${c.fecha_autorizacion
            ? dayjs(c.fecha_autorizacion).format('DD-MM-YYYY')
            : ''
        }`
    );
    draw(`Raza: ${c.mas_raza || ''}`);
    draw(`Sexo: ${c.mas_sexo || ''}`);
    draw(
        `Peso: ${c.mas_peso_kg != null ? c.mas_peso_kg + ' kg' : ''
        }`
    );
    draw(`Propietario: ${c.prop_nombre || ''}`);
    draw(`C.I.: ${c.prop_rut || ''}`);
    draw(`Dirección: ${c.prop_direccion || ''}`);
    draw(`Teléfono: ${c.prop_movil || ''}`);
    draw(`Correo Electrónico: ${c.prop_correo || ''}`);
    y -= 8;

    // ---------- 1. Procedimientos ----------
    drawNumberedWrapped(
        1,
        'Por el presente documento, autorizo realizar los siguientes procedimientos y/o intervenciones quirúrgicas:',
        { size: 11 }
    );

    const procText =
        c.procedimientos && c.procedimientos.trim().length
            ? c.procedimientos
            : '____________________________';

    drawWrapped(procText, { f: bold });

    drawWrapped(
        'al paciente arriba individualizado de mi propiedad y del cual soy responsable ante la Clínica Veterinaria.'
    );

    // ---------- 2. Exámenes prequirúrgicos ----------
    const exTxt = c.examenes_pre === 'SI' ? 'SI' : 'NO';
    drawNumberedWrapped(
        2,
        `EXÁMENES PREQUIRÚRGICOS: ${exTxt}.`
    );

    // ---------- 3 ----------
    drawNumberedWrapped(
        3,
        'Declaro que el médico tratante me ha informado la naturaleza y fines de los procedimientos de hospitalización, exámenes de laboratorio, ecografías, sedación, anestesia general y/o cirugía, además me ha informado de los beneficios, complicaciones y riesgos que puedan producirse.'
    );

    // ---------- 4 ----------
    drawNumberedWrapped(
        4,
        'Si durante los procedimientos mencionados se presentan condiciones imprevistas, que necesiten alternativas diferentes a las previstas, autorizo la utilización de medicamentos y/o la realización de procedimientos adicionales que el médico veterinario considere necesarios.'
    );

    // ---------- 5 ----------
    drawNumberedWrapped(
        5,
        'Finalmente declaro conocer los aranceles de los procedimientos a realizar y asumo además los costos derivados de acciones adicionales por imprevistos, si los existiese.'
    );

    // ---------- 6. Aranceles ----------
    drawNumberedWrapped(
        6,
        `Aranceles $ ${c.aranceles || '__________'}`
    );

    // ---------- Firma ----------
    y = 140;
    draw('______________________________', {
        center: true,
        size: 10,
    });
    draw('Firma Propietario.', {
        center: true,
        size: 10,
    });

    return pdf.save();
}


export default router;
