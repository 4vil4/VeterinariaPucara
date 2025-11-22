export async function init({ root, API, authHeaders }) {
  const title = root.querySelector('#calTitle');
  const daysEl = root.querySelector('#calDays');
  const side = root.querySelector('#calSide');
  const search = root.querySelector('#calSearch');

  let current = new Date();
  let citas = [];
  let filtro = '';

  // ---- Usuario actual y modo cliente ----
  const me = getCurrentUser();
  const isClient = !!me && me.role === 'user';

  function getAuthHeaders() {
    return typeof authHeaders === 'function' ? authHeaders() : {};
  }

  root.querySelector('#prevMonth').onclick = () => { current = addMonths(current, -1); load(); };
  root.querySelector('#nextMonth').onclick = () => { current = addMonths(current, 1); load(); };

  let t; search.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => { filtro = search.value.trim().toLowerCase(); load(); }, 250);
  });

  await load();

  async function load() {
    const { start, end } = monthRange(current);
    title.textContent = `Urgencias · ${current.toLocaleDateString('es-CL', { month: 'long', year: 'numeric' })}`;

    const url = `${API}/api/citas?from=${start}&to=${end}&urgencia=1${filtro ? `&search=${encodeURIComponent(filtro)}` : ''}`;
    const res = await fetchJSON(url);
    let list = (Array.isArray(res) ? res : []).filter(c => Number(c.urgencia) === 1);

    // si es cliente, solo sus urgencias
    if (isClient && me?.propietario_id) {
      const pid = Number(me.propietario_id);
      list = list.filter(c => Number(c.propietario_id) === pid);
    }

    citas = list;
    render();
  }

  function render() {
    const { grid } = monthGrid(current);
    daysEl.innerHTML = '';
    const grouped = groupByDay(citas);

    grid.forEach(d => {
      const dayKey = d.toISOString().slice(0, 10);
      const list = grouped[dayKey] || [];

      const cell = document.createElement('div');
      cell.className = 'cal-cell' + (d.getMonth() === current.getMonth() ? '' : ' out');

      const items = list.slice(0, 3).map(c => {
        const hora = new Date(c.fecha_inicio).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
        return `<div class="cal-event urg-event">• ${hora} · ${esc(c.propietario_nombre || '—')} (${esc(c.tipo)})</div>`;
      }).join('');

      cell.innerHTML = `
        <div class="d">${d.getDate()}</div>
        ${list.length ? `<div class="cal-badge urg-badge">${list.length}</div>` : ''}
        ${items}
      `;

      cell.onclick = () => openDay(dayKey, list);
      daysEl.appendChild(cell);
    });
  }

  function openDay(dayKey, list) {
    side.style.display = 'block';
    const titulo = new Date(dayKey).toLocaleDateString('es-CL', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

    side.innerHTML = `
        <div class="side-title">
          <h3 style="margin:0">${titulo}</h3>
        </div>
        <div class="side-list">
          ${list.length ? list.map(item => sideItem(item)).join('') : '<p>No hay urgencias.</p>'}
        </div>
      `;

    // Ir a la vista de tabla de citas filtrando por el día
    side.querySelector('#goCitas')?.addEventListener('click', () => {
      location.hash = `#/citas?from=${dayKey}&to=${dayKey}`;
    });

    // Handlers de editar / eliminar
    side.querySelectorAll('.btn-edit').forEach(b => b.onclick = () => editCita(b.dataset.id));
    side.querySelectorAll('.btn-del').forEach(b => b.onclick = () => delCita(b.dataset.id));
  }


  function sideItem(c) {
    const rango = `${fmtTime(c.fecha_inicio)}${c.fecha_fin ? `–${fmtTime(c.fecha_fin)}` : ''}`;
    return `
      <div class="side-item">
        <div>
          <div><b class="urg-event">${rango}</b> · ${esc(c.propietario_nombre || '—')}
            <span class="cal-badge urg-badge" style="position:static;margin-left:6px">URGENTE</span>
          </div>
          <div class="side-meta">${esc(c.tipo)} · ${esc(c.estado || 'programada')}</div>
          ${c.observaciones ? `<div class="side-meta">${esc(c.observaciones)}</div>` : ''}
        </div>
        <div style="display:flex;gap:6px">
          <button class="iconbtn btn-edit" data-id="${c.id}">✏️</button>
          <button class="iconbtn btn-del"  data-id="${c.id}">🗑️</button>
        </div>
      </div>
    `;
  }

  async function editCita(id) { location.hash = '#/citas'; }

  async function delCita(id) {
    if (!confirm('¿Eliminar esta cita?')) return;
    await fetchJSON(`${API}/api/citas/${id}`, { method: 'DELETE' });
    await load();
  }

  // helpers
  function groupByDay(arr) { const out = {}; for (const c of arr) { const d = c.fecha_inicio.slice(0, 10); (out[d] ||= []).push(c); } return out; }
  function monthRange(d) { const s = new Date(d.getFullYear(), d.getMonth(), 1); const e = new Date(d.getFullYear(), d.getMonth() + 1, 1); return { start: isoDate(s), end: isoDate(e) }; }
  function monthGrid(d) { const f = new Date(d.getFullYear(), d.getMonth(), 1); const s = startOfWeek(f); const days = []; for (let i = 0; i < 42; i++) { const dt = new Date(s); dt.setDate(s.getDate() + i); days.push(dt); } return { grid: days }; }
  function startOfWeek(d) { const nd = new Date(d); const w = (nd.getDay() + 6) % 7; nd.setDate(nd.getDate() - w); return nd; }
  function addMonths(d, n) { const nd = new Date(d); nd.setMonth(nd.getMonth() + n); return nd; }
  function isoDate(d) { return d.toISOString().slice(0, 10); }
  function fmtTime(iso) { return new Date(iso).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); }

  async function fetchJSON(url, opt = {}) {
    const baseHeaders = { ...getAuthHeaders(), ...(opt.headers || {}) };
    const o = { ...opt, headers: baseHeaders };
    if (o.body && typeof o.body === 'object') {
      o.headers['Content-Type'] = 'application/json';
      o.body = JSON.stringify(o.body);
    }
    const r = await fetch(url, o);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function getCurrentUser() {
    try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); }
    catch { return null; }
  }
}
