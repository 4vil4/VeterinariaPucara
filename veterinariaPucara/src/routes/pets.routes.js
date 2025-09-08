import { Router } from 'express';
import * as C from '../controllers/pets.controller.js';

const router = Router();
router.get('/:ownerId/nueva', C.formNew);
router.post('/:ownerId/nueva', C.create);
router.get('/:petId/consultas', C.consultasByPet);

export default router;
