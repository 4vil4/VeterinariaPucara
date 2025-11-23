import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';


import indexRoutes from './src/routes/index.routes.js';
import propietariosRoutes from './src/routes/propietarios.routes.js';
import mascotasRoutes from './src/routes/mascotas.routes.js';
import citasRoutes from './src/routes/citas.routes.js';
import urgenciasRoutes from './src/routes/urgencias.routes.js';
import registrosRoutes from './src/routes/registros.routes.js';
import authRoutes from './src/routes/auth.routes.js';
import personalRoutes from './src/routes/personal.routes.js';
import alimentosRoutes from './src/routes/alimentos.routes.js';
import medicamentosRoutes from './src/routes/medicamentos.routes.js';
import accesoriosRoutes from './src/routes/accesorios.routes.js';
import recetasRoutes from './src/routes/recetas.routes.js';
import antibioticosRoutes from './src/routes/antibioticos.routes.js';
import hospitalizacionRoutes from './src/routes/hospitalizacion.routes.js';
import certificadosSaludSAGRoutes from './src/routes/certificados.salud.sag.routes.js';
import CertSaludPucara from './src/routes/certificados.salud.pucara.routes.js';
import certificadosEpicrisisRoutes from './src/routes/certificados.epicrisis.routes.js';
import certificadosDefuncion from './src/routes/certificados.defuncion.routes.js';
import certificadosAutorizacionCirugiaRoutes from './src/routes/certificados.autorizacion.cirugia.routes.js';

const app = express();
app.use(cors({ origin: true }));
app.use(morgan('dev'));
app.use(express.json());

// Rutas
app.use('/api', indexRoutes);
app.use('/api/propietarios', propietariosRoutes);
app.use('/api/mascotas', mascotasRoutes);
app.use('/api/citas', citasRoutes);
app.use('/api/urgencias', urgenciasRoutes);
app.use('/api/registros', registrosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/personal', personalRoutes);
app.use('/api/alimentos', alimentosRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/accesorios', accesoriosRoutes);
app.use('/api/recetas', recetasRoutes);
app.use('/api/antibioticos', antibioticosRoutes);
app.use('/api/hospitalizacion', hospitalizacionRoutes);
app.use('/api/certificados/salud-sag', certificadosSaludSAGRoutes);
app.use('/api/certificados/salud-pucara', CertSaludPucara);
app.use('/api/certificados/epicrisis', certificadosEpicrisisRoutes);
app.use('/api/certificados/defuncion', certificadosDefuncion);
app.use('/api/certificados/autorizacion-cirugia-anestesia', certificadosAutorizacionCirugiaRoutes);

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API levantada en http://localhost:${PORT}`);
});
