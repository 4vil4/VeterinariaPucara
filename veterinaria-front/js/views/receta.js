export async function init({ root, API, authHeaders }) {
  root.classList.add('receta');
  root.innerHTML = `
    <div class="toolbar">
      <h2>📝 Recetas</h2>
      <div style="margin-left:auto"></div>
      <input id="q" class="input" placeholder="Buscar (mascota, propietario, texto…)" />
      <button id="btnReload" class="btn btn-edit">Recargar</button>
    </div>

    <div class="grid">
      <section class="card">
        <h3 style="margin-top:0">Nueva receta</h3>
        <form id="fReceta" class="frm">
          <div class="row">
            <div>
              <label>Mascota</label>
              <select id="mascota_id" required></select>
            </div>
            <div>
              <label>Fecha</label>
              <input id="fecha" type="datetime-local"/>
            </div>
          </div>

          <div class="row">
            <div>
              <label>Diagnóstico</label>
              <textarea id="diagnostico" placeholder="Opcional"></textarea>
            </div>
            <div>
              <label>Indicaciones</label>
              <textarea id="indicaciones" placeholder="Cuidados, recomendaciones…"></textarea>
            </div>
          </div>

          <div>
            <label>Medicamentos <span class="hint">(nombre, dosis, frecuencia)</span></label>
            <textarea id="medicamentos" placeholder="Ej: Otifree 5 gotas c/12h x 7 días"></textarea>
          </div>

          <!-- === Antibióticos === -->
          <div id="abSection" class="card" style="margin-top:12px">
            <div style="display:flex; align-items:center; gap:8px">
              <input id="r_ab_check" type="checkbox" />
              <label for="r_ab_check"><b>Contiene antibiótico</b></label>
            </div>

            <div id="r_ab_box" style="display:none; margin-top:8px">
              <div style="display:flex; gap:8px; align-items:end; flex-wrap:wrap">
                <div>
                  <label>Buscar antibiótico</label>
                  <input id="r_ab_search" class="input" placeholder="Nombre, fabricante, concentración..." />
                </div>
                <div style="flex:1; min-width:260px">
                  <label>Seleccionar</label>
                  <select id="r_ab_select" class="input" size="6" style="width:100%"></select>
                </div>
                <div>
                  <label>Dosis</label>
                  <input id="r_ab_dosis" class="input" placeholder="ej: 250 mg c/12h"/>
                </div>
                <div>
                  <label>Días</label>
                  <input id="r_ab_dias" class="input" type="number" min="1" step="1" />
                </div>
                <div>
                  <label>Notas</label>
                  <input id="r_ab_notas" class="input" />
                </div>
                <button id="r_ab_add" class="btn-hist" type="button">Agregar</button>
              </div>

              <div id="r_ab_list" style="margin-top:10px">
                <p class="hint">Sin antibióticos agregados.</p>
              </div>
            </div>
          </div>
          <!-- === /Antibióticos === -->

          <!-- Bloque firmado -->
          <div id="vetBlock"></div>

          <div class="row">
            <button class="btn-hist" type="submit">Guardar</button>
            <button class="btn-del" type="reset">Limpiar</button>
          </div>
        </form>
      </section>

      <section class="card">
        <h3 style="margin-top:0">Listado</h3>
        <div id="tblWrap"></div>
      </section>
    </div>
  `;

  // ---- Auth helpers
  function getUser() { try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; } }
  function getRole() { const u = getUser() || {}; return (u.role || u.rol || u.perfil || '').toString().toLowerCase(); }
  function getUserId() { const u = getUser() || {}; return u.id || u.user_id || u.veterinario_id || null; }
  function getUserName() { const u = getUser() || {}; return u.nombre || u.fullName || u.displayName || u.name || ''; }

  function getAuthHeaders() {
    return typeof authHeaders === 'function' ? authHeaders() : {};
  }

  const role = getRole();

  // ---- DOM refs
  const $q = root.querySelector('#q');
  const $btnReload = root.querySelector('#btnReload');
  const $tbl = root.querySelector('#tblWrap');
  const $selMascota = root.querySelector('#mascota_id');
  const $form = root.querySelector('#fReceta');
  const $vetBlock = root.querySelector('#vetBlock');

  // antibióticos DOM
  const abCheck = root.querySelector('#r_ab_check');
  const abBox = root.querySelector('#r_ab_box');
  const abSearch = root.querySelector('#r_ab_search');
  const abSelect = root.querySelector('#r_ab_select');
  const abDosis = root.querySelector('#r_ab_dosis');
  const abDias = root.querySelector('#r_ab_dias');
  const abNotas = root.querySelector('#r_ab_notas');
  const abAddBtn = root.querySelector('#r_ab_add');
  const abListDiv = root.querySelector('#r_ab_list');

  // ---- Data state
  let mascotas = [];
  let rows = [];
  let vets = [];
  let timer = null;

  // antibióticos state
  let abCatalog = [];
  let abUsos = []; // {antibiotico_id, nombre, dosis, duracion_dias, notas}

  // ---- Utils
  const esc = (s) => (s == null ? '' : String(s)).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const fmtDate = (s) => s ? new Date(s).toLocaleString() : '';
  function waLinkFromClNumber(raw, text) {
    let d = (raw || '').replace(/\D+/g, '');
    if (!d.startsWith('56')) {
      if (d.length === 9 && d.startsWith('9')) d = '56' + d;
      else if (d.length === 8) d = '569' + d;
      else d = '56' + d;
    }
    return `https://wa.me/${d}?text=${encodeURIComponent(text)}`;
  }
  function composeMsg(r) {
    return (
      `Hola ${r.propietario_nombre || ''}, aquí va la receta de ${r.mascota_nombre || ''} (${fmtDate(r.fecha)}):\n\n` +
      (r.diagnostico ? `Diagnóstico: ${r.diagnostico}\n` : '') +
      (r.indicaciones ? `Indicaciones: ${r.indicaciones}\n` : '') +
      (r.medicamentos ? `Medicamentos:\n${r.medicamentos}\n` : '') +
      `\n*Clínica Veterinaria Pucará*`
    ).trim();
  }

  async function fetchJSON(url, options = {}) {
    const baseHeaders = {
      Accept: 'application/json',
      ...getAuthHeaders(),
      ...(options.headers || {}),
    };
    const o = { ...options, headers: baseHeaders };

    if (o.body && typeof o.body === 'object' && !(o.body instanceof FormData)) {
      o.headers['Content-Type'] = 'application/json';
      o.body = JSON.stringify(o.body);
    }

    const r = await fetch(url, o);
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
  }

  // ---- UI builders
  function renderVetBlock() {
    if (role === 'vet') {
      $vetBlock.innerHTML = `
        <div>
          <label>Firmado por</label>
          <div class="badge">👨‍⚕️ ${esc(getUserName() || 'Veterinario')}</div>
          <div class="hint">Se firmará con tu usuario actual.</div>
        </div>`;
    } else if (role === 'admin') {
      $vetBlock.innerHTML = `
        <div class="row">
          <div>
            <label>Veterinario</label>
            <select id="veterinario_id" required></select>
          </div>
          <div>
            <label>Firmado por</label>
            <input id="firmado_por" type="text" readonly />
          </div>
        </div>`;
      const $sel = $vetBlock.querySelector('#veterinario_id');
      const $firmado = $vetBlock.querySelector('#firmado_por');
      $sel.innerHTML = `<option value="" disabled selected>Cargando…</option>`;
      vets.forEach(v => {
        const opt = document.createElement('option');
        opt.value = v.id; opt.textContent = v.nombre; $sel.appendChild(opt);
      });
      $sel.addEventListener('change', () => {
        const v = vets.find(x => String(x.id) === $sel.value);
        $firmado.value = v ? v.nombre : '';
      });
      if (vets.length) {
        $sel.value = String(vets[0].id);
        $firmado.value = vets[0].nombre;
      }
    } else {
      $vetBlock.innerHTML = `
        <div>
          <label>Firmado por</label>
          <div class="hint">Debes tener rol vet o admin para firmar recetas.</div>
        </div>`;
    }
  }

  function renderTable(list) {
    if (!list.length) { $tbl.innerHTML = `<p class="hint">Sin recetas.</p>`; return; }
    const head = `
      <thead><tr>
        <th>ID</th><th>Fecha</th><th>Mascota</th><th>Propietario</th><th>Resumen</th><th>Acciones</th>
      </tr></thead>`;
    const body = `<tbody>
      ${list.map(r => `
        <tr>
          <td>${r.id}</td>
          <td>${esc(fmtDate(r.fecha))}</td>
          <td>${esc(r.mascota_nombre)}</td>
          <td>${esc(r.propietario_nombre)}</td>
          <td>${esc((r.diagnostico || r.medicamentos || r.indicaciones || '').slice(0, 100))}</td>
          <td class="actions">
            <button class="btn btn-outline btn-wsp" data-id="${r.id}">WSP</button>
            <button class="btn btn-outline btn-del" data-id="${r.id}">Eliminar</button>
          </td>
        </tr>`).join('')}
    </tbody>`;
    $tbl.innerHTML = `<table class="tbl">${head}${body}</table>`;

    $tbl.querySelectorAll('.btn-wsp').forEach(b => b.addEventListener('click', () => {
      const id = Number(b.dataset.id);
      const r = rows.find(x => x.id === id);
      if (!r?.propietario_movil) { alert('El propietario no tiene móvil registrado.'); return; }
      window.open(waLinkFromClNumber(r.propietario_movil, composeMsg(r)), '_blank');
    }));
    $tbl.querySelectorAll('.btn-del').forEach(b => b.addEventListener('click', async () => {
      const id = Number(b.dataset.id);
      if (!confirm('¿Eliminar esta receta?')) return;
      await fetchJSON(`${API}/api/recetas/${id}`, { method: 'DELETE' });
      await loadList();
    }));
  }

  async function loadMascotas() {
    mascotas = await fetchJSON(`${API}/api/mascotas`);
    root.querySelector('#mascota_id').innerHTML =
      `<option value="" disabled selected>Selecciona…</option>` +
      mascotas.map(m => `<option value="${m.id}">${esc(m.nombre)} — ${esc(m.propietario_nombre || '')}</option>`).join('');
  }

  async function loadVets() {
    const urls = [
      `${API}/api/personal?veterinarios=1`,
      `${API}/api/personal/veterinarios`,
      `${API}/api/veterinarios`
    ];
    for (const u of urls) {
      try {
        const data = await fetchJSON(u);
        vets = (Array.isArray(data) ? data : data.items || []).map(x => ({
          id: x.id || x.veterinario_id || x.user_id || x.persona_id,
          nombre: x.nombre || x.fullName || x.displayName || `${x.nombres || ''} ${x.apellidos || ''}`.trim()
        })).filter(v => v.id && v.nombre);
        if (vets.length) break;
      } catch { }
    }
  }

  async function loadList() {
    const s = $q.value?.trim();
    const url = new URL(`${API}/api/recetas`);
    if (s) url.searchParams.set('search', s);
    rows = await fetchJSON(url.toString());
    renderTable(rows);
  }

  // ===== Antibióticos (catálogo y lista en formulario) =====
  abCheck.addEventListener('change', () => {
    abBox.style.display = abCheck.checked ? 'block' : 'none';
  });

  (async () => {
    try {
      abCatalog = await fetchJSON(`${API}/api/antibioticos?solo_activos=1`);
      renderAbOptions('');
    } catch { /* silencioso */ }
  })();

  abSearch.addEventListener('input', () => renderAbOptions(abSearch.value.trim()));

  function renderAbOptions(q) {
    const n = s => (s || '').toString().toLowerCase();
    const list = abCatalog.filter(a =>
      !q ||
      n(a.nombre).includes(n(q)) ||
      n(a.fabricante || '').includes(n(q)) ||
      n(a.concentracion || '').includes(n(q))
    );
    abSelect.innerHTML = list.map(a => `
      <option value="${a.id}">
        ${esc(a.nombre)}${a.concentracion ? ' — ' + esc(a.concentracion) : ''}${a.forma ? ' — ' + esc(a.forma) : ''}
      </option>`).join('');
  }

  abAddBtn.addEventListener('click', () => {
    const aid = Number(abSelect.value);
    if (!aid) { alert('Selecciona un antibiótico'); return; }
    const a = abCatalog.find(x => x.id === aid);
    if (!a) { alert('Antibiótico inválido'); return; }

    const item = {
      antibiotico_id: aid,
      nombre: a.nombre,
      dosis: abDosis.value.trim() || null,
      duracion_dias: abDias.value ? Number(abDias.value) : null,
      notas: abNotas.value.trim() || null
    };
    abUsos.push(item);
    abDosis.value = ''; abDias.value = ''; abNotas.value = '';
    renderAbList();
  });

  function renderAbList() {
    if (!abUsos.length) { abListDiv.innerHTML = '<p class="hint">Sin antibióticos agregados.</p>'; return; }
    const rowsHtml = abUsos.map((x, i) => `
      <tr>
        <td>${esc(x.nombre)}</td>
        <td>${esc(x.dosis || '')}</td>
        <td>${x.duracion_dias ?? ''}</td>
        <td>${esc(x.notas || '')}</td>
        <td style="width:80px"><button class="btn-sm btn-outline" data-i="${i}">Quitar</button></td>
      </tr>`).join('');
    abListDiv.innerHTML = `
      <table class="tbl">
        <thead><tr><th>Antibiótico</th><th>Dosis</th><th>Días</th><th>Notas</th><th></th></tr></thead>
        <tbody>${rowsHtml}</tbody>
      </table>`;
    abListDiv.querySelectorAll('button[data-i]').forEach(b => {
      b.addEventListener('click', () => {
        const i = Number(b.dataset.i);
        abUsos.splice(i, 1);
        renderAbList();
      });
    });
  }

  // ---- Guardar receta
  $form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!$selMascota.value) { alert('Selecciona una mascota'); return; }

    let firmado_por = null;
    let veterinario_id = null;

    if (role === 'vet') {
      firmado_por = getUserName() || null;
      veterinario_id = getUserId() || null;
    } else if (role === 'admin') {
      const $sel = $vetBlock.querySelector('#veterinario_id');
      const $firmado = $vetBlock.querySelector('#firmado_por');
      veterinario_id = $sel?.value ? Number($sel.value) : null;
      firmado_por = $firmado?.value || null;
    }

    const payload = {
      mascota_id: Number($selMascota.value),
      fecha: root.querySelector('#fecha').value || null,
      diagnostico: root.querySelector('#diagnostico').value || null,
      indicaciones: root.querySelector('#indicaciones').value || null,
      medicamentos: root.querySelector('#medicamentos').value || null,
      firmado_por, veterinario_id,
      antibiotico_bool: abCheck.checked || abUsos.length ? 1 : 0,
      antibioticos: abCheck.checked ? abUsos.map(x => ({
        antibiotico_id: x.antibiotico_id,
        dosis: x.dosis,
        duracion_dias: x.duracion_dias,
        notas: x.notas
      })) : []
    };

    await fetchJSON(`${API}/api/recetas`, { method: 'POST', body: payload });
    $form.reset();
    abUsos = []; renderAbList(); abBox.style.display = 'none';
    renderVetBlock();
    await loadList();
  });

  $q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(loadList, 300); });
  $btnReload.addEventListener('click', loadList);

  await Promise.all([loadMascotas(), loadVets()]);
  renderVetBlock();
  await loadList();
}
