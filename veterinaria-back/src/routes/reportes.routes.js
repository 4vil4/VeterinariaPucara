// routes/reportes.routes.js
import express from 'express';
import PDFDocument from 'pdfkit';
import pool from '../db.js';

export const routerReportes = express.Router();

/** Helper: rango de fechas del mes */
function getMonthRange(year, month) {
  // month: 1-12
  const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
  const to = new Date(Date.UTC(year, month, 1, 0, 0, 0)); // primer día del mes siguiente
  return {
    from: from.toISOString().slice(0, 19).replace('T', ' '),
    to: to.toISOString().slice(0, 19).replace('T', ' ')
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

    // Reutilizamos consultas básicas
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
        from, to,
        from, to,
        from, to,
        from, to,
        from, to,
        from, to,
        from, to,
        from, to
      ]
    );

    // Config PDF
    const doc = new PDFDocument({ margin: 40 });
    const fileName = `reporte-${year}-${String(month).padStart(2, '0')}.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);

    doc.pipe(res);

    // --- Contenido del PDF ---
    doc.fontSize(18).text('Clínica Veterinaria Pucará', { align: 'center' });
    doc.moveDown(0.5);
    doc.fontSize(14).text(`Informe mensual ${String(month).padStart(2, '0')}/${year}`, { align: 'center' });

    doc.moveDown(1);

    const r = resumenCitas[0] || {};
    doc.fontSize(12).text('Resumen de citas del mes:', { underline: true });
    doc.moveDown(0.5);
    doc.text(`Total de citas: ${r.total || 0}`);
    doc.text(`Citas urgentes: ${r.urgencias || 0}`);
    doc.text(`Atendidas: ${r.atendidas || 0}`);
    doc.text(`Canceladas: ${r.canceladas || 0}`);
    doc.text(`No asiste: ${r.no_asiste || 0}`);

    doc.moveDown(1);
    doc.fontSize(12).text('Movimientos económicos (por día y tipo):', { underline: true });
    doc.moveDown(0.5);

    movimientos.forEach(m => {
      const fechaStr = new Date(m.fecha).toLocaleDateString('es-CL');
      doc.text(`${fechaStr} - ${m.tipo}: $${Number(m.total).toFixed(0)}`);
    });

    // Aquí podrías agregar más secciones (anual, urgencias por día, etc.)

    doc.end();
  } catch (err) {
    console.error('Error reporte mensual PDF:', err);
    res.status(500).json({ error: 'Error al generar PDF de reporte mensual' });
  }
});

