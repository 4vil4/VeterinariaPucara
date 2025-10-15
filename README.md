# 🐾 Veterinaria Pucará - Sitio Web Estático

Sitio web institucional para **Veterinaria Pucará** en San Bernardo.  
Proyecto desarrollado con **HTML + CSS + JavaScript**, con base de datos **MySQL**.  

## 📂 Estructura del proyecto

### **Backend**
veterinaria-back/
├─ src/
│ ├─ middlewares/
| |     └─auth.middlewares.js
│ ├─ routes/
| |     ├─ auth.routes.js
| |     ├─ citas.routes.js
| |     ├─ index.routes.js
| |     ├─ mascotas.routes.js
| |     ├─ personal.routes.js
| |     ├─ propietarios.routes.js
| |     ├─ registros.routes.js
| |     └─ urgencias.routes.js
│ └─ db.js
├─ server.js
└─ package.json

### **Frontend**
veterinaria-front/
├─ assets/
|   └─ logo.png
├─ css/
|   ├─ calendario.css
|   ├─ citas.css
|   ├─ historico.css
|   ├─ login.css
|   ├─ mascotas.css
|   ├─ propietarios.css
|   ├─ public.css
|   ├─ registro.css
|   ├─ style.css
|   └─ urgencias.css
├─ js/
│ ├─ views/
| |     ├─ login/
| |     |   └─ login.js
| |     ├─ calendario.js
| |     ├─ citas.js
| |     ├─ historico.js
| |     ├─ mascotas.js
| |     ├─ personal.js
| |     ├─ propietarios.js
| |     ├─ public.js
| |     ├─ registro.js
| |     └─ urgencias.js
│ └─ main.js
├─ views/
|     ├─ login/
|     |   └─ login.html
|     ├─ calendario.html
|     ├─ citas.html
|     ├─ historico.html
|     ├─ mascotas.html
|     ├─ personal.html
|     ├─ propietarios.html
|     ├─ public.html
|     ├─ registro.html
|     └─ urgencias.html
├─ index.html
└─ package.json

## ⚙️ Requisitos

- [Node.js](https://nodejs.org/) v16 o superior  
- [npm](https://www.npmjs.com/) (incluido con Node)

## 🚀 Instalación y ejecución local

1. Clonar este repositorio:
   ```bash
   git clone https://github.com/4vil4/VeterinariaPucara.git
   cd veterinaria-pucara

2. Instalar dependencias:

    cd veterinaria-back
    npm install

3. Iniciar el servidor de desarrollo:

    cd veterinaria-back
    npm run dev

4. Instalacion BD MySQL:

    Abrir XAMPP o MySQL workbench
    importar el archivo **clinica_pucara.sql**

    en XAMPP => dar **Start** (Apachhe y MySQL)
    en Workbench => conectar

4. Ejecutar la Web:

    cd veterinaria-front
    npx serve -l 5500

    abrir en el navegador => http://localhost:5500