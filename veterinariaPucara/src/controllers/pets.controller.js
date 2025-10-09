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

export async function ficha(req, res) {
    const { petId } = req.params;
    const row = await Pets.getPetWithOwner(petId);
    if (!row) return res.status(404).send('Mascota no encontrada');

    let tags = [];
    if (row.tags) {
        try { const parsed = JSON.parse(row.tags); tags = Array.isArray(parsed) ? parsed : []; }
        catch { tags = String(row.tags).split(',').map(s => s.trim()).filter(Boolean); }
    }

    let fotoDataUrl = null;
    if (row.foto) {
        const b64 = Buffer.from(row.foto).toString('base64');
        fotoDataUrl = `data:image/jpeg;base64,${b64}`;
    }

    const pet = {
        ...row,
        fecha_nac_fmt: row.fecha_nac ? new Date(row.fecha_nac).toLocaleDateString('es-CL') : null,
        edad_human: row.fecha_nac ? calcEdadHumana(row.fecha_nac) : (row.age ? `${row.age} años` : '-'),
        tags,
        fotoDataUrl, 
    };

    const owner = { id: row.owner_id, name: row.owner_name, fono: row.owner_fono };
    res.render('pets/ficha', { pet, owner });
}

function calcEdadHumana(fecha) {
    const f = new Date(fecha), h = new Date();
    let y = h.getFullYear() - f.getFullYear();
    let m = h.getMonth() - f.getMonth();
    if (m < 0) { y--; m += 12; }
    return `${y} año(s) ${m} mes(es)`;
}

export async function editarForm(req, res) {
    const { petId } = req.params;
    const row = await Pets.getPetWithOwner(petId);
    if (!row) return res.status(404).send('Mascota no encontrada');

    let tags = [];
    if (row.tags) {
        try { tags = JSON.parse(row.tags); }
        catch { tags = String(row.tags).split(',').map(s => s.trim()).filter(Boolean); }
    }

    let fotoDataUrl = null;
    if (row.foto) {
        const b64 = Buffer.from(row.foto).toString('base64');
        fotoDataUrl = `data:image/jpeg;base64,${b64}`;
    }

    const pet = {
        ...row,
        fecha_nac_fmt: row.fecha_nac ? new Date(row.fecha_nac).toLocaleDateString('es-CL') : null,
        edad_human: row.fecha_nac ? calcEdadHumana(row.fecha_nac) : (row.age ? `${row.age} años` : '-'),
        tags,
        fotoDataUrl
    };

    res.render('pets/editar', { pet, owner: { id: row.owner_id, name: row.owner_name } });
}

export async function editarSave(req, res) {
    const { petId } = req.params;
    const {
        name_pet, especie, raza, age,
        historia, sexo, esterilizado,
        fecha_nac, estado, tags, foto_url,
        observaciones   
    } = req.body;

    let tagsJson = null;
    if (tags && tags.trim()) {
        const arr = tags.split(',').map(s => s.trim()).filter(Boolean);
        tagsJson = JSON.stringify(arr);
    }

    const fotoBuffer = req.file ? req.file.buffer : undefined;

    await Pets.updatePet(petId, {
        name_pet,
        especie,
        raza,
        age: age ? Number(age) : null,
        historia: historia || null,
        sexo: sexo || null,
        esterilizado: (esterilizado === '1' ? 1 : (esterilizado === '0' ? 0 : null)),
        fecha_nac: fecha_nac || null,
        estado: estado || 'Activo',
        tags: tagsJson,
        foto_url: foto_url || null,
        observaciones: observaciones || null,  
        foto: fotoBuffer
    });

    res.redirect(`/mascotas/${petId}/ficha`);
}
