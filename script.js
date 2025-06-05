const m3uUrl = 'https://corsproxy.io/?url=https://iptv-org.github.io/iptv/countries/uk.m3u';

const videoPlayer = document.getElementById('videoPlayer');
const channelList = document.getElementById('channelList');

let channels = [];

fetch(m3uUrl)
  .then(res => {
    if (!res.ok) throw new Error('Network response was not ok');
    return res.text();
  })
  .then(parseM3U)
  .then(() => {
    if (channels.length === 0) {
      channelList.innerHTML = 'No channels found.';
      return;
    }
    channelList.innerHTML = '';
    channels.forEach((ch, idx) => {
      const btn = document.createElement('button');
      btn.className = 'channel-button';
      btn.title = ch.title;
      btn.onclick = () => playChannel(idx);

      const img = document.createElement('img');
      img.src = `https://iptv-org.github.io/logos/auto/${encodeURIComponent(ch.title)}.png`;
      img.onerror = () => { img.src = 'https://via.placeholder.com/48?text=TV'; };

      const label = document.createElement('div');
      label.textContent = ch.title;

      btn.appendChild(img);
      btn.appendChild(label);
      channelList.appendChild(btn);
    });
    playChannel(0);
  })
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
      const url = lines[i + 1];
      if (titleMatch && url && url.trim() !== '') {
        channels.push({
          title: titleMatch[1].trim(),
          url: url.trim()
        });
      }
    }
  }
}

function playChannel(index) {
  const ch = channels[index];
  if (!ch) return;
  videoPlayer.src = ch.url;
  videoPlayer.play().catch(() => {
    alert("Failed to play this channel. Try another one.");
  });
}
