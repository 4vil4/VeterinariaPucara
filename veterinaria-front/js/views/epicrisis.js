export async function init({ root, API, authHeaders }) {
  const wrap = root.querySelector('#epiTableWrap');
  const search = root.querySelector('#epiSearch');
  const btnNew = root.querySelector('#epiNuevo');
  const mount = root.querySelector('#epiFormMount');
  let rows = [];

  await load('');

  let t; search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => load(search.value.trim()), 250);
  });
  btnNew.onclick = () => openForm();

  async function load(q) {
    rows = await jget(`${API}/api/certificados/epicrisis${q ? `?search=${encodeURIComponent(q)}` : ''}`);
    render();
  }

  function render() {
    wrap.innerHTML = `
      <table class="tbl">
        <thead>
          <tr>
            <th>Mascota</th><th>Propietario</th><th>Ingreso</th><th>Egreso</th><th>Vet.</th>
            <th style="width:280px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${esc(r.mas_nombre)}</td>
              <td>${esc(r.prop_nombre)}</td>
              <td>${fmt(r.fecha_ingreso)}</td>
              <td>${fmt(r.fecha_egreso)}</td>
              <td>${esc(r.vet_nombre)}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-outline btn-sm" data-act="edit" data-id="${r.id}">Editar</button>
                  <a class="btn btn-outline btn-sm" target="_blank" href="${API}/api/certificados/epicrisis/${r.id}/pdf">PDF</a>
                  <a class="btn btn-wa btn-sm" target="_blank" href="https://wa.me/?text=${encodeURIComponent(`Le comparto su Certificado Epicrisis (ID ${r.id}). PDF: ${API}/api/certificados/epicrisis/${r.id}/pdf`)}">WhatsApp</a>
                  <button class="btn btn-outline btn-sm" data-act="del" data-id="${r.id}">Eliminar</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    wrap.querySelectorAll('[data-act=edit]').forEach(b => b.onclick = () => openForm(Number(b.dataset.id)));
    wrap.querySelectorAll('[data-act=del]').forEach(b => b.onclick = () => del(Number(b.dataset.id)));
  }

  async function del(id) {
    if (!confirm('¿Eliminar certificado?')) return;
    await jdel(`${API}/api/certificados/epicrisis/${id}`);
    await load(search.value.trim());
  }

  // ----- crear/editar -----
  async function openForm(editId = null) {
    mount.innerHTML = '';
    const card = document.createElement('div');
    card.className = 'card';
    mount.appendChild(card);

    const mascotas = await jget(`${API}/api/mascotas`);
    const propietarios = await jget(`${API}/api/propietarios`);
    // usa el mismo endpoint que Salud Pucará para listar veterinarios
    const veterinarios = await jget(`${API}/api/personal?vets=1`).catch(() => []);

    // si es edición, trae la fila completa
    const editing = editId ? await jget(`${API}/api/certificados/epicrisis/${editId}`) : null;

    card.innerHTML = `
      <h3 style="margin-top:0">${editing ? 'Editar' : 'Nuevo'} Certificado Epicrisis</h3>
      <div class="form-grid">
        <div><label>Mascota</label>
          <select class="input" id="m_sel">
            ${mascotas.map(m => `<option value="${m.id}" data-prop="${m.propietario_id}">${esc(m.nombre)}</option>`).join('')}
          </select>
        </div>
        <div><label>Propietario</label>
          <select class="input" id="p_sel">
            ${propietarios.map(p => `<option value="${p.id}">${esc(p.nombre)}</option>`).join('')}
          </select>
        </div>
        <div><label>Veterinario</label>
          <select class="input" id="v_sel">
            ${veterinarios.map(v => `<option value="${v.id}">${esc(v.nombre)}</option>`).join('')}
          </select>
        </div>

        <div><label>Fecha ingreso</label><input type="date" class="input" id="f_ing"></div>
        <div><label>Fecha egreso</label><input type="date" class="input" id="f_egr"></div>

        <div class="full"><label>Síntomas y signos de ingreso</label><textarea id="f_sint" class="input" rows="3"></textarea></div>
        <div class="full"><label>Diagnóstico de ingreso</label><textarea id="f_din" class="input" rows="2"></textarea></div>
        <div class="full"><label>Diagnóstico de egreso</label><textarea id="f_deg" class="input" rows="2"></textarea></div>

        <div><label>Causa de egreso</label>
          <select id="f_causa" class="input">
            <option value="">—</option>
            <option value="alta_medica">Alta médica</option>
            <option value="alta_relativa">Alta relativa</option>
            <option value="alta_solicitada">Alta solicitada</option>
          </select>
        </div>

        <div class="full"><label>Exámenes complementarios</label><textarea id="f_exam" class="input" rows="2"></textarea></div>
        <div class="full"><label>Tratamiento realizado</label><textarea id="f_trr" class="input" rows="2"></textarea></div>
        <div class="full"><label>Tratamiento a seguir</label><textarea id="f_trs" class="input" rows="2"></textarea></div>
        <div class="full"><label>Recomendaciones</label><textarea id="f_reco" class="input" rows="2"></textarea></div>
      </div>

      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary" id="f_guardar">${editing ? 'Actualizar' : 'Guardar'}</button>
        <button class="btn btn-outline" id="f_cancelar">Cancelar</button>
      </div>
    `;

    const mSel = card.querySelector('#m_sel');
    const pSel = card.querySelector('#p_sel');
    const vSel = card.querySelector('#v_sel');

    // preselect (edición) o sincroniza propietario al cambiar mascota
    const setOwner = () => {
      const opt = mSel.selectedOptions[0];
      const pid = opt ? Number(opt.getAttribute('data-prop')) : null;
      if (pid) pSel.value = String(pid);
    };
    if (editing) {
      mSel.value = String(editing.mascota_id);
      pSel.value = String(editing.propietario_id);
      vSel.value = String(editing.veterinario_id);
      card.querySelector('#f_ing').value = (editing.fecha_ingreso || '').slice(0, 10);
      card.querySelector('#f_egr').value = (editing.fecha_egreso || '').slice(0, 10);
      card.querySelector('#f_sint').value = editing.sintomas || '';
      card.querySelector('#f_din').value = editing.diagnostico_ingreso || '';
      card.querySelector('#f_deg').value = editing.diagnostico_egreso || '';
      card.querySelector('#f_causa').value = editing.causa_egreso || '';
      card.querySelector('#f_exam').value = editing.examenes || '';
      card.querySelector('#f_trr').value = editing.tratamiento_realizado || '';
      card.querySelector('#f_trs').value = editing.tratamiento_seguir || '';
      card.querySelector('#f_reco').value = editing.recomendaciones || '';
    } else {
      setOwner();
    }
    mSel.addEventListener('change', setOwner);

    card.querySelector('#f_cancelar').onclick = () => card.remove();
    card.querySelector('#f_guardar').onclick = async () => {
      const payload = {
        mascota_id: Number(mSel.value),
        propietario_id: Number(pSel.value),
        veterinario_id: Number(vSel.value),
        fecha_ingreso: card.querySelector('#f_ing').value,
        fecha_egreso: card.querySelector('#f_egr').value,
        sintomas: card.querySelector('#f_sint').value.trim(),
        diagnostico_ingreso: card.querySelector('#f_din').value.trim(),
        diagnostico_egreso: card.querySelector('#f_deg').value.trim(),
        causa_egreso: card.querySelector('#f_causa').value || null,
        examenes: card.querySelector('#f_exam').value.trim(),
        tratamiento_realizado: card.querySelector('#f_trr').value.trim(),
        tratamiento_seguir: card.querySelector('#f_trs').value.trim(),
        recomendaciones: card.querySelector('#f_reco').value.trim()
      };
      if (!payload.fecha_ingreso || !payload.fecha_egreso) { alert('Faltan fechas'); return; }

      if (editing) {
        await jput(`${API}/api/certificados/epicrisis/${editId}`, payload);
      } else {
        await jpost(`${API}/api/certificados/epicrisis`, payload);
      }
      card.remove();
      await load(search.value.trim());
    };
  }

  function getAuthHeaders() {
    return authHeaders ? authHeaders() : {};
  }

  // helpers
  function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function fmt(iso) { return iso ? new Date(iso).toLocaleDateString('es-CL') : ''; }
  async function jget(u) {
    const r = await fetch(u, { headers: getAuthHeaders() });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  async function jpost(u, b) {
    const r = await fetch(u, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(b),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  async function jput(u, b) {
    const r = await fetch(u, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(b),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }
  async function jdel(u) {
    const r = await fetch(u, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r.json();
  }

}
