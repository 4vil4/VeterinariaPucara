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
    updateWhatsFab(); 
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
  updateWhatsFab(); 

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

// === WhatsApp FAB ===
const WHATS_PHONE = '56912345678'; // <-- tu número en formato internacional SIN + ni 00
const WHATS_MSG = 'Hola 👋, quisiera más información.';
let $whatsFab = null;

function ensureWhatsFab() {
  if ($whatsFab) return $whatsFab;
  const a = document.createElement('a');
  a.id = 'whatsFab';
  a.className = 'whats-fab';
  a.href = `https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent(WHATS_MSG)}`;
  a.target = '_blank';
  a.rel = 'noopener';
  a.title = 'Escríbenos por WhatsApp';
  a.innerHTML = `
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M19.11 17.6c-.28-.14-1.63-.8-1.88-.89-.25-.09-.43-.14-.62.14-.19.28-.71.88-.88 1.06-.16.19-.32.21-.6.07-.28-.14-1.19-.44-2.27-1.41-.84-.75-1.41-1.68-1.58-1.96-.16-.28-.02-.43.12-.57.12-.12.28-.32.42-.49.14-.16.19-.28.28-.47.09-.19.05-.36-.02-.5-.07-.14-.62-1.49-.85-2.05-.22-.53-.44-.46-.62-.47h-.53c-.19 0-.5.07-.76.36-.26.28-1 1-1 2.43 0 1.43 1.02 2.81 1.16 3 .14.19 2 3.06 4.84 4.29.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.12.55-.08 1.63-.67 1.86-1.31.23-.64.23-1.19.16-1.31-.07-.12-.25-.19-.53-.33zM27 16c0 6.08-4.93 11-11 11-1.93 0-3.75-.5-5.32-1.39L4 27.99l2.43-6.46A10.94 10.94 0 0 1 5 16c0-6.07 4.93-11 11-11s11 4.93 11 11z"/>
    </svg>`;
  document.body.appendChild(a);
  $whatsFab = a;
  return $whatsFab;
}

function shouldShowWhatsFab() {
  const role = getUser()?.role || null;
  // visible si NO es admin (incluye público sin sesión y vet/user)
  return role !== 'admin';
}

function updateWhatsFab() {
  ensureWhatsFab();
  $whatsFab.style.display = shouldShowWhatsFab() ? '' : 'none';
}

ensureWhatsFab(); updateWhatsFab();