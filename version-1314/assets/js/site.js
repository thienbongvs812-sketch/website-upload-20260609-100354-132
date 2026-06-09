(function () {
  function ready(callback) {
    if (document.readyState !== 'loading') {
      callback();
      return;
    }
    document.addEventListener('DOMContentLoaded', callback);
  }

  function setupMenu() {
    var button = document.querySelector('.menu-toggle');
    var panel = document.querySelector('.mobile-panel');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      var expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      panel.hidden = expanded;
    });
  }

  function setupHero() {
    var root = document.querySelector('[data-hero-root]');
    if (!root) {
      return;
    }
    var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('active', position === index);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('active', position === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        var next = Number(dot.getAttribute('data-hero-dot')) || 0;
        show(next);
        start();
      });
    });

    root.addEventListener('mouseenter', stop);
    root.addEventListener('mouseleave', start);
    start();
  }

  function setupCategoryFilter() {
    var grid = document.querySelector('[data-category-grid]');
    if (!grid) {
      return;
    }
    var input = document.querySelector('.category-filter-input');
    var type = document.querySelector('.category-type-filter');
    var year = document.querySelector('.category-year-filter');
    var count = document.querySelector('[data-result-count]');
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.searchable-card'));

    function apply() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = type ? type.value : '';
      var yearValue = year ? year.value : '';
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = [
          card.getAttribute('data-title') || '',
          card.getAttribute('data-tags') || '',
          card.getAttribute('data-region') || '',
          card.getAttribute('data-year') || '',
          card.getAttribute('data-type') || ''
        ].join(' ').toLowerCase();
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchType = !typeValue || card.getAttribute('data-type') === typeValue;
        var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
        var matched = matchQuery && matchType && matchYear;
        card.classList.toggle('is-hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });
      if (count) {
        count.textContent = '当前显示 ' + visible + ' 部作品';
      }
    }

    [input, type, year].forEach(function (element) {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
  }

  function createSearchCard(movie) {
    var tags = movie.tags.slice(0, 3).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');
    return '' +
      '<article class="movie-card">' +
        '<a class="poster-link" href="./' + escapeHtml(movie.href) + '">' +
          '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">' +
          '<span class="poster-shade"></span>' +
          '<span class="play-chip">播放</span>' +
        '</a>' +
        '<div class="movie-card-body">' +
          '<h3><a href="./' + escapeHtml(movie.href) + '">' + escapeHtml(movie.title) + '</a></h3>' +
          '<p class="movie-meta">' + escapeHtml([movie.year, movie.region, movie.type, movie.genre].filter(Boolean).join(' · ')) + '</p>' +
          '<p class="movie-desc">' + escapeHtml(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + tags + '</div>' +
        '</div>' +
      '</article>';
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function fillSelect(select, values) {
    if (!select) {
      return;
    }
    values.forEach(function (value) {
      var option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });
  }

  function setupSearch() {
    var root = document.querySelector('[data-search-root]');
    if (!root || !window.SEARCH_MOVIES) {
      return;
    }
    var movies = window.SEARCH_MOVIES;
    var input = root.querySelector('[data-search-input]');
    var type = root.querySelector('[data-search-type]');
    var region = root.querySelector('[data-search-region]');
    var year = root.querySelector('[data-search-year]');
    var count = root.querySelector('[data-search-count]');
    var results = root.querySelector('[data-search-results]');

    var types = Array.from(new Set(movies.map(function (movie) { return movie.type; }).filter(Boolean))).sort();
    var regions = Array.from(new Set(movies.map(function (movie) { return movie.region; }).filter(Boolean))).sort();
    var years = Array.from(new Set(movies.map(function (movie) { return movie.year; }).filter(Boolean))).sort().reverse();
    fillSelect(type, types);
    fillSelect(region, regions);
    fillSelect(year, years);

    function apply() {
      var query = input.value.trim().toLowerCase();
      var typeValue = type.value;
      var regionValue = region.value;
      var yearValue = year.value;
      var matches = movies.filter(function (movie) {
        var haystack = [movie.title, movie.region, movie.type, movie.year, movie.genre, movie.tags.join(' '), movie.oneLine].join(' ').toLowerCase();
        return (!query || haystack.indexOf(query) !== -1) &&
          (!typeValue || movie.type === typeValue) &&
          (!regionValue || movie.region === regionValue) &&
          (!yearValue || movie.year === yearValue);
      }).slice(0, 120);
      results.innerHTML = matches.map(createSearchCard).join('');
      count.textContent = '找到 ' + matches.length + ' 条结果，最多展示前 120 条';
    }

    [input, type, region, year].forEach(function (element) {
      element.addEventListener('input', apply);
      element.addEventListener('change', apply);
    });
    apply();
  }

  function setupPlayers() {
    var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
    shells.forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var source = shell.getAttribute('data-video-source');
      var initialized = false;
      var hls = null;

      function hideOverlay() {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      }

      function beginPlayback() {
        hideOverlay();
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function () {});
        }
      }

      function initialize() {
        if (!video || !source) {
          return;
        }
        if (initialized) {
          beginPlayback();
          return;
        }
        initialized = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.addEventListener('loadedmetadata', beginPlayback, { once: true });
          video.load();
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true,
            maxBufferLength: 60
          });
          hls.loadSource(source);
          hls.attachMedia(video);
          hls.on(window.Hls.Events.MANIFEST_PARSED, beginPlayback);
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
              return;
            }
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hls.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hls.recoverMediaError();
            } else {
              hls.destroy();
            }
          });
          return;
        }
        video.src = source;
        video.load();
        beginPlayback();
      }

      if (overlay) {
        overlay.addEventListener('click', initialize);
      }
      if (video) {
        video.addEventListener('play', hideOverlay);
        video.addEventListener('click', function () {
          if (video.paused) {
            initialize();
          }
        });
      }
      window.addEventListener('pagehide', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
      });
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupCategoryFilter();
    setupSearch();
    setupPlayers();
  });
})();
