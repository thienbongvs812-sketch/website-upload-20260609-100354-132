function onReady(callback) {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", callback);
  } else {
    callback();
  }
}

function normalize(value) {
  return String(value || "").toLowerCase().trim();
}

function initMenu() {
  const button = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".nav-menu");
  if (!button || !menu) {
    return;
  }
  button.addEventListener("click", function () {
    menu.classList.toggle("is-open");
  });
}

function initFilters() {
  const root = document.querySelector("[data-filter-root]");
  const list = document.querySelector("[data-card-list]");
  if (!root || !list) {
    return;
  }

  const queryInput = root.querySelector("[data-search-input]");
  const yearSelect = root.querySelector("[data-year-filter]");
  const regionSelect = root.querySelector("[data-region-filter]");
  const typeSelect = root.querySelector("[data-type-filter]");
  const categorySelect = root.querySelector("[data-category-filter]");
  const cards = Array.from(list.querySelectorAll(".movie-card"));
  const empty = list.querySelector(".empty-state");
  const params = new URLSearchParams(window.location.search);
  const initialQuery = params.get("q") || "";

  if (queryInput && initialQuery) {
    queryInput.value = initialQuery;
  }

  function applyFilters() {
    const q = normalize(queryInput ? queryInput.value : "");
    const year = normalize(yearSelect ? yearSelect.value : "");
    const region = normalize(regionSelect ? regionSelect.value : "");
    const type = normalize(typeSelect ? typeSelect.value : "");
    const category = normalize(categorySelect ? categorySelect.value : "");
    let visible = 0;

    cards.forEach(function (card) {
      const search = normalize(card.getAttribute("data-search"));
      const cardYear = normalize(card.getAttribute("data-year"));
      const cardRegion = normalize(card.getAttribute("data-region"));
      const cardType = normalize(card.getAttribute("data-type"));
      const cardCategory = normalize(card.getAttribute("data-category"));
      const matched = (!q || search.includes(q)) &&
        (!year || cardYear.includes(year)) &&
        (!region || cardRegion.includes(region)) &&
        (!type || cardType.includes(type)) &&
        (!category || cardCategory.includes(category));

      card.style.display = matched ? "" : "none";
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle("is-visible", visible === 0);
    }
  }

  [queryInput, yearSelect, regionSelect, typeSelect, categorySelect].forEach(function (control) {
    if (!control) {
      return;
    }
    control.addEventListener("input", applyFilters);
    control.addEventListener("change", applyFilters);
  });

  applyFilters();
}

export function initMoviePlayer(streamUrl, HlsClass) {
  const video = document.getElementById("movie-video");
  const panel = document.getElementById("player-panel");
  const overlay = document.getElementById("play-overlay");
  const state = document.getElementById("player-state");
  if (!video || !streamUrl) {
    return;
  }

  let attached = false;
  let hls = null;

  function setState(text) {
    if (state) {
      state.textContent = text || "";
    }
  }

  function attachStream() {
    if (attached) {
      return;
    }
    attached = true;

    if (HlsClass && HlsClass.isSupported && HlsClass.isSupported()) {
      hls = new HlsClass({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      if (HlsClass.Events && HlsClass.Events.ERROR) {
        hls.on(HlsClass.Events.ERROR, function () {
          setState("播放暂时不可用");
        });
      }
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    setState("播放暂时不可用");
  }

  function startVideo() {
    attachStream();
    const playTask = video.play();
    if (playTask && typeof playTask.catch === "function") {
      playTask.catch(function () {
        window.setTimeout(function () {
          video.play().catch(function () {
            setState("点击画面继续播放");
          });
        }, 500);
      });
    }
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      startVideo();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      startVideo();
    } else {
      video.pause();
    }
  });

  video.addEventListener("play", function () {
    if (panel) {
      panel.classList.add("is-playing");
    }
    setState("");
  });

  video.addEventListener("pause", function () {
    if (panel) {
      panel.classList.remove("is-playing");
    }
  });

  window.addEventListener("beforeunload", function () {
    if (hls && typeof hls.destroy === "function") {
      hls.destroy();
    }
  });
}

onReady(function () {
  initMenu();
  initFilters();
});
