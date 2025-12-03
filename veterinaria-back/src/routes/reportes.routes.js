import express from 'express';
import PDFDocument from 'pdfkit';
import pool from '../db.js';
import fs from 'fs';
import path from 'path';


export const routerReportes = express.Router();

/** Helper: rango de fechas del mes */
function getMonthRange(year, month) {
    // month: 1-12
    const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const to = new Date(Date.UTC(year, month, 1, 0, 0, 0)); 
    return {
        from: from.toISOString().slice(0, 19).replace('T', ' '),
        to: to.toISOString().slice(0, 19).replace('T', ' ')
    };
}

function drawHeader(doc, year, month) {
    const topY = 40;
    const logoPath = path.join(process.cwd(), 'assets', 'logoCert.PNG');

    if (fs.existsSync(logoPath)) {
        doc.image(logoPath, 50, topY - 10, { width: 70 });
    }

    doc
        .fontSize(18)
        .text('Clínica Veterinaria Pucará', 0, topY, { align: 'center' });

    doc
        .fontSize(14)
        .text(
            `Informe mensual ${String(month).padStart(2, '0')}/${year}`,
            0,
            topY + 24,
            { align: 'center' }
        );

    doc.moveDown(3);
}

function drawSimpleTable(doc, { x, y, headers, rows, colWidths }) {
    const totalWidth = colWidths.reduce((a, b) => a + b, 0);
    const rowHeight = 18;

    let currentY = y;
    doc.lineWidth(0.5);
    doc.fontSize(10);

    // Header
    doc.rect(x, currentY, totalWidth, rowHeight).stroke();
    let currentX = x;
    headers.forEach((h, i) => {
        doc.text(String(h), currentX + 4, currentY + 4, {
            width: colWidths[i] - 8,
            align: 'left'
        });
        currentX += colWidths[i];
    });

    currentY += rowHeight;

    // Filas
    rows.forEach((row) => {
        currentX = x;
        doc.rect(x, currentY, totalWidth, rowHeight).stroke();
        row.forEach((cell, i) => {
            doc.text(String(cell), currentX + 4, currentY + 4, {
                width: colWidths[i] - 8,
                align: 'left'
            });
            currentX += colWidths[i];
        });
        currentY += rowHeight;
    });

    return currentY;
}

/** Gráfico de barras para "citas atendidas por mes" */
function drawBarChart(doc, { x, y, width, height, labels, data, title }) {
    if (!data.length) {
        doc.fontSize(10).text(`${title}: sin datos`, x, y);
        return;
    }

    const max = Math.max(...data, 1);
    const barWidth = width / data.length;
    const axisBottomY = y + height;
    const axisLeftX = x;

    doc.save();
    doc.fontSize(12).text(title, x, y - 24);

    doc.lineWidth(0.5);
    doc
        .moveTo(axisLeftX, y)
        .lineTo(axisLeftX, axisBottomY)
        .lineTo(axisLeftX + width, axisBottomY)
        .stroke();

    // Barras
    doc.fillColor('#4A90E2'); 
    data.forEach((val, idx) => {
        const barHeight = (val / max) * (height - 20);
        const bx = x + idx * barWidth + 2;
        const by = axisBottomY - barHeight;
        doc.rect(bx, by, barWidth - 4, barHeight).fill();
    });

    // Etiquetas de los meses
    doc.fillColor('black');
    labels.forEach((lbl, idx) => {
        const lx = x + idx * barWidth + barWidth / 2;
        doc.fontSize(8).text(lbl, lx - 12, axisBottomY + 4, {
            width: 24,
            align: 'center'
        });
    });

    doc.restore();
}

/** Rangos de día y semana para "número de citas por período" */
function getDayAndWeekRanges(year, month) {
    const now = new Date();
    let ref;

    if (year === now.getFullYear() && month === now.getMonth() + 1) {
        ref = now;
    } else {
        ref = new Date(year, month, 0);
    }

    const dayStart = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
    const dayEnd = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + 1);

    const jsDay = ref.getDay(); 
    const diffToMonday = (jsDay + 6) % 7;
    const weekStart = new Date(ref);
    weekStart.setDate(ref.getDate() - diffToMonday);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const fmt = (d) =>
        d.toISOString().slice(0, 19).replace('T', ' ');

    return {
        dayStart: fmt(dayStart),
        dayEnd: fmt(dayEnd),
        weekStart: fmt(weekStart),
        weekEnd: fmt(weekEnd)
    };
}

/** GET /api/reportes/mes?year=YYYY&month=MM  (JSON para dashboards) */
routerReportes.get('/mes', async (req, res) => {
    try {
        const now = new Date();
        const year = Number(req.query.year) || now.getFullYear();
        const month = Number(req.query.month) || (now.getMonth() + 1);

        const { from, to } = getMonthRange(year, month);

        // 1) Citas por día dentro del mes
        const [citasPorDia] = await pool.query(
            `
      SELECT 
        DATE(fecha_inicio) AS dia,
        COUNT(*) AS total,
        SUM(urgencia) AS urgencias,
        SUM(estado = 'atendida') AS atendidas,
        SUM(estado = 'cancelada') AS canceladas,
        SUM(estado = 'no_asiste') AS no_asiste
      FROM cita
      WHERE fecha_inicio >= ? AND fecha_inicio < ?
      GROUP BY DATE(fecha_inicio)
      ORDER BY dia
      `,
            [from, to]
        );

        // 2) Resumen rápido del mes (totales)
        const [resumenCitas] = await pool.query(
            `
      SELECT
        COUNT(*) AS total,
        SUM(urgencia) AS urgencias,
        SUM(estado = 'atendida') AS atendidas,
        SUM(estado = 'cancelada') AS canceladas,
        SUM(estado = 'no_asiste') AS no_asiste
      FROM cita
      WHERE fecha_inicio >= ? AND fecha_inicio < ?
      `,
            [from, to]
        );

        // 3) Gráfico anual de citas (por mes)
        const [citasAnual] = await pool.query(
            `
      SELECT 
        DATE_FORMAT(fecha_inicio, '%Y-%m') AS mes,
        COUNT(*) AS total,
        SUM(urgencia) AS urgencias,
        SUM(estado = 'atendida') AS atendidas,
        SUM(estado = 'cancelada') AS canceladas,
        SUM(estado = 'no_asiste') AS no_asiste
      FROM cita
      WHERE YEAR(fecha_inicio) = ?
      GROUP BY DATE_FORMAT(fecha_inicio, '%Y-%m')
      ORDER BY mes
      `,
            [year]
        );

        // 4) Movimientos económicos del mes (todas las atenciones con monto_total)
        const [movimientos] = await pool.query(
            `
      SELECT fecha, tipo, SUM(monto_total) AS total
      FROM (
        SELECT fecha       AS fecha, 'consulta'        AS tipo, monto_total FROM consulta       WHERE fecha       >= ? AND fecha       < ?
        UNION ALL
        SELECT fecha       AS fecha, 'control'         AS tipo, monto_total FROM control        WHERE fecha       >= ? AND fecha       < ?
        UNION ALL
        SELECT fecha_ingreso AS fecha, 'hospitalizacion' AS tipo, monto_total FROM hospitalizacion WHERE fecha_ingreso >= ? AND fecha_ingreso < ?
        UNION ALL
        SELECT fecha       AS fecha, 'triaje'          AS tipo, monto_total FROM triaje         WHERE fecha       >= ? AND fecha       < ?
        UNION ALL
        SELECT fecha       AS fecha, 'vacuna'          AS tipo, monto_total FROM vacuna         WHERE fecha       >= ? AND fecha       < ?
        UNION ALL
        SELECT fecha       AS fecha, 'oftalmologia'    AS tipo, monto_total FROM oftalmologia   WHERE fecha       >= ? AND fecha       < ?
        UNION ALL
        SELECT fecha       AS fecha, 'profilaxis'      AS tipo, monto_total FROM profilaxis     WHERE fecha       >= ? AND fecha       < ?
        UNION ALL
        SELECT fecha       AS fecha, 'orden_examen'    AS tipo, monto_total FROM orden_examen   WHERE fecha       >= ? AND fecha       < ?
      ) t
      GROUP BY fecha, tipo
      ORDER BY fecha, tipo
      `,
            [
                from, to, // consulta
                from, to, // control
                from, to, // hospitalizacion
                from, to, // triaje
                from, to, // vacuna
                from, to, // oftalmologia
                from, to, // profilaxis
                from, to  // orden_examen
            ]
        );

        res.json({
            periodo: { year, month },
            resumenCitas: resumenCitas[0] || {
                total: 0, urgencias: 0, atendidas: 0,
                canceladas: 0, no_asiste: 0
            },
            citasPorDia,
            citasAnual,
            movimientos
        });
    } catch (err) {
        console.error('Error reporte mensual:', err);
        res.status(500).json({ error: 'Error al generar reporte mensual' });
    }
});

/** GET /api/reportes/mes/pdf?year=YYYY&month=MM  (descarga PDF) */
routerReportes.get('/mes/pdf', async (req, res) => {
    try {
        const now = new Date();
        const year = Number(req.query.year) || now.getFullYear();
        const month = Number(req.query.month) || (now.getMonth() + 1);
        const { from, to } = getMonthRange(year, month);
        const { dayStart, dayEnd, weekStart, weekEnd } = getDayAndWeekRanges(year, month);

        // ---------- 1) NÚMERO DE CITAS POR PERÍODO (MES) ----------
        const [[rowDia]] = await pool.query(
            'SELECT COUNT(*) AS total FROM cita WHERE fecha_inicio >= ? AND fecha_inicio < ?',
            [dayStart, dayEnd]
        );
        const [[rowSemana]] = await pool.query(
            'SELECT COUNT(*) AS total FROM cita WHERE fecha_inicio >= ? AND fecha_inicio < ?',
            [weekStart, weekEnd]
        );
        const [[rowMes]] = await pool.query(
            'SELECT COUNT(*) AS total FROM cita WHERE fecha_inicio >= ? AND fecha_inicio < ?',
            [from, to]
        );

        // ---------- 2) CITAS POR ESTADO (MES) ----------
        const [citasEstadoMes] = await pool.query(
            `
      SELECT estado, COUNT(*) AS total
      FROM cita
      WHERE fecha_inicio >= ? AND fecha_inicio < ?
      GROUP BY estado
      `,
            [from, to]
        );

        // ---------- 3) ATENCIONES POR TIPO (MES) ----------
        const [citasTipoMes] = await pool.query(
            `
      SELECT COALESCE(tipo,'(sin tipo)') AS tipo, COUNT(*) AS total
      FROM cita
      WHERE fecha_inicio >= ? AND fecha_inicio < ?
      GROUP BY tipo
      `,
            [from, to]
        );

        // ---------- 4) RAZAS / ESPECIE ATENDIDAS (MES) ----------
        const [razasMes] = await pool.query(
            `
      SELECT especie, COUNT(*) AS total
      FROM (
        SELECT m.especie
        FROM consulta c
        JOIN mascota m ON m.id = c.mascota_id
        WHERE c.fecha >= ? AND c.fecha < ?
        UNION ALL
        SELECT m.especie
        FROM control c
        JOIN mascota m ON m.id = c.mascota_id
        WHERE c.fecha >= ? AND c.fecha < ?
        UNION ALL
        SELECT m.especie
        FROM hospitalizacion h
        JOIN mascota m ON m.id = h.mascota_id
        WHERE h.fecha_ingreso >= ? AND h.fecha_ingreso < ?
        UNION ALL
        SELECT m.especie
        FROM triaje t
        JOIN mascota m ON m.id = t.mascota_id
        WHERE t.fecha >= ? AND t.fecha < ?
        UNION ALL
        SELECT m.especie
        FROM vacuna v
        JOIN mascota m ON m.id = v.mascota_id
        WHERE v.fecha >= ? AND v.fecha < ?
        UNION ALL
        SELECT m.especie
        FROM oftalmologia o
        JOIN mascota m ON m.id = o.mascota_id
        WHERE o.fecha >= ? AND o.fecha < ?
        UNION ALL
        SELECT m.especie
        FROM profilaxis p
        JOIN mascota m ON m.id = p.mascota_id
        WHERE p.fecha >= ? AND p.fecha < ?
        UNION ALL
        SELECT m.especie
        FROM orden_examen e
        JOIN mascota m ON m.id = e.mascota_id
        WHERE e.fecha >= ? AND e.fecha < ?
      ) t
      GROUP BY especie
      `,
            [from, to, from, to, from, to, from, to, from, to, from, to, from, to, from, to]
        );

        // ---------- 5) ATENCIONES POR VETERINARIO (MES) ----------
        const [vetMes] = await pool.query(
            `
      SELECT v.nombre, SUM(t.cant) AS total
      FROM (
        SELECT veterinario_id, COUNT(*) AS cant
        FROM consulta
        WHERE fecha >= ? AND fecha < ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM control
        WHERE fecha >= ? AND fecha < ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM hospitalizacion
        WHERE fecha_ingreso >= ? AND fecha_ingreso < ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM triaje
        WHERE fecha >= ? AND fecha < ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM vacuna
        WHERE fecha >= ? AND fecha < ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM oftalmologia
        WHERE fecha >= ? AND fecha < ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM profilaxis
        WHERE fecha >= ? AND fecha < ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM orden_examen
        WHERE fecha >= ? AND fecha < ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
      ) t
      JOIN veterinario v ON v.id = t.veterinario_id
      GROUP BY v.id, v.nombre
      ORDER BY total DESC
      `,
            [from, to, from, to, from, to, from, to, from, to, from, to, from, to, from, to]
        );

        // ---------- 6) BLOQUE ANUAL (AÑO ACTUAL) ----------

        const [[rowAnio]] = await pool.query(
            'SELECT COUNT(*) AS total FROM cita WHERE YEAR(fecha_inicio) = ?',
            [year]
        );

        const [citasEstadoAnio] = await pool.query(
            `
      SELECT estado, COUNT(*) AS total
      FROM cita
      WHERE YEAR(fecha_inicio) = ?
      GROUP BY estado
      `,
            [year]
        );

        const [citasTipoAnio] = await pool.query(
            `
      SELECT COALESCE(tipo,'(sin tipo)') AS tipo, COUNT(*) AS total
      FROM cita
      WHERE YEAR(fecha_inicio) = ?
      GROUP BY tipo
      `,
            [year]
        );

        const [razasAnio] = await pool.query(
            `
      SELECT especie, COUNT(*) AS total
      FROM (
        SELECT m.especie, c.fecha
        FROM consulta c
        JOIN mascota m ON m.id = c.mascota_id
        WHERE YEAR(c.fecha) = ?
        UNION ALL
        SELECT m.especie, c.fecha
        FROM control c
        JOIN mascota m ON m.id = c.mascota_id
        WHERE YEAR(c.fecha) = ?
        UNION ALL
        SELECT m.especie, h.fecha_ingreso
        FROM hospitalizacion h
        JOIN mascota m ON m.id = h.mascota_id
        WHERE YEAR(h.fecha_ingreso) = ?
        UNION ALL
        SELECT m.especie, t.fecha
        FROM triaje t
        JOIN mascota m ON m.id = t.mascota_id
        WHERE YEAR(t.fecha) = ?
        UNION ALL
        SELECT m.especie, v.fecha
        FROM vacuna v
        JOIN mascota m ON m.id = v.mascota_id
        WHERE YEAR(v.fecha) = ?
        UNION ALL
        SELECT m.especie, o.fecha
        FROM oftalmologia o
        JOIN mascota m ON m.id = o.mascota_id
        WHERE YEAR(o.fecha) = ?
        UNION ALL
        SELECT m.especie, p.fecha
        FROM profilaxis p
        JOIN mascota m ON m.id = p.mascota_id
        WHERE YEAR(p.fecha) = ?
        UNION ALL
        SELECT m.especie, e.fecha
        FROM orden_examen e
        JOIN mascota m ON m.id = e.mascota_id
        WHERE YEAR(e.fecha) = ?
      ) t
      GROUP BY especie
      `,
            [year, year, year, year, year, year, year, year]
        );

        const [vetAnio] = await pool.query(
            `
      SELECT v.nombre, SUM(t.cant) AS total
      FROM (
        SELECT veterinario_id, COUNT(*) AS cant
        FROM consulta
        WHERE YEAR(fecha) = ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM control
        WHERE YEAR(fecha) = ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM hospitalizacion
        WHERE YEAR(fecha_ingreso) = ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM triaje
        WHERE YEAR(fecha) = ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM vacuna
        WHERE YEAR(fecha) = ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM oftalmologia
        WHERE YEAR(fecha) = ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM profilaxis
        WHERE YEAR(fecha) = ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
        UNION ALL
        SELECT veterinario_id, COUNT(*) AS cant
        FROM orden_examen
        WHERE YEAR(fecha) = ? AND veterinario_id IS NOT NULL
        GROUP BY veterinario_id
      ) t
      JOIN veterinario v ON v.id = t.veterinario_id
      GROUP BY v.id, v.nombre
      ORDER BY total DESC
      `,
            [year, year, year, year, year, year, year, year]
        );

        // Citas atendidas por mes (para el gráfico anual)
        const [attendedByMonth] = await pool.query(
            `
      SELECT MONTH(fecha_inicio) AS mes, COUNT(*) AS total
      FROM cita
      WHERE YEAR(fecha_inicio) = ? AND estado = 'atendida'
      GROUP BY MONTH(fecha_inicio)
      ORDER BY mes
      `,
            [year]
        );

        const monthNames = [
            'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
            'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        const labelsAtendidas = monthNames;
        const dataAtendidas = monthNames.map((_, idx) => {
            const row = attendedByMonth.find(r => r.mes === idx + 1);
            return row ? Number(row.total) : 0;
        });

        // ---------- GENERAR PDF ----------
        const doc = new PDFDocument({ margin: 40, size: 'A4' });
        const fileName = `reporte-${year}-${String(month).padStart(2, '0')}.pdf`;

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

        doc.pipe(res);

        // ======== PÁGINA 1: RESUMEN MENSUAL ========
        drawHeader(doc, year, month);

        doc.fontSize(12).text('Resumen mensual', 60, 120, { underline: true });

        let y = 150;

        // Número de citas por período (día/semana/mes)
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Período', 'Cantidad de citas'],
            rows: [
                ['Día', rowDia?.total || 0],
                ['Semana', rowSemana?.total || 0],
                ['Mes', rowMes?.total || 0]
            ],
            colWidths: [200, 150]
        }) + 20;

        // Citas por estado
        const estadosDeseados = ['programada', 'confirmada', 'atendida', 'cancelada', 'no_asiste'];
        const mapEstadoMes = Object.fromEntries(citasEstadoMes.map(e => [e.estado, e.total]));
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Estado', 'Cantidad'],
            rows: estadosDeseados.map(e => [
                e,
                mapEstadoMes[e] || 0
            ]),
            colWidths: [200, 150]
        }) + 20;

        // Atenciones por tipo
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Tipo de atención', 'Cantidad'],
            rows: citasTipoMes.map(r => [r.tipo, r.total]),
            colWidths: [250, 150]
        }) + 20;

        // Razas / especie atendidas (perros / gatos)
        const mapRazaMes = Object.fromEntries(razasMes.map(r => [r.especie, r.total]));
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Especie', 'Cantidad de atenciones'],
            rows: [
                ['Perros', mapRazaMes['perro'] || 0],
                ['Gatos', mapRazaMes['gato'] || 0]
            ],
            colWidths: [200, 150]
        }) + 20;

        // Atenciones por veterinario (mes)
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Veterinario', 'Atenciones mes'],
            rows: vetMes.map(v => [v.nombre, v.total]),
            colWidths: [250, 150]
        });

        // ======== PÁGINA 2: RESUMEN ANUAL ========
        doc.addPage();
        drawHeader(doc, year, month);

        doc.fontSize(12).text(`Resumen anual ${year}`, 60, 120, { underline: true });

        y = 150;

        // Número de citas del año
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Período', 'Cantidad de citas'],
            rows: [['Año completo', rowAnio?.total || 0]],
            colWidths: [200, 150]
        }) + 20;

        // Citas por estado (año)
        const mapEstadoAnio = Object.fromEntries(citasEstadoAnio.map(e => [e.estado, e.total]));
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Estado', 'Cantidad (año)'],
            rows: estadosDeseados.map(e => [
                e,
                mapEstadoAnio[e] || 0
            ]),
            colWidths: [200, 180]
        }) + 20;

        // Atenciones por tipo (año)
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Tipo de atención', 'Cantidad (año)'],
            rows: citasTipoAnio.map(r => [r.tipo, r.total]),
            colWidths: [250, 150]
        }) + 20;

        // Razas / especie (año)
        const mapRazaAnio = Object.fromEntries(razasAnio.map(r => [r.especie, r.total]));
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Especie', 'Cantidad de atenciones (año)'],
            rows: [
                ['Perros', mapRazaAnio['perro'] || 0],
                ['Gatos', mapRazaAnio['gato'] || 0]
            ],
            colWidths: [230, 170]
        }) + 20;

        // Atenciones por veterinario (año)
        y = drawSimpleTable(doc, {
            x: 60,
            y,
            headers: ['Veterinario', 'Atenciones año'],
            rows: vetAnio.map(v => [v.nombre, v.total]),
            colWidths: [250, 150]
        });

        // ======== PÁGINA 3: GRÁFICO ANUAL DE CITAS ATENDIDAS ========
        doc.addPage();
        drawHeader(doc, year, month);

        drawBarChart(doc, {
            x: 60,
            y: 160,
            width: 480,
            height: 220,
            labels: labelsAtendidas,
            data: dataAtendidas,
            title: `Citas atendidas por mes (${year})`
        });

        doc.end();
    } catch (err) {
        console.error('Error reporte mensual PDF:', err);
        res.status(500).json({ error: 'Error al generar PDF de reporte mensual' });
    }
});
