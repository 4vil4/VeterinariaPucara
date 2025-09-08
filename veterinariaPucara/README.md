Aplicación web para la gestión de **propietarios**, **mascotas** y **citas** de una clínica veterinaria.  
Stack: **Node.js + Express**, **MySQL**, **EJS** (SSR), **Bootstrap/Tailwind-like** (estilos propios), **Click-to-Chat de WhatsApp** (sin API de Meta).

---

## Contenido

- [Demo local](#demo-local)
- [Requisitos](#requisitos)
- [Instalación](#instalación)
- [Variables de entorno](#variables-de-entorno)
- [Esquema SQL](#esquema-sql)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Rutas principales](#rutas-principales)
- [WhatsApp (Click-to-Chat)](#whatsapp-click-to-chat)
- [Scripts de npm](#scripts-de-npm)
- [Roadmap](#roadmap)
- [Base de datos](#base-de-datos)

---

## Requisitos

Node.js ≥ 18

MySQL ≥ 8 (o MariaDB compatible)

npm ≥ 9

## Instalación

- Clona el repositorio y entra al proyecto.

- Crea la base de datos: ejecuta el archivo SQL del proyecto (db.sql) en MySQL o MySQL Workbench.

- Este archivo crea todas las tablas necesarias.

- Crea el archivo .env en la raíz del proyecto (ver sección siguiente).

- Instala dependencias y ejecuta en desarrollo:

```bash
npm install
npm run dev
```

## Variables de entorno

```bash
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_NAME=veterinaria_pucara
```

## Estructura del proyecto

```bash
src/
  controllers/         # lógica de negocio (citas, owners, pets, etc.)
  middlewares/
  models/              # acceso a datos (MySQL)
  public/              # css / img / js
  routes/              # rutas Express
  services/
    pdf.service.js     # utilidades
  utils/
  views/               # EJS (SSR)
    layouts/           # layout.ejs
server.js              # arranque de Express
.env

```

## Rutas principales

Home: GET /

Propietarios: GET /owners, GET /owners/nuevo, POST /owners/nuevo, …

Mascotas: GET /pets, GET /pets/nueva, POST /pets/nueva, …

Citas:

GET /citas — listado

GET /citas/nueva — formulario

POST /citas/nueva — crea la cita

GET /citas/:id/whatsapp — abre WhatsApp con el detalle de la cita (click-to-chat)

## WhatsApp (Click-to-Chat)

El proyecto no usa la API de Meta; para enviar confirmaciones se abre WhatsApp (Web o app) con el mensaje prellenado y el recepcionista lo envía manualmente.

Ruta helper incluida en server.js:

```bash
// Abre WhatsApp con el texto prellenado
app.get('/wsp/compose', (req, res) => {
  const to  = String(req.query.to || '').replace(/\D/g, ''); 
  const msg = String(req.query.msg || '');
  if (!to) return res.status(400).send('Falta destinatario (to)');
  res.redirect(`https://wa.me/${to}?text=${encodeURIComponent(msg)}`);
});
```

## Scripts de npm

```bash
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```
- npm run dev → desarrollo con recarga.
- npm start → ejecución simple.

## Roadmap

- Fichas clínicas por mascota (historial).

- Adjuntar documentos (vacunas, exámenes).

- Recordatorios por email/SMS.

- Exportación de reportes (PDF).

## Base de datos

- copia el contenido del archivo **db.sql** en tu base de datos mysql y se creara
  la base de datos y las tablas, actualizar el archivo a medida que se creen cosas

## Demo local

```bash
git clone https://github.com/MarioCJG/veterinariaPucara-V2.git
cd veterinariaPucara
npm install

npm run dev
# abrir http://localhost:3000

```
