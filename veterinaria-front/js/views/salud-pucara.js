export async function init({ root, API }) {
  const wrap = root.querySelector('#pucTableWrap');
  const search = root.querySelector('#pucSearch');
  const btnNew = root.querySelector('#pucNuevo');
  const mount = root.querySelector('#pucFormMount');
  let rows = [];

  const DEFAULT_RELATO = [
    'El paciente previamente identificado, se presentó en la clínica veterinaria señalando que el',
    'día 1 enero durante la tarde salió de paseo con arnés y correa y fue atacado en su parte',
    'posterior por una perra que andaba suelta. ese mismo día se llama a su veterinario de',
    'cabecera ya que Bill presentaba sangre en un miembro posterior (no lo pudieron llevar por',
    'motivo de fuerza mayor), a lo cual el profesional receta: <b>naxpet</b> (analgésico antiinflamatorio)',
    'y <b>rosstrum</b> (antibiótico) acorde a su peso y ritmo horario.',
    '',
    'El 4 enero Bill comienza a evidenciar cambios en su comportamiento, motivo por el cual fue',
    'llevado a una clínica veterinaria. tras la evaluación, se recomienda hospitalización para',
    'manejo del dolor, fluidoterapia y toma de exámenes, ya que en la <b>ecofast</b> de abdomen',
    'realizada se observó líquido libre, sospechando ruptura de vejiga, además, se toma',
    'exámenes de sangre y orina dejándose hospitalizado durante 24 hrs.',
    '',
    'Al día siguiente se realiza una ecografía abdominal en el cual se evidencia coagulo en vejiga',
    'y otras lesiones (estas últimas no atribuibles al trauma). se realiza tratamiento inyectable y',
    'se envía con receta a casa.',
    '',
    '<span style="text-transform:uppercase">Se extiende el presente certificado para ser presentado a los organismos pertinentes a petición del propietario.</span>'
  ].join('<br>');

  await load('');

  let t; search.addEventListener('input', () => {
    clearTimeout(t); t = setTimeout(() => load(search.value.trim()), 250);
  });
  btnNew.onclick = () => openForm();

  async function load(q) {
    rows = await jget(`${API}/api/certificados/salud-pucara${q ? `?search=${encodeURIComponent(q)}` : ''}`);
    render();
  }

  function render() {
    wrap.innerHTML = `
      <table class="tbl">
        <thead><tr><th>#</th><th>Fecha</th><th>Mascota</th><th>Propietario</th><th>Vet.</th><th style="width:260px">Acciones</th></tr></thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${r.id}</td>
              <td>${fmt(r.fecha_cert)}</td>
              <td>${esc(r.mas_nombre)}</td>
              <td>${esc(r.prop_nombre)}</td>
              <td>${esc(r.vet_nombre)}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-outline btn-sm btn-edit" data-act="edit" data-id="${r.id}">Editar</button>
                  <a class="btn btn-outline btn-sm btn-pdf" target="_blank" href="${API}/api/certificados/salud-pucara/${r.id}/pdf">PDF</a>
                  <a class="btn btn-wa btn-sm btn-WSP" target="_blank" href="https://wa.me/?text=${encodeURIComponent(`Le comparto su Certificado Pucará (ID ${r.id}). PDF: ${API}/api/certificados/salud-pucara/${r.id}/pdf`)}">WhatsApp</a>
                  <button class="btn btn-outline btn-sm btn-del" data-act="del" data-id="${r.id}">Eliminar</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
    wrap.querySelectorAll('[data-act=edit]').forEach(b => b.onclick = () => openForm(Number(b.dataset.id)));
    wrap.querySelectorAll('[data-act=del]').forEach(b => b.onclick = () => del(Number(b.dataset.id)));
  }

  async function del(id) {
    if (!confirm('¿Eliminar certificado?')) return;
    await jdel(`${API}/api/certificados/salud-pucara/${id}`);
    await load(search.value.trim());
  }

  async function openForm(id = null) {
    mount.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    mount.appendChild(card);

    const mascotas = await jget(`${API}/api/mascotas`);
    const propietarios = await jget(`${API}/api/propietarios`);
    const veterinarios = await jget(`${API}/api/personal?vets=1`).catch(() => []);

    const editing = id ? await jget(`${API}/api/certificados/salud-pucara/${id}`) : null;

    card.innerHTML = `
      <h3 style="margin-top:0">${id ? 'Editar' : 'Nuevo'} Certificado Salud Pucará</h3>
      <div class="form-grid">
        <div>
          <label>Mascota</label>
          <select class="input" id="m_sel">
            ${mascotas.map(m => `<option value="${m.id}">${esc(m.nombre)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Propietario</label>
          <select class="input" id="p_sel">
            ${propietarios.map(p => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Veterinario</label>
          <select class="input" id="v_sel">
            ${veterinarios.map(v => `<option value="${v.id}">${esc(v.nombre)}</option>`).join('')}
          </select>
        </div>
        <div>
          <label>Fecha</label>
          <input type="date" class="input" id="fecha_cert" value="${editing ? (editing.fecha_cert || '').slice(0, 10) : today()}">
        </div>

        <div class="full">
          <label>Relato/Texto </label>
          <div id="relEditor" class="input rich-editor" contenteditable="true"></div>
          <div class="small-note">Puedes usar <b>negrita</b> y saltos de línea. No verás &lt;p&gt; ni &lt;br&gt;.</div>
        </div>
      </div>

      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary btn-add" id="f_guardar">Guardar</button>
        <button class="btn btn-outline btn-del" id="f_cancelar">Cancelar</button>
      </div>
    `;

    const mSel = card.querySelector('#m_sel');
    const pSel = card.querySelector('#p_sel');
    const vSel = card.querySelector('#v_sel');

    let me = null;
    try {
      me = JSON.parse(localStorage.getItem('auth_user') || 'null');
    } catch {
      me = null;
    }

    card.querySelector('#relEditor').innerHTML = editing?.relato_html || DEFAULT_RELATO;

    if (editing) {
      mSel.value = String(editing.mascota_id);
      pSel.value = String(editing.propietario_id);
      vSel.value = String(editing.veterinario_id);
    } else {
      syncOwnerFromMascota();
      if (me && me.role === 'vet') {
        const vetMatch =
          veterinarios.find(v => me.veterinario_id && String(v.id) === String(me.veterinario_id)) ||
          veterinarios.find(v => me.nombre && v.nombre && v.nombre.toLowerCase() === me.nombre.toLowerCase());
        if (vetMatch) vSel.value = String(vetMatch.id);
      }
    }

    mSel.addEventListener('change', syncOwnerFromMascota);


    function syncOwnerFromMascota() {
      const mid = Number(mSel.value);
      const m = mascotas.find(x => Number(x.id) === mid);
      if (m && m.propietario_id) {
        pSel.value = String(m.propietario_id);
      }
    }

    card.querySelector('#f_cancelar').onclick = () => card.remove();
    card.querySelector('#f_guardar').onclick = async () => {
      const payload = {
        mascota_id: Number(mSel.value),
        propietario_id: Number(pSel.value),
        veterinario_id: Number(vSel.value),
        fecha_cert: card.querySelector('#fecha_cert').value || today(),
        relato_html: card.querySelector('#relEditor').innerHTML.trim()
      };
      if (id) await jput(`${API}/api/certificados/salud-pucara/${id}`, payload);
      else await jpost(`${API}/api/certificados/salud-pucara`, payload);
      card.remove();
      await load(search.value.trim());
    };
  }


  // helpers
  function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function fmt(iso) { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('es-CL'); }
  function today() { return new Date().toISOString().slice(0, 10); }
  async function jget(u) { const r = await fetch(u); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  async function jpost(u, b) { const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  async function jput(u, b) { const r = await fetch(u, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
  async function jdel(u) { const r = await fetch(u, { method: 'DELETE' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
}
