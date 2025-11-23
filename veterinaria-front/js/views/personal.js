export async function init({ root, API }) {
  const tblWrap = root.querySelector('#vetTableWrap');
  const resWrap = root.querySelector('#vetResumenWrap');
  const detWrap = root.querySelector('#vetDetalleWrap');
  const search = root.querySelector('#vetSearch');
  const btnNuevo = root.querySelector('#btnNuevoVet');
  const from = root.querySelector('#from');
  const to = root.querySelector('#to');

  let vets = [];
  let currentVet = null;

  const y = new Date().getFullYear();
  from.value = `${y}-01`; to.value = `${y}-12`;

  await loadVets('');

  let t;
  search.oninput = () => {
    clearTimeout(t);
    t = setTimeout(() => loadVets(search.value.trim()), 250);
  };
  root.querySelector('#btnFiltrar').onclick = () => currentVet && loadHistorico(currentVet.id);
  btnNuevo.onclick = () => openVetForm(null);

  async function loadVets(q) {
    const url = `${API}/api/personal${q ? `?search=${encodeURIComponent(q)}` : ''}`;
    vets = await fetchJSON(url);
    tblWrap.innerHTML = buildTable(vets);
    tblWrap.querySelectorAll('tr[data-id]').forEach(tr => {
      tr.onclick = () => {
        currentVet = vets.find(v => v.id == tr.dataset.id);
        root.querySelector('#vetTitle').textContent = `Histórico por mes – ${currentVet.nombre}`;
        loadHistorico(currentVet.id);
      };
    });
    tblWrap.querySelectorAll('.btn-edit').forEach(b => b.onclick = (e) => {
      e.stopPropagation();
      openVetForm(vets.find(v => v.id == b.dataset.id));
    });
    tblWrap.querySelectorAll('.btn-del').forEach(b => b.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm('¿Eliminar (desactivar) este veterinario?')) return;
      await apiDelete(`${API}/api/personal/${b.dataset.id}`);
      await loadVets(search.value.trim());
      if (currentVet?.id == b.dataset.id) {
        currentVet = null;
        resWrap.textContent = 'Seleccione un veterinario…';
        detWrap.innerHTML = '';
      }
    });
  }

  async function loadHistorico(vetId) {
    const f = from.value + '-01';
    const t = to.value + '-01';
    const { resumen, detalle } = await fetchJSON(`${API}/api/personal/${vetId}/historico?from=${f}&to=${t}`);

    resWrap.innerHTML = `
      <table class="tbl">
        <thead><tr><th>Mes</th><th># Reg.</th><th>Total bruto</th><th>Comisión</th></tr></thead>
        <tbody>
          ${resumen.map(r => `
            <tr>
              <td>${r.mes}</td>
              <td>${r.cantidad_registros}</td>
              <td>$${fmt(r.total_bruto)}</td>
              <td><b>$${fmt(r.total_comision)}</b></td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;

    detWrap.innerHTML = `
      <h4>Detalle</h4>
      <table class="tbl">
        <thead><tr><th>Fecha</th><th>Tipo</th><th>Monto</th><th>%</th><th>Comisión</th></tr></thead>
        <tbody>
          ${detalle.map(d => `
            <tr>
              <td>${String(d.fecha).slice(0, 10)}</td>
              <td>${d.tipo}</td>
              <td>$${fmt(d.monto_total)}</td>
              <td>${d.porcentaje}%</td>
              <td><b>$${fmt(d.comision_monto)}</b></td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;
  }

  function buildTable(rows) {
    return `
      <table class="tbl">
        <thead><tr><th>Nombre</th><th>RUT</th><th>Correo</th><th>Móvil</th><th style="width:140px;text-align:right">Acciones</th></tr></thead>
        <tbody>
          ${rows.map(r => `
            <tr data-id="${r.id}">
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
            </tr>`).join('')}
        </tbody>
      </table>`;
  }

  function openVetForm(v) {
    const old = root.querySelector('.vet-form');
    if (old) old.remove();

    const wrap = document.createElement('div');
    wrap.className = 'card vet-form';
    wrap.style.marginTop = '12px';
    wrap.innerHTML = `
      <h3 style="margin-top:0">${v ? 'Editar' : 'Nuevo'} veterinario</h3>
      <div class="form-grid">
        <div><label>Nombre*</label><input class="input" id="f_nombre" value="${esc(v?.nombre || '')}"></div>
        <div><label>RUT</label><input class="input" id="f_rut" value="${esc(v?.rut || '')}"></div>
        <div><label>Correo</label><input class="input" id="f_correo" type="email" value="${esc(v?.correo || '')}"></div>
        <div><label>Móvil</label><input class="input" id="f_movil" value="${esc(v?.movil || '')}"></div>
      </div>
      <div style="margin-top:12px;display:flex;gap:8px">
        <button id="f_guardar" class="btn btn-hist">Guardar</button>
        <button id="f_cancelar" class="btn btn-del">Cancelar</button>
      </div>
      ${v ? '' : `
      <hr/>
      <h4>Crear usuario de acceso</h4>
      <div class="form-grid">
        <div><label>Email de acceso*</label><input class="input" id="u_email"></div>
        <div><label>Contraseña*</label><input class="input" id="u_pass" type="password"></div>
      </div>`}
    `;
    root.prepend(wrap);

    const rutInput = wrap.querySelector('#f_rut');
    const correoInput = wrap.querySelector('#f_correo');
    const movilInput = wrap.querySelector('#f_movil');

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
        movil: get('#f_movil', wrap)
      };

      if (!payload.nombre) {
        alert('Nombre es obligatorio');
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

      if (v) {
        await apiPut(`${API}/api/personal/${v.id}`, payload);
      } else {
        const body = {
          ...payload,
          userEmail: get('#u_email', wrap),
          userPass: get('#u_pass', wrap) || null
        };
        await apiPost(`${API}/api/personal`, body);
      }
      wrap.remove();
      await loadVets(search.value.trim());
    };
  }

  function get(sel, root = document) {
    return root.querySelector(sel)?.value?.trim() || '';
  }
  function esc(s) {
    return (s ?? '').toString().replace(/[&<>\"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }
  function fmt(n) {
    return Number(n || 0).toLocaleString('es-CL');
  }
  async function fetchJSON(u, o = {}) {
    const r = await fetch(u, { ...o, headers: { 'Content-Type': 'application/json', ...(o.headers || {}) } });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }
  async function apiPost(u, b) {
    return fetchJSON(u, { method: 'POST', body: JSON.stringify(b) });
  }
  async function apiPut(u, b) {
    return fetchJSON(u, { method: 'PUT', body: JSON.stringify(b) });
  }
  async function apiDelete(u) {
    return fetchJSON(u, { method: 'DELETE' });
  }
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
