(function () {
    var dataNode = document.getElementById('movie-player-data');
    var video = document.querySelector('[data-movie-video]');
    var overlay = document.querySelector('[data-player-overlay]');
    var data = {};
    var prepared = false;
    var hls = null;

    try {
        data = dataNode ? JSON.parse(dataNode.textContent || '{}') : {};
    } catch (error) {
        data = {};
    }

    function prepareVideo() {
        if (!video || !data.src || prepared) {
            return;
        }

        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = data.src;
        } else if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hls.loadSource(data.src);
            hls.attachMedia(video);
        } else {
            video.src = data.src;
        }

        prepared = true;
    }

    function startVideo() {
        prepareVideo();
        if (!video) {
            return;
        }
        video.setAttribute('controls', 'controls');
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {
                if (overlay) {
                    overlay.classList.remove('is-hidden');
                }
            });
        }
    }

    if (overlay) {
        overlay.addEventListener('click', startVideo);
    }

    if (video) {
        video.addEventListener('click', function () {
            if (!prepared) {
                startVideo();
            }
        });
    }

    window.addEventListener('pagehide', function () {
        if (hls && typeof hls.destroy === 'function') {
            hls.destroy();
        }
    });
}());
