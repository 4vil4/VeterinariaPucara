import * as Owners from '../models/owners.model.js';
import * as Pets from '../models/pets.model.js';
import * as Consultas from '../models/consultas.model.js';

export async function formNew(req, res) {
    const owner = await Owners.getOwner(req.params.ownerId);
    res.render('pets/form', { owner, pet: null });
}
export async function create(req, res) {
    const { ownerId } = req.params;
    await Pets.createPet({ user_id: ownerId, ...req.body });
    res.redirect(`/propietarios/${ownerId}/mascotas`);
}
export async function consultasByPet(req, res) {
    const pet = await Pets.getPet(req.params.petId);
    const consultas = await Consultas.getConsultasByPet(req.params.petId);
    res.render('consultas/list', { pet, consultas });
}
