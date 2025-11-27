# 🐾 Veterinaria Pucará - Sitio Web Estático

Sitio web institucional para **Veterinaria Pucará** en San Bernardo.  
Proyecto desarrollado con **HTML + CSS + JavaScript**, con base de datos **MySQL**.  

## 📂 Estructura del proyecto

### **Backend**
```
veterinaria-back/
├─ src/
│ ├─ middlewares/
| |     └─auth.middlewares.js
│ ├─ routes/
| |     ├─ accesorios.routes.js
| |     ├─ alimentos.routes.js
| |     ├─ antibioticos.routes.js
| |     ├─ auth.routes.js
| |     ├─ certificados.autorizacion.cirugia.routes.js
| |     ├─ certificados.defuncion.routes.js
| |     ├─ certificados.epicrisis.routes.js
| |     ├─ certificados.salud.pucara.routes.js
| |     ├─ certificados.salud.sag.routes.js
| |     ├─ citas.routes.js
| |     ├─ hospitalizacion.routes.js
| |     ├─ index.routes.js
| |     ├─ mascotas.routes.js
| |     ├─ medicamentos.routes.js
| |     ├─ personal.routes.js
| |     ├─ propietarios.routes.js
| |     ├─ recetas.routes.js
| |     ├─ registros.routes.js
| |     └─ urgencias.routes.js
│ └─ db.js
├─ server.js
└─ package.json
```

### **Frontend**
```
veterinaria-front/
├─ assets/
|   └─ logo.png
├─ css/
|   ├─ antibiotico.css
|   ├─ calendario.css
|   ├─ certificados.css
|   ├─ citas.css
|   ├─ historico.css
|   ├─ login.css
|   ├─ mascotas.css
|   ├─ personal.css
|   ├─ productos.css
|   ├─ propietarios.css
|   ├─ public-catalogo.css
|   ├─ public.css
|   ├─ receta.css
|   ├─ registro-hosp.css
|   ├─ registro.css
|   ├─ style.css
|   └─ urgencias.css
├─ js/
│ ├─ views/
| |     ├─ login/
| |     |   └─ login.js
| |     ├─ accesorios.js
| |     ├─ alimentos.js
| |     ├─ antibioticos.js
| |     ├─ autorizacion-cirugia-anestesia.js
| |     ├─ calendario.js
| |     ├─ catalogo.js
| |     ├─ citas.js
| |     ├─ defuncion.js
| |     ├─ epicrisis.js
| |     ├─ historico.js
| |     ├─ hospitalizacion.js
| |     ├─ mascotas.js
| |     ├─ medicamentos.js
| |     ├─ personal.js
| |     ├─ propietarios.js
| |     ├─ public.js
| |     ├─ receta.js
| |     ├─ registro.js
| |     ├─ salud-pucara.js
| |     ├─ salud-sag.js
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
```

## ⚙️ Requisitos

- [Node.js](https://nodejs.org/) v16 o superior  
- [npm](https://www.npmjs.com/) (incluido con Node)

## 🚀 Instalación y ejecución local

1. Clonar este repositorio:
   ```bash
   git clone https://github.com/4vil4/VeterinariaPucara.git
   cd veterinaria-pucara

2. Instalar dependencias:
    ```bash
    cd veterinaria-back
    npm install

3. Iniciar el servidor de desarrollo:
    ```bash
    cd veterinaria-back
    npm run dev

4. Instalacion BD MySQL:

    Abrir XAMPP o MySQL workbench
    importar el archivo **clinica_pucara.sql**

    en XAMPP => dar **Start** (Apachhe y MySQL)
    en Workbench => conectar

4. Ejecutar la Web:
    ```bash
    cd veterinaria-front
    npx serve -l 5500
    ```
    abrir en el navegador => http://localhost:5500