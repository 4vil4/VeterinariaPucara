import { Router } from 'express';
import * as ctrl from '../controllers/galeria.controller.js';
import { esTipoValido } from '../models/galeria.model.js';
import { uploadImage } from '../utils/upload.js';

const router = Router();

router.param('tipo', (req, res, next, tipo) => {
    if (!esTipoValido(tipo)) return res.status(404).send('Tipo no válido');
    next();
});

router.get('/:tipo', ctrl.list);
router.get('/:tipo/nuevo', ctrl.newForm);

// incorporamos el upload!!!
router.post('/:tipo/crear', uploadImage.single('imagen_file'), ctrl.create);
router.get('/:tipo/:id/editar', ctrl.editForm);
router.post('/:tipo/:id/actualizar', uploadImage.single('imagen_file'), ctrl.update);

router.post('/:tipo/:id/eliminar', ctrl.remove);

router.get('/:tipo', ctrl.list);

export default router;
