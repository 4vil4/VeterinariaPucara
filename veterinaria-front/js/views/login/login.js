const API = 'http://localhost:4000';
const API_AUTH = `${API}/api/auth`;

const $ = (s) => document.querySelector(s);

// ---------- Tabs ----------
document.querySelectorAll('.tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tabs button').forEach((b) => b.classList.remove('active'));
        document.querySelectorAll('.tab').forEach((t) => t.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(`f_${btn.dataset.tab}`).classList.add('active');
        clearMsg();
    });
});

// ---------- Helpers ----------
function setMsg(text, type = 'error') {
    let box = document.getElementById('auth_msg');
    if (!box) {
        box = document.createElement('p');
        box.id = 'auth_msg';
        box.className = 'help';
        document.querySelector('.auth-card').insertBefore(box, document.querySelector('.tabs').nextSibling);
    }
    box.textContent = text;
    box.style.color = type === 'error' ? '#b91c1c' : '#065f46';
}
function clearMsg() {
    const box = document.getElementById('auth_msg');
    if (box) box.textContent = '';
}
async function jfetch(url, opt = {}) {
    const o = { method: 'GET', headers: {}, ...opt };
    if (o.body && typeof o.body === 'object') {
        o.headers['Content-Type'] = 'application/json';
        o.body = JSON.stringify(o.body);
    }
    const res = await fetch(url, o);
    let payload = null;
    try { payload = await res.json(); } catch { /* texto vacío */ }
    if (!res.ok) {
        const msg = (payload && (payload.msg || payload.error)) || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return payload;
}
function goToApp() {
    const next = sessionStorage.getItem('post_login') || '/index.html#/mascotas';
    sessionStorage.removeItem('post_login');
    location.href = next;
}

// ---------- LOGIN ----------
document.getElementById('f_login').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();
    const email = document.getElementById('l_email').value.trim();
    const password = document.getElementById('l_pass').value;

    try {
        const r = await jfetch(`${API_AUTH}/login`, { method: 'POST', body: { email, password } });
        if (!r?.token) throw new Error('Respuesta inválida del servidor.');
        localStorage.setItem('auth_token', r.token);
        localStorage.setItem('auth_user', JSON.stringify(r.user || {}));
        goToApp();
    } catch (err) {
        console.error('Login error:', err);
        setMsg(err.message || 'No se pudo iniciar sesión.');
    }
});

// ---------- REGISTER ----------
document.getElementById('f_register').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();
    const nombre = document.getElementById('r_nombre').value.trim();
    const email = document.getElementById('r_email').value.trim();
    const password = document.getElementById('r_pass').value;

    try {
        const r = await jfetch(`${API_AUTH}/register`, { method: 'POST', body: { nombre, email, password } });
        localStorage.setItem('auth_token', r.token);
        localStorage.setItem('auth_user', JSON.stringify(r.user || {}));
        goToApp();
    } catch (err) {
        console.error('Register error:', err);
        setMsg(err.message || 'No se pudo crear la cuenta.');
    }
});

// ---------- FORGOT ----------
document.getElementById('f_forgot').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();
    const email = document.getElementById('f_email').value.trim();
    try {
        const r = await jfetch(`${API_AUTH}/forgot`, { method: 'POST', body: { email } });
        const info = r.resetLink ? `Link temporal: ${r.resetLink}` : 'Si el correo existe, recibirás instrucciones.';
        setMsg(info, 'ok');
    } catch (err) {
        console.error('Forgot error:', err);
        setMsg(err.message || 'No se pudo procesar la solicitud.');
    }
});

if (localStorage.getItem('auth_token')) {
    goToApp();
}
