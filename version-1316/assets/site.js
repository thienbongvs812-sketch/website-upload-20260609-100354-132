(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var panel = document.querySelector('[data-menu-panel]');
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  var stage = document.querySelector('[data-stage]');
  if (stage) {
    var slides = Array.prototype.slice.call(stage.querySelectorAll('[data-stage-slide]'));
    var dots = Array.prototype.slice.call(stage.querySelectorAll('[data-stage-dot]'));
    var current = 0;
    var activate = function (index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle('is-active', idx === current);
      });
    };
    dots.forEach(function (dot, idx) {
      dot.addEventListener('click', function () {
        activate(idx);
      });
    });
    activate(0);
    setInterval(function () {
      activate(current + 1);
    }, 5200);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var input = document.querySelector('[data-filter-input]');
  var empty = document.querySelector('[data-empty-state]');
  var chips = Array.prototype.slice.call(document.querySelectorAll('[data-filter-chip]'));
  var params = new URLSearchParams(window.location.search);
  var initialQuery = params.get('q') || '';
  var activeChip = '';
  var normalize = function (value) {
    return (value || '').toString().trim().toLowerCase();
  };
  var applyFilter = function () {
    if (!cards.length) return;
    var query = normalize(input ? input.value : initialQuery);
    var visible = 0;
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-filter-text') + ' ' + card.textContent);
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchChip = !activeChip || text.indexOf(normalize(activeChip)) !== -1;
      var show = matchQuery && matchChip;
      card.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });
    if (empty) empty.classList.toggle('is-visible', visible === 0);
  };
  if (input) {
    if (initialQuery) input.value = initialQuery;
    input.addEventListener('input', applyFilter);
  }
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var value = chip.getAttribute('data-filter-chip');
      activeChip = activeChip === value ? '' : value;
      chips.forEach(function (item) {
        item.classList.toggle('is-active', item === chip && activeChip);
      });
      applyFilter();
    });
  });
  applyFilter();
})();
