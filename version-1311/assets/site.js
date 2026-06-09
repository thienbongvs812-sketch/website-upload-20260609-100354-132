(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function bindMenu() {
        var button = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function bindHero() {
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
            slides.forEach(function (slide, i) {
                slide.classList.toggle('is-active', i === index);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle('is-active', i === index);
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
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
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

    function normalize(text) {
        return (text || '').toString().trim().toLowerCase();
    }

    function bindFilters() {
        var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-box]'));
        boxes.forEach(function (box) {
            var search = box.querySelector('[data-card-search]');
            var year = box.querySelector('[data-year-filter]');
            var type = box.querySelector('[data-type-filter]');
            var list = document.querySelector('[data-card-list]');
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card, .compact-card'));

            function apply() {
                var q = normalize(search && search.value);
                var y = normalize(year && year.value);
                var t = normalize(type && type.value);
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-type'));
                    var cardYear = normalize(card.getAttribute('data-year'));
                    var cardType = normalize(card.getAttribute('data-type'));
                    var matched = (!q || text.indexOf(q) !== -1) && (!y || cardYear === y) && (!t || cardType === t);
                    card.classList.toggle('is-hidden', !matched);
                });
            }

            [search, year, type].forEach(function (input) {
                if (input) {
                    input.addEventListener('input', apply);
                    input.addEventListener('change', apply);
                }
            });

            var params = new URLSearchParams(window.location.search);
            var query = params.get('q');
            if (query && search) {
                search.value = query;
            }
            apply();
        });
    }

    window.setupVideoPlayer = function (url) {
        var video = document.querySelector('[data-video-player]');
        var cover = document.querySelector('[data-player-cover]');
        if (!video || !cover || !url) {
            return;
        }
        var attached = false;

        function attach() {
            if (attached) {
                return;
            }
            attached = true;
            if (video.canPlayType('application/vnd.apple.mpegurl') || video.canPlayType('application/x-mpegURL')) {
                video.src = url;
            } else if (window.Hls && window.Hls.isSupported()) {
                var hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hls.loadSource(url);
                hls.attachMedia(video);
            } else {
                video.src = url;
            }
        }

        function play() {
            attach();
            cover.classList.add('is-hidden');
            var result = video.play();
            if (result && typeof result.catch === 'function') {
                result.catch(function () {});
            }
        }

        cover.addEventListener('click', play);
        video.addEventListener('click', function () {
            if (video.paused) {
                play();
            }
        });
    };

    ready(function () {
        bindMenu();
        bindHero();
        bindFilters();
    });
}());
