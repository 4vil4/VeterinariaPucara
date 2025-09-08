import { Router } from 'express';
import * as C from '../controllers/citas.controller.js';

const router = Router();

router.get('/', C.list);
router.get('/nueva', C.formNew);
router.post('/nueva', C.create);
router.get('/:id/whatsapp', C.whatsappByCita);
router.get('/:id/pdf', C.exportCitaPdf);

export default router;
