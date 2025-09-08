import * as Consultas from '../models/consultas.model.js';

export async function formNew(req, res) {
    res.render('consultas/form', { pet_id: req.params.petId });
}
export async function create(req, res) {
    await Consultas.createConsulta({ pet_id: req.params.petId, ...req.body });
    res.redirect(`/mascotas/${req.params.petId}/consultas`);
}
