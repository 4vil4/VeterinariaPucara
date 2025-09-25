import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

import homeRouter from './src/routes/home.routes.js';
import ownersRouter from './src/routes/owners.routes.js';
import petsRouter from './src/routes/pets.routes.js';
import consultasRouter from './src/routes/consultas.routes.js';
import citasRouter from './src/routes/citas.routes.js';
import documentosRouter from './src/routes/documentos.routes.js';
import apiRouter from './src/routes/api.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.locals.title = 'Clínica Veterinaria Pucará';
  next();
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'src', 'public')));

app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'ejs');

// Rutas
app.use('/', homeRouter);
app.use('/propietarios', ownersRouter);
app.use('/mascotas', petsRouter);
app.use('/consultas', consultasRouter);
app.use('/citas', citasRouter);
app.use('/documentos', documentosRouter);
app.use('/api', apiRouter);

// Abre WhatsApp con el texto prellenado
app.get('/wsp/compose', (req, res) => {
  const to = String(req.query.to || '').replace(/\D/g, ''); // Solo dígitos por si acaso
  const msg = String(req.query.msg || '');
  if (!to) return res.status(400).send('Falta destinatario (to)');
  res.redirect(`https://wa.me/${to}?text=${encodeURIComponent(msg)}`);
});

// 404
app.use((req, res) => res.status(404).send('No encontrado'));

// Iniciar
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
