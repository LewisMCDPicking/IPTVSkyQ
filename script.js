// Replace these with your Xtream API info
const XTREAM_API_URL = 'http://mv223.uk:8880/player_api.php?username=uc6Kcf7Y&password=fGJajuyUX2&action=get_live_streams';

// Replace with your EPG XMLTV URL if you have one (must allow CORS or proxy)
const EPG_URL = 'https://iptv-org.github.io/epg/guides/uk.xml';

let channels = [];
let epgData = {};
let selectedChannelIndex = 0;

const videoPlayer = document.getElementById('videoPlayer');
const channelListEl = document.getElementById('channelList');
const channelNameEl = document.getElementById('channelName');
const epgGridEl = document.getElementById('epgGrid');

// Load Xtream API JSON and parse channels
async function loadXtream() {
  try {
    const res = await fetch(XTREAM_API_URL);
    if (!res.ok) throw new Error(`Failed to load Xtream API: ${res.status}`);
    const data = await res.json();

    if (!data || !data.streams) throw new Error('Invalid Xtream API response');

    channels = data.streams.map(stream => ({
      id: stream.stream_id,
      name: stream.name || stream.stream_name || 'Unknown',
      logo: stream.stream_icon || null,
      url: stream.stream_url
    }));

    buildChannelList();
    selectChannel(0);
  } catch (err) {
    console.error(err);
    alert('Error loading Xtream API. Check the URL or network.');
  }
}

function buildChannelList() {
  channelListEl.innerHTML = '';
  channels.forEach((ch, idx) => {
    const chDiv = document.createElement('div');
    chDiv.className = 'channel-item';
    chDiv.title = ch.name;
    chDiv.dataset.index = idx;

    if (ch.logo) {
      const img = document.createElement('img');
      img.src = ch.logo;
      img.alt = ch.name;
      img.className = 'channel-logo';
      chDiv.appendChild(img);
    } else {
      chDiv.textContent = ch.name;
    }

    chDiv.addEventListener('click', () => {
      selectChannel(idx);
    });

    channelListEl.appendChild(chDiv);
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

  displayEPGForChannel(ch.id);
}

// The EPG code can stay the same as your existing one, or I can help adjust if you want.

async function loadEPG(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to load EPG');
    const xmlText = await res.text();
    parseEPG(xmlText);
  } catch (err) {
    console.error(err);
  }
}

function parseEPG(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");
  const channelElems = xmlDoc.querySelectorAll('channel');
  const programmeElems = xmlDoc.querySelectorAll('programme');

  epgData = {};

  channelElems.forEach(ch => {
    const id = ch.getAttribute('id');
    epgData[id] = [];
  });

  programmeElems.forEach(prg => {
    const chId = prg.getAttribute('channel');
    if (!epgData[chId]) return;
    const title = prg.querySelector('title')?.textContent || 'No Title';
    const start = prg.getAttribute('start');
    const stop = prg.getAttribute('stop');

    epgData[chId].push({ title, start, stop });
  });

  for (const chId in epgData) {
    epgData[chId].sort((a, b) => a.start.localeCompare(b.start));
  }

  displayEPGForChannel(channels[selectedChannelIndex]?.id);
}

function displayEPGForChannel(channelId) {
  epgGridEl.innerHTML = '';
  if (!channelId || !epgData[channelId]) {
    epgGridEl.innerHTML = '<div>No EPG data available for this channel.</div>';
    return;
  }

  const now = new Date();

  epgData[channelId].forEach(prg => {
    const start = parseEPGDate(prg.start);
    const stop = parseEPGDate(prg.stop);

    const epgItem = document.createElement('div');
    epgItem.className = 'epg-item';
    epgItem.textContent = prg.title;

    if (now >= start && now <= stop) {
      epgItem.classList.add('current');
    }

    epgGridEl.appendChild(epgItem);
  });
}

function parseEPGDate(dateStr) {
  const year = +dateStr.substr(0, 4);
  const month = +dateStr.substr(4, 2) - 1;
  const day = +dateStr.substr(6, 2);
  const hour = +dateStr.substr(8, 2);
  const min = +dateStr.substr(10, 2);
  const sec = +dateStr.substr(12, 2);
  return new Date(Date.UTC(year, month, day, hour, min, sec));
}

function init() {
  loadXtream();
  loadEPG(EPG_URL);
}

init();
