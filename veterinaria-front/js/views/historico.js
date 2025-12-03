export async function init({ root, API }) {
    const wrap = root.querySelector('#histTableWrap');
    const q = root.querySelector('#histSearch');
    const btnAll = root.querySelector('#btnAll');
    const btnDone = root.querySelector('#btnDone');
    const btnCanceled = root.querySelector('#btnCanceled');
    const btnReporteMes = root.querySelector('#btnHistReporteMes');

    let all = [];
    let estado = 'all';
    let text = '';

    let t; q.addEventListener('input', () => {
        clearTimeout(t); t = setTimeout(() => { text = q.value.trim().toLowerCase(); render(); }, 200);
    });
    btnAll.onclick = () => { estado = 'all'; mark(btnAll); render(); };
    btnDone.onclick = () => { estado = 'atendida'; mark(btnDone); render(); };
    btnCanceled.onclick = () => { estado = 'cancelada'; mark(btnCanceled); render(); };

    mark(btnAll);
    await load();

    async function load() {
        const r = await fetchJSON(`${API}/api/citas?order=desc`);
        all = Array.isArray(r) ? r : [];
        render();
    }

    function render() {
        const rows = all
            .filter(c => estado === 'all' ? true : (c.estado === estado))
            .filter(c => {
                if (!text) return true;
                const s = (v) => (v || '').toString().toLowerCase();
                return s(c.propietario_nombre).includes(text) ||
                    s(c.tipo).includes(text) ||
                    s(c.estado).includes(text) ||
                    s(c.observaciones).includes(text);
            });

        wrap.innerHTML = `
      <table class="tbl">
        <thead>
          <tr>
            <th>Inicio</th><th>Fin</th><th>Propietario</th>
            <th>Tipo</th><th>Estado</th><th>Urgencia</th><th>Obs.</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr>
              <td>${fmtDT(r.fecha_inicio)}</td>
              <td>${r.fecha_fin ? fmtDT(r.fecha_fin) : '—'}</td>
              <td>${esc(r.propietario_nombre || '—')}</td>
              <td>${esc(r.tipo || '—')}</td>
              <td>${pillEstado(r.estado)}</td>
              <td>${Number(r.urgencia) ? '<span class="badge-urg">URGENTE</span>' : '—'}</td>
              <td>${esc((r.observaciones || '').slice(0, 60))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    }

    function pillEstado(s) {
        if (s === 'atendida') return `<span class="pill pill-done">atendida</span>`;
        if (s === 'cancelada') return `<span class="pill pill-cancel">cancelada</span>`;
        return esc(s || '—');
    }

    function mark(btn) {
        [btnAll, btnDone, btnCanceled].forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
    }

    // Botón informe mensual
    btnReporteMes.addEventListener('click', () => {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = hoy.getMonth() + 1; // 1-12

        // Abre el PDF en otra pestaña
        const url = `${API}/api/reportes/mes/pdf?year=${year}&month=${month}`;
        window.open(url, '_blank');
    });

    // helpers
    function fmtDT(iso) { const d = new Date(iso); return d.toLocaleDateString('es-CL', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' ' + d.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }); }
    async function fetchJSON(url, opt = {}) { const o = { ...opt }; if (o.body && typeof o.body === 'object') { o.headers = { 'Content-Type': 'application/json', ...(o.headers || {}) }; o.body = JSON.stringify(o.body); } const r = await fetch(url, o); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
    function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
}
