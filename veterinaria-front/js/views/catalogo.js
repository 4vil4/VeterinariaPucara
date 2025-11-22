export async function init({ root, API, params, authHeaders }) {
    root.querySelector('#btnBackPublic')?.addEventListener('click', () => {
        if (history.length > 1) history.back();
        else location.hash = '#/public';
    });
    const tipo = String(params?.tipo || '').toLowerCase();
    const map = {
        alimentos: { title: 'Alimentos', base: `${API}/api/alimentos` },
        medicamentos: { title: 'Medicamentos', base: `${API}/api/medicamentos` },
        accesorios: { title: 'Accesorios', base: `${API}/api/accesorios` },
    };
    const cfg = map[tipo];
    if (!cfg) {
        root.innerHTML = `<div class="card"><h2>Catálogo</h2><p>Tipo no válido.</p></div>`;
        return;
    }

    root.querySelector('#catTitle').textContent = cfg.title;

    const grid = root.querySelector('#catGrid');
    const items = await fetchJSON(cfg.base);
    if (!Array.isArray(items) || items.length === 0) {
        grid.innerHTML = `<div class="card"><p>No hay productos disponibles.</p></div>`;
        return;
    }

    grid.innerHTML = items.map(r => card(r, cfg.base)).join('');

    const $dlg = root.querySelector('#catModal');
    const $close = root.querySelector('#catClose');
    const $foto = root.querySelector('#mFoto');
    const $nom = root.querySelector('#mNombre');
    const $desc = root.querySelector('#mDesc');
    const $precio = root.querySelector('#mPrecio');
    const $stock = root.querySelector('#mStock');

    grid.querySelectorAll('.cat-card').forEach(el => {
        el.addEventListener('click', async () => {
            const id = el.getAttribute('data-id');
            const r = await fetchJSON(`${cfg.base}/${id}`);
            $foto.src = `${cfg.base}/${id}/foto?ts=${Date.now()}`;
            $foto.alt = r.nombre || cfg.title;

            $nom.textContent = r.nombre || '(sin nombre)';
            $desc.textContent = r.descripcion || 'Sin descripción';
            $precio.textContent = `$${Number(r.precio || 0).toLocaleString('es-CL')}`;
            $stock.textContent = `Stock: ${Number(r.stock || 0)}`;

            if (typeof $dlg.showModal === 'function') $dlg.showModal();
            else $dlg.setAttribute('open', '');
        });
    });

    $close.addEventListener('click', () => {
        if (typeof $dlg.close === 'function') $dlg.close();
        else $dlg.removeAttribute('open');
    });
}

function card(r, base) {
    return `
    <article class="cat-card" data-id="${r.id}" title="Ver detalle">
      <div class="cat-card__imgwrap">
        <img loading="lazy" src="${base}/${r.id}/foto?ts=${Date.now()}"
             alt="${esc(r.nombre)}" onerror="this.style.display='none'">
      </div>
      <div class="cat-card__info">
        <h3 class="cat-card__name">${esc(r.nombre)}</h3>
        <strong class="cat-card__price">$${Number(r.precio || 0).toLocaleString('es-CL')}</strong>
      </div>
    </article>
  `;
}

async function fetchJSON(url) {
    const headers = authHeaders ? authHeaders() : {};
    const r = await fetch(url, { headers });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return r.json();
}

function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
