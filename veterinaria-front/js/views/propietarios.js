export async function init({ root, API }) {
    const tableWrap = root.querySelector('#propTableWrap');
    const searchInput = root.querySelector('#propSearch');
    const btnNuevo = root.querySelector('#btnNuevoProp');

    // Carga inicial
    await loadAndRender('');

    // Buscar
    let t;
    searchInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => loadAndRender(searchInput.value.trim()), 250);
    });

    // Nuevo propietario
    btnNuevo.addEventListener('click', () => {
        showForm(root, 'Nuevo propietario', null, async (payload) => {
            await apiPost(`${API}/api/propietarios`, payload);
            await loadAndRender(searchInput.value.trim());
        });
    });

    async function loadAndRender(search) {
        tableWrap.innerHTML = 'Cargando...';
        const url = `${API}/api/propietarios${search ? `?search=${encodeURIComponent(search)}` : ''}`;
        const rows = await fetchJSON(url);
        tableWrap.innerHTML = buildTable(rows);

        // Editar
        tableWrap.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                const current = rows.find(r => r.id === id) || {};
                showForm(root, 'Editar propietario', current, async (payload) => {
                    await apiPut(`${API}/api/propietarios/${id}`, payload);
                    await loadAndRender(searchInput.value.trim());
                });
            });
        });

        // Eliminar
        tableWrap.querySelectorAll('.btn-del').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.dataset.id);
                if (!confirm('¿Eliminar este propietario?')) return;
                await apiDelete(`${API}/api/propietarios/${id}`);
                await loadAndRender(searchInput.value.trim());
            });
        });
    }
}

/* --------------- UI --------------- */
function buildTable(rows) {
    const head = `
  <thead>
    <tr>
      <th>Nombre</th>
      <th>RUT</th>
      <th>Correo</th>
      <th>Móvil</th>
      <th style="width:140px;text-align:right">Acciones</th>
    </tr>
  </thead>`;
    const body = `
  <tbody>
    ${rows.map(r => `
      <tr>
        <td>${esc(r.nombre)}</td>
        <td>${esc(r.rut || '')}</td>
        <td>${esc(r.correo || '')}</td>
        <td>${esc(r.movil || '')}</td>
        <td>
          <div class="actions">
            <button class="iconbtn btn-edit" data-id="${r.id}">✏️</button>
            <button class="iconbtn btn-del" data-id="${r.id}">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('')}
  </tbody>`;
    return `<table class="tbl">${head}${body}</table>`;
}

function showForm(root, title, data, onSubmit) {
    const v = data || {};
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.style.marginTop = '12px';
    wrap.innerHTML = `
    <h3 style="margin-top:0">${title}</h3>
    <div class="form-grid">
      <div><label>Nombre*</label><input class="input" id="f_nombre" value="${esc(v.nombre || '')}" /></div>
      <div><label>RUT</label><input class="input" id="f_rut" value="${esc(v.rut || '')}" /></div>
      <div><label>Correo</label><input class="input" id="f_correo" type="email" value="${esc(v.correo || '')}" /></div>
      <div><label>Móvil</label><input class="input" id="f_movil" value="${esc(v.movil || '')}" /></div>
      <div style="grid-column:1 / -1"><label>Dirección</label><input class="input" id="f_direccion" value="${esc(v.direccion || '')}" /></div>
    </div>
    <div style="margin-top:14px;display:flex;gap:8px">
      <button class="btn btn-primary" id="f_guardar">Guardar</button>
      <button class="btn btn-outline" id="f_cancelar">Cancelar</button>
    </div>
  `;
    root.prepend(wrap);

    wrap.querySelector('#f_cancelar').onclick = () => wrap.remove();
    wrap.querySelector('#f_guardar').onclick = async () => {
        const payload = {
            nombre: get('#f_nombre', wrap),
            rut: get('#f_rut', wrap),
            correo: get('#f_correo', wrap),
            movil: get('#f_movil', wrap),
            direccion: get('#f_direccion', wrap),
        };
        if (!payload.nombre) { alert('El nombre es obligatorio'); return; }
        await onSubmit(payload);
        wrap.remove();
    };
}

/* --------------- helpers --------------- */
function get(sel, root = document) { return root.querySelector(sel).value?.trim(); }
function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
async function fetchJSON(url) { const r = await fetch(url); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiPost(url, body) { const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiPut(url, body) { const r = await fetch(url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiDelete(url) { const r = await fetch(url, { method: 'DELETE' }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
