import { Router } from 'express';
import * as C from '../controllers/pets.controller.js';
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });

const router = Router();
router.get('/:ownerId/nueva', C.formNew);
router.post('/:ownerId/nueva', C.create);
router.get('/:petId/consultas', C.consultasByPet);
router.get('/:petId/ficha', C.ficha);
router.get('/:petId/editar', C.editarForm);
router.post('/:petId/editar', upload.single('foto'), C.editarSave);

export default router;
