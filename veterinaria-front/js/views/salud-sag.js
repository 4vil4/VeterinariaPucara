// /public/js/views/certificados/salud-sag.js
export async function init({ root, API }) {
    const listWrap = root.querySelector('#certTableWrap');
    const searchInput = root.querySelector('#certSearch');
    const btnNew = root.querySelector('#btnNuevoCert');
    const formMount = root.querySelector('#certFormMount');

    let rows = [];
    await load('');

    let t;
    searchInput.addEventListener('input', () => {
        clearTimeout(t); t = setTimeout(() => render(searchInput.value.trim()), 250);
    });
    btnNew.addEventListener('click', () => openForm());

    async function load(q) {
        const url = `${API}/api/certificados/salud-sag${q ? `?search=${encodeURIComponent(q)}` : ''}`;
        rows = await jget(url);
        render(q);
    }

    function render(q = '') {
        const qn = (s) => (s || '').toLowerCase();
        const data = rows.filter(r =>
            !q || qn(r.mas_nombre).includes(qn(q)) || qn(r.prop_nombre).includes(qn(q)) || qn(r.vet_nombre).includes(qn(q))
        );

        listWrap.innerHTML = `
      <table class="tbl">
        <thead><tr>
          <th>#</th><th>Fecha</th><th>Mascota</th><th>Propietario</th><th>Vet.</th>
          <th style="width:260px">Acciones</th>
        </tr></thead>
        <tbody>
          ${data.map(r => `
            <tr>
              <td>${r.id}</td>
              <td>${fmt(r.fecha_cert)}</td>
              <td>${esc(r.mas_nombre)}</td>
              <td>${esc(r.prop_nombre)}</td>
              <td>${esc(r.vet_nombre)}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-outline btn-sm" data-act="edit" data-id="${r.id}">Editar</button>
                  <a class="btn btn-outline btn-sm" target="_blank" href="${API}/api/certificados/salud-sag/${r.id}/pdf">PDF</a>
                  <a class="btn btn-wa btn-sm" target="_blank"
                     href="https://wa.me/?text=${encodeURIComponent(`Le comparto su Certificado de Salud SAG (ID ${r.id}). PDF: ${API}/api/certificados/salud-sag/${r.id}/pdf`)}">
                     WhatsApp
                  </a>
                  <button class="btn btn-outline btn-sm" data-act="del" data-id="${r.id}">Eliminar</button>
                </div>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;
        listWrap.querySelectorAll('[data-act="edit"]').forEach(b => b.onclick = () => openForm(Number(b.dataset.id)));
        listWrap.querySelectorAll('[data-act="del"]').forEach(b => b.onclick = () => del(Number(b.dataset.id)));
    }

    async function del(id) {
        if (!confirm('¿Eliminar certificado?')) return;
        await jdel(`${API}/api/certificados/salud-sag/${id}`);
        await load(searchInput.value.trim());
    }

    async function openForm(editId = null) {
        formMount.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'card';
        wrap.style.marginTop = '12px';
        formMount.appendChild(wrap);

        // Datos base
        const mascotas = await jget(`${API}/api/mascotas`);
        const propietarios = await jget(`${API}/api/propietarios`);
        const veterinarios = await jget(`${API}/api/personal?vets=1`).catch(() => []);

        const editing = editId ? await jget(`${API}/api/certificados/salud-sag/${editId}`) : null;

        // Datos de tabla 
        const vacData = parseOrDefault(editing?.vacunacion_json, [
            { nombre: 'Distemper' }, { nombre: 'Adenovirus (Hepatitis)' },
            { nombre: 'Leptospira (L. canícola e icterohaemorrhagiae)' },
            { nombre: 'Parvovirus' }, { nombre: 'Parainfluenza' },
            { nombre: 'Coronavirus' }, { nombre: 'Antirrábica' }
        ]);
        const desData = parseOrDefault(editing?.desparasitacion_json, [
            { tipo: 'Interna' }, { tipo: 'Externa' }
        ]);

        wrap.innerHTML = `
      <h3 style="margin-top:0">${editId ? 'Editar' : 'Nuevo'} Certificado Salud SAG</h3>
      <div class="form-grid">
        <div class="full"><b>Mascota</b></div>
        <div>
          <label>Buscar mascota</label>
          <input class="input" id="m_search" placeholder="Nombre..." />
          <select class="input" id="m_sel" size="6" style="margin-top:6px;height:140px"></select>
        </div>
        <div>
          <label>Propietario</label>
          <select class="input" id="p_sel" size="6" style="height:140px"></select>
        </div>

        <div><label>Color</label><input class="input" id="mas_color" value="${editing?.mas_color ?? ''}"></div>
        <div><label>Fecha certificación</label><input class="input" id="fecha_cert" type="date" value="${editing ? (editing.fecha_cert || '').slice(0, 10) : today()}"></div>
        <div><label>Fecha inspección</label><input class="input" id="fecha_inspeccion" type="date" value="${editing ? (editing.fecha_inspeccion || '').slice(0, 10) : today()}"></div>
        <div><label>N° Microchip</label><input class="input" id="mas_microchip" value="${editing?.mas_microchip ?? ''}"></div>
        <div><label>Fecha aplicación microchip</label><input class="input" id="chip_fecha" type="date" value="${editing ? (editing.chip_fecha || '').slice(0, 10) : ''}"></div>
        <div><label>Sitio de aplicación</label><input class="input" id="chip_sitio" value="${editing?.chip_sitio ?? ''}"></div>

        <div class="full"><b>Veterinario firmante</b></div>
        <div>
          <label>Veterinario</label>
          <select class="input" id="v_sel" size="6" style="height:140px"></select>
          <p class="small-note">Dirección fija: Esmeralda #97 – San Bernardo (editable abajo).</p>
        </div>
        <div>
          <label>Dirección</label>
          <input class="input" id="vet_direccion" value="${editing?.vet_direccion || 'Esmeralda #97 – San Bernardo'}">
          <div class="small-note">Se imprime en el certificado.</div>
        </div>

        <div class="full"><b>Página 2 · Vacunación</b></div>
        <div class="full">
          <div id="vac_table"></div>
        </div>

        <div class="full"><b>Página 2 · Desparasitación</b></div>
        <div class="full">
          <div id="des_table"></div>
        </div>
      </div>

      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary" id="f_guardar">Guardar</button>
        <button class="btn btn-outline" id="f_cancelar">Cancelar</button>
      </div>
    `;

        // selects
        const mSel = wrap.querySelector('#m_sel'), mSearch = wrap.querySelector('#m_search');
        const pSel = wrap.querySelector('#p_sel');
        const vSel = wrap.querySelector('#v_sel');

        function renderMascotas(q = '') {
            const norm = (s) => (s || '').toLowerCase();
            const list = mascotas.filter(m => !q || norm(m.nombre).includes(norm(q)));
            mSel.innerHTML = list.map(m => `<option value="${m.id}">${esc(m.nombre)} — ${esc(m.especie || '')}</option>`).join('');
            if (editing) mSel.value = String(editing.mascota_id);
        }
        function renderPropietarios() {
            pSel.innerHTML = propietarios.map(p => `<option value="${p.id}">${esc(p.nombre)}${p.rut ? ' — ' + esc(p.rut) : ''}</option>`).join('');
            if (editing) pSel.value = String(editing.propietario_id);
        }
        function renderVets() {
            vSel.innerHTML = veterinarios.map(v => `<option value="${v.id}">${esc(v.nombre)}${v.rut ? ' — ' + esc(v.rut) : ''}</option>`).join('');
            if (editing) vSel.value = String(editing.veterinario_id);
        }
        renderMascotas(''); renderPropietarios(); renderVets();
        let t3; mSearch.addEventListener('input', () => { clearTimeout(t3); t3 = setTimeout(() => renderMascotas(mSearch.value.trim()), 200); });

        // cambios automáticos
        mSel.addEventListener('change', () => {
            const m = mascotas.find(x => String(x.id) === String(mSel.value));
            if (!m) return;
            setVal('#mas_microchip', m.nro_microchip || '');
            if (m.propietario_id) pSel.value = String(m.propietario_id);
        });

        // ======= TABLAS EDITABLES =======
        buildVacTable(wrap.querySelector('#vac_table'), vacData);
        buildDesTable(wrap.querySelector('#des_table'), desData);

        wrap.querySelector('#f_cancelar').onclick = () => wrap.remove();
        wrap.querySelector('#f_guardar').onclick = async () => {
            const m = mascotas.find(x => String(x.id) === String(mSel.value));
            const p = propietarios.find(x => String(x.id) === String(pSel.value));
            const v = veterinarios.find(x => String(x.id) === String(vSel.value));
            if (!m || !p || !v) { alert('Selecciona mascota, propietario y veterinario'); return; }

            // obtener datos desde las tablas
            const vacRows = readVacTable(wrap.querySelector('#vac_table'));
            const desRows = readDesTable(wrap.querySelector('#des_table'));

            const payload = {
                mascota_id: m.id, propietario_id: p.id, veterinario_id: v.id,
                mas_nombre: m.nombre, mas_raza: m.raza, mas_peso_kg: m.peso_kg,
                mas_especie: m.especie, mas_edad_anios: m.edad_anios, mas_sexo: m.sexo,
                mas_microchip: getVal('#mas_microchip', wrap),
                mas_color: getVal('#mas_color', wrap),
                chip_fecha: getVal('#chip_fecha', wrap) || null,
                chip_sitio: getVal('#chip_sitio', wrap) || null,

                prop_nombre: p.nombre, prop_rut: p.rut, prop_direccion: p.direccion, prop_fono: p.movil,

                fecha_cert: getVal('#fecha_cert', wrap) || today(),
                fecha_inspeccion: getVal('#fecha_inspeccion', wrap) || today(),

                vet_nombre: v.nombre, vet_rut: v.rut, vet_fono: v.movil,
                vet_direccion: getVal('#vet_direccion', wrap) || 'Esmeralda #97 – San Bernardo',

                vacunacion_json: JSON.stringify(vacRows),
                desparasitacion_json: JSON.stringify(desRows),
            };

            if (editId) await jput(`${API}/api/certificados/salud-sag/${editId}`, payload);
            else await jpost(`${API}/api/certificados/salud-sag`, payload);

            wrap.remove();
            await load(searchInput.value.trim());
        };
    }

    // --------- helpers UI tablas ----------
    function buildVacTable(mount, rows) {
        mount.innerHTML = `
      <table class="tbl grid-table">
        <thead><tr>
          <th>Nombre vacuna</th><th>Laboratorio</th><th>N° de serie</th><th>Fecha vacunación</th><th>Vigencia</th>
        </tr></thead>
        <tbody>
          ${rows.map((r, i) => `
            <tr>
              <td><input class="input input--sm" data-field="nombre" data-i="${i}" value="${esc(r.nombre || '')}" ${r.nombre ? 'readonly' : ''}></td>
              <td><input class="input input--sm" data-field="laboratorio" data-i="${i}" value="${esc(r.laboratorio || '')}"></td>
              <td><input class="input input--sm" data-field="serie" data-i="${i}" value="${esc(r.serie || '')}"></td>
              <td><input class="input input--sm" type="date" data-field="fecha" data-i="${i}" value="${(r.fecha || '').slice(0, 10)}"></td>
              <td><input class="input input--sm" data-field="vigencia" data-i="${i}" value="${esc(r.vigencia || '')}"></td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;
    }
    function buildDesTable(mount, rows) {
        mount.innerHTML = `
      <table class="tbl grid-table">
        <thead><tr>
          <th></th><th>Nombre Producto</th><th>Laboratorio</th><th>Principio activo</th><th>Lote</th><th>Fecha desparasitación</th><th>Hora</th>
        </tr></thead>
        <tbody>
          ${rows.map((r, i) => `
            <tr>
              <td><input class="input input--sm" data-field="tipo" data-i="${i}" value="${esc(r.tipo || '')}" ${r.tipo ? 'readonly' : ''}></td>
              <td><input class="input input--sm" data-field="producto" data-i="${i}" value="${esc(r.producto || '')}"></td>
              <td><input class="input input--sm" data-field="laboratorio" data-i="${i}" value="${esc(r.laboratorio || '')}"></td>
              <td><input class="input input--sm" data-field="principio" data-i="${i}" value="${esc(r.principio || '')}"></td>
              <td><input class="input input--sm" data-field="lote" data-i="${i}" value="${esc(r.lote || '')}"></td>
              <td><input class="input input--sm" type="date" data-field="fecha" data-i="${i}" value="${(r.fecha || '').slice(0, 10)}"></td>
              <td><input class="input input--sm" data-field="hora" data-i="${i}" value="${esc(r.hora || '')}"></td>
            </tr>`).join('')}
        </tbody>
      </table>
    `;
    }
    function readVacTable(mount) {
        const rows = [];
        const trs = Array.from(mount.querySelectorAll('tbody tr'));
        trs.forEach((tr, i) => {
            const get = (f) => tr.querySelector(`[data-field="${f}"][data-i="${i}"]`)?.value?.trim() || '';
            rows.push({
                nombre: get('nombre'),
                laboratorio: get('laboratorio'),
                serie: get('serie'),
                fecha: get('fecha'),
                vigencia: get('vigencia'),
            });
        });
        return rows;
    }
    function readDesTable(mount) {
        const rows = [];
        const trs = Array.from(mount.querySelectorAll('tbody tr'));
        trs.forEach((tr, i) => {
            const get = (f) => tr.querySelector(`[data-field="${f}"][data-i="${i}"]`)?.value?.trim() || '';
            rows.push({
                tipo: get('tipo'),
                producto: get('producto'),
                laboratorio: get('laboratorio'),
                principio: get('principio'),
                lote: get('lote'),
                fecha: get('fecha'),
                hora: get('hora'),
            });
        });
        return rows;
    }
    function parseOrDefault(json, def) {
        try { const v = json ? JSON.parse(json) : null; return Array.isArray(v) ? v : def; }
        catch { return def; }
    }

    // --------- helpers varios ----------
    function fmt(iso) { if (!iso) return ''; const d = new Date(iso); return d.toLocaleDateString('es-CL'); }
    function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])) }
    function getVal(sel, root = document) { return root.querySelector(sel)?.value?.trim(); }
    function setVal(sel, v, root = document) { const el = root.querySelector(sel); if (el) el.value = v ?? ''; }
    function today() { return new Date().toISOString().slice(0, 10); }

    // fetch helpers
    async function jget(u) { const r = await fetch(u); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
    async function jpost(u, b) { const r = await fetch(u, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
    async function jput(u, b) { const r = await fetch(u, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(b) }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
    async function jdel(u) { const r = await fetch(u, { method: 'DELETE' }); if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }
}
