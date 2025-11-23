import { Router } from 'express';
import pool from '../db.js';
import dayjs from 'dayjs';
import 'dayjs/locale/es.js';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

dayjs.locale('es');
const router = Router();

/* =========================
   LISTAR
   ========================= */
router.get('/', async (req, res) => {
    try {
        const { search = '', from, to } = req.query;
        const args = [];
        let where = ' WHERE 1=1 ';
        if (from) { where += ' AND c.fecha_cert >= ?'; args.push(from); }
        if (to) { where += ' AND c.fecha_cert < ?'; args.push(to); }
        if (search) {
            where += ' AND (c.mas_nombre LIKE ? OR c.prop_nombre LIKE ? OR c.vet_nombre LIKE ?)';
            args.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }
        const sql = `
      SELECT c.id, c.fecha_cert, c.mas_nombre, c.prop_nombre, c.vet_nombre,
             c.mas_especie, c.mas_raza
      FROM certificado_salud_sag c
      ${where}
      ORDER BY c.id DESC`;
        const [rows] = await pool.query(sql, args);
        res.json(rows);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error listando certificados' });
    }
});

/* =========================
   OBTENER UNO
   ========================= */
router.get('/:id', async (req, res) => {
    try {
        const [r] = await pool.query('SELECT * FROM certificado_salud_sag WHERE id=?', [req.params.id]);
        if (!r.length) return res.status(404).json({ error: 'No encontrado' });
        res.json(r[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error obteniendo certificado' });
    }
});

/* =========================
   CREAR
   ========================= */
router.post('/', async (req, res) => {
    try {
        const body = req.body || {};
        if (!body.mascota_id || !body.propietario_id || !body.veterinario_id) {
            return res.status(400).json({ error: 'Faltan IDs de mascota/propietario/veterinario' });
        }

        const [[M]] = await pool.query('SELECT * FROM mascota WHERE id=?', [body.mascota_id]);
        const [[P]] = await pool.query('SELECT * FROM propietario WHERE id=?', [body.propietario_id]);
        const [[V]] = await pool.query('SELECT * FROM veterinario WHERE id=?', [body.veterinario_id]);
        if (!M || !P || !V) return res.status(400).json({ error: 'IDs inválidos' });

        let edad = null;
        if (M?.fecha_nacimiento) {
            const fn = dayjs(M.fecha_nacimiento);
            edad = Number(Math.max(0, dayjs().diff(fn, 'year', true)).toFixed(1)); 
        } else if (M?.edad_anios != null) {
            edad = Number(M.edad_anios);
        }

        const snapshot = {
            mascota_id: body.mascota_id,
            propietario_id: body.propietario_id,
            veterinario_id: body.veterinario_id,

            mas_nombre: M?.nombre ?? '',
            mas_raza: M?.raza ?? '',
            mas_peso_kg: M?.peso_kg ?? null,
            mas_especie: M?.especie ?? '',
            mas_edad_anios: edad,
            mas_sexo: M?.sexo ?? '',
            mas_microchip: body.mas_microchip ?? M?.nro_microchip ?? '',
            mas_color: body.mas_color ?? null,
            chip_fecha: body.chip_fecha ?? null,
            chip_sitio: body.chip_sitio ?? null,

            prop_nombre: P?.nombre ?? '',
            prop_rut: P?.rut ?? '',
            prop_direccion: P?.direccion ?? '',  
            prop_fono: P?.movil ?? '',

            fecha_cert: body.fecha_cert ?? dayjs().format('YYYY-MM-DD'),
            fecha_inspeccion: body.fecha_inspeccion ?? dayjs().format('YYYY-MM-DD'),

            vet_nombre: V?.nombre ?? '',
            vet_rut: V?.rut ?? '',
            vet_fono: V?.movil ?? '',
            vet_direccion: body.vet_direccion ?? 'Esmeralda #97 – San Bernardo',

            vacunacion_json: body.vacunacion_json ?? '[]',
            desparasitacion_json: body.desparasitacion_json ?? '[]',
        };

        const [r] = await pool.query('INSERT INTO certificado_salud_sag SET ?', [snapshot]);
        const id = r.insertId;
        const [[row]] = await pool.query('SELECT * FROM certificado_salud_sag WHERE id=?', [id]);
        res.status(201).json(row);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error creando certificado' });
    }
});

/* =========================
   ACTUALIZAR
   ========================= */
router.put('/:id', async (req, res) => {
    try {
        const body = req.body || {};
        await pool.query('UPDATE certificado_salud_sag SET ? WHERE id=?', [body, req.params.id]);
        const [row] = await pool.query('SELECT * FROM certificado_salud_sag WHERE id=?', [req.params.id]);
        res.json(row[0]);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error actualizando certificado' });
    }
});

/* =========================
   ELIMINAR
   ========================= */
router.delete('/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM certificado_salud_sag WHERE id=?', [req.params.id]);
        res.json({ ok: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Error eliminando certificado' });
    }
});

/* =========================
   PDF
   ========================= */
router.get('/:id/pdf', async (req, res) => {
    try {
        const [r] = await pool.query('SELECT * FROM certificado_salud_sag WHERE id=?', [req.params.id]);
        if (!r.length) return res.status(404).json({ error: 'No encontrado' });
        const c = r[0];

        const pdf = await PDFDocument.create();
        const A4 = [595.28, 841.89];
        const p1 = pdf.addPage(A4);
        const p2 = pdf.addPage(A4);
        const font = await pdf.embedFont(StandardFonts.Helvetica);
        const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
        const draw = (p, txt, x, y, f = font, size = 11, color = rgb(0, 0, 0)) =>
            p.drawText(String(txt ?? ''), { x, y, size, font: f, color });

        // ------- PÁGINA 1 -------
        draw(p1, 'Certificado de salud', 210, 780, bold, 18);
        draw(p1, `FECHA: ${dayjs(c.fecha_cert).format('DD/MM/YYYY')}`, 60, 740, bold);

        draw(p1, '1. Identificación del animal de compañía', 60, 710, bold);
        const L = 60;
        const LABEL_W = 180;
        const COLON_X = L + LABEL_W;
        const VAL_X = COLON_X + 12;
        let y = 690;

        function put(label, val, opts = {}) {
            const size = opts.size || 11;
            const lh = opts.lh || 16;
            const labelWidth = font.widthOfTextAtSize(String(label), size);
            const lines = Math.max(1, Math.ceil(labelWidth / LABEL_W));
            if (lines > 1) {
                const mid = Math.floor(label.length / 2);
                const part1 = label.slice(0, mid);
                const part2 = label.slice(mid);
                p1.drawText(part1.trim(), { x: L, y, size, font: bold, color: rgb(0, 0, 0), maxWidth: LABEL_W, lineHeight: lh });
                p1.drawText(part2.trim(), { x: L, y: y - lh, size, font: bold, color: rgb(0, 0, 0), maxWidth: LABEL_W, lineHeight: lh });
                
                p1.drawText(':', { x: COLON_X, y, size, font: bold });
                p1.drawText(String(val ?? '—'), { x: VAL_X, y, size, font });
                y -= (lines * lh) + 6;
            } else {
                p1.drawText(label, { x: L, y, size, font: bold });
                p1.drawText(':', { x: COLON_X, y, size, font: bold });
                p1.drawText(String(val ?? '—'), { x: VAL_X, y, size, font });
                y -= lh + 6;
            }
        }

        put('Nombre Mascota', c.mas_nombre);
        put('Raza', c.mas_raza);
        put('Peso', c.mas_peso_kg ? `${Number(c.mas_peso_kg).toFixed(2)} kg` : '—');
        put('Especie', c.mas_especie);
        put('Edad', (c.mas_edad_anios != null ? `${Number(c.mas_edad_anios).toFixed(1)} años` : '—'));
        put('Color', c.mas_color || '—');
        put('Sexo', c.mas_sexo);
        put('N° Microchip', c.mas_microchip || '—');
        put('Fecha de aplicación del Microchip', c.chip_fecha ? dayjs(c.chip_fecha).format('DD/MM/YYYY') : '—');
        put('Sitio de Aplicación de Microchip', c.chip_sitio || '—');

        y -= 6;
        draw(p1, '2. Identificación del propietario', L, y, bold); y -= 22;
        put('Nombre del Dueño(a)', c.prop_nombre);
        put('Rut / Pasaporte', c.prop_rut || '—');
        put('Dirección', c.prop_direccion || '—');
        put('Fono', c.prop_fono || '—');

        y -= 6;
        draw(p1, '3. El Médico Veterinario que suscribe Certifica que el Animal de Compañía:', L, y, bold);
        y -= 28;
        const texto = 'Se encuentra clínicamente sano al examen físico, sin presentar tumoraciones, heridas frescas o en proceso de cicatrización, ni signos de enfermedades infectocontagiosas, cuarentenales o transmisibles, ni presencia de parásitos externos y ha sido tratado contra estos últimos.';
        p1.drawText(texto, { x: L, y, size: 11, font, maxWidth: 475, lineHeight: 14 });
        y -= 80;
        draw(p1, `Fecha de la inspección física del animal de compañía: ${dayjs(c.fecha_inspeccion).format('DD/MM/YYYY')}`, L, y, bold);

        // firma
        draw(p1, '_______________________________', 200, 120);
        draw(p1, 'Firma y timbre del médico veterinario', 210, 105, font, 10);


        // ------- PÁGINA 2 -------

        function wrapCellText(text, maxWidth, fontRef, size) {
            const words = String(text ?? '').split(/\s+/);
            const lines = [];
            let line = '';
            for (const w of words) {
                const test = line ? line + ' ' + w : w;
                if (fontRef.widthOfTextAtSize(test, size) <= maxWidth) {
                    line = test;
                } else {
                    if (line) lines.push(line);
                    line = w;
                }
            }
            if (line) lines.push(line);
            return lines;
        }

        draw(p2, 'Vacunación', 60, 780, bold, 13);

        const vacHeaders = ['Nombre vacuna', 'Lab.', 'N° serie', 'Fecha', 'Vigencia'];
        const vacWidths = [160, 90, 80, 80, 80]; 
        const vacX0 = 60;
        const vacY0 = 760;
        const vacFontSz = 8.8;
        const vacLH = 11;
        const vacBaseH = 16;

        const vacDefault = [
            { nombre: 'Distemper' },
            { nombre: 'Adenovirus (Hepatitis)' },
            { nombre: 'Leptospira (L. canícola e icterohaemorrhagiae)' },
            { nombre: 'Parvovirus' },
            { nombre: 'Parainfluenza' },
            { nombre: 'Coronavirus' },
            { nombre: 'Antirrábica' }
        ];

        let vacUser = [];
        try { vacUser = JSON.parse(c.vacunacion_json || '[]'); } catch { }
        const vacRows = vacDefault.map(d => {
            const hit = vacUser.find(u => (u.nombre || '').toLowerCase() === (d.nombre || '').toLowerCase());
            return {
                nombre: d.nombre,
                laboratorio: hit?.laboratorio || '',
                serie: hit?.serie || '',
                fecha: hit?.fecha ? dayjs(hit.fecha).format('DD/MM/YYYY') : '',
                vigencia: hit?.vigencia || ''
            };
        });

        const vacXs = [vacX0];
        for (let i = 0; i < vacWidths.length; i++) vacXs.push(vacXs[i] + vacWidths[i]);

        let yTop = vacY0;

        const headH = vacBaseH;
        p2.drawRectangle({ x: vacX0, y: yTop - headH, width: vacXs.at(-1) - vacX0, height: headH, borderColor: rgb(0, 0, 0), borderWidth: 1 });
        for (let i = 0; i < vacHeaders.length; i++) {
            draw(p2, vacHeaders[i], vacXs[i] + 3, yTop - 12, bold, vacFontSz);
            p2.drawLine({ start: { x: vacXs[i], y: yTop }, end: { x: vacXs[i], y: yTop - headH }, thickness: 1, color: rgb(0, 0, 0) });
        }
        p2.drawLine({ start: { x: vacXs.at(-1), y: yTop }, end: { x: vacXs.at(-1), y: yTop - headH }, thickness: 1, color: rgb(0, 0, 0) });
        yTop -= headH;

        for (const r of vacRows) {
            const cells = [
                wrapCellText(r.nombre, vacWidths[0] - 6, font, vacFontSz),
                wrapCellText(r.laboratorio, vacWidths[1] - 6, font, vacFontSz),
                wrapCellText(r.serie, vacWidths[2] - 6, font, vacFontSz),
                wrapCellText(r.fecha, vacWidths[3] - 6, font, vacFontSz),
                wrapCellText(r.vigencia, vacWidths[4] - 6, font, vacFontSz),
            ];
            const linesMax = Math.max(...cells.map(a => a.length));
            const rowH = Math.max(vacBaseH, linesMax * vacLH + 4);

            p2.drawRectangle({ x: vacX0, y: yTop - rowH, width: vacXs.at(-1) - vacX0, height: rowH, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            for (let i = 0; i < vacXs.length; i++) {
                p2.drawLine({ start: { x: vacXs[i], y: yTop }, end: { x: vacXs[i], y: yTop - rowH }, thickness: 1, color: rgb(0, 0, 0) });
            }

            for (let i = 0; i < cells.length; i++) {
                let yy = yTop - 12;
                for (const ln of cells[i]) {
                    draw(p2, ln, vacXs[i] + 3, yy, font, vacFontSz);
                    yy -= vacLH;
                }
            }
            yTop -= rowH;
        }

        draw(p2, 'Desparasitación', 60, 505, bold, 13);

        const desHeaders = ['Tipo', 'Producto', 'Lab.', 'Principio', 'Lote', 'Fecha', 'Hora'];
        const desWidths = [55, 95, 85, 95, 55, 75, 60];
        const desX0 = 60;
        const desY0 = 490;
        const desFontSz = 8.6;
        const desLH = 11;
        const desBaseH = 16;
        const desXs = [desX0];
        for (let i = 0; i < desWidths.length; i++) desXs.push(desXs[i] + desWidths[i]);

        let desUser = [];
        try { desUser = JSON.parse(c.desparasitacion_json || '[]'); } catch { }
        const desDefault = [{ tipo: 'Interna' }, { tipo: 'Externa' }];
        const desRows = desDefault.map(d => {
            const hit = desUser.find(u => (u.tipo || '').toLowerCase() === (d.tipo || '').toLowerCase());
            return {
                tipo: d.tipo,
                producto: hit?.producto || '',
                laboratorio: hit?.laboratorio || '',
                principio: hit?.principio || '',
                lote: hit?.lote || '',
                fecha: hit?.fecha ? dayjs(hit.fecha).format('DD/MM/YYYY') : '',
                hora: hit?.hora || ''
            };
        });

        let y2 = desY0;

        p2.drawRectangle({ x: desX0, y: y2 - desBaseH, width: desXs.at(-1) - desX0, height: desBaseH, borderColor: rgb(0, 0, 0), borderWidth: 1 });
        for (let i = 0; i < desHeaders.length; i++) {
            draw(p2, desHeaders[i], desXs[i] + 3, y2 - 12, bold, desFontSz);
            p2.drawLine({ start: { x: desXs[i], y: y2 }, end: { x: desXs[i], y: y2 - desBaseH }, thickness: 1, color: rgb(0, 0, 0) });
        }
        p2.drawLine({ start: { x: desXs.at(-1), y: y2 }, end: { x: desXs.at(-1), y: y2 - desBaseH }, thickness: 1, color: rgb(0, 0, 0) });
        y2 -= desBaseH;

        for (const r of desRows) {
            const cells = [
                wrapCellText(r.tipo, desWidths[0] - 6, font, desFontSz),
                wrapCellText(r.producto, desWidths[1] - 6, font, desFontSz),
                wrapCellText(r.laboratorio, desWidths[2] - 6, font, desFontSz),
                wrapCellText(r.principio, desWidths[3] - 6, font, desFontSz),
                wrapCellText(r.lote, desWidths[4] - 6, font, desFontSz),
                wrapCellText(r.fecha, desWidths[5] - 6, font, desFontSz),
                wrapCellText(r.hora, desWidths[6] - 6, font, desFontSz),
            ];
            const linesMax = Math.max(...cells.map(a => a.length));
            const rowH = Math.max(desBaseH, linesMax * desLH + 4);

            p2.drawRectangle({ x: desX0, y: y2 - rowH, width: desXs.at(-1) - desX0, height: rowH, borderColor: rgb(0, 0, 0), borderWidth: 1 });
            for (let i = 0; i < desXs.length; i++) {
                p2.drawLine({ start: { x: desXs[i], y: y2 }, end: { x: desXs[i], y: y2 - rowH }, thickness: 1, color: rgb(0, 0, 0) });
            }

            for (let i = 0; i < cells.length; i++) {
                let yy = y2 - 12;
                for (const ln of cells[i]) {
                    draw(p2, ln, desXs[i] + 3, yy, font, desFontSz);
                    yy -= desLH;
                }
            }
            y2 -= rowH;
        }


        const VET_TOP_Y = 320; 
        const VET_GAP = 18;

        draw(p2, 'Datos del Médico Veterinario Firmante', 60, VET_TOP_Y, bold);
        draw(p2, `Nombre: ${c.vet_nombre}`, 60, VET_TOP_Y - VET_GAP * 1);
        draw(p2, `Rut: ${c.vet_rut || '—'}`, 60, VET_TOP_Y - VET_GAP * 2);
        draw(p2, `Teléfono: ${c.vet_fono || '—'}`, 60, VET_TOP_Y - VET_GAP * 3);
        draw(p2, `Dirección: ${c.vet_direccion || '—'}`, 60, VET_TOP_Y - VET_GAP * 4);
        draw(p2, `Fecha de la inspección física del animal de compañía: ${dayjs(c.fecha_inspeccion).format('DD/MM/YYYY')}`,
            60, VET_TOP_Y - VET_GAP * 5);

        const SIG_LINE_Y = 55;
        const SIG_CAP_Y = 40;
        const NOTE_Y = 22;

        draw(p2, '_______________________________', 200, SIG_LINE_Y);
        draw(p2, 'Firma del Médico Veterinario', 220, SIG_CAP_Y, font, 9);
        draw(p2, 'Nota: Los requisitos específicos según el destino deben adjuntarse a este certificado',
            60, NOTE_Y, font, 8);

        const bytes = await pdf.save();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Certificado-Salud-SAG-${c.id}.pdf"`);
        res.send(Buffer.from(bytes));
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'No se pudo generar el PDF' });
    }
});

export default router;
