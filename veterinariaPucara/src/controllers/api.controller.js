import { getOwners } from '../models/owners.model.js';
import { getPetsByOwner } from '../models/pets.model.js';

export async function ownersList(req, res) {
    const owners = await getOwners();
    res.json(owners);
}

export async function petsByOwner(req, res) {
    const { ownerId } = req.params;
    const pets = await getPetsByOwner(ownerId);
    res.json(pets);
}
