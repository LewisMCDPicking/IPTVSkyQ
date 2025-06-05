// ====== Replace with your actual M3U URL =======
const M3U_URL = 'http://srv2.slweb.tv/get.php?username=realbazaar&password=caroline1&type=m3u_plus&output=ts';

// Replace with your EPG XMLTV URL if available (must allow CORS or use proxy)
const EPG_URL = 'https://iptv-org.github.io/epg/guides/uk.xml';

// Global variables
let channels = [];
let epgData = {};
let selectedChannelIndex = 0;

// Elements
const videoPlayer = document.getElementById('videoPlayer');
const channelListEl = document.getElementById('channelList');
const channelNameEl = document.getElementById('channelName');
const epgGridEl = document.getElementById('epgGrid');

// Load M3U playlist
async function loadM3U(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load M3U playlist: ${res.status}`);
    const text = await res.text();
    parseM3U(text);
    buildChannelList();
    selectChannel(0);
  } catch (err) {
    console.error(err);
    alert('Error loading M3U playlist. Check the URL or network.');
  }
}

// Parse M3U playlist text into channels array
function parseM3U(data) {
  channels = [];
  const lines = data.split('\n').map(line => line.trim());

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF')) {
      const infoLine = lines[i];
      const urlLine = lines[i + 1];
      if (!urlLine || urlLine.startsWith('#')) continue;

      const tvgIdMatch = infoLine.match(/tvg-id="([^"]+)"/);
      const tvgNameMatch = infoLine.match(/tvg-name="([^"]+)"/);
      const tvgLogoMatch = infoLine.match(/tvg-logo="([^"]+)"/);
      const groupMatch = infoLine.match(/group-title="([^"]+)"/);
      const channelNameMatch = infoLine.match(/,(.*)$/);

      channels.push({
        id: tvgIdMatch ? tvgIdMatch[1] : null,
        name: tvgNameMatch ? tvgNameMatch[1] : (channelNameMatch ? channelNameMatch[1] : 'Unknown'),
        logo: tvgLogoMatch ? tvgLogoMatch[1] : null,
        group: groupMatch ? groupMatch[1] : 'Others',
        url: urlLine
      });

      i++;
    }
  }
}

// Build the horizontal channel list UI
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

// Select channel by index
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

// Load and parse EPG XMLTV
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

// Parse EPG XML into a dictionary keyed by channel id
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

    epgData[chId].push({
      title,
      start,
      stop,
    });
  });

  for (const chId in epgData) {
    epgData[chId].sort((a, b) => a.start.localeCompare(b.start));
  }

  displayEPGForChannel(channels[selectedChannelIndex]?.id);
}

// Display EPG items for a given channel id
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

// Helper to parse XMLTV date string to Date object
function parseEPGDate(dateStr) {
  const year = +dateStr.substr(0, 4);
  const month = +dateStr.substr(4, 2) - 1;
  const day = +dateStr.substr(6, 2);
  const hour = +dateStr.substr(8, 2);
  const min = +dateStr.substr(10, 2);
  const sec = +dateStr.substr(12, 2);
  return new Date(Date.UTC(year, month, day, hour, min, sec));
}

// Initialize the app
function init() {
  loadM3U(M3U_URL);
  loadEPG(EPG_URL);
}

init();
