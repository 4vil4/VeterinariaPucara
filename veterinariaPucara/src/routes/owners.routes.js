import { Router } from 'express';
import * as C from '../controllers/owners.controller.js';
const router = Router();

router.get('/', C.list);
router.get('/nuevo', C.formNew);
router.post('/nuevo', C.create);
router.get('/:id/mascotas', C.detailPets);

export default router;
