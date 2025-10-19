export async function init({ root }) {
  const grid = root.querySelector('#promoGrid');

  const promos = getLocalPromos();

  if (!promos.length) {
    grid.innerHTML = `
      <div class="card public__empty">
        <h3>Sin promociones disponibles</h3>
        <p>Vuelve más tarde.</p>
      </div>`;
    return;
  }

  grid.innerHTML = promos.map(p => promoCard(p)).join('');

  root.querySelector('#btnReloadPromos')?.addEventListener('click', (e) => {
    e.preventDefault();
    grid.classList.add('is-loading');
    setTimeout(() => {
      grid.classList.remove('is-loading');
      grid.innerHTML = promos.map(p => promoCard(p)).join('');
    }, 250);
  });
}

function promoCard(p) {
  return `
  <article class="promo-card card">
    <div class="promo-card__media">
      <img src="${p.image}" alt="${esc(p.title)}" loading="lazy" onerror="this.style.display='none'">
    </div>
    <div class="promo-card__body">
      <div class="promo-card__head">
        <h3 class="promo-card__title">${esc(p.title)}</h3>
        ${p.price ? `<strong class="promo-card__price">$${Number(p.price).toLocaleString('es-CL')}</strong>` : ''}
      </div>
      <p class="promo-card__desc">${esc(p.desc)}</p>
      <div class="promo-card__meta">
        <span class="badge">${esc(p.badge || 'Promo')}</span>
        ${p.note ? `<small class="promo-card__note">${esc(p.note)}</small>` : ''}
      </div>
    </div>
  </article>`;
}

function getLocalPromos() {
  return [
    {
      id: 1,
      title: 'Desparasitación completa',
      desc: '10% descuento este mes',
      price: 19990,
      image: '/assets/promos/promo-antiparasitario.jpeg',
      badge: '¡Nuevo!'
    },
    {
      id: 2,
      title: 'Vacunación canina',
      desc: 'Plan anual a precio especial',
      price: 24990,
      image: '/assets/promos/promo-vacuna.jpeg',
      badge: 'Temporada'
    },
    {
      id: 3,
      title: 'Profilaxis dental',
      desc: 'Incluye evaluación',
      price: 34990,
      image: '/assets/promos/promo-profilaxis.jpeg',
      badge: 'Top'
    }
  ];
}

function esc(s) { return (s ?? '').toString().replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
