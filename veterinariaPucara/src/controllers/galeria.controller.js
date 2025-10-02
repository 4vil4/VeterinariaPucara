import * as Galeria from '../models/galeria.model.js';

const TITULOS = {
    accesorios: 'Galería de accesorios',
    alimentos: 'Galería de alimentos',
    medicamentos: 'Galería de medicamentos',
};

export async function list(req, res, next) {
    try {
        const tipo = String(req.params.tipo || '').toLowerCase();
        const items = await Galeria.listByTipo(tipo);

        // Construimos las filas en JS (no en EJS)
        const rowsHtml = items.length
            ? items.map(it => `
          <tr>
            <td>
              ${it.imagen_url ? `<img class="gal-thumb" src="${it.imagen_url}" alt="${it.nombre}">` : ''}
            </td>
            <td><strong>${it.nombre}</strong></td>
            <td>${(it.descripcion || '').slice(0, 120)}</td>
            <td>${it.precio != null ? `$${Number(it.precio).toLocaleString('es-CL')}` : '-'}</td>
            <td>
              <div class="d-flex gap-2">
                <a class="btn btn--outline" href="/galeria/${tipo}/${it.id}/editar">Editar</a>
                <form action="/galeria/${tipo}/${it.id}/eliminar" method="POST"
                      onsubmit="return confirm('¿Eliminar este ítem?');">
                  <button class="btn btn-danger">Eliminar</button>
                </form>
              </div>
            </td>
          </tr>
        `).join('')
            : `
          <tr>
            <td colspan="5" class="text-center p-3 text-muted">
              No hay productos aún. Usa “Agregar producto”.
            </td>
          </tr>
        `;

        res.render('galeria/list', {
            titulo: TITULOS[tipo] || 'Galería',
            tipo,
            items,        // por si lo necesitas
            rowsHtml,     // ← pasamos el HTML ya listo
        });
    } catch (err) { next(err); }
}

export function newForm(req, res) {
    const tipo = String(req.params.tipo || '').toLowerCase();
    res.render('galeria/form', {
        titulo: `Nuevo ítem - ${tipo}`,
        tipo,
        item: { id: null, nombre: '', descripcion: '', precio: '', imagen_url: '' },
        action: `/galeria/${tipo}/crear`,
        method: 'POST',
    });
}

export async function create(req, res, next) {
    try {
        const tipo = String(req.params.tipo || '').toLowerCase();
        const { nombre, descripcion, precio, imagen_url: imagenUrlTexto } = req.body;

        const imagen_url = req.file ? `/uploads/${req.file.filename}` : (imagenUrlTexto || null);

        await Galeria.create(tipo, { nombre, descripcion, precio, imagen_url });
        res.redirect(`/galeria/${tipo}`);
    } catch (err) { next(err); }
}

export async function editForm(req, res, next) {
    try {
        const tipo = String(req.params.tipo || '').toLowerCase();
        const id = Number(req.params.id);
        const item = await Galeria.findById(tipo, id);
        if (!item) return res.status(404).send('Ítem no encontrado');

        res.render('galeria/form', {
            titulo: `Editar ítem - ${tipo}`,
            tipo,
            item,
            action: `/galeria/${tipo}/${id}/actualizar`,
            method: 'POST',
        });
    } catch (err) { next(err); }
}

export async function update(req, res, next) {
    try {
        const tipo = String(req.params.tipo || '').toLowerCase();
        const id = Number(req.params.id);
        const { nombre, descripcion, precio, imagen_url: imagenUrlTexto } = req.body;

        const imagen_url = req.file ? `/uploads/${req.file.filename}` : (imagenUrlTexto || null);

        await Galeria.update(tipo, id, { nombre, descripcion, precio, imagen_url });
        res.redirect(`/galeria/${tipo}`);
    } catch (err) { next(err); }
}

export async function remove(req, res, next) {
    try {
        const tipo = String(req.params.tipo || '').toLowerCase();
        const id = Number(req.params.id);
        const item = await Galeria.findById(tipo, id);

        if (item?.imagen_url?.startsWith('/uploads/')) {
            const abs = path.resolve(__dirname, '..', 'public', item.imagen_url.replace(/^\//, ''));
            fs.promises.unlink(abs).catch(() => { });
        }

        await Galeria.remove(tipo, id);
        res.redirect(`/galeria/${tipo}`);
    } catch (err) { next(err); }
}
