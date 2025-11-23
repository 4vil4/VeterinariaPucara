import { Router } from 'express';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import pool from '../db.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

dayjs.locale('es');
const router = Router();

/* ========= LISTAR ========= */
router.get('/', async (req, res) => {
    const { search = '' } = req.query;
    const q = `%${search}%`;
    const [rows] = await pool.query(
        `SELECT id, mas_nombre, prop_nombre, vet_nombre, fecha_ingreso, fecha_egreso
     FROM certificado_epicrisis
     WHERE mas_nombre LIKE ? OR prop_nombre LIKE ? OR vet_nombre LIKE ?
     ORDER BY id DESC`,
        [q, q, q]
    );
    res.json(rows);
});

/* ========= OBTENER ========= */
router.get('/:id', async (req, res) => {
    const [[row]] = await pool.query('SELECT * FROM certificado_epicrisis WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
});

/* ========= CREAR ========= */
router.post('/', async (req, res) => {
    try {
        const b = req.body || {};
        if (!b.mascota_id || !b.propietario_id || !b.veterinario_id)
            return res.status(400).json({ error: 'Faltan IDs' });
        if (!b.fecha_ingreso || !b.fecha_egreso)
            return res.status(400).json({ error: 'Faltan fechas de ingreso/egreso' });

        const [[M]] = await pool.query('SELECT * FROM mascota WHERE id=?', [b.mascota_id]);
        const [[P]] = await pool.query('SELECT * FROM propietario WHERE id=?', [b.propietario_id]);
        const [[V]] = await pool.query('SELECT * FROM veterinario WHERE id=?', [b.veterinario_id]);
        if (!M || !P || !V) return res.status(400).json({ error: 'IDs inválidos' });

        let edad = null;
        if (M.fecha_nacimiento) {
            const birth = dayjs(M.fecha_nacimiento);
            const now = dayjs();
            const years = now.diff(birth, 'year');
            const months = now.diff(birth.add(years, 'year'), 'month');
            edad = years + months / 12;
        } else if (M.edad_anios != null) {
            edad = Number(M.edad_anios);
        }

        const snap = {
            mascota_id: M.id, propietario_id: P.id, veterinario_id: V.id,
            mas_nombre: M.nombre, mas_especie: M.especie, mas_raza: M.raza, mas_sexo: M.sexo,
            mas_edad_anios: edad, mas_peso_kg: M.peso_kg,
            prop_nombre: P.nombre, prop_rut: P.rut, prop_movil: P.movil, prop_direccion: P.direccion,
            vet_nombre: V.nombre, vet_rut: V.rut,

            fecha_ingreso: b.fecha_ingreso,
            fecha_egreso: b.fecha_egreso,

            sintomas: b.sintomas || null,
            diagnostico_ingreso: b.diagnostico_ingreso || null,
            diagnostico_egreso: b.diagnostico_egreso || null,
            causa_egreso: b.causa_egreso || null,
            examenes: b.examenes || null,
            tratamiento_realizado: b.tratamiento_realizado || null,
            tratamiento_seguir: b.tratamiento_seguir || null,
            recomendaciones: b.recomendaciones || null
        };

        const [r] = await pool.query('INSERT INTO certificado_epicrisis SET ?', [snap]);
        const id = r.insertId;
        const [[row]] = await pool.query('SELECT * FROM certificado_epicrisis WHERE id=?', [id]);
        res.status(201).json(row);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error creando certificado' });
    }
});

/* ========= ACTUALIZAR ========= */
router.put('/:id', async (req, res) => {
    const b = req.body || {};
    await pool.query('UPDATE certificado_epicrisis SET ? WHERE id=?', [b, req.params.id]);
    const [[row]] = await pool.query('SELECT * FROM certificado_epicrisis WHERE id=?', [req.params.id]);
    res.json(row);
});

/* ========= ELIMINAR ========= */
router.delete('/:id', async (req, res) => {
    await pool.query('DELETE FROM certificado_epicrisis WHERE id=?', [req.params.id]);
    res.json({ ok: true });
});

/* ========= PDF ========= */
router.get('/:id/pdf', async (req, res) => {
    const [[c]] = await pool.query('SELECT * FROM certificado_epicrisis WHERE id=?', [req.params.id]);
    if (!c) return res.status(404).send('No encontrado');

    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595.28, 841.89]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const draw = (text, x, y, f = font, size = 11) =>
        page.drawText(String(text ?? ''), { x, y, size, font: f, color: rgb(0, 0, 0) });

    draw('VETERINARIA “PUCARÁ”', 70, 800, bold, 9);
    draw('ESMERALDA #97', 70, 788, font, 9);
    draw('FONO: 22 859 2840', 70, 776, font, 9);
    draw('SAN BERNARDO   SANTIAGO / CHILE', 70, 764, font, 9);
    draw('LOGO', 480, 770, font, 12);
    draw('Epicrisis', 260, 730, bold, 16);

    const L = 70, LABEL_W = 170, COL_X = L + LABEL_W, VAL_X = COL_X + 10;
    let y = 700;
    const put = (label, val) => {
        page.drawText(label, { x: L, y, size: 11, font: bold });
        page.drawText(':', { x: COL_X, y, size: 11, font: bold });
        page.drawText(String(val ?? '—'), { x: VAL_X, y, size: 11, font });
        y -= 18;
    };
    const fmt = (d) => (d ? dayjs(d).format('DD-MM-YYYY') : '');

    const formatEdad = (v) => {
        if (v == null || isNaN(v)) return null;
        let years = Math.floor(Number(v));
        let months = Math.round((Number(v) - years) * 12);
        if (months === 12) { years += 1; months = 0; }
        if (!years && months) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
        if (years && !months) return `${years} ${years === 1 ? 'año' : 'años'}`;
        return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
    };

    put('Fecha de ingreso', fmt(c.fecha_ingreso));
    put('Fecha de egreso', fmt(c.fecha_egreso));
    y -= 6;

    draw('1. Identificación del propietario', L, y, bold); y -= 16;
    put('Nombre del Dueño(a)', c.prop_nombre);
    put('Rut/pasaporte', c.prop_rut);
    put('Dirección', c.prop_direccion);
    put('Teléfono', c.prop_movil);
    y -= 6;

    draw('2. Identificación del paciente', L, y, bold); y -= 16;
    put('Nombre Mascota', c.mas_nombre);
    put('Especie', c.mas_especie);
    put('Raza', c.mas_raza);
    put('Sexo', c.mas_sexo);
    put('Edad', formatEdad(c.mas_edad_anios));
    put('Peso', c.mas_peso_kg != null ? `${Number(c.mas_peso_kg).toFixed(2)} kg` : '—');
    y -= 6;

    const width = 460, lineH = 14;
    const wrap = (text) => {
        const words = String(text || '—').split(/\s+/);
        let line = '', out = [];
        for (const w of words) {
            const t = line ? line + ' ' + w : w;
            if (font.widthOfTextAtSize(t, 11) <= width) line = t;
            else { if (line) out.push(line); line = w; }
        }
        if (line) out.push(line);
        return out;
    };
    const drawBlock = (title, text) => {
        draw(title, L, y, bold); y -= 16;
        for (const ln of wrap(text)) { draw(ln, L, y, font, 11); y -= lineH; }
        y -= 6;
    };

    drawBlock('Síntomas y signos de ingreso:', c.sintomas);
    drawBlock('Diagnóstico de ingreso:', c.diagnostico_ingreso);
    drawBlock('Diagnóstico de egreso:', c.diagnostico_egreso);
    put('Causa de egreso', ({
        alta_medica: 'alta médica',
        alta_relativa: 'alta relativa',
        alta_solicitada: 'alta solicitada'
    }[c.causa_egreso]) || (c.causa_egreso || '—'));
    y -= 8;

    drawBlock('Exámenes complementarios:', c.examenes);
    drawBlock('Tratamiento realizado:', c.tratamiento_realizado);
    drawBlock('Tratamiento a seguir:', c.tratamiento_seguir);
    drawBlock('Recomendaciones:', c.recomendaciones);

    const PAGE_W = page.getWidth();
    const cx = PAGE_W / 2;
    const center = (text, yPos, f = font, size = 10) => {
        const txt = String(text ?? '');
        const w = f.widthOfTextAtSize(txt, size);
        page.drawText(txt, { x: cx - w / 2, y: yPos, size, font: f, color: rgb(0, 0, 0) });
    };

    center('SE EXTIENDE EL PRESENTE CERTIFICADO PARA SER PRESENTADO A LOS ORGANISMOS PERTINENTES A PETICION DEL PROPIETARIO.', 120, bold, 8);

    center('______________________________', 96, font, 10);
    center(c.vet_nombre || 'Nombre Veterinario', 82, font, 10);
    center('MEDICO VETERINARIO', 68, font, 10);
    center(`RUT: ${c.vet_rut || '—'}`, 54, font, 10);

    const bytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=cert-epicrisis-${c.id}.pdf`);
    res.send(Buffer.from(bytes));
});

export default router;
