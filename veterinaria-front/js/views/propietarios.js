export async function init({ root, API }) {
  const tableWrap = root.querySelector('#propTableWrap');
  const searchInput = root.querySelector('#propSearch');
  const btnNuevo = root.querySelector('#btnNuevoProp');

  await loadAndRender('');

  let t;
  searchInput.addEventListener('input', () => {
    clearTimeout(t);
    t = setTimeout(() => loadAndRender(searchInput.value.trim()), 250);
  });

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
  const old = root.querySelector('.prop-form');
  if (old) old.remove();

  const v = data || {};
  const wrap = document.createElement('div');
  wrap.className = 'card prop-form';
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
      <button class="btn-hist" id="f_guardar">Guardar</button>
      <button class="btn-del" id="f_cancelar">Cancelar</button>
    </div>
  `;
  root.prepend(wrap);

  const nombreInput = wrap.querySelector('#f_nombre');
  const rutInput = wrap.querySelector('#f_rut');
  const correoInput = wrap.querySelector('#f_correo');
  const movilInput = wrap.querySelector('#f_movil');

  if (nombreInput) {
    nombreInput.addEventListener('input', () => {
      let val = nombreInput.value;
      val = val.replace(/[^a-zA-ZÁÉÍÓÚáéíóúÑñ\s]/g, '');
      nombreInput.value = val;
    });
  }

  if (rutInput) {
    rutInput.addEventListener('input', () => {
      rutInput.value = formatRut(rutInput.value);
    });
  }

  if (movilInput) {
    movilInput.addEventListener('focus', () => {
      if (!movilInput.value.trim()) movilInput.value = '+569';
    });
    movilInput.addEventListener('input', () => {
      movilInput.value = formatMovil(movilInput.value);
    });
  }

  wrap.querySelector('#f_cancelar').onclick = () => wrap.remove();
  wrap.querySelector('#f_guardar').onclick = async () => {
    const payload = {
      nombre: get('#f_nombre', wrap),
      rut: get('#f_rut', wrap),
      correo: get('#f_correo', wrap),
      movil: get('#f_movil', wrap),
      direccion: get('#f_direccion', wrap),
    };

    if (!payload.nombre) {
      alert('El nombre es obligatorio');
      return;
    }

    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(payload.nombre)) {
      alert('El nombre solo puede contener letras y espacios.');
      return;
    }

    if (payload.rut) {
      const raw = payload.rut.replace(/[^0-9kK]/g, '');
      if (raw.length < 2) {
        alert('El RUT no es válido.');
        return;
      }
      const dv = raw.slice(-1).toUpperCase();
      if (!/^[0-9K]$/.test(dv)) {
        alert('El dígito verificador del RUT debe ser un número o K.');
        return;
      }
      payload.rut = formatRut(payload.rut);
    }

    if (payload.correo) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.correo)) {
        alert('Ingresa un correo válido (debe contener @ y un dominio).');
        return;
      }
    }

    if (payload.movil) {
      payload.movil = formatMovil(payload.movil);
      if (!/^\+569\d{8}$/.test(payload.movil)) {
        alert('El móvil debe tener el formato +569 seguido de 8 dígitos.');
        return;
      }
    }

    await onSubmit(payload);
    wrap.remove();
  };
}

/* --------------- helpers --------------- */
function get(sel, root = document) {
  return root.querySelector(sel).value?.trim();
}

function esc(s) {
  return (s ?? '').toString().replace(/[&<>"']/g, m =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])
  );
}

async function fetchJSON(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiPost(url, body) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiPut(url, body) {
  const r = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

async function apiDelete(url) {
  const r = await fetch(url, { method: 'DELETE' });
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return r.json();
}

/* ---- formateadores específicos ---- */
function formatRut(value) {
  let v = (value || '').replace(/[^0-9kK]/g, '').toUpperCase();
  if (!v) return '';
  if (v.length > 9) v = v.slice(0, 9);
  if (v.length <= 1) return v;
  const cuerpo = v.slice(0, -1);
  const dv = v.slice(-1);
  const cuerpoFmt = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${cuerpoFmt}-${dv}`;
}

function formatMovil(value) {
  let v = (value || '').replace(/[^\d]/g, '');
  if (!v) return '+569';
  if (v.startsWith('569')) {
    v = v.slice(3);
  } else if (v.startsWith('56')) {
    v = v.slice(2);
  } else if (v.startsWith('9')) {
    v = v.slice(1);
  }
  v = v.slice(0, 8);
  return '+569' + v;
}
