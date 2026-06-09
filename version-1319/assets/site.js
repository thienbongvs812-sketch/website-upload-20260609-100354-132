/* 静态电影网站主交互脚本：导航、Hero 轮播、搜索筛选与 HLS 播放 */
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function setupMobileMenu() {
        var button = document.querySelector('[data-mobile-toggle]');
        var panel = document.querySelector('[data-mobile-panel]');

        if (!button || !panel) {
            return;
        }

        button.addEventListener('click', function () {
            panel.classList.toggle('is-open');
            button.setAttribute('aria-expanded', panel.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    function setupHeroSlider() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));

        if (slides.length <= 1) {
            return;
        }

        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;

            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });

            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
                restart();
            });
        });

        show(0);
        start();
    }

    function initializeVideo(video, source) {
        if (!video || !source || video.dataset.ready === 'true') {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.dataset.ready = 'true';
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90
            });

            hls.loadSource(source);
            hls.attachMedia(video);
            video._hlsInstance = hls;
            video.dataset.ready = 'true';
            return;
        }

        video.src = source;
        video.dataset.ready = 'true';
    }

    function setupPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll('[data-hls-player]'));

        players.forEach(function (player) {
            var video = player.querySelector('video[data-src]');
            var button = player.querySelector('[data-play-button]');

            if (!video || !button) {
                return;
            }

            function startPlayback() {
                initializeVideo(video, video.dataset.src);
                player.classList.add('is-playing');

                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            button.addEventListener('click', startPlayback);

            video.addEventListener('play', function () {
                player.classList.add('is-playing');
            });

            video.addEventListener('pause', function () {
                if (!video.ended) {
                    player.classList.remove('is-playing');
                }
            });
        });
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function createMovieCard(movie) {
        var article = document.createElement('article');
        article.className = 'movie-card';

        article.innerHTML = [
            '<a class="poster-link" href="' + movie.url + '" aria-label="观看 ' + escapeHtml(movie.title) + '">',
            '    <span class="corner-badge">' + escapeHtml(movie.type) + '</span>',
            '    <img class="movie-poster" src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '封面" loading="lazy">',
            '</a>',
            '<div class="card-body">',
            '    <h3 class="card-title"><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '    <div class="card-meta">',
            '        <span>' + escapeHtml(movie.year) + '</span>',
            '        <span>·</span>',
            '        <span>' + escapeHtml(movie.region) + '</span>',
            '    </div>',
            '    <p class="card-desc">' + escapeHtml(movie.oneLine) + '</p>',
            '</div>'
        ].join('');

        return article;
    }

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    function setupSearchPage() {
        var root = document.querySelector('[data-search-page]');

        if (!root || !window.MOVIE_INDEX) {
            return;
        }

        var input = root.querySelector('[data-search-input]');
        var region = root.querySelector('[data-region-filter]');
        var type = root.querySelector('[data-type-filter]');
        var year = root.querySelector('[data-year-filter]');
        var results = root.querySelector('[data-search-results]');
        var count = root.querySelector('[data-search-count]');
        var params = new URLSearchParams(window.location.search);
        var queryFromUrl = params.get('q') || '';

        input.value = queryFromUrl;

        function render() {
            var keyword = normalize(input.value);
            var regionValue = normalize(region.value);
            var typeValue = normalize(type.value);
            var yearValue = normalize(year.value);
            var matches = window.MOVIE_INDEX.filter(function (movie) {
                var haystack = normalize([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    movie.tags,
                    movie.oneLine,
                    movie.category
                ].join(' '));

                return (!keyword || haystack.indexOf(keyword) !== -1)
                    && (!regionValue || normalize(movie.region).indexOf(regionValue) !== -1)
                    && (!typeValue || normalize(movie.type).indexOf(typeValue) !== -1)
                    && (!yearValue || normalize(movie.year) === yearValue);
            });

            var limited = matches.slice(0, 120);
            results.innerHTML = '';

            if (count) {
                count.textContent = '找到 ' + matches.length + ' 部影片，当前展示 ' + limited.length + ' 部';
            }

            if (!limited.length) {
                results.innerHTML = '<div class="empty-state">没有找到匹配影片，可以尝试更换关键词、地区、类型或年份。</div>';
                return;
            }

            limited.forEach(function (movie) {
                results.appendChild(createMovieCard(movie));
            });
        }

        [input, region, type, year].forEach(function (control) {
            control.addEventListener('input', render);
            control.addEventListener('change', render);
        });

        render();
    }

    ready(function () {
        setupMobileMenu();
        setupHeroSlider();
        setupPlayers();
        setupSearchPage();
    });
})();
