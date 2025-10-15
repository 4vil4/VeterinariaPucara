export async function init({ root, API }) {
    const tblWrap = root.querySelector('#tblWrap');
    const detalle = root.querySelector('#detalle');

    const data = await fetchJSON(`${API}/api/mascotas`);
    tblWrap.innerHTML = buildMascotasTable(data, API);

    tblWrap.querySelectorAll('tr[data-id]').forEach(tr => {
        tr.addEventListener('click', async (e) => {
            if (e.target.closest('button')) return;
            const id = tr.getAttribute('data-id');
            const m = await fetchJSON(`${API}/api/mascotas/${id}`);
            detalle.innerHTML = renderPetCard(m);
        });
    });

    tblWrap.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const m = await fetchJSON(`${API}/api/mascotas/${id}`);
            showMascotaForm(root, API, 'Editar mascota', m, async (fd) => {
                await apiPutForm(`${API}/api/mascotas/${id}`, fd);
                await init({ root, API });
            });
        });
    });

    tblWrap.querySelectorAll('.btn-del').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (!confirm('¿Eliminar esta mascota?')) return;
            await apiDelete(`${API}/api/mascotas/${id}`);
            await init({ root, API });
        });
    });

    root.querySelector('#btnNuevaMascota').addEventListener('click', () => {
        showMascotaForm(root, API, 'Nueva mascota', null, async (fd) => {
            await apiPostForm(`${API}/api/mascotas`, fd);
            await init({ root, API });
        });
    });
}

/* ---------- UI ---------- */
function buildMascotasTable(rows, API) {
    const head = `
  <thead><tr>
    <th>Foto</th><th>Nombre</th><th>N° Historial</th><th>Especie</th>
    <th>Raza</th><th>Sexo</th><th>Propietario</th><th style="width:160px">Acciones</th>
  </tr></thead>`;
    const body = `
  <tbody>
    ${rows.map(r => {
        const thumb = `${API}/api/mascotas/${r.id}/foto?ts=${encodeURIComponent(r.updated_at || '')}`;
        return `
      <tr data-id="${r.id}">
        <td><img src="${thumb}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'"/></td>
        <td>${esc(r.nombre)}</td>
        <td>${esc(r.n_historial || '')}</td>
        <td>${esc(r.especie || '')}</td>
        <td>${esc(r.raza || '')}</td>
        <td>${esc(r.sexo || '')}</td>
        <td>${esc(r.propietario_nombre || '')}</td>
        <td>
          <div class="actions">
            <button class="btn-sm btn-outline btn-edit" data-id="${r.id}">Editar</button>
            <button class="btn-sm btn-outline btn-del" data-id="${r.id}">Eliminar</button>
          </div>
        </td>
      </tr>`;
    }).join('')}
  </tbody>`;
    return `<table class="tbl">${head}${body}</table>`;
}

function renderPetCard(m) {
    const foto = m.foto_url || '';
    const edadTxt = calcularEdad(m.fecha_nacimiento);
    return `
    <div class="card">
      <div class="pet-card">
        <img class="pet-photo" src="${foto || ''}" alt="Foto" onerror="this.style.display='none'"/>
        <div>
          <div class="pet-title">${esc(m.nombre)} <span class="badge">${esc(m.especie || '')}</span></div>
          <div class="kv"><b>N° Historia:</b> ${esc(m.n_historial || '—')}</div>
          <div class="kv"><b>Raza:</b> ${esc(m.raza || '—')}</div>
          <div class="kv"><b>Sexo:</b> ${esc(m.sexo || '—')}</div>
          <div class="kv"><b>Fecha de nacimiento:</b> ${esc(m.fecha_nacimiento || '—')}</div>
          <div class="kv"><b>Edad:</b> ${edadTxt || '—'}</div>
          <div class="kv"><b>Peso:</b> ${m.peso_kg != null ? m.peso_kg + ' kg' : '—'}</div>
        </div>
      </div>
    </div>`;
}

function showMascotaForm(root, API, title, m, onSubmit) {
    const v = m || {};
    const form = document.createElement('div');
    form.className = 'card';
    form.innerHTML = `
    <h3 style="margin-top:0">${title}</h3>
    <div class="form-grid">
      <div><label>Nombre</label><input class="input" id="f_nombre" value="${esc(v.nombre || '')}" /></div>
      <div><label>N° Historial</label><input class="input" id="f_hist" value="${esc(v.n_historial || '')}" /></div>
      <div><label>Especie</label><input class="input" id="f_especie" value="${esc(v.especie || '')}" placeholder="perro/gato" /></div>
      <div><label>Raza</label><input class="input" id="f_raza" value="${esc(v.raza || '')}" /></div>
      <div><label>Sexo</label><input class="input" id="f_sexo" value="${esc(v.sexo || '')}" placeholder="macho/hembra" /></div>
      <div><label>Fecha nacimiento</label><input class="input" id="f_fnac" type="date" value="${(v.fecha_nacimiento || '').slice(0, 10)}" /></div>
      <div><label>Peso (kg)</label><input class="input" id="f_peso" type="number" step="0.01" value="${v.peso_kg ?? ''}" /></div>

      <div>
        <label>Propietario</label>
        <div style="display:flex; gap:8px; align-items:center">
          <div style="flex:1">
            <input class="input" id="f_prop_search" placeholder="Buscar por nombre o RUT..." />
            <select class="input" id="f_prop_select" size="5" style="margin-top:6px;height:140px"></select>
          </div>
          <button class="btn btn-outline" type="button" id="btnNewOwner">Nuevo</button>
        </div>
        <small id="prop_hint" style="color:#64748b">Escribe para buscar. Selecciona un propietario.</small>
        <div id="newOwnerBox" style="display:none; margin-top:10px">
          <div class="form-grid">
            <div><label>Nombre*</label><input class="input" id="o_nombre"/></div>
            <div><label>RUT</label><input class="input" id="o_rut"/></div>
            <div><label>Correo</label><input class="input" id="o_correo" type="email"/></div>
            <div><label>Movil</label><input class="input" id="o_movil"/></div>
            <div style="grid-column:1 / -1"><label>Dirección</label><input class="input" id="o_direccion"/></div>
          </div>
          <div style="margin-top:8px; display:flex; gap:8px">
            <button class="btn btn-primary" id="o_guardar" type="button">Guardar propietario</button>
            <button class="btn btn-outline" id="o_cancelar" type="button">Cancelar</button>
          </div>
        </div>
      </div>

      <div style="grid-column:1 / -1">
        <label>Foto</label>
        <div style="display:flex; gap:12px; align-items:center">
          <img id="f_preview" class="pet-photo" alt="Preview"
               style="width:120px;height:120px;object-fit:cover;border-radius:12px;background:#e2e8f0;display:${v.foto_url ? 'block' : 'none'}"
               src="${v.foto_url || ''}"/>
          <input class="input" id="f_foto" type="file" accept="image/*" />
        </div>
        <small style="color:#64748b">Formatos permitidos: JPG, PNG, WebP (máx 5MB).</small>
      </div>
    </div>

    <div style="margin-top:14px; display:flex; gap:8px">
      <button class="btn btn-primary" id="f_guardar">Guardar</button>
      <button class="btn btn-outline" id="f_cancelar">Cancelar</button>
    </div>
  `;
    root.prepend(form);

    // Preview foto
    const fileInput = form.querySelector('#f_foto');
    const preview = form.querySelector('#f_preview');
    fileInput.addEventListener('change', () => {
        const f = fileInput.files?.[0];
        if (!f) return;
        const reader = new FileReader();
        reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
        reader.readAsDataURL(f);
    });

    // Selector propietario
    const propSearch = form.querySelector('#f_prop_search');
    const propSelect = form.querySelector('#f_prop_select');
    let propietariosCache = [];
    let selectedOwnerId = v.propietario_id ?? null;

    (async () => {
        await loadPropietarios('');
        renderPropOptions(propietariosCache, selectedOwnerId);
        if (selectedOwnerId) propSelect.value = String(selectedOwnerId);
    })();

    let tSearch;
    propSearch.addEventListener('input', () => {
        clearTimeout(tSearch);
        tSearch = setTimeout(async () => {
            await loadPropietarios(propSearch.value.trim());
            renderPropOptions(propietariosCache, null);
        }, 250);
    });
    propSelect.addEventListener('change', () => { selectedOwnerId = Number(propSelect.value) || null; });

    const box = form.querySelector('#newOwnerBox');
    form.querySelector('#btnNewOwner').onclick = () => { box.style.display = (box.style.display === 'none') ? 'block' : 'none'; };

    form.querySelector('#o_guardar').onclick = async () => {
        const payload = {
            nombre: form.querySelector('#o_nombre').value.trim(),
            rut: form.querySelector('#o_rut').value.trim(),
            correo: form.querySelector('#o_correo').value.trim(),
            movil: form.querySelector('#o_movil').value.trim(),
            direccion: form.querySelector('#o_direccion').value.trim(),
        };
        if (!payload.nombre) { alert('Nombre de propietario es obligatorio'); return; }
        const r = await apiPost(`${API}/api/propietarios`, payload);
        await loadPropietarios('');
        renderPropOptions(propietariosCache, r.id);
        selectedOwnerId = r.id;
        box.style.display = 'none';
        form.querySelector('#prop_hint').textContent = 'Propietario creado y seleccionado.';
    };
    form.querySelector('#o_cancelar').onclick = () => { box.style.display = 'none'; };

    async function loadPropietarios(search = '') {
        const url = `${API}/api/propietarios${search ? `?search=${encodeURIComponent(search)}` : ''}`;
        propietariosCache = await fetchJSON(url);
    }
    function renderPropOptions(list, selectId) {
        propSelect.innerHTML = list.map(p =>
            `<option value="${p.id}">${esc(p.nombre)}${p.rut ? ' — ' + esc(p.rut) : ''}${p.movil ? ' — ' + esc(p.movil) : ''}</option>`
        ).join('');
        if (selectId) propSelect.value = String(selectId);
    }

    // Guardar / Cancelar
    form.querySelector('#f_cancelar').onclick = () => form.remove();
    form.querySelector('#f_guardar').onclick = async () => {
        const payload = {
            nombre: val('#f_nombre', form),
            n_historial: val('#f_hist', form),
            especie: val('#f_especie', form),
            raza: val('#f_raza', form),
            sexo: val('#f_sexo', form),
            fecha_nacimiento: val('#f_fnac', form) || null,
            peso_kg: parseFloat(val('#f_peso', form)) || null,
            propietario_id: selectedOwnerId
        };
        if (!payload.nombre) { alert('Nombre es requerido'); return; }
        if (!payload.propietario_id) { alert('Selecciona o crea un propietario.'); return; }

        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => { if (v !== null && v !== undefined && v !== '') fd.append(k, v); });
        const f = fileInput.files?.[0];
        if (f) fd.append('foto', f);

        await onSubmit(fd);
        form.remove();
    };
}

/* ---------- helpers ---------- */
function val(sel, root = document) { return root.querySelector(sel).value?.trim(); }
function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function calcularEdad(iso) {
    if (!iso) return '';
    const d = new Date(iso); if (isNaN(d)) return '';
    const now = new Date();
    let y = now.getFullYear() - d.getFullYear();
    let m = now.getMonth() - d.getMonth();
    let day = now.getDate() - d.getDate();
    if (day < 0) m--;
    if (m < 0) { y--; m += 12; }
    const ys = y > 0 ? `${y} año${y > 1 ? 's' : ''}` : '';
    const ms = m > 0 ? `${m} mes${m > 1 ? 'es' : ''}` : '';
    return [ys, ms].filter(Boolean).join(' ');
}
async function fetchJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiPost(url, body) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiPostForm(url, fd) { const r = await fetch(url, { method: 'POST', body: fd }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiPutForm(url, fd) { const r = await fetch(url, { method: 'PUT', body: fd }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiDelete(url) { const r = await fetch(url, { method: 'DELETE' }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
