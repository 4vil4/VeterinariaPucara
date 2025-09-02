(function () {
    const PHONE_E164 = '+56912345678'; // TODO: reemplazar por el número real
    const whatsappMsg = 'Hola, me gustaría agendar una hora para mi mascota (Nombre / Servicio / Fecha estimada).';

    function openWhatsApp() {
        const num = PHONE_E164.replace(/\D/g, '');
        const text = encodeURIComponent(whatsappMsg);
        window.open(`https://wa.me/${num}?text=${text}`, '_blank', 'noopener');
    }

    function toggleMobile() {
        document.getElementById('mobile')?.classList.toggle('open');
    }

    function openMaps() {
        const q = encodeURIComponent('Veterinaria Pucará, San Bernardo, Chile');
        window.open('https://www.google.com/maps/search/?api=1&query=' + q, '_blank', 'noopener');
    }

    // Año en footer
    const y = document.getElementById('y');
    if (y) y.textContent = new Date().getFullYear();

    // Bindings
    document.getElementById('btn-mobile')?.addEventListener('click', toggleMobile);
    document.getElementById('cta-whatsapp')?.addEventListener('click', (e) => { e.preventDefault(); openWhatsApp(); });
    document.getElementById('cta-whatsapp-mobile')?.addEventListener('click', (e) => { e.preventDefault(); openWhatsApp(); });
    document.getElementById('cta-whatsapp-cta')?.addEventListener('click', (e) => { e.preventDefault(); openWhatsApp(); });
    document.getElementById('cta-whatsapp-form')?.addEventListener('click', (e) => { e.preventDefault(); openWhatsApp(); });
    document.getElementById('btn-maps')?.addEventListener('click', (e) => { e.preventDefault(); openMaps(); });

    // Cerrar menú móvil al hacer clic en un enlace
    document.querySelectorAll('.m-link').forEach(a => {
        a.addEventListener('click', () => {
            document.getElementById('mobile')?.classList.remove('open');
        });
    });
})();
