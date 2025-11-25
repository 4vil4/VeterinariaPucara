export async function init({ root, API }) {
  const tableWrap = root.querySelector('#hospTableWrap');
  const inputSearch = root.querySelector('#hospSearch');
  const btnNew = root.querySelector('#hospNew');

  let openedId = null;
  let openedCard = null;

  await loadAndRender('');

  let t;
  inputSearch.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => loadAndRender(inputSearch.value.trim()), 250);
  });

  btnNew.addEventListener('click', () => {
    showForm(root, API, async (payload) => {
      const r = await apiPost(`${API}/api/hospitalizacion`, payload);
      await loadAndRender(inputSearch.value.trim());
      if (r?.id) toggleCard(r.id);
    });
  });

  function toggleCard(id) {
    if (openedId === id) {
      if (openedCard) openedCard.remove();
      openedId = null; openedCard = null;
      return;
    }
    if (openedCard) openedCard.remove();
    openedCard = openHospMonitoreoCard(root, API, id, tableWrap.closest('.card'));
    openedId = id;
    openedCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function loadAndRender(search) {
    const url = `${API}/api/hospitalizacion${search ? `?search=${encodeURIComponent(search)}` : ''}`;
    const rows = await fetchJSON(url);
    tableWrap.innerHTML = buildTable(rows);

    // Abrir monitoreo
    tableWrap.querySelectorAll('.open-mon').forEach(btn => {
      btn.onclick = (e) => { e.stopPropagation(); toggleCard(Number(btn.dataset.id)); };
    });
    tableWrap.querySelectorAll('tbody tr').forEach(tr => {
      tr.onclick = (e) => {
        if (e.target.closest('.open-mon')) return;
        toggleCard(Number(tr.dataset.id));
      };
    });

    // Dar alta
    tableWrap.querySelectorAll('.btn-alt').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        await apiPatchAuth(`${API}/api/hospitalizacion/${id}/alta`);
        await loadAndRender(search);
        if (openedId === id) toggleCard(id); 
      };
    });

    // Reabrir
    tableWrap.querySelectorAll('.btn-reabrir').forEach(btn => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        const id = Number(btn.dataset.id);
        await apiPatchAuth(`${API}/api/hospitalizacion/${id}/reabrir`);
        await loadAndRender(search);
        if (openedId === id) toggleCard(id);
      };
    });
  }
}

/* ---------- helpers UI ----------- */

function buildTable(rows) {
  const head = `
    <thead><tr>
      <th style="width:80px">ID</th>
      <th>Ingreso</th>
      <th>Mascota</th>
      <th>Motivo</th>
      <th>Estado</th>
      <th style="width:220px">Acciones</th>
    </tr></thead>`;
  const body = `
    <tbody>
      ${rows.map(r => `
        <tr data-id="${r.id}">
          <td>${esc(r.id)}</td>
          <td>${esc(formatHM_DMY(r.fecha_ingreso))}</td>
          <td>${esc(r.mascota_nombre || '')}</td>
          <td>${esc(r.motivo || '')}</td>
          <td>${esc(r.estado || '')}</td>
          <td>
            <button class="btn-hosp open-mon" data-id="${r.id}">Monitoreo</button>
            ${r.estado === 'alta'
      ? `<button class="btn-hosp2 btn-reabrir" data-id="${r.id}">Reabrir</button>`
      : `<button class="btn-hosp2 btn-alt" data-id="${r.id}">Dar alta</button>`
    }
          </td>
        </tr>
      `).join('')}
    </tbody>`;
  return `<table class="tbl">${head}${body}</table>`;
}

/* -------- helpers de fecha -------- */

function formatHM_DMY(value) {
  if (!value) return '';
  const d = parseDateSafe(value);
  if (isNaN(d)) return '';
  const pad = n => String(n).padStart(2, '0');
  const HH = pad(d.getHours());
  const mm = pad(d.getMinutes());
  const DD = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const YYYY = d.getFullYear();
  return `${HH}:${mm} - ${DD}/${MM}/${YYYY}`;
}

function parseDateSafe(v) {
  if (v instanceof Date) return v;
  if (typeof v === 'number') return new Date(v);
  if (typeof v === 'string') {
    let s = v.trim();
    if (/^\d{4}-\d{2}-\d{2}\s+\d/.test(s)) s = s.replace(' ', 'T');
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += 'T00:00:00';
    return new Date(s);
  }
  return new Date(v);
}

/* ======== Formulario nueva hospitalización ======== */

function showForm(root, API, onSubmit) {
  const wrap = document.createElement('div');
  wrap.className = 'card';
  wrap.style.marginTop = '12px';
  wrap.innerHTML = `
    <h3 style="margin-top:0">Nueva hospitalización</h3>
    <div class="form-grid">
      <div>
        <label>Mascota</label>
        <input class="input" id="pet_search" placeholder="Buscar mascota..." />
        <select class="input" id="pet_select" size="5" style="margin-top:6px;height:140px"></select>
        <small>Selecciona una mascota.</small>
      </div>
      <div><label>Fecha ingreso</label><input class="input" id="fecha_ingreso" type="datetime-local"></div>
      <div><label>Peso (kg)</label><input class="input" id="peso_kg" type="number" step="0.01"></div>
      <div><label>Motivo</label><input class="input" id="motivo"></div>
      <div><label>Estado</label><input class="input" id="estado" placeholder="en_curso/alta/derivada/fallecida"></div>
      <div style="grid-column:1/-1"><label>Observaciones</label><textarea class="input" id="observaciones" rows="3"></textarea></div>
    </div>
    <div style="margin-top:14px;display:flex;gap:8px">
      <button class="btn btn-primary btn-add" id="f_guardar">Guardar</button>
      <button class="btn btn-outline btn-del" id="f_cancelar">Cancelar</button>
    </div>
  `;
  root.prepend(wrap);

  // --- mascotas ---
  const petSearch = wrap.querySelector('#pet_search');
  const petSelect = wrap.querySelector('#pet_select');
  let mascotas = [];
  let selectedPet = null;

  (async () => {
    mascotas = await fetchJSON(`${API}/api/mascotas`);
    renderPets('');
    if (petSelect.options.length > 0) {
      petSelect.selectedIndex = 0;
      selectedPet = Number(petSelect.value) || null;
    }
    petSearch.oninput = () => renderPets(petSearch.value.trim());
    petSelect.onchange = () => { selectedPet = Number(petSelect.value) || null; };
  })();

  function renderPets(q) {
    const norm = s => (s || '').toString().toLowerCase();
    const list = mascotas.filter(m => !q || norm(m.nombre).includes(norm(q)));
    petSelect.innerHTML = list
      .map(m => `<option value="${m.id}">${esc(m.nombre)} — ${esc(m.especie || '')}</option>`)
      .join('');
    if (petSelect.options.length > 0) {
      petSelect.selectedIndex = 0;
      selectedPet = Number(petSelect.value) || null;
    } else {
      selectedPet = null;
    }
  }

  wrap.querySelector('#f_cancelar').onclick = () => wrap.remove();
  wrap.querySelector('#f_guardar').onclick = async () => {
    const data = {
      mascota_id: selectedPet,
      fecha_ingreso: wrap.querySelector('#fecha_ingreso').value || null,
      motivo: wrap.querySelector('#motivo').value || null,
      estado: wrap.querySelector('#estado').value || null,
      observaciones: wrap.querySelector('#observaciones').value || null,
      peso_kg: wrap.querySelector('#peso_kg').value ? Number(wrap.querySelector('#peso_kg').value) : null
    };
    if (!data.mascota_id) { alert('Debes seleccionar una mascota'); return; }
    await onSubmit(data);
    wrap.remove();
  };
}

/* =========== Tarjeta de Monitoreo =========== */

function openHospMonitoreoCard(root, API, hospId, mountAfterEl) {
  const card = document.createElement('div');
  card.className = 'card hosp-card';
  card.dataset.hospId = String(hospId);
  card.style.marginTop = '12px';
  const hoy = new Date().toISOString().slice(0, 10);

  card.innerHTML = `
    <h3 class="hosp-title">Seguimiento diario · …</h3>

    <div class="form-grid hosp-grid">
      <div>
        <label>Fecha</label>
        <input class="input" id="hosp_fecha" type="date" value="${hoy}" />
      </div>

      <div class="hosp-hours">
        <label>Horas (coma separadas)</label>
        <input class="input" id="hosp_horas" placeholder="06:00,10:00,14:00,18:00,22:00" />
        <small>Si lo dejas vacío, usaré 06:00,10:00,14:00,18:00,22:00</small>
      </div>

      <div class="hosp-init">
        <button class="btn-hosp" id="hosp_init">Inicializar horarios</button>
      </div>
    </div>

    <div class="hosp-actions">
      <div class="btns">
        <button class="btn-hosp2" id="hosp_reload">Actualizar</button>
        <button class="btn-hosp" id="hosp_add_row">Agregar hora</button>
      </div>
      <div class="hosp-days" id="hosp_days"></div>
    </div>

    <div id="hosp_tbl" style="margin-top:10px">Cargando...</div>

    <div class="hosp-obs">
      <button class="btn-hosp" id="hosp_obs_toggle">Observación diaria +</button>
      <div id="hosp_obs_wrap" class="hosp-obs hidden">
        <textarea id="hosp_obs_txt" class="input" rows="4" placeholder="Escribe las observaciones generales del día..."></textarea>
        <div class="obs-actions">
          <button class="btn btn-primary" id="hosp_obs_save">Guardar observación</button>
          <button class="btn-hosp" id="hosp_obs_cancel">Cerrar</button>
        </div>
      </div>
    </div>
  `;

  if (mountAfterEl && mountAfterEl.insertAdjacentElement) mountAfterEl.insertAdjacentElement('afterend', card);
  else root.append(card);

  const elFecha = card.querySelector('#hosp_fecha');
  const elHoras = card.querySelector('#hosp_horas');
  const elInit = card.querySelector('#hosp_init');
  const elTbl = card.querySelector('#hosp_tbl');
  const elDays = card.querySelector('#hosp_days');

  // Observación diaria
  const obsToggle = card.querySelector('#hosp_obs_toggle');
  const obsWrap = card.querySelector('#hosp_obs_wrap');
  const obsTxt = card.querySelector('#hosp_obs_txt');
  const obsSave = card.querySelector('#hosp_obs_save');
  const obsCancel = card.querySelector('#hosp_obs_cancel');

  let hospIngresoISO = null;
  let hospAltaISO = null;

  // Obtener info hospitalización
  (async () => {
    try {
      const h = await fetchJSONAuth(`${API}/api/hospitalizacion/${hospId}`);
      hospIngresoISO = (h?.fecha_ingreso || '').slice(0, 10) || null;
      hospAltaISO = h?.fecha_alta ? h.fecha_alta.slice(0, 10) : null;

      const titleEl = card.querySelector('.hosp-title');
      titleEl.textContent = `Seguimiento diario · ${h?.mascota_nombre || ('Hospitalización #' + hospId)}`;

      renderDays();
    } catch { }
  })();

  function renderDays() {
    if (!hospIngresoISO) { elDays.textContent = ''; return; }
    const hoyISO = new Date().toISOString().slice(0, 10);
    const selectedISO = (elFecha.value || hoyISO);
    const capISO = (hospAltaISO && selectedISO > hospAltaISO) ? hospAltaISO : selectedISO;
    const d = daysBetween(hospIngresoISO, capISO);
    const base = `<span class="hosp-badge">Día ${d} de hospitalización</span>`;
    const alta = hospAltaISO
      ? ` <span class="hosp-badge" style="background:#10b981;color:#fff">Alta ${formatDMY(hospAltaISO)}</span>`
      : '';
    elDays.innerHTML = base + alta;
  }

  function formatDMY(iso) {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  elFecha.addEventListener('change', () => { renderDays(); loadTable(); });

  elInit.onclick = async () => {
    const horas = (elHoras.value || '').split(',').map(s => s.trim()).filter(Boolean);
    await apiPostAuth(`${API}/api/hospitalizacion/${hospId}/monitoreo/init`, {
      fecha: elFecha.value,
      ...(horas.length ? { horas } : {})
    });
    await loadTable();
  };
  card.querySelector('#hosp_reload').onclick = loadTable;
  card.querySelector('#hosp_add_row').onclick = () => addRow({ hora: '00:00' });

  // Observación diaria
  obsToggle.onclick = async () => {
    obsWrap.classList.toggle('hidden');
    if (!obsWrap.classList.contains('hidden')) {
      const j = await fetchJSONAuth(`${API}/api/hospitalizacion/${hospId}/observacion?fecha=${elFecha.value}`);
      obsTxt.value = j?.texto || '';
    }
  };
  obsCancel.onclick = () => { obsWrap.classList.add('hidden'); };
  obsSave.onclick = async () => {
    const body = { fecha: elFecha.value, texto: obsTxt.value?.trim() || '' };
    await fetchJSONAuth(`${API}/api/hospitalizacion/${hospId}/observacion`, { method: 'PUT', body });
    obsWrap.classList.add('hidden');
  };

  loadTable();

  async function loadTable() {
    const rows = await fetchJSONAuth(`${API}/api/hospitalizacion/${hospId}/monitoreo?fecha=${elFecha.value}`);
    render(rows);
  }

  function render(rows) {
    elTbl.innerHTML = `
      <table class="tbl hosp-matrix">
        <thead>
          <tr>
            <th>Hora</th><th>°C</th><th>LPM</th><th>FR</th><th>Peso</th>
            <th>% Deshid.</th><th>TLC (seg)</th><th>PA</th><th>PAS</th><th>PAD</th><th>PAM</th>
            <th style="width:160px">Notas</th>
            <th style="width:120px">Acciones</th>
          </tr>
        </thead>
        <tbody id="hosp_body">
          ${rows.map(r => rowHTML(r)).join('')}
        </tbody>
      </table>`;
    elTbl.querySelectorAll('.btn-save').forEach(b => b.onclick = () => saveRow(getRowData(b.closest('tr'))));
    elTbl.querySelectorAll('.btn-del').forEach(b => b.onclick = () => delRow(b.closest('tr')));
  }

  function rowHTML(r) {
    return `
      <tr data-hora="${esc(r.hora || '')}">
        <td><input class="input" data-f="hora" type="time" value="${esc(r.hora || '')}"></td>
        <td><input class="input" data-f="temperatura_c" type="number" step="0.1" value="${val(r.temperatura_c)}"></td>
        <td><input class="input" data-f="lpm" type="number" step="1" value="${val(r.lpm)}"></td>
        <td><input class="input" data-f="fr" type="number" step="1" value="${val(r.fr)}"></td>
        <td><input class="input" data-f="peso_kg" type="number" step="0.01" value="${val(r.peso_kg)}"></td>
        <td><input class="input" data-f="deshidratacion" value="${esc(r.deshidratacion || '')}"></td>
        <td><input class="input" data-f="tlc_seg" type="number" step="0.1" value="${val(r.tlc_seg)}"></td>
        <td><input class="input" data-f="pa" value="${esc(r.pa || '')}"></td>
        <td><input class="input" data-f="pas" type="number" step="1" value="${val(r.pas)}"></td>
        <td><input class="input" data-f="pad" type="number" step="1" value="${val(r.pad)}"></td>
        <td><input class="input" data-f="pam" type="number" step="1" value="${val(r.pam)}"></td>
        <td><input class="input" data-f="notas" value="${esc(r.notas || '')}"></td>
        <td>
          <div class="actions">
            <button class="iconbtn btn-save">💾</button>
            <button class="iconbtn btn-del">🗑️</button>
          </div>
        </td>
      </tr>`;
  }

  function addRow(r) {
    const tb = elTbl.querySelector('#hosp_body');
    tb.insertAdjacentHTML('beforeend', rowHTML(r || { hora: '00:00' }));
    const last = tb.lastElementChild;
    last.querySelector('.btn-save').onclick = () => saveRow(getRowData(last));
    last.querySelector('.btn-del').onclick = () => delRow(last);
  }

  function getRowData(tr) {
    const obj = { hora: '', fecha: document.querySelector('#hosp_fecha').value };
    tr.querySelectorAll('input[data-f]').forEach(i => {
      obj[i.dataset.f] = i.type === 'number'
        ? (i.value === '' ? null : Number(i.value))
        : (i.value || null);
    });
    obj.hora = (obj.hora || '').slice(0, 5);
    return obj;
  }

  async function saveRow(data) {
    if (!data.hora) { alert('Debes indicar la hora'); return; }
    await fetchJSONAuth(`${API}/api/hospitalizacion/${hospId}/monitoreo`, {
      method: 'PUT',
      body: data
    });
    await loadTable();
  }

  async function delRow(tr) {
    const hora = tr.querySelector('input[data-f="hora"]').value.slice(0, 5);
    if (!hora) return;
    await fetchJSONAuth(`${API}/api/hospitalizacion/${hospId}/monitoreo?fecha=${document.querySelector('#hosp_fecha').value}&hora=${hora}`, { method: 'DELETE' });
    tr.remove();
  }

  function val(v) { return (v == null ? '' : String(v)); }
  function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function authHeaders() { const t = localStorage.getItem('auth_token'); return t ? { Authorization: `Bearer ${t}` } : {}; }

  async function fetchJSONAuth(url, opt = {}) {
    const o = { ...opt, headers: { ...(opt.headers || {}), 'Content-Type': 'application/json', ...authHeaders() } };
    if (o.body && typeof o.body === 'object') o.body = JSON.stringify(o.body);
    const r = await fetch(url, o);
    let j = null; try { j = await r.json(); } catch { }
    if (!r.ok) throw new Error(j?.msg || `HTTP ${r.status}`);
    return j;
  }
  async function apiPostAuth(url, body) { return fetchJSONAuth(url, { method: 'POST', body }); }

  return card;
}

/* -------- utils -------- */
function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function authHeaders() { const t = localStorage.getItem('auth_token'); return t ? { Authorization: `Bearer ${t}` } : {}; }
async function fetchJSON(url, opt) { const r = await fetch(url, { ...opt, headers: { ...(opt?.headers || {}), ...authHeaders() } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiPost(url, body) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body: JSON.stringify(body) }); const j = await r.json().catch(() => null); if (!r.ok) throw new Error(j?.msg || `HTTP ${r.status}`); return j; }
function daysBetween(startISO, endISO) { const s = new Date(startISO + 'T00:00:00'); const e = new Date(endISO + 'T00:00:00'); const diff = Math.floor((e - s) / 86400000) + 1; return Math.max(1, diff); }
async function apiPatchAuth(url, body) {
  const r = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: body ? JSON.stringify(body) : undefined
  });
  const j = await r.json().catch(() => null);
  if (!r.ok) throw new Error(j?.msg || `HTTP ${r.status}`);
  return j;
}
