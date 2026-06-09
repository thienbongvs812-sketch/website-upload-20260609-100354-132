(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
        } else {
            document.addEventListener('DOMContentLoaded', callback);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function cardText(card) {
        return normalize([
            card.dataset.title,
            card.dataset.year,
            card.dataset.region,
            card.dataset.type,
            card.dataset.genre,
            card.dataset.category,
            card.dataset.tags
        ].join(' '));
    }

    function yearMatches(year, bucket) {
        var number = parseInt(year, 10) || 0;
        if (!bucket || bucket === '全部年份') {
            return true;
        }
        if (bucket === '2026-2024') {
            return number >= 2024;
        }
        if (bucket === '2023-2020') {
            return number >= 2020 && number <= 2023;
        }
        if (bucket === '2019-2015') {
            return number >= 2015 && number <= 2019;
        }
        if (bucket === '2014以前') {
            return number < 2015;
        }
        return true;
    }

    function initMobileMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var nav = document.querySelector('[data-mobile-nav]');
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener('click', function () {
            nav.classList.toggle('is-open');
        });
    }

    function initHeroSlider() {
        var root = document.querySelector('[data-hero]');
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(root.querySelectorAll('[data-hero-dot]'));
        var prev = root.querySelector('[data-hero-prev]');
        var next = root.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
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
                show(parseInt(dot.dataset.heroDot, 10) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-root]'));
        panels.forEach(function (panel) {
            var input = panel.querySelector('[data-filter-input]');
            var typeSelect = panel.querySelector('[data-filter-type]');
            var yearSelect = panel.querySelector('[data-filter-year]');
            var count = panel.querySelector('[data-visible-count]');
            var list = panel.parentElement.querySelector('[data-card-list]');
            if (!list) {
                list = document.querySelector('[data-card-list]');
            }
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.children);

            function apply() {
                var query = normalize(input ? input.value : '');
                var type = typeSelect ? typeSelect.value : '';
                var year = yearSelect ? yearSelect.value : '';
                var visible = 0;

                cards.forEach(function (card) {
                    var text = cardText(card);
                    var ok = true;
                    if (query && text.indexOf(query) === -1) {
                        ok = false;
                    }
                    if (type && card.dataset.type !== type) {
                        ok = false;
                    }
                    if (!yearMatches(card.dataset.year, year)) {
                        ok = false;
                    }
                    card.classList.toggle('is-hidden', !ok);
                    if (ok) {
                        visible += 1;
                    }
                });

                if (count) {
                    count.textContent = String(visible);
                }
            }

            [input, typeSelect, yearSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });
            apply();
        });
    }

    function initSearchApp() {
        var root = document.querySelector('[data-search-app]');
        if (!root || !window.SEARCH_MOVIES) {
            return;
        }
        var input = root.querySelector('[data-search-query]');
        var button = root.querySelector('[data-search-button]');
        var typeSelect = root.querySelector('[data-search-type]');
        var sortSelect = root.querySelector('[data-search-sort]');
        var count = root.querySelector('[data-search-count]');
        var results = root.querySelector('[data-search-results]');
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get('q') || '';

        function movieCard(movie) {
            var tagHtml = movie.tags.slice(0, 3).map(function (tag) {
                return '<span class="tag-chip">' + escapeHtml(tag) + '</span>';
            }).join('');
            return [
                '<article class="movie-card">',
                '<a href="' + escapeHtml(movie.url) + '" class="movie-card-link" aria-label="观看 ' + escapeHtml(movie.title) + '">',
                '<div class="poster-wrap">',
                '<img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" class="poster-img" loading="lazy" onerror="this.style.display=\'none\'; this.nextElementSibling.classList.add(\'is-visible\');">',
                '<div class="poster-fallback"><span>' + escapeHtml(movie.title) + '</span><small>' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.type) + '</small></div>',
                '<span class="year-badge">' + escapeHtml(movie.year) + '</span>',
                '<span class="play-chip">播放</span>',
                '</div>',
                '<div class="movie-card-body">',
                '<div class="meta-pills"><span>' + escapeHtml(movie.region) + '</span><span>' + escapeHtml(movie.type) + '</span></div>',
                '<h3>' + escapeHtml(movie.title) + '</h3>',
                '<p class="card-line">' + escapeHtml(movie.oneLine) + '</p>',
                '<div class="card-tags">' + tagHtml + '</div>',
                '</div>',
                '</a>',
                '</article>'
            ].join('');
        }

        function escapeHtml(value) {
            return String(value || '')
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/"/g, '&quot;')
                .replace(/'/g, '&#039;');
        }

        function apply() {
            var query = normalize(input ? input.value : '');
            var type = typeSelect ? typeSelect.value : '';
            var sort = sortSelect ? sortSelect.value : 'score';
            var filtered = window.SEARCH_MOVIES.filter(function (movie) {
                var text = normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.tags.join(' '),
                    movie.oneLine
                ].join(' '));
                if (type && movie.type !== type) {
                    return false;
                }
                return !query || text.indexOf(query) !== -1;
            });

            filtered.sort(function (a, b) {
                if (sort === 'year') {
                    return b.year - a.year || b.score - a.score;
                }
                if (sort === 'title') {
                    return a.title.localeCompare(b.title, 'zh-Hans-CN');
                }
                return b.score - a.score || b.year - a.year;
            });

            if (count) {
                count.textContent = String(filtered.length);
            }
            results.innerHTML = filtered.slice(0, 200).map(movieCard).join('');
        }

        if (input && initialQuery) {
            input.value = initialQuery;
        }
        [input, typeSelect, sortSelect].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        if (button) {
            button.addEventListener('click', apply);
        }
        apply();
    }

    function initPlayer() {
        var video = document.getElementById('movie-player');
        var overlay = document.querySelector('[data-video-src]');
        var status = document.querySelector('[data-player-status]');
        if (!video || !overlay) {
            return;
        }
        var hlsInstance = null;

        function setStatus(message) {
            if (status) {
                status.textContent = message;
            }
        }

        function playSource() {
            var source = overlay.dataset.videoSrc;
            if (!source) {
                setStatus('当前影片暂未绑定播放源。');
                return;
            }

            overlay.classList.add('is-hidden');
            setStatus('正在加载高清播放源，请稍候。');

            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                video.play().catch(function () {
                    setStatus('播放已就绪，请再次点击视频播放。');
                });
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
                hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus('播放源加载完成，正在播放。');
                    video.play().catch(function () {
                        setStatus('播放源已准备好，请点击播放器继续。');
                    });
                });
                hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
                    if (data && data.fatal) {
                        setStatus('播放源加载遇到网络或媒体错误，可刷新页面后重试。');
                    }
                });
                return;
            }

            video.src = source;
            video.play().catch(function () {
                setStatus('当前浏览器需要支持 HLS 或加载 HLS 播放组件后才能播放。');
            });
        }

        overlay.addEventListener('click', playSource);
        video.addEventListener('play', function () {
            overlay.classList.add('is-hidden');
        });
    }

    ready(function () {
        initMobileMenu();
        initHeroSlider();
        initFilters();
        initSearchApp();
        initPlayer();
    });
}());
