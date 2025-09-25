import { Router } from 'express';
import * as C from '../controllers/consultas.controller.js';

const router = Router();
router.get('/:petId/nueva', C.formNew);
router.post('/:petId/nueva', C.create);

export default router;
