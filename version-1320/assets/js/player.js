(function () {
  const video = document.getElementById('movie-video');
  const mask = document.getElementById('play-mask');
  const config = document.getElementById('player-config');

  if (!video || !config) {
    return;
  }

  const streamUrl = config.textContent.trim();
  let ready = false;
  let hls = null;

  function prepare() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function play() {
    prepare();

    if (mask) {
      mask.classList.add('is-hidden');
    }

    const promise = video.play();

    if (promise && typeof promise.catch === 'function') {
      promise.catch(function () {
        video.controls = true;
      });
    }
  }

  if (mask) {
    mask.addEventListener('click', play);
    mask.addEventListener('touchstart', function (event) {
      event.preventDefault();
      play();
    }, { passive: false });
  }

  video.addEventListener('click', function () {
    if (!ready) {
      play();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls) {
      hls.destroy();
    }
  });
})();
