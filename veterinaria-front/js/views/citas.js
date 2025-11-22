export async function init({ root, API, authHeaders }) {
  const tableWrap = root.querySelector('#citasTableWrap');
  const qInput = root.querySelector('#citasSearch');
  const fromInput = root.querySelector('#citasFrom');
  const toInput = root.querySelector('#citasTo');
  const btnFiltrar = root.querySelector('#btnCitasFiltrar');
  const btnNuevo = root.querySelector('#btnNuevaCitaTabla');

  // ---- Usuario actual y modo cliente ----
  const me = getCurrentUser();
  const isClient = !!me && me.role === 'user';

  let data = [];

  // id/nombre de propietario resuelto para el usuario tipo "user"
  let clientOwnerId = me && me.propietario_id ? Number(me.propietario_id) : null;
  let clientOwnerName = (me && (me.nombre || me.full_name || me.email)) || '';

  const today = new Date();
  fromInput.value = isoDate(new Date(today.getFullYear(), today.getMonth(), 1));
  toInput.value = isoDate(new Date(today.getFullYear(), today.getMonth() + 1, 1));

  // si es user y no tenemos propietario_id aún, lo buscamos en la tabla de propietarios
  if (isClient && !clientOwnerId) {
    await resolveClientOwner();
  }

  await load();

  const qs = new URLSearchParams(location.hash.split('?')[1] || '');
  if (qs.get('new') === '1') {
    const pref = qs.get('date');
    openForm(pref ? `${pref}T10:00` : null);
    location.hash = '#/citas';
  }

  let t;
  qInput.addEventListener('input', () => { clearTimeout(t); t = setTimeout(render, 250); });
  btnFiltrar.addEventListener('click', load);
  btnNuevo.addEventListener('click', () => openForm());

  async function load() {
    const url = `${API}/api/citas?from=${fromInput.value}&to=${toInput.value}&search=${encodeURIComponent(qInput.value.trim())}`;
    let res = await fetchJSON(url);
    data = Array.isArray(res) ? res : [];

    // Si es usuario tipo "user", solo mostramos sus propias citas (por propietario)
    if (isClient && clientOwnerId) {
      const pid = Number(clientOwnerId);
      data = data.filter(c => Number(c.propietario_id) === pid);
    }

    render();
  }

  function render() {
    const q = (qInput.value || '').toLowerCase();
    const rows = data.filter(c => !q ||
      (c.propietario_nombre || '').toLowerCase().includes(q) ||
      (c.tipo || '').toLowerCase().includes(q) ||
      (c.estado || '').toLowerCase().includes(q)
    );

    tableWrap.innerHTML = `
      <table class="tbl">
        <thead>
          <tr>
            <th>Inicio</th><th>Fin</th><th>Propietario</th>
            <th>Tipo</th><th>Estado</th><th>Urgencia</th><th>Obs.</th><th style="width:120px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr data-id="${r.id}">
              <td data-label="Inicio">${fmtDT(r.fecha_inicio)}</td>
              <td data-label="Fin">${r.fecha_fin ? fmtDT(r.fecha_fin) : '—'}</td>
              <td data-label="Propietario">${esc(r.propietario_nombre || '—')}</td>
              <td data-label="Tipo">${esc(r.tipo || '—')}</td>
              <td data-label="Estado"><span class="state">${esc(r.estado || 'programada')}</span></td>
              <td data-label="Urgencia">${r.urgencia ? '<span class="badge-urg">URGENTE</span>' : '—'}</td>
              <td data-label="Obs.">${esc((r.observaciones || '').slice(0, 40))}</td>
              <td data-label="Acciones">
                <div class="actions">
                  <button class="iconbtn btn-edit" data-id="${r.id}">✏️</button>
                  <button class="iconbtn btn-del" data-id="${r.id}">🗑️</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;

    tableWrap.querySelectorAll('.btn-edit').forEach(b => b.onclick = () => {
      const id = b.dataset.id; const it = data.find(x => String(x.id) === String(id));
      openForm(null, it);
    });
    tableWrap.querySelectorAll('.btn-del').forEach(b => b.onclick = async () => {
      const id = b.dataset.id;
      if (!confirm('¿Eliminar esta cita?')) return;
      await fetchJSON(`${API}/api/citas/${id}`, { method: 'DELETE' });
      await load();
    });
  }

  // ----- Formulario crear/editar -----
  async function openForm(prefillISO = null, editing = null) {
    const wrap = document.createElement('div');
    wrap.className = 'card form-card';
    const dtStart = editing ? editing.fecha_inicio.slice(0, 16).replace(' ', 'T') :
      prefillISO ? prefillISO.slice(0, 16) : new Date().toISOString().slice(0, 16);
    const dtEnd = editing && editing.fecha_fin ? editing.fecha_fin.slice(0, 16).replace(' ', 'T') : '';

    // nombre del propietario fijo para user (usamos el resuelto si lo tenemos)
    const fixedOwnerName = (isClient && me)
      ? (clientOwnerName || me.nombre || me.full_name || me.email || '')
      : '';

    wrap.innerHTML = `
      <h3 style="margin-top:0">${editing ? 'Editar' : 'Nueva'} cita</h3>

      <div id="citasAlert" class="citas-alert citas-alert-error" style="display:none">
        <span class="citas-alert-icon">⚠️</span>
        <span class="citas-alert-text"></span>
      </div>

      <div class="form-grid">
        <div>
          <label>Propietario</label>
          ${isClient
        ? `<input class="input" id="own_fixed" value="${esc(fixedOwnerName)}" disabled>`
        : `
          <input class="input" id="own_search" placeholder="Buscar propietario..." />
          <select class="input" id="own_select" size="5" style="margin-top:6px;height:140px"></select>
              `
      }
        </div>
        <div><label>Inicio</label><input class="input" id="f_ini" type="datetime-local" value="${dtStart}"></div>
        <div><label>Fin (opcional)</label><input class="input" id="f_fin" type="datetime-local" value="${dtEnd}"></div>
        <div><label>Tipo</label><input class="input" id="f_tipo" value="${editing ? esc(editing.tipo) : 'consulta'}"></div>
        <div>
          <label>Estado</label>
          <select id="f_estado" class="input">
            <option value="programada">programada</option>
            <option value="confirmada">confirmada</option>
            <option value="atendida">atendida</option>
            <option value="cancelada">cancelada</option>
          </select>
        </div>
        <div>
          <label>Urgencia</label>
          <select class="input" id="f_urg">
            <option value="0" ${!editing || !editing.urgencia ? 'selected' : ''}>No</option>
            <option value="1" ${editing && editing.urgencia ? 'selected' : ''}>Sí</option>
          </select>
        </div>
        <div style="grid-column:1/-1"><label>Observaciones</label><textarea class="input" id="f_obs" rows="3">${editing ? esc(editing.observaciones || '') : ''}</textarea></div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-hist" id="f_guardar">Guardar</button>
        <button class="btn btn-del" id="f_cancelar">Cancelar</button>
      </div>
    `;

    const estadoSel = wrap.querySelector('#f_estado');
    estadoSel.value = editing ? (editing.estado || 'programada') : 'programada';
    tableWrap.parentElement.after(wrap);

    const ownSelect = wrap.querySelector('#own_select');
    const ownSearch = wrap.querySelector('#own_search');

    const alertBox = wrap.querySelector('#citasAlert');
    const alertText = wrap.querySelector('.citas-alert-text');

    function showError(msg) {
      if (!alertBox || !alertText) {
        window.alert(msg);
        return;
      }
      alertText.textContent = msg;
      alertBox.style.display = 'flex';
    }

    function clearError() {
      if (alertBox && alertText) {
        alertBox.style.display = 'none';
        alertText.textContent = '';
      }
    }

    // Solo cargamos propietarios si NO es cliente
    if (!isClient) {
      let owners = await fetchJSON(`${API}/api/propietarios`);
      function renderOwners(q = '') {
        const n = s => (s || '').toLowerCase();
        const list = owners.filter(o => !q || n(o.nombre).includes(n(q)) || n(o.rut || '').includes(n(q)));
        ownSelect.innerHTML = list.map(o => `<option value="${o.id}">${esc(o.nombre)}${o.rut ? ` — ${esc(o.rut)}` : ''}</option>`).join('');
        if (editing && editing.propietario_id) ownSelect.value = String(editing.propietario_id);
      }
      renderOwners();
      let t2; ownSearch.addEventListener('input', () => { clearTimeout(t2); t2 = setTimeout(() => renderOwners(ownSearch.value.trim()), 200); });
    }

    wrap.querySelector('#f_cancelar').onclick = () => wrap.remove();
    wrap.querySelector('#f_guardar').onclick = async () => {
      clearError();

      // propietario_id según el tipo de usuario
      let propietario_id = null;
      if (isClient) {
        propietario_id = clientOwnerId || (me?.propietario_id ? Number(me.propietario_id) : null);
      } else {
        propietario_id = Number(ownSelect.value);
      }

      const estadoVal = (wrap.querySelector('#f_estado').value || '').trim();

      const payload = {
        ...(Number.isFinite(propietario_id) && propietario_id > 0 ? { propietario_id: Number(propietario_id) } : {}),
        fecha_inicio: wrap.querySelector('#f_ini').value || undefined,
        fecha_fin: wrap.querySelector('#f_fin').value,
        tipo: (wrap.querySelector('#f_tipo').value || '').trim() || undefined,
        estado: estadoVal || undefined,
        urgencia: Number(wrap.querySelector('#f_urg').value),
        observaciones: wrap.querySelector('#f_obs').value
      };

      if (!payload.fecha_inicio || !payload.tipo) {
        showError('La fecha de inicio y el tipo de cita son obligatorios.');
        return;
      }

      try {
        if (editing) {
          await fetchJSON(`${API}/api/citas/${editing.id}`, { method: 'PUT', body: payload });
        } else {
          await fetchJSON(`${API}/api/citas`, { method: 'POST', body: payload });
        }
        wrap.remove();
        await load();
      } catch (err) {
        // aquí va a llegar el mensaje del backend, por ejemplo:
        // "Ya existe una cita en el rango de 1 hora para ese horario."
        showError(err.message || 'No se pudo guardar la cita.');
      }
    };
  }

  // --- resolver propietario del usuario (solo para role=user) ---
  async function resolveClientOwner() {
    try {
      const owners = await fetchJSON(`${API}/api/propietarios`);
      const email = (me?.email || '').toLowerCase();
      const nombre = (me?.nombre || '').toLowerCase();
      const found = owners.find(o =>
        (o.correo && o.correo.toLowerCase() === email) ||
        (o.nombre && o.nombre.toLowerCase() === nombre)
      );
      if (found) {
        clientOwnerId = Number(found.id);
        clientOwnerName = found.nombre || clientOwnerName;
      }
    } catch (e) {
      console.error('No se pudo resolver el propietario del usuario', e);
    }
  }

  // ------- helpers -------
  function fmtDT(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('es-CL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  }

  function isoDate(d) { return d.toISOString().slice(0, 10); }

  async function fetchJSON(url, opt = {}) {
    const o = { ...opt };
    const baseHeaders = authHeaders ? authHeaders() : {};

    if (o.body && typeof o.body === 'object') {
      o.headers = {
        'Content-Type': 'application/json',
        ...baseHeaders,
        ...(o.headers || {}),
      };
      o.body = JSON.stringify(o.body);
    } else {
      o.headers = {
        ...baseHeaders,
        ...(o.headers || {}),
      };
    }

    const r = await fetch(url, o);

    let data = null;
    try {
      data = await r.json();
    } catch {
      data = null;
    }

    if (!r.ok) {
      const msg = data && (data.msg || data.error || data.message);
      throw new Error(msg || `Error HTTP ${r.status}`);
    }

    return data;
  }

  function esc(s) {
    return (s ?? '').toString().replace(/[&<>"']/g, m => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;',
      '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); }
    catch { return null; }
  }
}
