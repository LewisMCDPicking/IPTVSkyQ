// M3U with proxy for CORS bypass
const M3U_URL = 'https://corsproxy.io/?http://srv2.slweb.tv/get.php?username=realbazaar&password=caroline1&type=m3u_plus&output=ts';

// Public EPG (if compatible)
const EPG_URL = 'https://iptv-org.github.io/epg/guides/uk.xml';

let channels = [];
let epgData = {};
let selectedChannelIndex = 0;

const videoPlayer = document.getElementById('videoPlayer');
const channelListEl = document.getElementById('channelList');
const channelNameEl = document.getElementById('channelName');
const epgGridEl = document.getElementById('epgGrid');

async function loadM3U(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    parseM3U(text);
    buildChannelList();
    selectChannel(0);
  } catch (err) {
    console.error('Error loading M3U:', err);
    alert('Error loading M3U playlist. Check the URL or network.');
  }
}

function parseM3U(data) {
  channels = [];
  const lines = data.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith('#EXTINF')) {
      const name = line.split(',').pop().trim();
      const url = lines[i + 1]?.trim();
      if (url && !url.startsWith('#')) {
        channels.push({ name, url });
        i++;
      }
    }
  }
}

function buildChannelList() {
  channelListEl.innerHTML = '';
  channels.forEach((ch, idx) => {
    const div = document.createElement('div');
    div.className = 'channel-item';
    div.textContent = ch.name;
    div.dataset.index = idx;
    div.addEventListener('click', () => selectChannel(idx));
    channelListEl.appendChild(div);
  });
}

function selectChannel(index) {
  if (index < 0 || index >= channels.length) return;
  selectedChannelIndex = index;

  document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('selected'));
  const selectedEl = channelListEl.querySelector(`[data-index="${index}"]`);
  if (selectedEl) selectedEl.classList.add('selected');

  const ch = channels[index];
  channelNameEl.textContent = ch.name;
  videoPlayer.src = ch.url;
  videoPlayer.play();
}

// Optional: Load EPG data (if EPG_URL matches your channel IDs)
async function loadEPG(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('EPG fetch failed');
    const xmlText = await res.text();
    parseEPG(xmlText);
  } catch (err) {
    console.warn('EPG not loaded:', err);
  }
}

function parseEPG(xml) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'text/xml');
  const items = doc.querySelectorAll('programme');

  epgData = {};
  items.forEach(prg => {
    const chId = prg.getAttribute('channel');
    const title = prg.querySelector('title')?.textContent || 'No Title';
    const start = prg.getAttribute('start');
    const stop = prg.getAttribute('stop');
    if (!epgData[chId]) epgData[chId] = [];
    epgData[chId].push({ title, start, stop });
  });
}

function init() {
  loadM3U(M3U_URL);
  // loadEPG(EPG_URL); // optional
}

init();
