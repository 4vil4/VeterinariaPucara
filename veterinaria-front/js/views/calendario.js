export async function init({ root, API }) {
  const title = root.querySelector('#calTitle');
  const daysWrap = root.querySelector('#calDays');
  const side = root.querySelector('#calSide');
  const search = root.querySelector('#calSearch');

  let current = new Date();
  let citas = [];
  let filtro = '';

  // ---- Usuario actual y modo cliente ----
  const me = getCurrentUser();
  const isClient = !!me && me.role === 'user';

  root.querySelector('#prevMonth').onclick = () => { current = addMonths(current, -1); load(); };
  root.querySelector('#nextMonth').onclick = () => { current = addMonths(current, 1); load(); };

  let t; search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(() => { filtro = search.value.trim().toLowerCase(); render(); }, 250); });

  await load();

  async function load() {
    const { start, end } = monthRange(current);
    title.textContent = current.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' });

    let res = await fetchJSON(`${API}/api/citas?from=${start}&to=${end}&search=${encodeURIComponent(filtro)}`);
    citas = Array.isArray(res) ? res : [];

    if (isClient && me?.propietario_id) {
      const pid = Number(me.propietario_id);
      citas = citas.filter(c => Number(c.propietario_id) === pid);
    }

    render();
  }

  function render() {
    const { grid } = monthGrid(current);
    daysWrap.innerHTML = '';
    const grouped = groupByDay(citas);

    grid.forEach(d => {
      const key = d.toISOString().slice(0, 10);
      const list = grouped[key] || [];
      const cell = document.createElement('div');
      cell.className = 'cal-cell' + (d.getMonth() === current.getMonth() ? '' : ' out');

      const items = list.slice(0, 3).map(c => {
        const hora = new Date(c.fecha_inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        const u = c.urgencia ? ' 🔴' : '';
        return `<div class="cal-event">• ${hora}${u} · ${esc(c.propietario_nombre || '—')} (${esc(c.tipo)})</div>`;
      }).join('');

      cell.innerHTML = `<div class="d">${d.getDate()}</div>${list.length ? `<div class="cal-badge">${list.length}</div>` : ''}${items}`;
      cell.onclick = () => openDay(key, list);
      daysWrap.appendChild(cell);
    });
  }

  function openDay(key, list) {
    side.style.display = 'block';
    const txt = new Date(key).toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    side.innerHTML = `
        <div class="side-title">
          <h3 style="margin:0">${txt}</h3>
        </div>
        <div class="side-list">
          ${list.length ? list.map(item => sideItem(item)).join('') : '<p>No hay citas.</p>'}
        </div>
      `;

    side.querySelector('#sideNew')?.addEventListener('click', () => {
      location.hash = `#/citas?new=1&date=${key}`;
    });

    side.querySelectorAll('.btn-edit').forEach(b => {
      b.onclick = () => openForm(null, list.find(x => x.id == b.dataset.id));
    });
    side.querySelectorAll('.btn-del').forEach(b => {
      b.onclick = () => delCita(b.dataset.id);
    });
  }

  function sideItem(c) {
    const rango = `${fmtTime(c.fecha_inicio)}${c.fecha_fin ? `–${fmtTime(c.fecha_fin)}` : ''}`;
    const chip = c.urgencia ? '<span class="cal-badge" style="position:static;margin-left:6px;background:#fee2e2">URGENTE</span>' : '';
    return `
      <div class="side-item">
        <div>
          <div><b>${rango}</b> · ${esc(c.propietario_nombre || '—')} ${chip}</div>
          <div class="side-meta">${esc(c.tipo)} · ${esc(c.estado || 'programada')}</div>
          ${c.observaciones ? `<div class="side-meta">${esc(c.observaciones)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px">
          <button class="iconbtn btn-edit" data-id="${c.id}">✏️</button>
          <button class="iconbtn btn-del" data-id="${c.id}">🗑️</button>
        </div>
      </div>`;
  }

  async function delCita(id) {
    if (!confirm('¿Eliminar esta cita?')) return;
    await fetchJSON(`${API}/api/citas/${id}`, { method: 'DELETE' });
    await load();
  }

  async function openForm(dateISO = null, editing = null) {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.style.marginTop = '12px';

    const dtStart = editing ? editing.fecha_inicio.slice(0, 16).replace(' ', 'T')
      : dateISO ? `${dateISO}T10:00` : new Date().toISOString().slice(0, 16);
    const dtEnd = editing && editing.fecha_fin ? editing.fecha_fin.slice(0, 16).replace(' ', 'T') : '';

    wrap.innerHTML = `
      <h3 style="margin-top:0">${editing ? 'Editar' : 'Nueva'} cita</h3>
      <div class="form-grid">
        <div>
          <label>Propietario</label>
          <input class="input" id="own_search" placeholder="Buscar propietario..." />
          <select class="input" id="own_select" size="5" style="margin-top:6px;height:140px"></select>
        </div>
        <div><label>Inicio</label><input class="input" id="f_ini" type="datetime-local" value="${dtStart}"></div>
        <div><label>Fin (opcional)</label><input class="input" id="f_fin" type="datetime-local" value="${dtEnd}"></div>
        <div><label>Tipo</label><input class="input" id="f_tipo" value="${editing ? esc(editing.tipo) : 'consulta'}"></div>
        <div>
          <label>Estado</label>
          <select class="input" id="f_estado">
            ${['programada', 'confirmada', 'atendida', 'cancelada'].map(s => `<option ${editing && editing.estado === s ? 'selected' : ''}>${s}</option>`).join('')}
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
    side.after(wrap);

    const ownSelect = wrap.querySelector('#own_select');
    const ownSearch = wrap.querySelector('#own_search');
    let owners = await fetchJSON(`${API}/api/propietarios`);
    function renderOwners(q = '') {
      const n = s => (s || '').toLowerCase();
      const list = owners.filter(o => !q || n(o.nombre).includes(n(q)) || n(o.rut || '').includes(n(q)));
      ownSelect.innerHTML = list.map(o => `<option value="${o.id}">${esc(o.nombre)}${o.rut ? ` — ${esc(o.rut)}` : ''}</option>`).join('');
      if (editing && editing.propietario_id) ownSelect.value = String(editing.propietario_id);
    }
    renderOwners();
    let t2; ownSearch.addEventListener('input', () => { clearTimeout(t2); t2 = setTimeout(() => renderOwners(ownSearch.value.trim()), 200); });

    wrap.querySelector('#f_cancelar').onclick = () => wrap.remove();
    wrap.querySelector('#f_guardar').onclick = async () => {
      const payload = {
        propietario_id: Number(ownSelect.value) || null,
        fecha_inicio: wrap.querySelector('#f_ini').value,
        fecha_fin: wrap.querySelector('#f_fin').value || null,
        tipo: wrap.querySelector('#f_tipo').value.trim(),
        estado: wrap.querySelector('#f_estado').value,
        urgencia: Number(wrap.querySelector('#f_urg').value),
        observaciones: wrap.querySelector('#f_obs').value.trim() || null
      };
      if (!payload.fecha_inicio || !payload.tipo) { alert('Inicio y tipo son obligatorios'); return; }
      if (editing) await fetchJSON(`${API}/api/citas/${editing.id}`, { method: 'PUT', body: payload });
      else await fetchJSON(`${API}/api/citas`, { method: 'POST', body: payload });
      wrap.remove();
      await load();
    };
  }

  // ------- helpers -------
  function groupByDay(arr) {
    const out = {};
    for (const c of arr) { const d = c.fecha_inicio.slice(0, 10); (out[d] ||= []).push(c); }
    return out;
  }
  function monthRange(d) { const start = new Date(d.getFullYear(), d.getMonth(), 1); const end = new Date(d.getFullYear(), d.getMonth() + 1, 1); return { start: isoDate(start), end: isoDate(end) }; }
  function monthGrid(d) { const first = new Date(d.getFullYear(), d.getMonth(), 1); const start = startOfWeek(first); const days = []; for (let i = 0; i < 42; i++) { const dt = new Date(start); dt.setDate(start.getDate() + i); days.push(dt); } return { grid: days }; }
  function startOfWeek(d) { const nd = new Date(d); const day = (nd.getDay() + 6) % 7; nd.setDate(nd.getDate() - day); return nd; }
  function addMonths(d, n) { const nd = new Date(d); nd.setMonth(nd.getMonth() + n); return nd; }
  function isoDate(d) { return d.toISOString().slice(0, 10); }
  function fmtTime(iso) { return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); }
  async function fetchJSON(url, opt = {}) { const o = { ...opt }; if (o.body && typeof o.body === 'object') { o.headers = { 'Content-Type': 'application/json', ...(o.headers || {}) }; o.body = JSON.stringify(o.body); } const r = await fetch(url, o); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
  function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); }
    catch { return null; }
  }
}
