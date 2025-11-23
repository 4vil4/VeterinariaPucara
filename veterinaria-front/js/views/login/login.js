const API = 'http://localhost:4000';
const API_AUTH = `${API}/api/auth`;

const $ = (s) => document.querySelector(s);

// ---------- Tabs ----------
document.querySelectorAll('.tabs button').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tabs button').forEach((b) =>
            b.classList.remove('active')
        );
        document.querySelectorAll('.tab').forEach((t) =>
            t.classList.remove('active')
        );
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
        document
            .querySelector('.auth-card')
            .insertBefore(box, document.querySelector('.tabs').nextSibling);
    }
    box.textContent = text;
    box.style.color = type === 'error' ? '#b91c1c' : '#065f46';
}
function clearMsg() {
    const box = document.getElementById('auth_msg');
    if (box) box.textContent = '';
}

async function jfetchJSON(url, opt = {}) {
    const o = { method: 'GET', headers: {}, ...opt };
    if (o.body && typeof o.body === 'object' && !(o.body instanceof FormData)) {
        o.headers['Content-Type'] = 'application/json';
        o.body = JSON.stringify(o.body);
    }
    const res = await fetch(url, o);
    let payload = null;
    try {
        payload = await res.json();
    } catch {
    }
    if (!res.ok) {
        const msg =
            (payload && (payload.msg || payload.error)) || `HTTP ${res.status}`;
        throw new Error(msg);
    }
    return payload;
}

function goToApp() {
    const next = sessionStorage.getItem('post_login') || '/index.html#/public';
    sessionStorage.removeItem('post_login');
    location.href = next;
}

// =======================================================
//                      LOGIN
// =======================================================
document.getElementById('f_login').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();
    const email = document.getElementById('l_email').value.trim();
    const password = document.getElementById('l_pass').value;

    try {
        const r = await jfetchJSON(`${API_AUTH}/login`, {
            method: 'POST',
            body: { email, password },
        });
        if (!r?.token) throw new Error('Respuesta inválida del servidor.');
        localStorage.setItem('auth_token', r.token);
        localStorage.setItem('auth_user', JSON.stringify(r.user || {}));
        goToApp();
    } catch (err) {
        console.error('Login error:', err);
        setMsg(err.message || 'No se pudo iniciar sesión.');
    }
});

// =======================================================
//                 REGISTER (3 pasos)
// =======================================================
const regForm = document.getElementById('f_register');
const panes = regForm.querySelectorAll('.step-pane');
const inds = regForm.querySelectorAll('.step-ind');
const btnPrev = document.getElementById('reg_prev');
const btnNext = document.getElementById('reg_next');
const btnSubmit = document.getElementById('reg_submit');

let currentStep = 1;
const MAX_STEP = 3;

function showStep(n) {
    currentStep = n;

    panes.forEach((p) =>
        p.classList.toggle('active', Number(p.dataset.step) === n)
    );

    inds.forEach((i) =>
        i.classList.toggle('active', Number(i.dataset.step) === n)
    );

    const circles = document.querySelectorAll('.step-circle');
    circles.forEach((c) => {
        const step = Number(c.dataset.step);
        c.classList.remove('active', 'done');

        if (step < n) c.classList.add('done');
        if (step === n) c.classList.add('active');
    });

    btnPrev.style.display = n === 1 ? 'none' : '';
    btnNext.style.display = n === MAX_STEP ? 'none' : '';
    btnSubmit.style.display = n === MAX_STEP ? '' : 'none';
}

showStep(1);

btnPrev.addEventListener('click', () => {
    if (currentStep > 1) showStep(currentStep - 1);
});

btnNext.addEventListener('click', () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < MAX_STEP) showStep(currentStep + 1);
});

function validateStep(step) {
    const fields = regForm.querySelectorAll(
        `.step-pane[data-step="${step}"] input, .step-pane[data-step="${step}"] select`
    );
    for (const f of fields) {
        if (f.hasAttribute('required') && !f.value.trim()) {
            setMsg('Completa todos los campos obligatorios del paso actual.');
            f.focus();
            return false;
        }
        if (f.type === 'email' && f.value) {
            const ok = /\S+@\S+\.\S+/.test(f.value);
            if (!ok) {
                setMsg('Ingresa un correo válido.');
                f.focus();
                return false;
            }
        }
    }

    if (step === 3) {
        const p1 = document.getElementById('r_pass').value;
        const p2 = document.getElementById('r_pass2').value;
        if (p1.length < 6) {
            setMsg('La contraseña debe tener al menos 6 caracteres.');
            document.getElementById('r_pass').focus();
            return false;
        }
        if (p1 !== p2) {
            setMsg('Las contraseñas no coinciden.');
            document.getElementById('r_pass2').focus();
            return false;
        }
    }

    clearMsg();
    return true;
}

regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();

    for (let s = 1; s <= MAX_STEP; s++) {
        if (!validateStep(s)) {
            showStep(s);
            return;
        }
    }

    const owner_nombre = document.getElementById('r_owner_nombre').value.trim();
    const owner_rut = document.getElementById('r_owner_rut').value.trim();
    const owner_email = document.getElementById('r_owner_email').value.trim();
    const owner_movil = document.getElementById('r_owner_movil').value.trim();
    const owner_direccion = document
        .getElementById('r_owner_direccion')
        .value.trim();

    const pet_especie = document.getElementById('r_pet_especie').value.trim();
    const pet_nombre = document.getElementById('r_pet_nombre').value.trim();
    const pet_raza = document.getElementById('r_pet_raza').value.trim();
    const pet_sexo = document.getElementById('r_pet_sexo').value;
    const pet_fnac = document.getElementById('r_pet_fnac').value;
    const pet_foto = document.getElementById('r_pet_foto').files[0] || null;

    const password = document.getElementById('r_pass').value;
    const password2 = document.getElementById('r_pass2').value;

    const fd = new FormData();
    fd.append('owner_nombre', owner_nombre);
    fd.append('owner_rut', owner_rut);
    fd.append('owner_email', owner_email);
    fd.append('owner_movil', owner_movil);
    fd.append('owner_direccion', owner_direccion);

    fd.append('pet_especie', pet_especie);
    fd.append('pet_nombre', pet_nombre);
    fd.append('pet_raza', pet_raza);
    fd.append('pet_sexo', pet_sexo);
    fd.append('pet_fecha_nacimiento', pet_fnac || '');

    if (pet_foto) fd.append('pet_foto', pet_foto);

    fd.append('password', password);
    fd.append('password2', password2);

    try {
        const res = await fetch(`${API_AUTH}/register-full`, {
            method: 'POST',
            body: fd,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
            const msg = data.msg || data.error || `HTTP ${res.status}`;
            throw new Error(msg);
        }

        if (!data.token) {
            throw new Error('Respuesta inválida del servidor.');
        }

        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('auth_user', JSON.stringify(data.user || {}));
        goToApp();
    } catch (err) {
        console.error('Register-full error:', err);
        setMsg(err.message || 'No se pudo crear la cuenta.');
    }
});

// =======================================================
//                     FORGOT
// =======================================================
document.getElementById('f_forgot').addEventListener('submit', async (e) => {
    e.preventDefault();
    clearMsg();
    const email = document.getElementById('f_email').value.trim();
    try {
        const r = await jfetchJSON(`${API_AUTH}/forgot`, {
            method: 'POST',
            body: { email },
        });
        const info = r.resetLink
            ? `Link temporal: ${r.resetLink}`
            : 'Si el correo existe, recibirás instrucciones.';
        setMsg(info, 'ok');
    } catch (err) {
        console.error('Forgot error:', err);
        setMsg(err.message || 'No se pudo procesar la solicitud.');
    }
});

// ====================== RUT ==========================
const rutInput = document.getElementById('r_owner_rut');

rutInput.addEventListener('input', () => {
    let v = rutInput.value.replace(/[^0-9kK]/g, '').toUpperCase();

    v = v.slice(0, 9);

    if (v.length <= 1) {
        rutInput.value = v;
        return;
    }

    const cuerpo = v.slice(0, v.length - 1).replace(/[^0-9]/g, '');
    const dv = v.slice(-1);

    const cuerpoFormato = cuerpo.replace(/\B(?=(\d{3})+(?!\d))/g, '.');

    rutInput.value = `${cuerpoFormato}-${dv}`;
});

// ================= TELÉFONO ======================
const mov = document.getElementById('r_owner_movil');

mov.addEventListener('focus', () => {
    if (!mov.value.startsWith('+569')) {
        mov.value = '+569 ';
    }
});

mov.addEventListener('input', () => {
    if (!mov.value.startsWith('+569 ')) {
        mov.value = '+569 ';
    }

    mov.value = '+569 ' + mov.value.slice(5).replace(/\D/g, '').slice(0, 8);
});

if (localStorage.getItem('auth_token')) {
    goToApp();
}
