(function () {
    var menuToggle = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuToggle && mobilePanel) {
        menuToggle.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function showSlide(index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function bindGlobalSearch(shell) {
        var input = shell.querySelector('[data-search-input]');
        var resultBox = shell.querySelector('[data-search-results]');

        if (!input || !resultBox || !Array.isArray(window.movieSearchIndex)) {
            return;
        }

        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            if (!query) {
                resultBox.classList.remove('is-open');
                resultBox.innerHTML = '';
                return;
            }

            var matches = window.movieSearchIndex.filter(function (movie) {
                var text = [movie.title, movie.region, movie.year, movie.type, movie.category, movie.tags, movie.oneLine].join(' ').toLowerCase();
                return text.indexOf(query) !== -1;
            }).slice(0, 12);

            if (!matches.length) {
                resultBox.innerHTML = '<div class="search-result-item"><span></span><span><strong>暂无匹配内容</strong><small>换一个关键词试试</small></span></div>';
                resultBox.classList.add('is-open');
                return;
            }

            resultBox.innerHTML = matches.map(function (movie) {
                return '<a class="search-result-item" href="' + escapeHtml(movie.url) + '">'
                    + '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '">'
                    + '<span><strong>' + escapeHtml(movie.title) + '</strong><small>'
                    + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.category)
                    + '</small></span></a>';
            }).join('');
            resultBox.classList.add('is-open');
        });

        document.addEventListener('click', function (event) {
            if (!shell.contains(event.target)) {
                resultBox.classList.remove('is-open');
            }
        });
    }

    document.querySelectorAll('.search-shell').forEach(bindGlobalSearch);

    document.querySelectorAll('[data-grid-filter]').forEach(function (filterBar) {
        var section = filterBar.closest('.content-section');
        if (!section) {
            return;
        }

        var grid = section.querySelector('[data-card-grid]');
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var search = filterBar.querySelector('[data-local-search]');
        var region = filterBar.querySelector('[data-local-region]');
        var year = filterBar.querySelector('[data-local-year]');
        var type = filterBar.querySelector('[data-local-type]');

        function applyFilters() {
            var query = search ? search.value.trim().toLowerCase() : '';
            var regionValue = region ? region.value : '';
            var yearValue = year ? year.value : '';
            var typeValue = type ? type.value : '';

            cards.forEach(function (card) {
                var cardText = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.tags, card.textContent].join(' ').toLowerCase();
                var visible = true;

                if (query && cardText.indexOf(query) === -1) {
                    visible = false;
                }
                if (regionValue && card.dataset.region !== regionValue) {
                    visible = false;
                }
                if (yearValue && card.dataset.year !== yearValue) {
                    visible = false;
                }
                if (typeValue && card.dataset.type !== typeValue) {
                    visible = false;
                }

                card.classList.toggle('is-hidden', !visible);
            });
        }

        [search, region, year, type].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });
    });
}());
