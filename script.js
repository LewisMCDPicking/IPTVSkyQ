const m3uUrl = 'https://iptv-org.github.io/iptv/countries/uk.m3u';

const videoPlayer = document.getElementById("videoPlayer");
const channelList = document.getElementById("channelList");

// Navigation buttons
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
    channelList.innerHTML = "<p style='color: red;'>Failed to load channels. Check your M3U URL.</p>";
  });

function parseM3U(data) {
  const lines = data.split('\n');
  channels = [];
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF')) {
      const titleMatch = lines[i].match(/,(.*)/);
      const groupMatch = lines[i].match(/group-title="(.*?)"/i);
      const logoMatch = lines[i].match(/tvg-logo="(.*?)"/i);
      const url = lines[i + 1];

      if (titleMatch && url) {
        channels.push({
          title: titleMatch[1].trim(),
          group: groupMatch ? groupMatch[1].toLowerCase() : 'other',
          logo: logoMatch ? logoMatch[1] : '',
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

  // fallback: if no matches found, show all channels
  let filtered = channels.filter(ch => {
    return filterGroup[type].some(keyword => ch.group.includes(keyword));
  });

  if(filtered.length === 0) filtered = channels;

  filtered.forEach(ch => {
    const btn = document.createElement('button');
    btn.className = 'channel-button';
    btn.title = ch.group;

    const img = document.createElement('img');
    img.src = ch.logo || 'https://via.placeholder.com/50x50?text=No+Logo';
    img.alt = ch.title;
    img.className = 'channel-logo';

    const span = document.createElement('span');
    span.textContent = ch.title;

    btn.appendChild(img);
    btn.appendChild(span);

    btn.onclick = () => playChannel(ch.url);
    channelList.appendChild(btn);
  });
}

function playChannel(url) {
  videoPlayer.src = url;
  videoPlayer.play().catch(() => {
    alert("Failed to play this channel. Try another one.");
  });
}

// Handle nav clicks and toggle active button
document.querySelectorAll("nav button").forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll("nav button").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    showChannels(btn.dataset.type);
  });
});
