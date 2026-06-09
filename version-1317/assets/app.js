(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var navLinks = document.querySelector('[data-nav-links]');
    var navSearch = document.querySelector('.nav-search');

    if (menuButton && navLinks && navSearch) {
        menuButton.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
            navSearch.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, position) {
                slide.classList.toggle('is-active', position === index);
            });
            dots.forEach(function (dot, position) {
                dot.classList.toggle('is-active', position === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        showSlide(0);
        restart();
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    var searchInput = document.querySelector('[data-filter-search]');
    var yearSelect = document.querySelector('[data-filter-year]');
    var typeSelect = document.querySelector('[data-filter-type]');
    var genreSelect = document.querySelector('[data-filter-genre]');
    var status = document.querySelector('[data-filter-status]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-grid] .movie-card-link'));

    function uniqueValues(name) {
        var values = cards.map(function (card) {
            return card.getAttribute(name) || '';
        }).filter(Boolean);
        return Array.from(new Set(values)).sort(function (a, b) {
            return b.localeCompare(a, 'zh-Hans-CN');
        });
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

    function cardText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-tags') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-type') || '',
            card.getAttribute('data-genre') || ''
        ].join(' ').toLowerCase();
    }

    function applyFilters() {
        var keyword = (searchInput && searchInput.value ? searchInput.value : '').trim().toLowerCase();
        var year = yearSelect && yearSelect.value ? yearSelect.value : '';
        var type = typeSelect && typeSelect.value ? typeSelect.value : '';
        var genre = genreSelect && genreSelect.value ? genreSelect.value : '';
        var visible = 0;

        cards.forEach(function (card) {
            var matchesKeyword = !keyword || cardText(card).indexOf(keyword) > -1;
            var matchesYear = !year || card.getAttribute('data-year') === year;
            var matchesType = !type || card.getAttribute('data-type') === type;
            var matchesGenre = !genre || (card.getAttribute('data-genre') || '').indexOf(genre) > -1;
            var show = matchesKeyword && matchesYear && matchesType && matchesGenre;
            card.classList.toggle('is-hidden', !show);
            if (show) {
                visible += 1;
            }
        });

        if (status) {
            status.textContent = visible > 0 ? '筛选结果已更新' : '未找到匹配影片';
        }
    }

    if (cards.length) {
        fillSelect(yearSelect, uniqueValues('data-year'));
        fillSelect(typeSelect, uniqueValues('data-type'));
        fillSelect(genreSelect, uniqueValues('data-genre'));

        if (searchInput && query) {
            searchInput.value = query;
        }

        [searchInput, yearSelect, typeSelect, genreSelect].forEach(function (element) {
            if (element) {
                element.addEventListener('input', applyFilters);
                element.addEventListener('change', applyFilters);
            }
        });

        applyFilters();
    }
}());
