(function () {
  const navToggle = document.querySelector('.nav-toggle');
  const mainNav = document.querySelector('#main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!expanded));
      mainNav.classList.toggle('is-open');
    });
  }

  const hero = document.querySelector('[data-hero]');

  if (hero) {
    const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
    const prev = hero.querySelector('[data-hero-prev]');
    const next = hero.querySelector('[data-hero-next]');
    let current = 0;
    let timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        clearInterval(timer);
      }
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        showSlide(index);
        start();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        showSlide(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        showSlide(current + 1);
        start();
      });
    }

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    showSlide(0);
    start();
  }

  document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
    const root = panel.parentElement || document;
    const input = panel.querySelector('[data-search-input]');
    const region = panel.querySelector('[data-region-filter]');
    const type = panel.querySelector('[data-type-filter]');
    const year = panel.querySelector('[data-year-filter]');
    const cards = Array.from(root.querySelectorAll('.js-movie-card'));

    function valueOf(element) {
      return element ? element.value.trim().toLowerCase() : '';
    }

    function applyFilters() {
      const query = valueOf(input);
      const regionValue = valueOf(region);
      const typeValue = valueOf(type);
      const yearValue = Number(valueOf(year) || 0);

      cards.forEach(function (card) {
        const text = [
          card.dataset.title || '',
          card.dataset.tags || '',
          card.dataset.region || '',
          card.dataset.type || '',
          card.dataset.year || ''
        ].join(' ').toLowerCase();
        const cardRegion = (card.dataset.region || '').toLowerCase();
        const cardType = (card.dataset.type || '').toLowerCase();
        const cardYear = Number(card.dataset.year || 0);
        const matched = (!query || text.indexOf(query) !== -1) &&
          (!regionValue || cardRegion === regionValue) &&
          (!typeValue || cardType === typeValue) &&
          (!yearValue || cardYear >= yearValue);

        card.classList.toggle('is-filter-hidden', !matched);
      });
    }

    [input, region, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', applyFilters);
        element.addEventListener('change', applyFilters);
      }
    });
  });
})();
