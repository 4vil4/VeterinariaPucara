const API = 'http://localhost:4000';

/* ===== Auth helpers ===== */
function getUser() { try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; } }
function getToken() { return localStorage.getItem('auth_token'); }
function isLoggedIn() { return !!getToken(); }
function authHeaders() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }

/* ===== DOM ===== */
const $sidebar = document.querySelector('aside.sidebar');
const $menu = document.querySelector('aside.sidebar .menu');
const $btnHeaderLogin = document.getElementById('btnHeaderLogin'); // botón en top-right

/* ===== Alternar UI pública/privada ===== */
function setPublicUI(isPublic) {
  const sidebar = document.querySelector('aside.sidebar, #sidebar, .sidebar');
  const btnHeaderLogin = document.getElementById('btnHeaderLogin');

  if (sidebar) {
    sidebar.classList.toggle('is-hidden', isPublic);
    sidebar.style.display = isPublic ? 'none' : '';
    const shell = sidebar.parentElement; 
    if (shell) shell.classList.toggle('public-no-sidebar', isPublic);
  }

  // Botón "Iniciar sesión" solo en público
  if (btnHeaderLogin) btnHeaderLogin.style.display = isPublic ? '' : 'none';

  document.body.classList.toggle('public-mode', isPublic);
}

function buildMenu() {
  const me = getUser();
  const isVet = me?.role === 'vet';
  if (!$menu) return;

  const adminMenu = [
    { href: '#/mascotas', label: '🐾 Mascotas' },
    { href: '#/propietarios', label: '🧑 Propietarios' },
    { href: '#/registro/consulta', label: '📑 Registros' },
    { href: '#/citas', label: '🧭 Citas' },
    { href: '#/calendario', label: '🗓️ Calendario' },
    { href: '#/urgencias', label: '🚨 Urgencias' },
    { href: '#/historico', label: '📁 Historico' },
    { href: '#/personal', label: '🩺 Personal' },
  ];
  const vetMenu = [
    { href: '#/mascotas', label: '🐾 Mascotas' },
    { href: '#/propietarios', label: '🧑 Propietarios' },
    { href: '#/registro/consulta', label: '📑 Registros' },
    { href: '#/citas', label: '🧭 Citas' },
    { href: '#/calendario', label: '🗓️ Calendario' },
    { href: '#/urgencias', label: '🚨 Urgencias' },
  ];

  const registrosSubmenu = `
    <button class="menu__item menu__item--btn text-menu" id="btnRegistros">
      📑<span>Registros</span><i class="i i-caret" aria-hidden="true"></i>
    </button>
    <div class="submenu" id="submenuRegistros">
      <a href="#/registro/consulta" class="submenu__item text-submenu">📝 Consulta</a>
      <a href="#/registro/control" class="submenu__item text-submenu">📝 Control</a>
      <a href="#/registro/cirugia" class="submenu__item text-submenu">📝 Cirugía</a>
      <a href="#/registro/vacuna" class="submenu__item text-submenu">📝 Vacuna</a>
      <a href="#/registro/antiparasitario" class="submenu__item text-submenu">📝 Antiparasitario</a>
      <a href="#/registro/antipulgas" class="submenu__item text-submenu">📝 Antipulgas</a>
      <a href="#/registro/hospitalizacion" class="submenu__item text-submenu">📝 Hospitalización</a>
      <a href="#/registro/triaje" class="submenu__item text-submenu">📝 Triaje</a>
      <a href="#/registro/profilaxis" class="submenu__item text-submenu">📝 Profilaxis</a>
      <a href="#/registro/defuncion" class="submenu__item text-submenu">📝 Defunción</a>
      <a href="#/registro/dermatologia" class="submenu__item text-submenu">📝 Dermatología</a>
      <a href="#/registro/orden_examen" class="submenu__item text-submenu">📝 Orden de exámenes</a>
      <a href="#/registro/oftalmologia" class="submenu__item text-submenu">📝 Oftalmología</a>
    </div>`;

  const items = (isVet ? vetMenu : adminMenu)
    .map(i => (i.label.includes('Registros') ? registrosSubmenu : `<a href="${i.href}" class="menu__item text-menu"><span>${i.label}</span></a>`))
    .join('');

  const logoutBtn = `
    <div class="menu__spacer"></div>
    <button class="menu__item menu__item--btn text-menu btn btn-outline" id="btnLogout">
      <span>🔴 Cerrar sesión</span>
    </button>
  `;
  $menu.innerHTML = items + logoutBtn;

  document.getElementById('btnRegistros')?.addEventListener('click', () => {
    document.getElementById('submenuRegistros')?.classList.toggle('open');
  });
  document.getElementById('btnLogout')?.addEventListener('click', () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    // activar modo público 
    setPublicUI(true);

    location.hash = '#/public';
    router();
  });

}

/* ===== Router ===== */
const app = document.getElementById('app');
const routes = {
  '/public': () => mountView('public'),
  '/mascotas': () => mountView('mascotas'),
  '/propietarios': () => mountView('propietarios'),
  '/citas': () => mountView('citas'),
  '/calendario': () => mountView('calendario'),
  '/urgencias': () => mountView('urgencias'),
  '/historico': () => mountView('historico'),
  '/personal': () => mountView('personal'),
  '/registro/:tipo': (p) => mountView('registro', p),
};

function parseHash() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\//, '').split('/');
  if (parts[0] === 'registro' && parts[1]) {
    return { route: '/registro/:tipo', params: { tipo: parts[1] } };
  }
  return { route: `/${parts[0] || ''}` };
}

function guardRoute(route) {
  const me = getUser();
  if (me?.role === 'vet' && (route === '/historico' || route === '/personal')) {
    location.hash = '#/mascotas';
    return false;
  }
  return true;
}

async function router() {
  const { route, params } = parseHash();

  if (!isLoggedIn()) {
    setPublicUI(true);
    if (route !== '/public') {
      location.hash = '#/public';
      return;
    }
    await routes['/public']();
    return;
  }

  if (route === '/public') {
    location.hash = '#/mascotas';
    return;
  }

  // UI privada 
  setPublicUI(false);
  buildMenu();

  if (!guardRoute(route)) return;

  if (routes[route]) routes[route](params || {});
  else app.innerHTML = `<div class="card"><h2>Panel</h2><p>Selecciona una opción del menú.</p></div>`;
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

/* ===== Loader de vistas (HTML + CSS + módulo JS) ===== */
const loadedCSS = new Set();
const loadedModules = new Map();
const viewCssDeps = {
  public: ['../css/public.css'],
  calendario: ['../css/calendario.css'],
  urgencias: ['../css/calendario.css', '../css/urgencias.css'],
  citas: ['../css/citas.css'],
  mascotas: ['../css/mascotas.css'],
  propietarios: ['../css/propietarios.css'],
  registro: ['../css/registro.css'],
  historico: ['../css/citas.css', '../css/historico.css'],
};

async function mountView(name, params = {}) {
  try {
    const htmlURL = new URL(`../views/${name}.html`, import.meta.url).toString();
    const res = await fetch(htmlURL, { headers: { ...authHeaders() } });
    if (!res.ok) throw new Error(`HTML ${res.status} en ${htmlURL}`);
    app.innerHTML = await res.text();

    const deps = viewCssDeps[name] || [`../css/${name}.css`];
    for (const href of deps) await loadCSSOnce(href);

    const modURL = new URL(`./views/${name}.js`, import.meta.url).toString();
    const mod = await loadModuleOnce(modURL);
    if (typeof mod.init !== 'function') {
      app.insertAdjacentHTML('beforeend', `<p style="color:#b91c1c">La vista "${name}" no exporta <code>init</code>.</p>`);
      return;
    }
    await mod.init({ root: app, API, params });
  } catch (e) {
    app.innerHTML = `<div class="card"><h2>${name}</h2><p style="color:#b91c1c">Error: ${e?.message || e}</p></div>`;
    console.error(e);
  }
}

async function loadCSSOnce(href) {
  const abs = new URL(href + `?v=${Date.now()}`, import.meta.url).toString();
  if (loadedCSS.has(abs)) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = abs;
  document.head.appendChild(link);
  loadedCSS.add(abs);
}
async function loadModuleOnce(url) {
  const abs = url + `?v=${Date.now()}`;
  if (loadedModules.has(abs)) return loadedModules.get(abs);
  const mod = await import(abs);
  loadedModules.set(abs, mod);
  return mod;
}
