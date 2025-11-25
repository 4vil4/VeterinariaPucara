export async function init({ root, API }) {
    const listWrap = root.querySelector('#certTableWrap');
    const searchInput = root.querySelector('#certSearch');
    const btnNew = root.querySelector('#btnNuevoCert');
    const formMount = root.querySelector('#certFormMount');

    let rows = [];
    await load('');

    let t;
    searchInput.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => render(searchInput.value.trim()), 250);
    });
    btnNew.addEventListener('click', () => openForm());

    async function load(q) {
        const url = `${API}/api/certificados/defuncion${q ? `?search=${encodeURIComponent(q)}` : ''
            }`;
        rows = await jget(url);
        render(q);
    }

    function render(q = '') {
        const n = (s) => (s || '').toLowerCase();
        const data = rows.filter(
            (r) =>
                !q ||
                n(r.mas_nombre).includes(n(q)) ||
                n(r.prop_nombre).includes(n(q)) ||
                n(r.vet_nombre).includes(n(q))
        );

        listWrap.innerHTML = `
      <table class="tbl">
        <thead>
          <tr>
            <th>#</th>
            <th>Fecha Cert.</th>
            <th>Mascota</th>
            <th>Propietario</th>
            <th>Vet.</th>
            <th style="width:260px">Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${data.length
                ? data
                    .map(
                        (r) => `
            <tr>
              <td>${r.id}</td>
              <td>${fmt(r.fecha_cert)}</td>
              <td>${esc(r.mas_nombre)}</td>
              <td>${esc(r.prop_nombre)}</td>
              <td>${esc(r.vet_nombre)}</td>
              <td>
                <div class="actions">
                  <button class="btn btn-outline btn-sm btn-edit" data-act="edit" data-id="${r.id}">Editar</button>
                  <a class="btn btn-outline btn-sm btn-pdf" target="_blank" href="${API}/api/certificados/defuncion/${r.id}/pdf">PDF</a>
                  <a class="btn btn-wa btn-sm btn-WSP" target="_blank"
                    href="https://wa.me/?text=${encodeURIComponent(
                            `Le comparto el Certificado de Defunción de su mascota (ID ${r.id}). PDF: ${API}/api/certificados/defuncion/${r.id}/pdf`
                        )}">
                    WhatsApp
                  </a>
                  <button class="btn btn-outline btn-sm btn-del" data-act="del" data-id="${r.id}">Eliminar</button>
                </div>
              </td>
            </tr>`
                    )
                    .join('')
                : `<tr><td colspan="6">Sin certificados.</td></tr>`
            }
        </tbody>
      </table>
    `;

        listWrap
            .querySelectorAll('[data-act="edit"]')
            .forEach((b) => (b.onclick = () => openForm(Number(b.dataset.id))));
        listWrap
            .querySelectorAll('[data-act="del"]')
            .forEach((b) => (b.onclick = () => delCert(Number(b.dataset.id))));
    }

    async function delCert(id) {
        if (!confirm('¿Eliminar certificado de defunción?')) return;
        await jdel(`${API}/api/certificados/defuncion/${id}`);
        await load(searchInput.value.trim());
    }

    async function openForm(editId = null) {
        formMount.innerHTML = '';
        const wrap = document.createElement('div');
        wrap.className = 'card';
        wrap.style.marginTop = '12px';
        formMount.appendChild(wrap);

        const mascotas = await jget(`${API}/api/mascotas`);
        const propietarios = await jget(`${API}/api/propietarios`);
        const veterinarios = await jget(
            `${API}/api/personal?vets=1`
        ).catch(() => []);

        const editing = editId
            ? await jget(`${API}/api/certificados/defuncion/${editId}`)
            : null;

        wrap.innerHTML = `
      <h3 style="margin-top:0">${editId ? 'Editar' : 'Nuevo'
            } Certificado de Defunción</h3>
      <div class="form-grid">
        <div class="full"><b>Mascota / Propietario</b></div>
        <div>
          <label>Buscar mascota</label>
          <input class="input" id="m_search" placeholder="Nombre..." />
          <select class="input" id="m_sel" size="6" style="margin-top:6px;height:140px"></select>
        </div>
        <div>
          <label>Propietario</label>
          <select class="input" id="p_sel" size="6" style="height:140px"></select>
        </div>

        <div class="full"><b>Datos de Defunción</b></div>
        <div><label>Color</label><input class="input" id="color" value="${esc(
                editing?.color || ''
            )}"></div>
        <div><label>Fecha de Defunción</label><input class="input" id="fecha_defuncion" type="date" value="${editing
                ? (editing.fecha_defuncion || '').slice(0, 10)
                : today()
            }"></div>
        <div><label>Lugar de Defunción</label><input class="input" id="lugar_defuncion" value="${esc(
                editing?.lugar_defuncion || ''
            )}"></div>
        <div class="full">
          <label>Motivo de Defunción</label>
          <textarea class="input" id="motivo_defuncion" rows="3">${esc(
                editing?.motivo_defuncion || ''
            )}</textarea>
        </div>

        <div><label>Fecha Certificado</label><input class="input" id="fecha_cert" type="date" value="${editing
                ? (editing.fecha_cert || '').slice(0, 10)
                : today()
            }"></div>

        <div class="full"><b>Veterinario firmante</b></div>
        <div>
          <label>Veterinario</label>
          <select class="input" id="v_sel" size="6" style="height:140px"></select>
        </div>
      </div>

      <div style="margin-top:12px;display:flex;gap:8px">
        <button class="btn btn-primary btn-add" id="f_guardar">Guardar</button>
        <button class="btn btn-outline btn-del" id="f_cancelar">Cancelar</button>
      </div>
    `;

        const mSel = wrap.querySelector('#m_sel');
        const mSearch = wrap.querySelector('#m_search');
        const pSel = wrap.querySelector('#p_sel');
        const vSel = wrap.querySelector('#v_sel');

        function renderMascotas(q = '') {
            const norm = (s) => (s || '').toLowerCase();
            const list = mascotas.filter(
                (m) => !q || norm(m.nombre).includes(norm(q))
            );
            mSel.innerHTML = list
                .map(
                    (m) =>
                        `<option value="${m.id}">${esc(m.nombre)} — ${esc(
                            m.especie || ''
                        )}</option>`
                )
                .join('');
            if (editing) mSel.value = String(editing.mascota_id);
        }

        function renderPropietarios() {
            pSel.innerHTML = propietarios
                .map(
                    (p) =>
                        `<option value="${p.id}">${esc(p.nombre)}${p.rut ? ' — ' + esc(p.rut) : ''
                        }</option>`
                )
                .join('');
            if (editing) pSel.value = String(editing.propietario_id);
        }

        function renderVets() {
            vSel.innerHTML = veterinarios
                .map(
                    (v) =>
                        `<option value="${v.id}">${esc(v.nombre)}${v.rut ? ' — ' + esc(v.rut) : ''
                        }</option>`
                )
                .join('');

            let me = null;
            try {
                me = JSON.parse(localStorage.getItem('auth_user') || 'null');
            } catch {
                me = null;
            }

            if (editing) {
                vSel.value = String(editing.veterinario_id);
            } else if (me && me.role === 'vet') {
                const vetMatch =
                    veterinarios.find(
                        (v) =>
                            me.veterinario_id &&
                            String(v.id) === String(me.veterinario_id)
                    ) ||
                    veterinarios.find(
                        (v) =>
                            me.nombre &&
                            v.nombre &&
                            v.nombre.toLowerCase() === me.nombre.toLowerCase()
                    );

                if (vetMatch) {
                    vSel.value = String(vetMatch.id);
                }
            }
        }

        renderMascotas('');
        renderPropietarios();
        renderVets();

        let t2;
        mSearch.addEventListener('input', () => {
            clearTimeout(t2);
            t2 = setTimeout(
                () => renderMascotas(mSearch.value.trim()),
                200
            );
        });

        mSel.addEventListener('change', () => {
            const m = mascotas.find(
                (x) => String(x.id) === String(mSel.value)
            );
            if (!m) return;
            if (m.propietario_id) pSel.value = String(m.propietario_id);
        });

        wrap.querySelector('#f_cancelar').onclick = () => wrap.remove();

        wrap.querySelector('#f_guardar').onclick = async () => {
            const m = mascotas.find(
                (x) => String(x.id) === String(mSel.value)
            );
            const p = propietarios.find(
                (x) => String(x.id) === String(pSel.value)
            );
            const v = veterinarios.find(
                (x) => String(x.id) === String(vSel.value)
            );

            if (!m || !p || !v) {
                alert(
                    'Debes seleccionar mascota, propietario y veterinario'
                );
                return;
            }

            const payload = {
                mascota_id: m.id,
                propietario_id: p.id,
                veterinario_id: v.id,
                color: getVal('#color', wrap),
                fecha_defuncion: getVal('#fecha_defuncion', wrap),
                lugar_defuncion: getVal('#lugar_defuncion', wrap),
                motivo_defuncion: getVal('#motivo_defuncion', wrap),
                fecha_cert: getVal('#fecha_cert', wrap),
            };

            if (!payload.fecha_defuncion) {
                alert('Fecha de defunción es obligatoria');
                return;
            }

            if (editId)
                await jput(
                    `${API}/api/certificados/defuncion/${editId}`,
                    payload
                );
            else
                await jpost(
                    `${API}/api/certificados/defuncion`,
                    payload
                );

            wrap.remove();
            await load(searchInput.value.trim());
        };
    }

    // helpers
    function fmt(iso) {
        if (!iso) return '';
        const d = new Date(iso);
        return d.toLocaleDateString('es-CL');
    }
    function esc(s) {
        return (s ?? '').toString().replace(
            /[&<>"']/g,
            (m) =>
            ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;',
            }[m])
        );
    }
    function getVal(sel, root = document) {
        return root.querySelector(sel)?.value?.trim() || '';
    }
    function today() {
        return new Date().toISOString().slice(0, 10);
    }

    async function jget(u) {
        const r = await fetch(u);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }
    async function jpost(u, b) {
        const r = await fetch(u, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(b),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }
    async function jput(u, b) {
        const r = await fetch(u, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(b),
        });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }
    async function jdel(u) {
        const r = await fetch(u, { method: 'DELETE' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
    }
}
