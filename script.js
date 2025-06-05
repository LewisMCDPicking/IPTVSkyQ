const m3uUrl = 'https://iptv-org.github.io/iptv/countries/uk.m3u';

const videoPlayer = document.getElementById("videoPlayer");
const channelList = document.getElementById("channelList");

const navButtons = {
  live: document.getElementById('nav-live'),
  movies: document.getElementById('nav-movies'),
  series: document.getElementById('nav-series')
};

let channels = [];

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
      const groupMatch = lines[i].match(/group-title="(.*?)"/i);
      const url = lines[i + 1];

      if (titleMatch && url) {
        channels.push({
          title: titleMatch[1].trim(),
          group: groupMatch ? groupMatch[1].toLowerCase() : 'other',
          url: url.trim()
        });
      }
    }
  }
  showChannels('live');
}

function showChannels(type) {
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
    btn.title = ch.group;
    btn.onclick = () => playChannel(ch.url);

    const img = document.createElement('img');
    img.src = `https://iptv-org.github.io/logos/auto/${encodeURIComponent(ch.title)}.png`;
    img.onerror = () => { img.src = 'https://via.placeholder.com/48x48?text=TV'; };

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

document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    showChannels(btn.dataset.type);
  });
});
