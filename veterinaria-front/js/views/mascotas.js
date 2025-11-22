export async function init({ root, API, params = {} }) {
  const tblWrap = root.querySelector('#tblWrap');
  const detalle = root.querySelector('#detalle');

  const isClient = !!params.client;
  const listUrl = isClient
    ? `${API}/api/mascotas/mias`
    : `${API}/api/mascotas`;

  const data = await fetchJSON(listUrl);
  tblWrap.innerHTML = buildMascotasTable(data, API);

  let nextHist = 1000;
  if (Array.isArray(data) && data.length) {
    const maxHist = data.reduce((max, r) => {
      const n = parseInt(r.n_historial, 10);
      return Number.isNaN(n) ? max : Math.max(max, n);
    }, 999);
    nextHist = maxHist < 1000 ? 1000 : maxHist + 1;
  }

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
      showMascotaForm(
        root,
        API,
        'Editar mascota',
        m,
        async (fd) => {
          await apiPutForm(`${API}/api/mascotas/${id}`, fd);
          await init({ root, API, params }); 
        },
        { client: isClient }  
      );
    });
  });

  tblWrap.querySelectorAll('.btn-del').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = btn.dataset.id;
      if (!confirm('¿Eliminar esta mascota?')) return;
      await apiDelete(`${API}/api/mascotas/${id}`);
      await init({ root, API, params });
    });
  });

  tblWrap.querySelectorAll('.btn-hist').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.id);
      const nombre = btn.dataset.nombre || 'Mascota';

      let items = [];
      try {
        const res = await fetch(`${API}/api/mascotas/${id}/historial`);
        if (res.ok) items = await res.json();
      } catch (_) { }

      if (!items || !items.length) {
        try {
          const resR = await fetch(`${API}/api/recetas?mascota_id=${id}`);
          if (resR.ok) {
            const recetas = await resR.json();
            items = (recetas || []).map(r => ({
              tipo: 'Receta',
              fecha: r.fecha || r.created_at,
              resumen: r.diagnostico || r.medicamentos || r.indicaciones || '',
            }));
          }
        } catch (_) { }
      }

      items.sort((a, b) => new Date(b.fecha || b.created_at || 0) - new Date(a.fecha || a.created_at || 0));
      detalle.innerHTML = renderHistorial(nombre, items);
      bindHistClicks(detalle, API);
      detalle.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  root.querySelector('#btnNuevaMascota').addEventListener('click', () => {
    showMascotaForm(
      root,
      API,
      'Nueva mascota',
      null,
      async (fd) => {
        const postUrl = isClient
          ? `${API}/api/mascotas/mias`
          : `${API}/api/mascotas`;
        await apiPostForm(postUrl, fd);
        await init({ root, API, params });
      },
      { client: isClient, nextHist }
    );
  });
}


/* ---------- UI ---------- */
function buildMascotasTable(rows, API) {
  const head = `
  <thead><tr>
    <th>Foto</th><th>Nombre</th><th>N° Historial</th><th>Especie</th>
    <th>Raza</th><th>Sexo</th><th>Propietario</th><th style="width:220px">Acciones</th>
  </tr></thead>`;
  const body = `
    <tbody>
      ${rows.map(r => {
        const thumb = `${API}/api/mascotas/${r.id}/foto?ts=${encodeURIComponent(r.updated_at || '')}`;
        return `
          <tr data-id="${r.id}">
            <td data-label="Foto">
              <img src="${thumb}" alt="" style="width:40px;height:40px;object-fit:cover;border-radius:8px" onerror="this.style.display='none'"/>
            </td>
            <td data-label="Nombre">${esc(r.nombre)}</td>
            <td data-label="N° Historial">${esc(r.n_historial || '')}</td>
            <td data-label="Especie">${esc(r.especie || '')}</td>
            <td data-label="Raza">${esc(r.raza || '')}</td>
            <td data-label="Sexo">${esc(r.sexo || '')}</td>
            <td data-label="Propietario">${esc(r.propietario_nombre || '')}</td>
            <td data-label="Acciones">
              <div class="actions">
                <button class="btn-hist" data-id="${r.id}" data-nombre="${esc(r.nombre)}">Historial</button>
                <button class="btn-edit" data-id="${r.id}">Editar</button>
                <button class="btn-del" data-id="${r.id}">Eliminar</button>
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
  const esterTxt = (m.esterilizado === 1 || m.esterilizado === '1') ? 'Sí' :
    (m.esterilizado === 0 || m.esterilizado === '0') ? 'No' : '—';
  return `
    <div class="card">
      <div class="pet-card">
        <img class="pet-photo" src="${foto || ''}" alt="Foto" onerror="this.style.display='none'"/>
        <div>
          <div class="pet-title">${esc(m.nombre)} <span class="badge">${esc(m.especie || '')}</span></div>
          <div class="kv"><b>N° Historia:</b> ${esc(m.n_historial || '—')}</div>
          <div class="kv"><b>Raza:</b> ${esc(m.raza || '—')}</div>
          <div class="kv"><b>Sexo:</b> ${esc(m.sexo || '—')}</div>
          <div class="kv"><b>Esterilizado:</b> ${esterTxt}</div>
          <div class="kv"><b>N° microchip:</b> ${esc(m.nro_microchip || '—')}</div>
          <div class="kv"><b>Fecha de nacimiento:</b> ${esc(m.fecha_nacimiento || '—')}</div>
          <div class="kv"><b>Edad:</b> ${edadTxt || '—'}</div>
          <div class="kv"><b>Peso:</b> ${m.peso_kg != null ? m.peso_kg + ' kg' : '—'}</div>
        </div>
      </div>
    </div>`;
}

function renderHistorial(nombreMascota, items) {
  const fmt = s => s ? new Date(s).toLocaleString() : '';
  const escTxt = s => (s ?? '').toString().replace(/\s+/g, ' ').trim();

  if (!items.length) {
    return `
      <div class="card">
        <h3 style="margin:0 0 8px 0">Historial de ${esc(nombreMascota)}</h3>
        <p class="muted">No hay registros para esta mascota.</p>
      </div>`;
  }

  const rows = items.map(it => {
    const tipo = (it.tipo || it.category || it.clase || 'Registro').toString();
    const fecha = fmt(it.fecha || it.created_at);
    const resumen = escTxt(it.resumen || it.diagnostico || it.descripcion || it.indicaciones || it.motivo || it.medicamentos || '');
    
    return `
      <li class="hist-item hist-click" data-tipo="${esc(tipo)}" data-id="${it.id}">
        <div class="hist-dot"></div>
        <div class="hist-body">
          <div class="hist-top">
            <span class="hist-badge">${esc(tipo)}</span>
            <span class="hist-date">${esc(fecha)}</span>
          </div>
          ${resumen ? `<div class="hist-txt">${esc(resumen)}</div>` : ''}
          <div class="hint" style="margin-top:4px">Click para ver detalle</div>
        </div>
      </li>`;
  }).join('');

  return `
    <div class="card" id="histCard">
      <h3 style="margin:0 0 8px 0">Historial de ${esc(nombreMascota)}</h3>
      <ul class="hist-list">${rows}</ul>
    </div>`;
}


function showMascotaForm(root, API, title, m, onSubmit, opts = {}) {
  const oldForm = root.querySelector('.mascota-form');
  if (oldForm) oldForm.remove();

  const v = m || {};
  const isClient = !!opts.client; 
  const isNew = !v.id; 
  const initialHist = v.n_historial || (opts.nextHist ?? '');

  const form = document.createElement('div');
  form.className = 'card mascota-form';

  const ownerSection = isClient
    ? `
      <div>
        <label>Propietario</label>
        <p class="muted">Se usarán automáticamente tus datos como propietario.</p>
      </div>`
    : `
      <div>
        <label>Propietario</label>
        <div style="display:flex; gap:8px; align-items:center">
          <div style="flex:1">
            <input class="input" id="f_prop_search" placeholder="Buscar por nombre o RUT..." />
            <select class="input" id="f_prop_select" size="5" style="margin-top:6px;height:140px"></select>
          </div>
          <button class="btn-edit" type="button" id="btnNewOwner">Nuevo</button>
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
            <button class="btn-hist" id="o_guardar" type="button">Guardar propietario</button>
            <button class="btn-del" id="o_cancelar" type="button">Cancelar</button>
          </div>
        </div>
      </div>`;

  form.innerHTML = `
    <h3 style="margin-top:0">${title}</h3>
    <div class="form-grid">
      <div><label>Nombre</label><input class="input" id="f_nombre" value="${esc(v.nombre || '')}" /></div>
      <div>
        <label>N° Historial</label>
        <input class="input" id="f_hist" value="${esc(initialHist || '')}" ${initialHist ? 'readonly' : ''} />
      </div>
      <div>
        <label>Especie</label>
        <select class="input" id="f_especie">
          <option value="">Seleccione…</option>
          <option value="perro" ${(v.especie || '').toLowerCase() === 'perro' ? 'selected' : ''}>Perro</option>
          <option value="gato"  ${(v.especie || '').toLowerCase() === 'gato' ? 'selected' : ''}>Gato</option>
        </select>
      </div>
      <div><label>Raza</label><input class="input" id="f_raza" value="${esc(v.raza || '')}" /></div>
      <div>
        <label>Sexo</label>
        <select class="input" id="f_sexo">
          <option value="">Seleccione…</option>
          <option value="macho"  ${(v.sexo || '').toLowerCase() === 'macho' ? 'selected' : ''}>Macho</option>
          <option value="hembra" ${(v.sexo || '').toLowerCase() === 'hembra' ? 'selected' : ''}>Hembra</option>
        </select>
      </div>

      <div style="display:flex;align-items:center;gap:8px">
        <input id="f_ester" type="checkbox" ${(v.esterilizado === 1 || v.esterilizado === '1') ? 'checked' : ''} />
        <label for="f_ester">Esterilizado</label>
      </div>

      <div><label>N° microchip</label><input class="input" id="f_chip" type="text" value="${esc(v.nro_microchip || '')}" /></div>

      <div><label>Fecha nacimiento</label><input class="input" id="f_fnac" type="date" value="${(v.fecha_nacimiento || '').slice(0, 10)}" /></div>
      <div><label>Peso (kg)</label><input class="input" id="f_peso" type="number" step="0.01" value="${v.peso_kg ?? ''}" /></div>

      ${ownerSection}

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
      <button class="btn-hist" id="f_guardar">Guardar</button>
      <button class="btn-del" id="f_cancelar">Cancelar</button>
    </div>
  `;
  root.prepend(form);

  // ---------- Validaciones en tiempo real ----------
  const nombreInput = form.querySelector('#f_nombre');
  if (nombreInput) {
    nombreInput.addEventListener('input', () => {
      let val = nombreInput.value;
      val = val.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
      nombreInput.value = val;
    });
  }

  const chipInput = form.querySelector('#f_chip');
  if (chipInput) {
    chipInput.addEventListener('input', () => {
      chipInput.value = chipInput.value.replace(/\D/g, '');
    });
  }

  const fileInput = form.querySelector('#f_foto');
  const preview = form.querySelector('#f_preview');
  fileInput.addEventListener('change', () => {
    const f = fileInput.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = e => { preview.src = e.target.result; preview.style.display = 'block'; };
    reader.readAsDataURL(f);
  });

  // ---------- Propietario (solo admin/vet) ----------
  let selectedOwnerId = v.propietario_id ?? null;

  if (!isClient) {
    const propSearch = form.querySelector('#f_prop_search');
    const propSelect = form.querySelector('#f_prop_select');
    let propietariosCache = [];

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
    form.querySelector('#btnNewOwner').onclick = () => {
      box.style.display = (box.style.display === 'none' || !box.style.display) ? 'block' : 'none';
    };

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
  }

  // ---------- Guardar / Cancelar ----------
  form.querySelector('#f_cancelar').onclick = () => form.remove();
  form.querySelector('#f_guardar').onclick = async () => {
    const payload = {
      nombre: val('#f_nombre', form),
      n_historial: val('#f_hist', form),
      especie: val('#f_especie', form),
      raza: val('#f_raza', form),
      sexo: val('#f_sexo', form),
      esterilizado: form.querySelector('#f_ester').checked ? 1 : 0,
      nro_microchip: val('#f_chip', form),
      fecha_nacimiento: val('#f_fnac', form) || null,
      peso_kg: parseFloat(val('#f_peso', form)) || null,
    };

    if (!payload.nombre) { alert('Nombre es requerido'); return; }
    if (!payload.especie) { alert('Selecciona especie'); return; }

    // Validación extra: nombre solo letras
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(payload.nombre)) {
      alert('El nombre solo puede contener letras y espacios (sin números).');
      return;
    }

    // Validación extra: N° historial >= 1000
    if (payload.n_historial) {
      const n = parseInt(payload.n_historial, 10);
      if (Number.isNaN(n) || n < 1000) {
        alert('El N° de historial debe ser un número mayor o igual a 1000.');
        return;
      }
    }

    // Validación extra: microchip solo números
    if (payload.nro_microchip && !/^\d+$/.test(payload.nro_microchip)) {
      alert('El N° de microchip solo puede contener números.');
      return;
    }

    if (!isClient) {
      payload.propietario_id = selectedOwnerId;
      if (!payload.propietario_id) {
        alert('Selecciona o crea un propietario.');
        return;
      }
    }

    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== '') fd.append(k, v);
    });
    const f = fileInput.files?.[0];
    if (f) fd.append('foto', f);

    await onSubmit(fd);
    form.remove();
  };
}



/* ----------Funciones auxiliares ----------- */
function bindHistClicks(rootEl, API) {
  rootEl.querySelectorAll('.hist-click').forEach(li => {
    li.addEventListener('click', async () => {
      const tipo = (li.dataset.tipo || '').toLowerCase();
      const id = Number(li.dataset.id);
      if (!id) return;

      showModal('Detalle', '<div style="padding:12px">Cargando…</div>');

      try {
        const data = await fetchHistDetail(API, tipo, id);
        const html = renderHistDetail(tipo, data);
        showModal(capitalize(tipo), html);
      } catch (e) {
        showModal('Error', `<div style="padding:12px;color:#b91c1c">No se pudo cargar el detalle (${e?.message || e}).</div>`);
      }
    });
  });
}

async function fetchHistDetail(API, tipo, id) {
  if (tipo === 'receta' || tipo === 'recetas') {
    const r = await fetch(`${API}/api/recetas/${id}`);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  const map = {
    consulta: 'consulta',
    control: 'control',
    cirugía: 'cirugia',
    cirugia: 'cirugia',
    vacuna: 'vacuna',
    antiparasitario: 'antiparasitario',
    antipulgas: 'antipulgas',
    hospitalización: 'hospitalizacion',
    hospitalizacion: 'hospitalizacion',
    triaje: 'triaje',
    profilaxis: 'profilaxis',
    defunción: 'defuncion',
    defuncion: 'defuncion',
    dermatología: 'dermatologia',
    dermatologia: 'dermatologia',
    'orden de exámenes': 'orden_examen',
    'orden de examenes': 'orden_examen',
    oftalmología: 'oftalmologia',
    oftalmologia: 'oftalmologia'
  };
  const key = map[tipo] || tipo;

  const url = `${API}/api/registros/${key}?search=${encodeURIComponent(String(id))}`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const list = await r.json();
  const found = Array.isArray(list) ? list.find(x => Number(x.id) === Number(id)) : null;
  if (!found) throw new Error('No se encontró el registro');
  return found;
}

function renderHistDetail(tipo, d) {
  const dt = s => s ? new Date(s).toLocaleString() : '';
  const row = (k, v) => v == null || v === '' ? '' :
    `<div class="kv"><b>${k}:</b> <span>${esc(String(v))}</span></div>`;

  const t = tipo.toLowerCase();

  if (t === 'receta' || t === 'recetas') {
    return `
      <div class="modal-body">
        ${row('ID', d.id)}
        ${row('Fecha', dt(d.fecha || d.created_at))}
        ${row('Mascota', d.mascota_nombre)}
        ${row('Propietario', d.propietario_nombre)}
        ${row('Diagnóstico', d.diagnostico)}
        ${row('Indicaciones', d.indicaciones)}
        ${row('Medicamentos', d.medicamentos)}
      </div>`;
  }

  return `
    <div class="modal-body">
      ${row('ID', d.id)}
      ${row('Fecha', dt(d.fecha || d.fecha_ingreso || d.created_at))}
      ${row('Mascota', d.mascota_nombre)}
      ${row('Motivo', d.motivo)}
      ${row('Diagnóstico', d.diagnostico)}
      ${row('Indicaciones', d.indicaciones)}
      ${row('Procedimiento', d.procedimiento)}
      ${row('Vacuna', d.vacuna)}
      ${row('Producto', d.producto)}
      ${row('Vía', d.via)}
      ${row('Dosis', d.dosis)}
      ${row('Temperatura °C', d.temperatura_c)}
      ${row('Peso kg', d.peso_kg)}
      ${row('Estado', d.estado)}
      ${row('Notas/Observaciones', d.notas || d.observaciones)}
    </div>`;
}

/* ===== Modal ===== */
function showModal(title, html) {
  let modal = document.getElementById('simpleModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'simpleModal';
    modal.innerHTML = `
      <div class="modal-backdrop" style="position:fixed;inset:0;background:rgba(15,23,42,.55);display:flex;align-items:center;justify-content:center;z-index:1000">
        <div class="modal-card card" style="min-width:320px;max-width:720px;max-height:80vh;overflow:auto">
          <div class="modal-head" style="display:flex;align-items:center;justify-content:space-between;gap:8px">
            <h3 id="modalTitle" style="margin:0">Detalle</h3>
            <button id="modalClose" class="btn-del">Cerrar</button>
          </div>
          <div id="modalBody" style="margin-top:8px"></div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector('#modalClose').addEventListener('click', () => modal.remove());
    modal.addEventListener('click', (e) => { if (e.target.classList.contains('modal-backdrop')) modal.remove(); });
  }
  modal.querySelector('#modalTitle').textContent = title || 'Detalle';
  modal.querySelector('#modalBody').innerHTML = html || '';
}

function capitalize(s) { s = (s || '').toString(); return s ? s[0].toUpperCase() + s.slice(1) : s; }


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
async function fetchJSON(url, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = { ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const r = await fetch(url, { ...options, headers });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
async function apiPost(url, body) {
  const token = localStorage.getItem('auth_token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const r = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiPostForm(url, fd) {
  const token = localStorage.getItem('auth_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const r = await fetch(url, {
    method: 'POST',
    headers,
    body: fd,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiPutForm(url, fd) {
  const token = localStorage.getItem('auth_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const r = await fetch(url, {
    method: 'PUT',
    headers,
    body: fd,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiDelete(url) {
  const token = localStorage.getItem('auth_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const r = await fetch(url, {
    method: 'DELETE',
    headers,
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
