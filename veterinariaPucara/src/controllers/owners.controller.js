import * as Owners from '../models/owners.model.js';
import * as Pets from '../models/pets.model.js';

export async function list(req, res) {
    const owners = await Owners.getOwners();
    res.render('owners/list', { owners });
}
export async function formNew(req, res) { res.render('owners/form', { owner: null }); }
export async function create(req, res) {
    const id = await Owners.createOwner(req.body);
    res.redirect(`/propietarios/${id}/mascotas`);
}
export async function detailPets(req, res) {
    const owner = await Owners.getOwner(req.params.id);
    const pets = await Pets.getPetsByOwner(req.params.id);
    res.render('pets/list', { owner, pets });
}
