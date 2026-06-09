(function () {
  var box = document.querySelector('[data-media-box]');
  if (!box) return;
  var video = box.querySelector('video');
  var overlay = box.querySelector('[data-overlay]');
  var button = box.querySelector('[data-play]');
  if (!video) return;
  var url = video.getAttribute('data-hls');
  var loaded = false;
  var hls;
  var load = function () {
    if (loaded || !url) return Promise.resolve();
    loaded = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({ enableWorker: true });
      hls.loadSource(url);
      hls.attachMedia(video);
      return new Promise(function (resolve) {
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
      });
    }
    video.src = url;
    return Promise.resolve();
  };
  var play = function (event) {
    if (event) event.preventDefault();
    if (overlay) overlay.classList.add('is-hidden');
    load().then(function () {
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    });
  };
  if (overlay) overlay.addEventListener('click', play);
  if (button) button.addEventListener('click', play);
  video.addEventListener('click', function () {
    if (video.paused) play();
  });
  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') hls.destroy();
  });
})();
