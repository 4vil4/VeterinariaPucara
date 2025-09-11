import * as Docs from '../models/documentos.model.js';
import { generatePdfFromView } from '../services/pdf.service.js';
import dayjs from 'dayjs';

// ===== LISTA por mascota (cards) =====
export async function listByPet(req, res) {
  const petId = req.params.petId;
  const docs = await Docs.getDocsByPet(petId);

  const docsParsed = docs.map(d => ({
    ...d,
    fecha_fmt: new Date(d.created_at).toLocaleString('es-CL'),
    datos: d.datos || {},
  }));

  const cardsHtml = docsParsed.map(d => {
    const actionsHtml = (d.tipo === 'receta')
      ? `<a class="btn btn--outline" href="/documentos/${petId}/receta/${d.id}/pdf">PDF</a>`
      : '';

    let contentHtml = '';

    if (d.tipo === 'receta') {
      const medsArray = Array.isArray(d.datos?.medicamentos)
        ? d.datos.medicamentos
        : String(d.datos?.medicamentos || '').split('\n').map(s => s.trim()).filter(Boolean);

      const medsLis = medsArray.length
        ? medsArray.map(m => `<li>${m}</li>`).join('')
        : '<li>-</li>';

      contentHtml = `
        <div>
          <div><strong>Medicamentos:</strong></div>
          <ul style="margin:.25rem 0 .5rem 1rem;">${medsLis}</ul>
          <div><strong>Indicaciones:</strong></div>
          <div>${d.datos?.indicaciones || '-'}</div>
        </div>
      `;
    } else if (d.tipo === 'presupuesto') {
      const items = Array.isArray(d.datos?.items) ? d.datos.items : [];
      const filas = items.map(it => {
        const qty = Number(it.qty || 0);
        const price = Number(it.price || 0);
        const sub = qty * price;
        return `
          <tr>
            <td>${it.desc || '-'}</td>
            <td>${qty}</td>
            <td>$${price}</td>
            <td>$${sub}</td>
          </tr>
        `;
      }).join('');
      const total = items.reduce((acc, it) => acc + (Number(it.qty || 0) * Number(it.price || 0)), 0);

      contentHtml = `
        <div class="mb-2"><strong>Título:</strong> ${d.datos?.titulo || '-'}</div>
        <div class="mb-2"><strong>Notas:</strong> ${d.datos?.notas || '-'}</div>
        <div class="mb-2"><strong>Ítems:</strong></div>
        <div class="border rounded p-2">
          ${items.length ? `
            <table class="tbl" style="width:100%">
              <thead>
                <tr>
                  <th>Desc</th>
                  <th style="width:90px">Cant.</th>
                  <th style="width:110px">Precio</th>
                  <th style="width:110px">Subtotal</th>
                </tr>
              </thead>
              <tbody>${filas}</tbody>
            </table>
            <div class="d-flex justify-content-between mt-2">
              <strong>Total</strong>
              <strong>$${total}</strong>
            </div>
          ` : `<div class="text-muted">Sin ítems</div>`}
        </div>
      `;
    } else {
      contentHtml = `<div class="text-muted">Datos disponibles</div>`;
    }

    return `
      <div class="card shadow-sm mt-3">
        <div class="card-body">
          <div class="d-flex align-items-center justify-content-between mb-2">
            <div>
              <div><strong>${d.tipo}</strong></div>
              <div class="text-muted" style="font-size:.9rem">${d.fecha_fmt}</div>
            </div>
            <div class="d-flex gap-2">${actionsHtml}</div>
          </div>
          ${contentHtml}
        </div>
      </div>
    `;
  }).join('');

  res.render('documentos/list', { pet_id: petId, cardsHtml });
}

// ===== LISTA por propietario (tablas) =====
export async function listByOwner(req, res) {
  const ownerId = req.params.ownerId;
  const owner = await Docs.getOwnerById(ownerId);
  if (!owner) return res.status(404).send('Propietario no encontrado');

  const docs = await Docs.getDocsByOwner(ownerId);
  const recetas = docs.filter(d => d.tipo === 'receta');
  const presupuestos = docs.filter(d => d.tipo === 'presupuesto');

  res.render('documentos/list_owner', { owner, recetas, presupuestos });
}

// ===== FORM & CREATE Receta =====
export async function formReceta(req, res) {
  res.render('documentos/form_receta', { pet_id: req.params.petId });
}
export async function createReceta(req, res) {
  const { petId } = req.params;
  const { medicamentos, indicaciones } = req.body;

  const meds = String(medicamentos || '').split('\n').map(s => s.trim()).filter(Boolean);
  const datos = { medicamentos: meds, indicaciones };

  await Docs.createDocumento({ pet_id: petId, tipo: 'receta', datos });
  res.redirect(`/documentos/${petId}`);
}

// ===== PDF Receta =====
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

// ===== CREATE Presupuesto =====
export async function formPresupuesto(req, res) {
  res.render('documentos/form_presupuesto', {
    owner_id: req.params.ownerId,
    pet_id: req.query.pet_id || ''
  });
}
export async function createPresupuesto(req, res) {
  const { ownerId } = req.params;
  const { pet_id, titulo, notas, item_desc = [], item_qty = [], item_price = [] } = req.body;

  const items = [].concat(item_desc).map((desc, i) => ({
    desc,
    qty: Number([].concat(item_qty)[i] || 0),
    price: Number([].concat(item_price)[i] || 0)
  }));
  const subtotal = items.reduce((acc, it) => acc + it.qty * it.price, 0);
  const datos = { titulo, notas, items, subtotal };

  await Docs.createPresupuesto({ pet_id, datos });
  res.redirect(`/documentos/owner/${ownerId}`);
}

// ===== WhatsApp genérico (receta/presupuesto) =====
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
