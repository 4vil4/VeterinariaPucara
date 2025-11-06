import { Router } from 'express';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import pool from '../db.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

dayjs.locale('es');
const router = Router();

// ============== LISTAR ==============
router.get('/', async (req, res) => {
    const { search = '' } = req.query;
    const q = `%${search}%`;
    const [rows] = await pool.query(
        `SELECT c.id, c.fecha_cert, c.mas_nombre, c.prop_nombre, c.vet_nombre
     FROM certificado_salud_pucara c
     WHERE c.mas_nombre LIKE ? OR c.prop_nombre LIKE ? OR c.vet_nombre LIKE ?
     ORDER BY c.id DESC`,
        [q, q, q]
    );
    res.json(rows);
});

// ============== OBTENER UNO ==============
router.get('/:id', async (req, res) => {
    const [[row]] = await pool.query('SELECT * FROM certificado_salud_pucara WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
});

// ============== CREAR ==============
router.post('/', async (req, res) => {
    try {
        const b = req.body || {};
        if (!b.mascota_id || !b.propietario_id || !b.veterinario_id)
            return res.status(400).json({ error: 'Faltan IDs' });

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
            edad = years + (months / 12); 
        } else if (M.edad_anios != null) {
            edad = Number(M.edad_anios); 
        }

        const snap = {
            mascota_id: M.id, propietario_id: P.id, veterinario_id: V.id,
            mas_nombre: M.nombre, mas_especie: M.especie, mas_raza: M.raza, mas_sexo: M.sexo,
            mas_edad_anios: edad, mas_peso_kg: M.peso_kg,
            prop_nombre: P.nombre, prop_movil: P.movil, prop_direccion: P.direccion,
            fecha_cert: b.fecha_cert || dayjs().format('YYYY-MM-DD'),
            relato_html: b.relato_html || '',
            vet_nombre: V.nombre, vet_rut: V.rut,
        };

        const [r] = await pool.query('INSERT INTO certificado_salud_pucara SET ?', [snap]);
        const id = r.insertId;
        const [[row]] = await pool.query('SELECT * FROM certificado_salud_pucara WHERE id=?', [id]);
        res.status(201).json(row);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error creando' });
    }
});

// ============== ACTUALIZAR ==============
router.put('/:id', async (req, res) => {
    const b = req.body || {};
    await pool.query('UPDATE certificado_salud_pucara SET ? WHERE id=?', [b, req.params.id]);
    const [[row]] = await pool.query('SELECT * FROM certificado_salud_pucara WHERE id=?', [req.params.id]);
    res.json(row);
});

// ============== ELIMINAR ==============
router.delete('/:id', async (req, res) => {
    await pool.query('DELETE FROM certificado_salud_pucara WHERE id=?', [req.params.id]);
    res.json({ ok: true });
});

// ======== Util: HTML básico ========
function htmlToPlain(html = '') {
    if (!html) return '';
    return html
        .replace(/<\s*br\s*\/?>/gi, '\n')
        .replace(/<\/\s*p\s*>/gi, '\n\n')
        .replace(/<\s*p[^>]*>/gi, '')
        .replace(/<\/\s*strong\s*>/gi, '</b>')
        .replace(/<\s*strong[^>]*>/gi, '<b>')
        .replace(/<\/?[^>]+>/g, '')
        .replace(/\u00A0/g, ' ')
        .replace(/[ \t]+\n/g, '\n')
        .trim();
}

// ============== PDF ==============
router.get('/:id/pdf', async (req, res) => {
    const [[c]] = await pool.query('SELECT * FROM certificado_salud_pucara WHERE id=?', [req.params.id]);
    if (!c) return res.status(404).send('No encontrado');

    const pdf = await PDFDocument.create();
    const p = pdf.addPage([595.28, 841.89]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

    const draw = (text, x, y, f = font, size = 11) =>
        p.drawText(String(text ?? ''), { x, y, size, font: f, color: rgb(0, 0, 0) });

    // Encabezado
    draw('VETERINARIA “PUCARÁ”', 70, 800, bold, 9);
    draw('ESMERALDA #97', 70, 788, font, 9);
    draw('FONO: 22 859 2840', 70, 776, font, 9);
    draw('SAN BERNARDO   SANTIAGO / CHILE', 70, 764, font, 9);
    draw('LOGO', 480, 770, font, 12);
    draw('Certificado de Salud', 210, 730, bold, 16);

    // Helper etiqueta-valor
    const L = 70, LABEL_W = 160, COL_X = L + LABEL_W, VAL_X = COL_X + 10;
    let y = 700;
    function put(label, val) {
        p.drawText(label, { x: L, y, size: 11, font: bold });
        p.drawText(':', { x: COL_X, y, size: 11, font: bold });
        p.drawText(String(val ?? '—'), { x: VAL_X, y, size: 11, font });
        y -= 18;
    }

    function formatEdadFromNumber(v) {
        if (v == null || isNaN(v)) return null;
        let years = Math.floor(Number(v));
        let months = Math.round((Number(v) - years) * 12);
        if (months === 12) { years += 1; months = 0; }
        if (years <= 0 && months > 0) return `${months} ${months === 1 ? 'mes' : 'meses'}`;
        if (months === 0) return `${years} ${years === 1 ? 'año' : 'años'}`;
        return `${years} ${years === 1 ? 'año' : 'años'} y ${months} ${months === 1 ? 'mes' : 'meses'}`;
    }

    put('Nombre Mascota', c.mas_nombre);
    put('Especie', c.mas_especie);
    put('Raza', c.mas_raza);
    put('Sexo', c.mas_sexo);
    put('Edad', c.mas_edad_anios != null ? formatEdadFromNumber(Number(c.mas_edad_anios)) : '—');
    put('Peso', c.mas_peso_kg != null ? `${Number(c.mas_peso_kg).toFixed(2)} kg` : '—');

    y -= 8; draw('Nombre del Dueño(a)', L, y, bold); p.drawText(':', { x: COL_X, y, size: 11, font: bold }); draw(c.prop_nombre, VAL_X, y); y -= 18;
    draw('Teléfono', L, y, bold); p.drawText(':', { x: COL_X, y, size: 11, font: bold }); draw(c.prop_movil, VAL_X, y); y -= 18;
    draw('Dirección', L, y, bold); p.drawText(':', { x: COL_X, y, size: 11, font: bold }); draw(c.prop_direccion, VAL_X, y); y -= 26;

    const width = 460, lineH = 14;
    const plain = htmlToPlain(c.relato_html || '');
    const paras = plain.split(/\n{2,}/);
    const wrap = (text) => {
        const words = text.split(/\s+/);
        let line = '', out = [];
        for (const w of words) {
            const t = line ? line + ' ' + w : w;
            if (font.widthOfTextAtSize(t, 11) <= width) line = t;
            else { if (line) out.push(line); line = w; }
        }
        if (line) out.push(line);
        return out;
    };

    for (const para of paras) {
        const lines = wrap(para);
        for (const ln of lines) { draw(ln, L, y, font, 11); y -= lineH; }
        y -= 4;
    }

    // -------- Pie y firma centrados --------
    const PAGE_W = p.getWidth();
    const centerX = PAGE_W / 2;

    const drawCentered = (text, yPos, f = font, size = 10) => {
        const txt = String(text ?? '');
        const w = f.widthOfTextAtSize(txt, size);
        p.drawText(txt, { x: centerX - w / 2, y: yPos, size, font: f, color: rgb(0, 0, 0) });
    };

    const wrapByWidth = (text, fnt, size, maxWidth) => {
        const words = String(text || '').split(/\s+/);
        let line = '', out = [];
        for (const w of words) {
            const t = line ? line + ' ' + w : w;
            if (fnt.widthOfTextAtSize(t, size) <= maxWidth) line = t;
            else { if (line) out.push(line); line = w; }
        }
        if (line) out.push(line);
        return out;
    };

    const NOTE_TEXT =
        'SE EXTIENDE EL PRESENTE CERTIFICADO PARA SER PRESENTADO A LOS ORGANISMOS PERTINENTES A PETICION DEL PROPIETARIO.';
    const NOTE_SIZE = 7.5;
    const NOTE_MAXW = PAGE_W - 130;
    const NOTE_LINEH = 9.5;
    let noteY = 140;
    const noteLines = wrapByWidth(NOTE_TEXT, bold, NOTE_SIZE, NOTE_MAXW);
    for (const ln of noteLines) { drawCentered(ln, noteY, bold, NOTE_SIZE); noteY -= NOTE_LINEH; }

    // Firma
    drawCentered('______________________________', 104, font, 10);
    drawCentered(c.vet_nombre || 'Nombre Veterinario', 90, font, 10);
    drawCentered('MEDICO VETERINARIO', 76, font, 10);
    drawCentered(`RUT: ${c.vet_rut || '—'}`, 62, font, 10);

    const bytes = await pdf.save();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename=cert-salud-pucara-${c.id}.pdf`);
    res.send(Buffer.from(bytes));
});

export default router;
