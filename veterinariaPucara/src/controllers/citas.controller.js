import * as Citas from '../models/citas.model.js';
import { generatePdfFromView } from '../services/pdf.service.js';
import dayjs from 'dayjs';

export async function list(req, res) {
    const ok = req.query.ok === '1';
    const citas = await Citas.getCitas();
    res.render('citas/list', { citas, ok });
}

export async function formNew(req, res) {
    const config = await Citas.getSlotsConfig();
    res.render('citas/form', { config });
}

export async function create(req, res) {
    const { fecha, tipo, observaciones, urgencia } = req.body;

    const pet_ids = [...new Set((req.body.pet_ids || '')
        .split(',').map(x => x.trim()).filter(Boolean).map(Number))];

    if (!pet_ids.length) {
        return res.status(400).send('Debes seleccionar al menos una mascota.');
    }

    const citaId = await Citas.createCita({
        fecha,
        tipo,
        observaciones,
        urgencia: !!urgencia,
        pet_ids
    });

    // Construir mensaje
    const fechaTxt = new Date(fecha).toLocaleString('es-CL');
    const pets = await Citas.getPetsByCita(citaId);
    const mascotas = pets.map(p => p.name_pet).join(', ') || '-';
    const tipoTxt = tipo || 'consulta';
    const obsTxt = observaciones || '-';

    const msg = `Confirmación de cita — Clínica Pucará
Fecha: ${fechaTxt}
Tipo: ${tipoTxt}
Mascota(s): ${mascotas}
Obs: ${obsTxt}`;

    // Teléfono del dueño
    const ownerPhones = await Citas.getOwnerPhonesByPetIds(pet_ids);
    const to = String(ownerPhones?.[0] || '').replace(/\D/g, '');

    // Si no hay teléfono, volver directo con OK
    if (!to) {
        return res.redirect('/citas?ok=1');
    }

    // Mostrar pantalla de confirmación 
    return res.render('citas/confirm-wsp', {
        to,
        msg
    });
}

export async function whatsappByCita(req, res) {
    const id = Number(req.params.id);
    const cita = await Citas.getCitaById(id);
    if (!cita) return res.status(404).send('Cita no encontrada');

    const pets = await Citas.getPetsByCita(id);
    const petIds = pets.map(p => p.id);
    const mascotas = pets.map(p => p.name_pet).join(', ') || '-';

    const ownerPhones = petIds.length
        ? await Citas.getOwnerPhonesByPetIds(petIds)
        : [];
    const to = String(ownerPhones?.[0] || '').replace(/\D/g, '');
    if (!to) return res.redirect('/citas');

    const fechaTxt = new Date(cita.fecha).toLocaleString('es-CL');
    const tipoTxt = cita.tipo || 'consulta';
    const obsTxt = cita.observaciones || '-';

    const msg = `Confirmación de cita — Clínica Pucará
Fecha: ${fechaTxt}
Tipo: ${tipoTxt}
Mascota(s): ${mascotas}
Obs: ${obsTxt}`;

    return res.redirect(`/wsp/compose?to=${to}&msg=${encodeURIComponent(msg)}`);
}

export const exportCitaPdf = async (req, res) => {
    try {
        const id = Number(req.params.id);
        const cita = await Citas.getCitaById(id);
        if (!cita) return res.status(404).send('Cita no encontrada');

        const pets = await Citas.getPetsByCita(id);
        const mascotas = pets.map(p => p.name_pet).join(', ') || '-';

        const data = {
            title: 'Detalle de Cita',
            generadoEl: dayjs().format('DD/MM/YYYY HH:mm'),
            baseUrl: `${req.protocol}://${req.get('host')}`,
            cita: {
                ...cita,
                fecha_fmt: cita.fecha ? dayjs(cita.fecha).format('DD/MM/YYYY HH:mm') : '',
                mascotas
            }
        };

        const pdfBuffer = await generatePdfFromView(req.app, 'pdf/cita', data);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="cita_${id}.pdf"`);
        res.send(pdfBuffer);
    } catch (err) {
        console.error('Error al exportar PDF de cita:', err);
        res.status(500).send('No fue posible generar el PDF.');
    }
};
