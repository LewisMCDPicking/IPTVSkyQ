// script.js

const m3uUrl = 'https://iptv-org.github.io/iptv/countries/uk.m3u';

const channelListEl = document.getElementById('channel-list');
const previewPlayer = document.getElementById('preview-player');
const mainPlayer = document.getElementById('main-player');
const loadingEgg = document.getElementById('loading-egg');

let previewHls = null;
let mainHls = null;
let currentPreviewChannel = null;
let currentMainChannel = null;

// Show loading egg
function showLoading() {
  loadingEgg.style.display = 'block';
}

// Hide loading egg
function hideLoading() {
  loadingEgg.style.display = 'none';
}

// Play stream on a video element with HLS.js support
function playStream(videoEl, url, isMainPlayer = false) {
  if (Hls.isSupported()) {
    if (isMainPlayer && mainHls) {
      mainHls.destroy();
      mainHls = null;
    }
    if (!isMainPlayer && previewHls) {
      previewHls.destroy();
      previewHls = null;
    }

    const hls = new Hls();
    hls.loadSource(url);
    hls.attachMedia(videoEl);
    showLoading();

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoEl.play();
    });

    hls.on(Hls.Events.LEVEL_LOADED, () => {
      hideLoading();
    });

    hls.on(Hls.Events.ERROR, (event, data) => {
      console.error('HLS error:', data);
      hideLoading();
      alert('Stream playback error. Please try another channel.');
    });

    if (isMainPlayer) mainHls = hls;
    else previewHls = hls;

  } else if (videoEl.canPlayType('application/vnd.apple.mpegurl')) {
    // Native HLS support (Safari)
    videoEl.src = url;
    videoEl.play();
    hideLoading();
  } else {
    alert('Your browser does not support HLS streams.');
  }
}

// Fetch channels from M3U and build the list
async function fetchChannels(url) {
  const res = await fetch(url);
  const text = await res.text();

  const lines = text.split('\n');
  const channels = [];

  for(let i = 0; i < lines.length; i++) {
    if(lines[i].startsWith('#EXTINF')) {
      const name = lines[i].split(',')[1];
      const streamUrl = lines[i + 1];
      channels.push({ name, url: streamUrl });
    }
  }
  return channels;
}

function createChannelButton(channel) {
  const btn = document.createElement('button');
  btn.classList.add('channel-btn');
  btn.textContent = channel.name;

  btn.onclick = () => {
    // First click: show preview if not already previewing this channel
    if(currentPreviewChannel !== channel.url) {
      currentPreviewChannel = channel.url;
      playStream(previewPlayer, channel.url, false);
      highlightButton(btn);
      return;
    }

    // Second click on same channel: play full screen
    if(currentMainChannel !== channel.url) {
      currentMainChannel = channel.url;
      playStream(mainPlayer, channel.url, true);
      // Optionally, switch to fullscreen or show main player prominently
      mainPlayer.scrollIntoView({behavior: "smooth"});
      highlightButton(btn, true);
    }
  };

  return btn;
}

function highlightButton(button, main=false) {
  // Remove highlights
  document.querySelectorAll('.channel-btn').forEach(b => {
    b.classList.remove('highlight-preview');
    b.classList.remove('highlight-main');
  });

  if(main) {
    button.classList.add('highlight-main');
  } else {
    button.classList.add('highlight-preview');
  }
}

async function init() {
  loadingEgg.style.display = 'none'; // hide initially
  channelListEl.textContent = 'Loading channels...';
  const channels = await fetchChannels(m3uUrl);

  channelListEl.textContent = '';
  channels.forEach(ch => {
    const btn = createChannelButton(ch);
    channelListEl.appendChild(btn);
  });

  // Optionally auto-preview the first channel
  if(channels.length) {
    currentPreviewChannel = channels[0].url;
    playStream(previewPlayer, channels[0].url, false);
    highlightButton(channelListEl.children[0]);
  }
}

window.onload = init;
