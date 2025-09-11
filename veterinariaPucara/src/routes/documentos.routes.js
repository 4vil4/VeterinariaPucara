import { Router } from 'express';
import {
  listByPet, formReceta, createReceta, exportRecetaPdf,
  listByOwner, formPresupuesto, createPresupuesto, wspDocumento
} from '../controllers/documentos.controller.js';

const router = Router();

// Pantalla principal de Documentos
router.get('/', (req, res) => res.render('documentos/index_owner_select'));

// --- Rutas por propietario ---
router.get('/owner/:ownerId', listByOwner);
router.get('/owner/:ownerId/presupuesto/nuevo', formPresupuesto);
router.post('/owner/:ownerId/presupuesto/nuevo', createPresupuesto);
router.get('/owner/:ownerId/doc/:docId/wsp', wspDocumento);

// --- Rutas por mascota ---
router.get('/:petId/receta/:docId/pdf', exportRecetaPdf);
router.get('/:petId/receta', formReceta);
router.post('/:petId/receta', createReceta);
router.get('/:petId', listByPet);

export default router;