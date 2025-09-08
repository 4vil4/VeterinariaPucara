import * as Docs from '../models/documentos.model.js';
import { generatePdfFromView } from '../services/pdf.service.js';
import dayjs from 'dayjs';

// LISTA por mascota
export async function listByPet(req, res) {
  const petId = req.params.petId;
  const docs = await Docs.getDocsByPet(petId);

  // Normaliza/transforma datos para mostrar!!
  const docsParsed = docs.map(d => ({
    ...d,
    fecha_fmt: new Date(d.created_at).toLocaleString('es-CL'),
    datos: d.datos || {},
  }));

  // Construimos el HTML de filas en JS puro (sin EJS) OJO
  const rowsHtml = docsParsed.map(d => {
    // medicamentos como arreglo
    const medsArray = Array.isArray(d.datos?.medicamentos)
      ? d.datos.medicamentos
      : String(d.datos?.medicamentos || '')
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean);

    const medsHtml = medsArray.map(m => `<li>${m}</li>`).join('');

    const datosHtml = (d.tipo === 'receta')
      ? `
        <div><strong>Medicamentos:</strong></div>
        <ul style="margin:6px 0 8px 18px;">${medsHtml}</ul>
        <div><strong>Indicaciones:</strong></div>
        <div>${d.datos?.indicaciones || '-'}</div>
      `
      : `<pre>${JSON.stringify(d.datos, null, 2)}</pre>`;

    const pdfBtn = (d.tipo === 'receta')
      ? `<a class="btn btn--outline" href="/documentos/${petId}/receta/${d.id}/pdf">PDF</a>`
      : '';

    return `
      <tr>
        <td>${d.tipo}</td>
        <td>${d.fecha_fmt}</td>
        <td>${datosHtml}</td>
        <td>${pdfBtn}</td>
      </tr>
    `;
  }).join('');

  // Renderizamos pasando el pet_id
  res.render('documentos/list', { pet_id: petId, rowsHtml });
}

// FORM de nueva receta
export async function formReceta(req, res) {
  res.render('documentos/form_receta', { pet_id: req.params.petId });
}

// CREAR receta
export async function createReceta(req, res) {
  const { petId } = req.params;
  const { medicamentos, indicaciones } = req.body;

  const meds = String(medicamentos || '')
    .split('\n').map(s => s.trim()).filter(Boolean);

  const datos = { medicamentos: meds, indicaciones };
  await Docs.createDocumento({ pet_id: petId, tipo: 'receta', datos });
  res.redirect(`/documentos/${petId}`);
}

// EXPORTAR PDF de una receta
export async function exportRecetaPdf(req, res) {
  try {
    const { petId, docId } = req.params;
    const doc = await Docs.getDocById(docId);
    if (!doc || doc.tipo !== 'receta' || String(doc.pet_id) !== String(petId)) {
      return res.status(404).send('Receta no encontrada');
    }

    const pet = await Docs.getPetById(petId);
    const owner = await Docs.getOwnerByPetId(petId);

    const data = {
      title: 'Receta Médica',
      generadoEl: dayjs().format('DD/MM/YYYY HH:mm'),
      baseUrl: `${req.protocol}://${req.get('host')}`,
      receta: {
        id: doc.id,
        fecha: dayjs(doc.created_at).format('DD/MM/YYYY HH:mm'),
        medicamentos: Array.isArray(doc.datos?.medicamentos)
          ? doc.datos.medicamentos
          : String(doc.datos?.medicamentos || '').split('\n').filter(Boolean),
        indicaciones: doc.datos?.indicaciones || ''
      },
      pet: pet ? { id: pet.id, nombre: pet.name_pet, especie: pet.especie, raza: pet.raza } : null,
      owner: owner ? { nombre: owner.name, fono: owner.fono, email: owner.email } : null,
      clinica: { nombre: 'Clínica Veterinaria Pucará' }
    };

    const pdfBuffer = await generatePdfFromView(req.app, 'pdf/receta', data);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="receta_${doc.id}.pdf"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error exportando receta a PDF:', err);
    res.status(500).send('No fue posible generar el PDF.');
  }
}

// ====== LISTA por propietario ======
export async function listByOwner(req, res) {
  const ownerId = req.params.ownerId;
  const owner = await Docs.getOwnerById(ownerId);
  if (!owner) return res.status(404).send('Propietario no encontrado');

  const docs = await Docs.getDocsByOwner(ownerId);
  const recetas = docs.filter(d => d.tipo === 'receta');
  const presupuestos = docs.filter(d => d.tipo === 'presupuesto');

  res.render('documentos/list_owner', { owner, recetas, presupuestos });
}

// ====== FORM + CREAR presupuesto ======
export async function formPresupuesto(req, res) {
  res.render('documentos/form_presupuesto', {
    owner_id: req.params.ownerId,
    pet_id: req.query.pet_id || ''   // <-- importante
  });
}

export async function createPresupuesto(req, res) {
  const { ownerId } = req.params;
  const { pet_id, titulo, notas, item_desc = [], item_qty = [], item_price = [] } = req.body;

  const items = [].concat(item_desc).map((desc, i) => ({
    desc: desc,
    qty: Number([].concat(item_qty)[i] || 0),
    price: Number([].concat(item_price)[i] || 0)
  }));
  const subtotal = items.reduce((acc, it) => acc + it.qty * it.price, 0);

  const datos = { titulo, notas, items, subtotal };
  await Docs.createPresupuesto({ pet_id, datos });
  res.redirect(`/documentos/owner/${ownerId}`);
}

// ====== WhatsApp de cualquier doc ======
export async function wspDocumento(req, res) {
  const { ownerId, docId } = req.params;
  const owner = await Docs.getOwnerById(ownerId);
  const doc = await Docs.getDocById(docId);
  if (!owner || !doc) return res.redirect(`/documentos/owner/${ownerId}`);

  const to = String(owner.fono || '').replace(/\D/g, '');
  if (!to) return res.redirect(`/documentos/owner/${ownerId}`);

  const fechaTxt = new Date(doc.created_at).toLocaleString('es-CL');
  let msg = '';

  if (doc.tipo === 'receta') {
    const meds = Array.isArray(doc.datos?.medicamentos) ? doc.datos.medicamentos : [];
    msg = `Receta — Clínica Pucará
Fecha: ${fechaTxt}
Mascota: ${doc.name_pet || ''}
Medicamentos:
- ${meds.join('\n- ')}
Indicaciones: ${doc.datos?.indicaciones || '-'}`;
  } else if (doc.tipo === 'presupuesto') {
    const items = doc.datos?.items || [];
    const lines = items.map(it => `• ${it.desc}: ${it.qty} x $${it.price}`);
    const total = items.reduce((acc, it) => acc + it.qty * it.price, 0);
    msg = `Presupuesto — Clínica Pucará
Fecha: ${fechaTxt}
Mascota: ${doc.name_pet || ''}
${lines.join('\n')}
Total: $${total}`;
  }

  res.redirect(`/wsp/compose?to=${to}&msg=${encodeURIComponent(msg)}`);
}