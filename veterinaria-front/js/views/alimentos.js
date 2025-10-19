export async function init({ root, API }) {
  await mountProducts(root, API, {
    title: 'Alimentos',
    base: `${API}/api/alimentos`,
  });
}

/* ---------- helper de la vista ---------- */
async function mountProducts(root, API, cfg) {
  const wrap = root.querySelector('#prodTableWrap') || root;
  const search = root.querySelector('#prodSearch');
  const btnNew = root.querySelector('#btnNuevoProd');

  const me = safeUser();
  if (me?.role !== 'admin') {
    root.innerHTML = `<div class="card"><h2>${cfg.title}</h2><p>No autorizado.</p></div>`;
    return;
  }

  let rows = [];
  await load('');

  let t;
  search?.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => load(search.value.trim()), 250);
  });

  btnNew?.addEventListener('click', () => openForm());

  async function load(q) {
    const url = `${cfg.base}${q ? `?search=${encodeURIComponent(q)}` : ''}`;
    rows = await fetchJSON(url);
    render();
  }

  function thumbUrl(id) { return `${cfg.base}/${id}/foto?ts=${Date.now()}`; }

  function render() {
    wrap.innerHTML = `
    <div class="table-responsive">
      <table class="tbl">
        <thead>
          <tr>
            <th>Foto</th><th>Nombre</th><th>Descripción</th>
            <th>Precio</th><th>Stock</th><th>Activo</th>
            <th style="width:160px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map(r => `
            <tr data-id="${r.id}">
              <td><img src="${thumbUrl(r.id)}" onerror="this.style.display='none'" class="prod-thumb"></td>
              <td>${esc(r.nombre)}</td>
              <td>${esc((r.descripcion || '').slice(0, 100))}</td>
              <td>$${Number(r.precio || 0).toFixed(2)}</td>
              <td>${Number(r.stock || 0)}</td>
              <td>${Number(r.activo) ? 'Sí' : 'No'}</td>
              <td>
                <div class="actions">
                  <button class="btn-sm btn-outline btn-edit" data-id="${r.id}">Editar</button>
                  <button class="btn-sm btn-outline btn-del"  data-id="${r.id}">Eliminar</button>
                </div>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

    wrap.querySelectorAll('.btn-edit').forEach(b => b.onclick = () => {
      const id = Number(b.dataset.id);
      const it = rows.find(x => x.id === id);
      openForm(it);
    });
    wrap.querySelectorAll('.btn-del').forEach(b => b.onclick = async () => {
      const id = Number(b.dataset.id);
      if (!confirm('¿Eliminar?')) return;
      await fetchJSON(`${cfg.base}/${id}`, { method: 'DELETE' });
      await load(search?.value?.trim() || '');
    });
  }


  function openForm(editing = null) {
    const box = document.createElement('div');
    box.className = 'card form-card';
    box.innerHTML = `
      <h3 style="margin-top:0">${editing ? 'Editar' : 'Nuevo'} ${cfg.title.slice(0, -1)}</h3>
      <div class="form-grid">
        <div><label>Nombre*</label><input class="input" id="f_nombre" value="${esc(editing?.nombre || '')}"></div>
        <div><label>Precio</label><input class="input" id="f_precio" type="number" step="0.01" value="${editing?.precio ?? ''}"></div>
        <div><label>Stock</label><input class="input" id="f_stock" type="number" step="1" value="${editing?.stock ?? ''}"></div>
        <div><label>Activo</label>
          <select class="input" id="f_activo">
            <option value="1" ${editing?.activo ? 'selected' : ''}>Sí</option>
            <option value="0" ${editing && !editing.activo ? 'selected' : ''}>No</option>
          </select>
        </div>
        <div style="grid-column:1 / -1"><label>Descripción</label><textarea class="input" id="f_desc" rows="3">${esc(editing?.descripcion || '')}</textarea></div>
        <div style="grid-column:1 / -1">
          <label>Foto</label>
          <div class="photo-row">
            <img id="f_preview" class="prod-preview" ${editing ? `src="${thumbUrl(editing.id)}"` : ''} onerror="this.style.display='none'">
            <input id="f_foto" class="input" type="file" accept="image/*">
            ${editing ? `<label class="chk"><input type="checkbox" id="f_clear"> Quitar foto</label>` : ''}
          </div>
          <small class="help">JPG, PNG o WebP, máx 5MB.</small>
        </div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary" id="f_guardar">Guardar</button>
        <button class="btn btn-outline" id="f_cancelar">Cancelar</button>
      </div>
    `;
    root.prepend(box);

    const inpFile = box.querySelector('#f_foto');
    const prev = box.querySelector('#f_preview');
    inpFile?.addEventListener('change', () => {
      const f = inpFile.files?.[0]; if (!f) return;
      const rd = new FileReader();
      rd.onload = e => { prev.src = e.target.result; prev.style.display = 'block'; };
      rd.readAsDataURL(f);
    });

    box.querySelector('#f_cancelar')?.addEventListener('click', () => box.remove());
    box.querySelector('#f_guardar')?.addEventListener('click', async () => {
      const fd = new FormData();
      const nombre = val('#f_nombre', box);
      if (!nombre) { alert('Nombre es obligatorio'); return; }
      fd.append('nombre', nombre);
      fd.append('precio', val('#f_precio', box) || 0);
      fd.append('stock', val('#f_stock', box) || 0);
      fd.append('activo', val('#f_activo', box) || 1);
      fd.append('descripcion', val('#f_desc', box) || '');

      const file = inpFile?.files?.[0];
      if (file) fd.append('foto', file);
      if (editing) {
        if (box.querySelector('#f_clear')?.checked) fd.append('foto_clear', '1');
        await fetchJSON(`${cfg.base}/${editing.id}`, { method: 'PUT', body: fd });
      } else {
        await fetchJSON(`${cfg.base}`, { method: 'POST', body: fd });
      }
      box.remove();
      await load(root.querySelector('#prodSearch')?.value?.trim() || '');
    });
  }

  // helpers
  function val(sel, el = document) { return el.querySelector(sel)?.value?.trim(); }
  function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
  function safeUser() { try { return JSON.parse(localStorage.getItem('auth_user') || '{}'); } catch { return {}; } }
  async function fetchJSON(url, opt = {}) {
    const token = localStorage.getItem('auth_token') || '';
    const o = { ...opt, headers: { ...(opt.headers || {}), Authorization: token ? `Bearer ${token}` : '' } };
    
    if (o.body && !(o.body instanceof FormData)) {
      o.headers['Content-Type'] = 'application/json';
      o.body = JSON.stringify(o.body);
    }
    const r = await fetch(url, o);
    if (!r.ok) {
      const msg = await r.text().catch(() => `HTTP ${r.status}`);
      throw new Error(msg || `HTTP ${r.status}`);
    }
    const ct = r.headers.get('content-type') || '';
    return ct.includes('application/json') ? r.json() : r.text();
  }
}
