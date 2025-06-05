const M3U_URL = 'https://corsproxy.io/?url=https://iptv-org.github.io/iptv/countries/gb.m3u';

const videoPlayer = document.getElementById('videoPlayer');
const channelList = document.getElementById('channelList');
const nowPlaying = document.getElementById('nowPlaying');

let channels = [];

async function loadM3U() {
  try {
    const res = await fetch(M3U_URL);
    if (!res.ok) throw new Error('Failed to fetch M3U');
    const text = await res.text();
    parseM3U(text);
    displayChannels();
    playChannel(0);
  } catch (err) {
    nowPlaying.textContent = '❌ Error loading M3U playlist.';
    console.error('M3U Load Error:', err);
  }
}

function parseM3U(data) {
  const lines = data.split('\n');
  channels = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF')) {
      const name = lines[i].split(',').pop().trim();
      const url = lines[i + 1]?.trim();
      if (url && !url.startsWith('#')) {
        channels.push({ name, url });
        i++;
      }
    }
  }
}

function displayChannels() {
  channelList.innerHTML = '';
  channels.forEach((channel, index) => {
    const div = document.createElement('div');
    div.className = 'channel-item';
    div.textContent = channel.name;
    div.addEventListener('click', () => playChannel(index));
    channelList.appendChild(div);
  });
}

function playChannel(index) {
  const channel = channels[index];
  document.querySelectorAll('.channel-item').forEach(el => el.classList.remove('selected'));
  channelList.children[index].classList.add('selected');
  videoPlayer.src = channel.url;
  videoPlayer.play();
  nowPlaying.textContent = `Now Playing: ${channel.name}`;
}

loadM3U();
