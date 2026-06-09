(function() {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMobileNav() {
    var button = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(parseInt(dot.getAttribute('data-hero-dot'), 10) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function setupFilters() {
    var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
    panels.forEach(function(panel) {
      var section = panel.parentElement;
      if (!section) {
        return;
      }
      var grid = section.querySelector('[data-card-grid]');
      if (!grid) {
        return;
      }
      var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-card]'));
      var input = panel.querySelector('[data-filter-input]');
      var year = panel.querySelector('[data-filter-year]');
      var category = panel.querySelector('[data-filter-category]');
      var sort = panel.querySelector('[data-sort-select]');
      var count = panel.querySelector('[data-visible-count]');

      function cardText(card) {
        return normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' '));
      }

      function applySort() {
        var mode = sort ? sort.value : 'year-desc';
        var sorted = cards.slice().sort(function(a, b) {
          if (mode === 'title-asc') {
            return String(a.getAttribute('data-title') || '').localeCompare(String(b.getAttribute('data-title') || ''), 'zh-Hans-CN');
          }
          if (mode === 'rank-desc') {
            return (parseFloat(b.getAttribute('data-rank')) || 0) - (parseFloat(a.getAttribute('data-rank')) || 0);
          }
          return (parseInt(b.getAttribute('data-year'), 10) || 0) - (parseInt(a.getAttribute('data-year'), 10) || 0);
        });
        sorted.forEach(function(card) {
          grid.appendChild(card);
        });
      }

      function applyFilter() {
        var keyword = normalize(input ? input.value : '');
        var selectedYear = year ? year.value : '';
        var selectedCategory = category ? normalize(category.value) : '';
        var visible = 0;

        cards.forEach(function(card) {
          var text = cardText(card);
          var matchesKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchesYear = !selectedYear || String(card.getAttribute('data-year') || '').indexOf(selectedYear) !== -1;
          var matchesCategory = !selectedCategory || text.indexOf(selectedCategory) !== -1;
          var isVisible = matchesKeyword && matchesYear && matchesCategory;
          card.classList.toggle('is-filter-hidden', !isVisible);
          if (isVisible) {
            visible += 1;
          }
        });

        if (count) {
          count.textContent = String(visible);
        }
      }

      [input, year, category].forEach(function(control) {
        if (control) {
          control.addEventListener('input', applyFilter);
          control.addEventListener('change', applyFilter);
        }
      });

      if (sort) {
        sort.addEventListener('change', function() {
          applySort();
          applyFilter();
        });
      }

      applySort();
      applyFilter();
    });
  }

  window.initMoviePlayer = function(videoId, sourceUrl, buttonId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = button;

    if (!video || !button || !sourceUrl) {
      return;
    }

    function attachSource() {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (!video.getAttribute('src')) {
          video.setAttribute('src', sourceUrl);
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsInstance) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(sourceUrl);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        }
        return;
      }

      if (!video.getAttribute('src')) {
        video.setAttribute('src', sourceUrl);
      }
    }

    function start() {
      attachSource();
      video.setAttribute('controls', 'controls');
      overlay.classList.add('is-hidden');
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function() {
          overlay.classList.remove('is-hidden');
        });
      }
    }

    button.addEventListener('click', start);
    video.addEventListener('click', function() {
      if (video.paused) {
        start();
      }
    });
  };

  ready(function() {
    setupMobileNav();
    setupHero();
    setupFilters();
  });
})();
