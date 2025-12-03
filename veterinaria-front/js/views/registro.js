export async function init({ root, API, params }) {
    const tipo = params?.tipo;
    const cfg = CONFIG[tipo];
    if (!cfg) {
        root.innerHTML = `<div class="card"><h2>${tipo}</h2><p>Tipo no soportado.</p></div>`;
        return;
    }

    const me = getUser();
    const isVet = me?.role === 'vet';
    const myVetId = me?.veterinario_id || null;

    const title = root.querySelector('#regTitle');
    const tableWrap = root.querySelector('#regTableWrap');
    const inputSearch = root.querySelector('#regSearch');
    const btnNew = root.querySelector('#regNew');

    title.textContent = `Registros · ${cfg.title}`;

    await loadAndRender('');

    let t;
    inputSearch.addEventListener('input', () => {
        clearTimeout(t);
        t = setTimeout(() => loadAndRender(inputSearch.value.trim()), 250);
    });

    btnNew.addEventListener('click', () => {
        showForm(root, API, cfg, isVet, myVetId, me, async (payload) => {
            if (isVet) payload.veterinario_id = myVetId;
            await apiPost(`${API}/api/registros/${tipo}`, payload);
            await loadAndRender(inputSearch.value.trim());
        });
    });

    async function loadAndRender(search) {
        const url = `${API}/api/registros/${tipo}${search ? `?search=${encodeURIComponent(search)}` : ''}`;
        const rows = await fetchJSON(url);
        tableWrap.innerHTML = buildTable(rows, cfg);
    }
}

const PESO_FIELD = { name: 'peso_kg', type: 'number', step: '0.01', label: 'Peso (kg)' };

const CONFIG = {
    consulta: {
        title: 'Consulta',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'motivo', label: 'Motivo' },
            { key: 'diagnostico', label: 'Diagnóstico' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'motivo', label: 'Motivo' },
            { name: 'diagnostico', label: 'Diagnóstico', type: 'textarea' },
            { name: 'indicaciones', label: 'Indicaciones', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
            { name: 'anestesia_bool', type: 'checkbox', label: 'Consulta con anestesia' }
        ]
    },
    control: {
        title: 'Control',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'motivo', label: 'Motivo' },
            { key: 'peso_kg', label: 'Peso' },
            { key: 'temperatura_c', label: 'Temp.' },
        ],
        form: [
            { name: 'mascota_id', label: 'Mascota', type: 'pet' },
            { name: 'fecha', label: 'Fecha', type: 'datetime' },
            PESO_FIELD,
            { name: 'motivo', label: 'Motivo' },
            { name: 'temperatura_c', label: 'Temperatura (°C)', type: 'number', step: '0.1' },
            { name: 'diagnostico', label: 'Diagnóstico', type: 'textarea' },
            { name: 'indicaciones', label: 'Indicaciones', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    cirugia: {
        title: 'Cirugía',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'procedimiento', label: 'Procedimiento' },
            { key: 'asa', label: 'ASA' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'procedimiento', label: 'Procedimiento' },
            { name: 'asa', label: 'ASA' },
            { name: 'cirujano', label: 'Cirujano' },
            { name: 'anestesia', label: 'Anestesia' },
            { name: 'notas', label: 'Notas', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    vacuna: {
        title: 'Vacuna',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'vacuna', label: 'Vacuna' },
            { key: 'lote', label: 'Lote' },
            { key: 'proxima_fecha', label: 'Próxima' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'vacuna', label: 'Vacuna' },
            { name: 'lote', label: 'Lote' },
            { name: 'proxima_fecha', type: 'date', label: 'Próxima fecha' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    antiparasitario: {
        title: 'Antiparasitario',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'producto', label: 'Producto' },
            { key: 'via', label: 'Vía' },
            { key: 'dosis', label: 'Dosis' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'producto', label: 'Producto' },
            { name: 'via', label: 'Vía (oral/tópico/inyectable)' },
            { name: 'dosis', type: 'number', step: '0.01', label: 'Dosis' },
            { name: 'unidad', label: 'Unidad' },
            { name: 'proxima_fecha', type: 'date', label: 'Próxima fecha' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    antipulgas: {
        title: 'Antipulgas',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'producto', label: 'Producto' },
            { key: 'via', label: 'Vía' },
            { key: 'dosis', label: 'Dosis' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'producto', label: 'Producto' },
            { name: 'via', label: 'Vía (tópico/oral)' },
            { name: 'dosis', type: 'number', step: '0.01', label: 'Dosis' },
            { name: 'proxima_fecha', type: 'date', label: 'Próxima fecha' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    triaje: {
        title: 'Triaje',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'nivel', label: 'Nivel' },
            { key: 'notas', label: 'Notas' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'nivel', label: 'Nivel (I-V)' },
            { name: 'notas', label: 'Notas', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    profilaxis: {
        title: 'Profilaxis',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'tipo', label: 'Tipo' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'tipo', label: 'Tipo (p.ej. dental)' },
            { name: 'procedimiento', label: 'Procedimiento', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    defuncion: {
        title: 'Defunción',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'tipo', label: 'Tipo' },
            { key: 'causa', label: 'Causa' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'tipo', label: 'Tipo (natural/eutanasia)' },
            { name: 'causa', label: 'Causa' },
            { name: 'certificado', label: 'Certificado (0/1)' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    dermatologia: {
        title: 'Dermatología',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'motivo', label: 'Motivo' },
            { key: 'diagnostico', label: 'Diagnóstico' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'motivo', label: 'Motivo' },
            { name: 'diagnostico', label: 'Diagnóstico' },
            { name: 'tratamiento', label: 'Tratamiento', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    orden_examen: {
        title: 'Orden de exámenes',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'tipo_examen', label: 'Tipo' },
            { key: 'estado', label: 'Estado' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'tipo_examen', label: 'Tipo de examen' },
            { name: 'laboratorio', label: 'Laboratorio' },
            { name: 'estado', label: 'Estado (pendiente/enviado/recibido/informado)' },
            { name: 'observaciones', label: 'Observaciones', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
    oftalmologia: {
        title: 'Oftalmología',
        columns: [
            { key: 'id', label: 'ID', w: 80 },
            { key: 'fecha', label: 'Fecha' },
            { key: 'mascota_nombre', label: 'Mascota' },
            { key: 'motivo', label: 'Motivo' },
            { key: 'diagnostico', label: 'Diagnóstico' }
        ],
        form: [
            { name: 'mascota_id', type: 'pet', label: 'Mascota' },
            { name: 'fecha', type: 'datetime', label: 'Fecha' },
            PESO_FIELD,
            { name: 'motivo', label: 'Motivo' },
            { name: 'diagnostico', label: 'Diagnóstico' },
            { name: 'tratamiento', label: 'Tratamiento', type: 'textarea' },
            { name: 'veterinario_id', type: 'vet', label: 'Veterinario' },
            { name: 'monto_total', type: 'number', step: '100', label: 'Monto total (CLP)' },
        ]
    },
};

function buildTable(rows, cfg) {
    const head = `
    <thead><tr>
      ${cfg.columns.map(c => `<th ${c.w ? `style="width:${c.w}px"` : ''}>${c.label}</th>`).join('')}
    </tr></thead>`;

    const body = `
    <tbody>
      ${rows.map(r => `
        <tr>
          ${cfg.columns.map(c => {
            let val = r[c.key] ?? '';
            // Formatear fechas como DD/MM/YYYY HH:mm
            if (c.key === 'fecha' && val) {
                val = formatDateTime(val);
            }
            return `<td>${esc(val)}</td>`;
          }).join('')}
        </tr>`).join('')}
    </tbody>`;

    return `<table class="tbl">${head}${body}</table>`;
}

function showForm(root, API, cfg, isVet, myVetId, me, onSubmit) {
    const wrap = document.createElement('div');
    wrap.className = 'card';
    wrap.style.marginTop = '12px';

    const fieldsHTML = cfg.form.map(f => {
        if (f.type === 'textarea') {
            return `<div ${f.full ? 'style="grid-column:1 / -1"' : ''}><label>${f.label}</label><textarea class="input" id="${f.name}" rows="3"></textarea></div>`;
        }
        if (f.type === 'datetime') {
            return `<div><label>${f.label}</label><input class="input" id="${f.name}" type="datetime-local"></div>`;
        }
        if (f.type === 'date') {
            return `<div><label>${f.label}</label><input class="input" id="${f.name}" type="date"></div>`;
        }
        if (f.type === 'number') {
            return `<div><label>${f.label}</label><input class="input" id="${f.name}" type="number" step="${f.step || '1'}" value="${f.value ?? ''}"></div>`;
        }
        if (f.type === 'checkbox') {
            return `<div style="display:flex;align-items:center;gap:8px"><input id="${f.name}" type="checkbox"><label for="${f.name}">${f.label}</label></div>`;
        }
        if (f.type === 'pet') {
            return `
      <div>
        <label>${f.label}</label>
        <input class="input" id="pet_search" placeholder="Buscar mascota por nombre..." />
        <select class="input" id="pet_select" size="5" style="margin-top:6px;height:140px"></select>
        <small style="color:#64748b">Selecciona una mascota.</small>
      </div>`;
        }
        if (f.type === 'vet') {
            if (isVet && myVetId) {
                return `
        <div>
          <label>Veterinario</label>
          <div class="input" style="background:#f8fafc">${esc(me?.nombre || 'Mi usuario')}</div>
        </div>`;
            }
            return `
      <div>
        <label>${f.label}</label>
        <input class="input" id="vet_search" placeholder="Buscar veterinario..." />
        <select class="input" id="vet_select" size="5" style="margin-top:6px;height:140px"></select>
        <small style="color:#64748b">Selecciona un veterinario.</small>
      </div>`;
        }
        return `<div><label>${f.label}</label><input class="input" id="${f.name}"></div>`;
    }).join('');

    wrap.innerHTML = `
    <h3 style="margin-top:0">Nuevo ${cfg.title}</h3>
    <div class="form-grid">${fieldsHTML}</div>
    <div style="margin-top:14px;display:flex;gap:8px">
      <button class="btn-hist" id="f_guardar">Guardar</button>
      <button class="btn-del" id="f_cancelar">Cancelar</button>
    </div>
  `;
    root.prepend(wrap);

    const petSearch = wrap.querySelector('#pet_search');
    const petSelect = wrap.querySelector('#pet_select');
    let mascotas = [];
    let selectedPet = null;
    (async () => {
        if (petSelect) {
            mascotas = await fetchJSON(`${API}/api/mascotas`);
            renderPets('');
            petSearch.addEventListener('input', () => renderPets(petSearch.value.trim()));
            petSelect.addEventListener('change', () => selectedPet = Number(petSelect.value) || null);
        }
    })();
    function renderPets(q) {
        const norm = (s) => (s || '').toString().toLowerCase();
        const list = mascotas.filter(m => !q || norm(m.nombre).includes(norm(q)));
        petSelect.innerHTML = list.map(m => `<option value="${m.id}">${esc(m.nombre)} — ${esc(m.especie || '')}</option>`).join('');
    }

    const vetSearch = wrap.querySelector('#vet_search');
    const vetSelect = wrap.querySelector('#vet_select');
    let veterinarios = [];
    let selectedVet = null;
    (async () => {
        if (vetSelect) {
            veterinarios = await fetchJSON(`${API}/api/personal`);
            renderVets('');
            vetSearch.addEventListener('input', () => renderVets(vetSearch.value.trim()));
            vetSelect.addEventListener('change', () => selectedVet = Number(vetSelect.value) || null);
        }
    })();
    function renderVets(q) {
        const norm = (s) => (s || '').toString().toLowerCase();
        const list = veterinarios.filter(v => !q || norm(v.nombre).includes(norm(q)) || norm(v.rut || '').includes(norm(q)));
        vetSelect.innerHTML = list.map(v => `<option value="${v.id}">${esc(v.nombre)}${v.rut ? ' — ' + esc(v.rut) : ''}</option>`).join('');
    }

    wrap.querySelector('#f_cancelar').onclick = () => wrap.remove();
    wrap.querySelector('#f_guardar').onclick = async () => {
        const data = {};
        for (const f of cfg.form) {
            if (f.type === 'pet') { data.mascota_id = selectedPet; continue; }
            if (f.type === 'vet') { data.veterinario_id = (isVet && myVetId) ? myVetId : (selectedVet || null); continue; }
            const el = wrap.querySelector('#' + f.name);
            if (!el) continue;
            if (f.type === 'checkbox') data[f.name] = el.checked ? 1 : 0;
            else if (f.type === 'number') data[f.name] = el.value === '' ? null : Number(el.value);
            else data[f.name] = el.value?.trim() || null;
        }

        if (!data.mascota_id) { alert('Debes seleccionar una mascota'); return; }
        if (isVet && !myVetId) { alert('Tu usuario no está vinculado a un veterinario. Contacta al administrador.'); return; }
        if (data.monto_total == null) data.monto_total = 0;

        await onSubmit(data);
        wrap.remove();
    };
}

function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }

function getUser() { try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; } }
function authHeaders() { const t = localStorage.getItem('auth_token'); return t ? { Authorization: `Bearer ${t}` } : {}; }
async function fetchJSON(url) { const r = await fetch(url, { headers: { ...authHeaders() } }); if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); }
async function apiPost(url, body) {
    const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify(body)
    });
    let j = null; try { j = await r.json(); } catch { }
    if (!r.ok) throw new Error(j?.msg || `HTTP ${r.status}`);
    return j;
}

/** Formato: DD/MM/YYYY HH:mm */
function formatDateTime(value) {
    const d = new Date(value);
    if (isNaN(d)) return value; 

    const pad = n => String(n).padStart(2, '0');
    const dd = pad(d.getDate());
    const mm = pad(d.getMonth() + 1);
    const yyyy = d.getFullYear();
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());

    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}
