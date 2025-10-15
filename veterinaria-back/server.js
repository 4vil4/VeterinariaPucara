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

app.get('/api/health', (_, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`API levantada en http://localhost:${PORT}`);
});
