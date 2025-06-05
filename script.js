const m3uUrl = 'https://iptv-org.github.io/iptv/countries/uk.m3u';

const videoPlayer = document.getElementById("videoPlayer");
const channelList = document.getElementById("channelList");
const navButtons = document.querySelectorAll("nav button");

let channels = [];
let currentFilter = 'live';

// Fetch and parse M3U playlist
fetch(m3uUrl)
  .then(res => res.text())
  .then(parseM3U)
  .catch(err => {
    console.error('Failed to load M3U playlist:', err);
    channelList.innerHTML = "<p style='color: red;'>Failed to load channels.</p>";
  });

function parseM3U(data) {
  const lines = data.split('\n');
  channels = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF')) {
      const titleMatch = lines[i].match(/,(.*)/);
      const logoMatch = lines[i].match(/tvg-logo="(.*?)"/i);
      const groupMatch = lines[i].match(/group-title="(.*?)"/i);
      const url = lines[i + 1];

      if (titleMatch && url) {
        channels.push({
          title: titleMatch[1].trim(),
          logo: logoMatch ? logoMatch[1] : null,
          group: groupMatch ? groupMatch[1].toLowerCase() : 'other',
          url: url.trim()
        });
      }
    }
  }
  showChannels(currentFilter);
}

function showChannels(type) {
  currentFilter = type;
  channelList.innerHTML = '';

  const filterGroup = {
    live: ['uk', 'entertainment', 'news', 'sports'],
    movies: ['movie', 'film', 'cinema'],
    series: ['series', 'tv shows', 'drama']
  };

  let filtered = channels.filter(ch =>
    filterGroup[type].some(keyword => ch.group.includes(keyword))
  );
  if (filtered.length === 0) filtered = channels;

  filtered.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'channel-button';
    btn.title = ch.title;
    btn.onclick = () => playChannel(ch.url);

    const img = document.createElement('img');
    img.src = ch.logo || `https://iptv-org.github.io/iptv/logos/${encodeURIComponent(ch.title)}.png`;
    img.onerror = () => { img.src = 'https://via.placeholder.com/48x28?text=TV'; };

    const label = document.createElement('div');
    label.textContent = ch.title;

    btn.appendChild(img);
    btn.appendChild(label);
    channelList.appendChild(btn);
  });
}

function playChannel(url) {
  videoPlayer.src = url;
  videoPlayer.play().catch(() => {
    alert("Failed to play this channel. Try another one.");
  });
}

// Navigation buttons behavior
navButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    navButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    showChannels(btn.dataset.type);
  });
});
