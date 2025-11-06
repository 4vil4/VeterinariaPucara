const API = 'http://localhost:4000';
let petAnim = null;

/* ===== Auth helpers ===== */
function getUser() { try { return JSON.parse(localStorage.getItem('auth_user') || 'null'); } catch { return null; } }
function getToken() { return localStorage.getItem('auth_token'); }
function isLoggedIn() { return !!getToken(); }
function authHeaders() { const t = getToken(); return t ? { Authorization: `Bearer ${t}` } : {}; }

/* ===== DOM ===== */
const $sidebar = document.querySelector('aside.sidebar');
const $menu = document.querySelector('aside.sidebar .menu');
const $btnHeaderLogin = document.getElementById('btnHeaderLogin');

// === Config FAQ PetBot ===
const PETBOT_FAQS = [
  { q: '¿Horario de atención?', a: 'Atendemos de Lunes a Sábado de 09:00 a 19:00 hrs.', kw: ['horario', 'hora', 'abren', 'cierran'] },
  { q: '¿Dónde están ubicados?', a: 'Estamos en Esmeralda 97, San Bernardo, Santiago.', kw: ['dirección', 'ubicación', 'mapa', 'donde'] },
  { q: '¿Toman urgencias?', a: 'Sí, recibimos urgencias. Si es crítico, ven cuanto antes y también avísanos por WhatsApp.', kw: ['urgencia', 'emergencia'] },
  { q: '¿Vacunación?', a: 'Aplicamos el plan de vacunación completo para perros y gatos. Te asesoramos según edad y esquema.', kw: ['vacuna', 'vacunación'] },
  { q: '¿Precios de consulta?', a: 'La consulta general tiene valor de $XXXXX. Pide tu hora por WhatsApp para confirmación.', kw: ['precio', 'valor', 'costo', 'consulta'] },
];

function normalize(s) { return (s || '').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
function findFaq(text) {
  const t = normalize(text);
  for (const f of PETBOT_FAQS) if (f.kw?.some(k => t.includes(normalize(k)))) return f;
  return PETBOT_FAQS.find(f => normalize(f.q).includes(t) || t.includes(normalize(f.q))) || null;
}

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
    { href: '#/receta', label: '📝 Receta' },
    { href: '#/hospitalizacion', label: '🏥 Hospitalización' },
    { href: '#/antibioticos', label: '🧫 Antibióticos' },
    { href: '#/citas', label: '🧭 Citas' },
    { href: '#/calendario', label: '🗓️ Calendario' },
    { href: '#/urgencias', label: '🚨 Urgencias' },
    { href: '#/certificados', label: '📄 Certificados' },
    { href: '#/historico', label: '📁 Historico' },
    { href: '#/personal', label: '🩺 Personal' },
    { href: '#/alimentos', label: '🍖 Alimentos' },
    { href: '#/medicamentos', label: '💊 Medicamentos' },
    { href: '#/accesorios', label: '🛍️ Accesorios' },
  ];
  const vetMenu = [
    { href: '#/mascotas', label: '🐾 Mascotas' },
    { href: '#/propietarios', label: '🧑 Propietarios' },
    { href: '#/registro/consulta', label: '📑 Registros' },
    { href: '#/hospitalizacion', label: '🏥 Hospitalización' },
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
      <a href="#/registro/triaje" class="submenu__item text-submenu">📝 Triaje</a>
      <a href="#/registro/profilaxis" class="submenu__item text-submenu">📝 Profilaxis</a>
      <a href="#/registro/defuncion" class="submenu__item text-submenu">📝 Defunción</a>
      <a href="#/registro/dermatologia" class="submenu__item text-submenu">📝 Dermatología</a>
      <a href="#/registro/orden_examen" class="submenu__item text-submenu">📝 Orden de exámenes</a>
      <a href="#/registro/oftalmologia" class="submenu__item text-submenu">📝 Oftalmología</a>
    </div>`;

  const certificadosSubmenu = `
    <button class="menu__item menu__item--btn text-menu" id="btnCertificados">
      📄<span>Certificados</span><i class="i i-caret" aria-hidden="true"></i>
    </button>
    <div class="submenu" id="submenuCertificados">
      <a href="#/certificados/salud-sag" class="submenu__item text-submenu">🧾 Cert Salud SAG</a>
      <a href="#/certificados/salud-pucara" class="submenu__item text-submenu">🧾 Cert Salud Pucará</a>
      <a href="#/certificados/epicrisis" class="submenu__item text-submenu">🧾 Cert Epicrisis</a>
    </div>`;

  const items = (isVet ? vetMenu : adminMenu)
    .map(i => (i.label.includes('Registros') ? registrosSubmenu
      : i.label.includes('Certificados') ? certificadosSubmenu
        : `<a href="${i.href}" class="menu__item text-menu"><span>${i.label}</span></a>`))
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
  document.getElementById('btnCertificados')?.addEventListener('click', () => {
    document.getElementById('submenuCertificados')?.classList.toggle('open');
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
  '/alimentos': () => mountView('alimentos'),
  '/medicamentos': () => mountView('medicamentos'),
  '/accesorios': () => mountView('accesorios'),
  '/ver/:tipo': (p) => mountView('catalogo', p),
  '/receta': () => mountView('receta'),
  '/antibioticos': () => mountView('antibioticos'),
  '/hospitalizacion': () => mountView('hospitalizacion'),
  '/certificados/:tipo': (p) => {
    const map = {
      'salud-sag': 'salud-sag',
      'salud-pucara': 'salud-pucara',
      'epicrisis': 'epicrisis',
    };
    const viewName = map[p.tipo] || 'salud-sag';
    return mountView(viewName, p);
  },
};

function parseHash() {
  const hash = location.hash || '#/';
  const parts = hash.replace(/^#\//, '').split('/');

  if (parts[0] === 'registro' && parts[1]) {
    return { route: '/registro/:tipo', params: { tipo: parts[1] } };
  }

  if (parts[0] === 'ver' && parts[1]) {
    return { route: '/ver/:tipo', params: { tipo: parts[1] } };
  }

  if (parts[0] === 'certificados' && parts[1]) {
    return { route: '/certificados/:tipo', params: { tipo: parts[1] } };
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
    ensurePetBotUI(); updatePetBot(); await mountPetLottie();

    const PUBLIC_ROUTES = ['/public', '/ver/:tipo'];

    if (!PUBLIC_ROUTES.includes(route)) {
      location.hash = '#/public';
      return;
    }

    await routes[route](params || {});
    return;
  }

  if (route === '/public') {
    location.hash = '#/mascotas';
    return;
  }

  setPublicUI(false);
  buildMenu();
  updateWhatsFab();
  ensurePetBotUI(); updatePetBot(); await mountPetLottie();

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
  alimentos: ['../css/productos.css'],
  medicamentos: ['../css/productos.css'],
  accesorios: ['../css/productos.css'],
  catalogo: ['../css/public.css', '../css/public-catalogo.css'],
  receta: ['../css/receta.css'],
  antibioticos: ['../css/antibiotico.css'],
  hospitalizacion: ['../css/registro-hosp.css'],
  'salud-sag': ['../css/certificados.css'],
  'salud-pucara': ['../css/certificados.css'], 
  'epicrisis': ['../css/certificados.css'],
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

/* ========== WhatsApp ========== */
const WHATS_PHONE = '56912345678';
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
  return role !== 'admin';
}

function updateWhatsFab() {
  ensureWhatsFab();
  $whatsFab.style.display = shouldShowWhatsFab() ? '' : 'none';
}

ensureWhatsFab(); updateWhatsFab();

/* ========== PetBot (Lottie) ========== */
const PET_USE = 'dog';
const PET_LOTTIE = PET_USE === 'cat' ? '../assets/lottie/a-cat.json' : '../assets/lottie/a-dog.json'; // relativo a /js/main.js
let $petFab = null, $petPanel = null, $petBody = null, $petInput = null;
let _lottieLoaded = false;

async function loadLottieOnce() {
  if (_lottieLoaded || window.lottie) { _lottieLoaded = true; return; }
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/lottie-web@5.12.2/build/player/lottie.min.js';
    s.async = true; s.onload = () => { _lottieLoaded = true; res(); }; s.onerror = rej;
    document.head.appendChild(s);
  });
}

function ensurePetBotUI() {
  if ($petFab && $petPanel) return;

  const fab = document.createElement('button');
  fab.className = 'petbot-fab';
  fab.type = 'button';
  fab.title = 'Mascota virtual';
  fab.innerHTML = `<div id="petLottie" class="petbot-lottie"></div>`;
  document.body.appendChild(fab);
  $petFab = fab;

  const panel = document.createElement('div');
  panel.className = 'petbot-panel';
  panel.innerHTML = `
    <div class="petbot-header">
      <div class="title">Pucará Bot 🐶</div>
      <button class="petbot-close" aria-label="Cerrar">✕</button>
    </div>
    <div class="petbot-body"></div>
    <div class="petbot-input">
      <input type="text" placeholder="Escribe tu pregunta..." />
      <button type="button">Enviar</button>
    </div>`;
  document.body.appendChild(panel);

  panel.querySelector('.petbot-close').addEventListener('click', () => panel.classList.remove('open'));
  $petBody = panel.querySelector('.petbot-body');
  $petInput = panel.querySelector('.petbot-input input');
  const sendBtn = panel.querySelector('.petbot-input button');

  function pushMsg(text, who = 'bot') {
    const b = document.createElement('div');
    b.className = `pb-msg ${who}`;
    b.textContent = text;
    $petBody.appendChild(b);
    $petBody.scrollTop = $petBody.scrollHeight;
  }

  function send(text) {
    if (!text) return;
    pushMsg(text, 'user');
    const hit = findFaq(text);
    if (hit) {
      pushMsg(hit.a, 'bot');
    } else {
      pushMsg('No tengo esa respuesta aún 🤔. Revisa las preguntas rápidas o contáctanos por WhatsApp:', 'bot');
      const quick = document.createElement('div'); quick.className = 'petbot-quick';
      const a = document.createElement('a');
      a.href = `https://wa.me/${WHATS_PHONE}?text=${encodeURIComponent('Hola, necesito ayuda: ' + text)}`;
      a.target = '_blank'; a.rel = 'noopener';
      a.className = 'btn-wa';
      a.textContent = 'Abrir WhatsApp';
      a.style = 'background:#25D366;color:#fff;border:none;padding:8px 10px;border-radius:8px;';
      quick.appendChild(a);
      $petBody.appendChild(quick);
      $petBody.scrollTop = $petBody.scrollHeight;
    }
  }

  function sendFromInput() {
    const v = $petInput.value.trim();
    if (!v) return;
    $petInput.value = '';
    send(v);
  }

  $petInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendFromInput(); });
  sendBtn.addEventListener('click', sendFromInput);

  pushMsg('¡Hola! Soy tu mascota virtual. ¿En qué te ayudo?');
  const quick = document.createElement('div'); quick.className = 'petbot-quick';
  PETBOT_FAQS.slice(0, 5).forEach(f => {
    const b = document.createElement('button');
    b.textContent = f.q;
    b.addEventListener('click', () => send(f.q));
    quick.appendChild(b);
  });
  $petBody.appendChild(quick);

  fab.addEventListener('click', () => $petPanel.classList.toggle('open'));

  $petPanel = panel;
}

function shouldShowPetBot() {
  const role = getUser()?.role || null;
  return role !== 'admin';
}

function updatePetBot() {
  ensurePetBotUI();
  const show = shouldShowPetBot();
  $petFab.style.display = show ? '' : 'none';
  if (!show) $petPanel.classList.remove('open');
}

async function mountPetLottie() {
  await loadLottieOnce();
  const container = document.getElementById('petLottie');
  if (!container || !window.lottie) return;

  if (petAnim && typeof petAnim.destroy === 'function') {
    petAnim.destroy();
    petAnim = null;
  }
  container.innerHTML = '';

  petAnim = window.lottie.loadAnimation({
    container,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: PET_LOTTIE
  });
}

