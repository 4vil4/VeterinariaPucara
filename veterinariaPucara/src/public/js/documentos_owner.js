(function () {
    const root = document.getElementById('owner-docs');
    if (!root) return;

    const ownerId = root.dataset.ownerId;

    // Botones
    const btnRec = document.getElementById('btnNuevaReceta');
    const btnPres = document.getElementById('btnNuevoPresupuesto');

    // Modales y controles (receta)
    const modalRec = document.getElementById('recetaModal');
    const selRec = document.getElementById('selPetReceta');
    const goRec = document.getElementById('goReceta');
    const cancelRec = document.getElementById('cancelReceta');

    // Modales y controles (presupuesto)
    const modalPres = document.getElementById('presupuestoModal');
    const selPres = document.getElementById('selPetPres');
    const goPres = document.getElementById('goPresupuesto');
    const cancelPres = document.getElementById('cancelPresupuesto');

    async function loadPetsInto(selectEl) {
        if (!selectEl) return;
        selectEl.innerHTML = '<option value="">Cargando...</option>';
        try {
            const r = await fetch('/api/owners/' + ownerId + '/pets');
            const pets = await r.json();
            if (!pets.length) {
                selectEl.innerHTML = '<option value="">(Este propietario no tiene mascotas)</option>';
                return;
            }
            selectEl.innerHTML = '<option value="">Seleccione...</option>' +
                pets.map(p => '<option value="' + p.id + '">' + (p.name_pet || ('Mascota #' + p.id)) + '</option>').join('');
        } catch (e) {
            selectEl.innerHTML = '<option value="">No fue posible cargar mascotas</option>';
        }
    }

    // --- Receta ---
    btnRec && btnRec.addEventListener('click', () => {
        if (modalRec) modalRec.style.display = 'block';
        loadPetsInto(selRec);
        if (goRec) goRec.disabled = true;
    });

    cancelRec && cancelRec.addEventListener('click', () => {
        if (modalRec) modalRec.style.display = 'none';
    });

    selRec && selRec.addEventListener('change', () => {
        if (goRec) goRec.disabled = !selRec.value;
    });

    goRec && goRec.addEventListener('click', () => {
        if (selRec && selRec.value) location.href = '/documentos/' + selRec.value + '/receta';
    });

    modalRec && modalRec.addEventListener('click', (e) => {
        if (e.target === modalRec) modalRec.style.display = 'none';
    });

    // --- Presupuesto ---
    btnPres && btnPres.addEventListener('click', () => {
        if (modalPres) modalPres.style.display = 'block';
        loadPetsInto(selPres);
        if (goPres) goPres.disabled = true;
    });

    cancelPres && cancelPres.addEventListener('click', () => {
        if (modalPres) modalPres.style.display = 'none';
    });

    selPres && selPres.addEventListener('change', () => {
        if (goPres) goPres.disabled = !selPres.value;
    });

    goPres && goPres.addEventListener('click', () => {
        if (selPres && selPres.value) {
            // Abrimos el formulario de presupuesto con la mascota preseleccionada!
            location.href = '/documentos/owner/' + ownerId + '/presupuesto/nuevo?pet_id=' + selPres.value;
        }
    });

    modalPres && modalPres.addEventListener('click', (e) => {
        if (e.target === modalPres) modalPres.style.display = 'none';
    });
})();
