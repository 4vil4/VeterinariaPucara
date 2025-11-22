// views/antibioticos.js
let _authHeadersFn = null;

export async function init({ root, API, authHeaders }) {
  const $search = root.querySelector('#abSearch');
  const $newBtn = root.querySelector('#abNew');
  const $wrap = root.querySelector('#abWrap');
  const $tabs = root.querySelectorAll('#abTabBar .btn');
  const $filterEnv = root.querySelector('#abFilterEnv');
  const $refreshUsos = root.querySelector('#abRefreshUsos');

  // guardamos la función para usarla en los helpers globales
  _authHeadersFn = authHeaders;

  let currentTab = 'catalogo';
  let t;

  function setTab(tab) {
    currentTab = tab;
    $tabs.forEach(b => {
      if (b.dataset.tab === tab) b.classList.add('btn-edit');
      else b.classList.remove('btn-edit');
    });
    const showUsosControls = (tab === 'usos');
    $filterEnv.style.display = showUsosControls ? 'inline-block' : 'none';
    $refreshUsos.style.display = showUsosControls ? 'inline-block' : 'none';
    $newBtn.style.display = tab === 'catalogo' ? 'inline-block' : 'none';
    load();
  }

  async function load() {
    if (currentTab === 'catalogo') {
      const q = $search.value.trim();
      const rows = await fetchJSON(`${API}/api/antibioticos?solo_activos=1${q ? `&search=${encodeURIComponent(q)}` : ''}`);
      $wrap.innerHTML = renderCatalog(rows);
      bindCatalogActions();
    } else {
      const enviados = $filterEnv.value || 'todos';
      const rows = await fetchJSON(`${API}/api/antibioticos/usos?enviados=${encodeURIComponent(enviados)}`);
      $wrap.innerHTML = renderUsos(rows);
      bindUsosActions();
    }
  }

  function renderCatalog(rows) {
    const head = `
      <thead><tr>
        <th>Nombre</th><th>Forma</th><th>Concentración</th><th>Vía</th><th>Fabricante</th><th style="width:160px">Acciones</th>
      </tr></thead>`;
    const body = `
      <tbody>
        ${rows.map(r => `
          <tr data-id="${r.id}">
            <td>${esc(r.nombre)}</td>
            <td>${esc(r.forma || '')}</td>
            <td>${esc(r.concentracion || '')}</td>
            <td>${esc(r.via || '')}</td>
            <td>${esc(r.fabricante || '')}</td>
            <td>
              <div class="actions">
                <button class="btn-edit" data-id="${r.id}">Editar</button>
                <button class="btn-del" data-id="${r.id}">Desactivar</button>
              </div>
            </td>
          </tr>
        `).join('')}
      </tbody>`;
    return `<table class="tbl">${head}${body}</table>`;
  }

  function renderUsos(rows) {
    const head = `
    <thead><tr>
      <th>Fecha receta</th><th>Mascota</th><th>Propietario</th>
      <th>Antibiótico</th><th>Dosis</th><th>Días</th>
      <th>Estado</th><th style="width:140px">Acciones</th>
    </tr></thead>`;

    const body = `
    <tbody>
      ${rows.map(r => {
      const fechaFmt = r.enviado_at ? fmtDateTime(r.enviado_at) : '';
      const estadoHtml = r.enviado_sag_bool
        ? `<div class="estado-wrap">
               <span class="badge badge-success">Enviado</span>
               ${fechaFmt ? `<small class="estado-fecha">${fechaFmt}</small>` : ''}
             </div>`
        : `<span class="badge badge-danger">No enviado</span>`;

      return `
          <tr data-id="${r.id}">
            <td>${fmtDateTime(r.receta_fecha)}</td>
            <td>${esc(r.mascota_nombre || '')}</td>
            <td>${esc(r.propietario_nombre || '')}</td>
            <td>${esc(r.antibiotico_nombre)} ${esc(r.concentracion || '')}</td>
            <td>${esc(r.dosis || '')}</td>
            <td>${r.duracion_dias ?? ''}</td>
            <td>${estadoHtml}</td>
            <td>
              <div class="actions">
                ${r.enviado_sag_bool
          ? `<button class="btn-noenv btn-unmark" data-id="${r.id}">Desmarcar</button>`
          : `<button class="btn-env btn-mark" data-id="${r.id}">Marcar enviado</button>`
        }
              </div>
            </td>
          </tr>
        `;
    }).join('')}
    </tbody>`;

    return `<table class="tbl">${head}${body}</table>`;
  }

  function bindCatalogActions() {
    $wrap.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        const row = btn.closest('tr');
        const initVals = {
          nombre: row.children[0].textContent.trim(),
          forma: row.children[1].textContent.trim(),
          concentracion: row.children[2].textContent.trim(),
          via: row.children[3].textContent.trim(),
          fabricante: row.children[4].textContent.trim(),
          activo_bool: 1
        };
        showAbForm('Editar antibiótico', initVals, async (payload) => {
          await apiPut(`${API}/api/antibioticos/${id}`, payload);
          await load();
        });
      });
    });
    $wrap.querySelectorAll('.btn-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        if (!confirm('¿Desactivar este antibiótico?')) return;
        await apiDelete(`${API}/api/antibioticos/${id}`);
        await load();
      });
    });
  }

  function bindUsosActions() {
    $wrap.querySelectorAll('.btn-mark').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await apiPatch(`${API}/api/antibioticos/usos/${id}/enviar`, {});
        await load();
      });
    });
    $wrap.querySelectorAll('.btn-unmark').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.dataset.id;
        await apiPatch(`${API}/api/antibioticos/usos/${id}/desmarcar`, {});
        await load();
      });
    });
  }

  function showAbForm(title, v, onSubmit) {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.innerHTML = `
      <h3 style="margin-top:0">${title}</h3>
      <div class="form-grid">
        <div><label>Nombre*</label><input class="input" id="f_nombre" value="${esc(v?.nombre || '')}" /></div>
        <div><label>Forma</label><input class="input" id="f_forma" value="${esc(v?.forma || '')}" /></div>
        <div><label>Concentración</label><input class="input" id="f_conc" value="${esc(v?.concentracion || '')}" /></div>
        <div><label>Vía</label><input class="input" id="f_via" value="${esc(v?.via || '')}" /></div>
        <div><label>Fabricante</label><input class="input" id="f_fab" value="${esc(v?.fabricante || '')}" /></div>
        <div><label>Registro ISP</label><input class="input" id="f_isp" value="${esc(v?.registro_isp || '')}" /></div>
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
        nombre: wrap.querySelector('#f_nombre').value.trim(),
        forma: wrap.querySelector('#f_forma').value.trim(),
        concentracion: wrap.querySelector('#f_conc').value.trim(),
        via: wrap.querySelector('#f_via').value.trim(),
        fabricante: wrap.querySelector('#f_fab').value.trim(),
        registro_isp: wrap.querySelector('#f_isp').value.trim(),
        activo_bool: 1
      };
      if (!payload.nombre) { alert('Nombre es obligatorio'); return; }
      await onSubmit(payload);
      wrap.remove();
    };
  }

  // eventos
  $tabs.forEach(b => b.addEventListener('click', () => setTab(b.dataset.tab)));
  $search.addEventListener('input', () => { clearTimeout(t); t = setTimeout(load, 250); });
  $newBtn.addEventListener('click', () => showAbForm('Nuevo antibiótico', {}, async (p) => {
    await apiPost(`${API}/api/antibioticos`, p);
    await load();
  }));
  $filterEnv.addEventListener('change', load);
  $refreshUsos.addEventListener('click', load);

  // init
  setTab('catalogo');
}

/* utils */
function getAuthHeaders() {
  return typeof _authHeadersFn === 'function' ? _authHeadersFn() : {};
}

function esc(s) {
  return (s ?? '').toString().replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}

function fmtDateTime(s) {
  if (!s) return '';
  const d = new Date(s);
  return isNaN(d) ? '' : d.toLocaleString();
}

async function fetchJSON(url) {
  const r = await fetch(url, { headers: getAuthHeaders() });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiPost(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiPut(url, body) {
  const r = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiPatch(url, body) {
  const r = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiDelete(url) {
  const r = await fetch(url, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}
