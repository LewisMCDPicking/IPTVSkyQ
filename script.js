const rawUrl = 'http://cord-cutter.net:8080/get.php?username=5ZK2w7aJNy&password=J3ddWZD9Ww&type=m3u_plus';
const m3uUrl = 'https://api.allorigins.win/raw?url=' + encodeURIComponent(rawUrl);

const videoPlayer = document.getElementById('videoPlayer');
const channelList = document.getElementById('channelList');

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
      const url = lines[i + 1];
      if (titleMatch && url) {
        channels.push({ title: titleMatch[1].trim(), url: url.trim() });
      }
    }
  }
  if (channels.length === 0) {
    channelList.innerHTML = "<p>No channels found.</p>";
    return;
  }
  channelList.innerHTML = '';
  channels.forEach((ch, idx) => {
    const btn = document.createElement('div');
    btn.className = 'channel';
    btn.textContent = ch.title;
    btn.onclick = () => playChannel(idx);
    channelList.appendChild(btn);
  });
  playChannel(0);
}

function playChannel(index) {
  const ch = channels[index];
  videoPlayer.src = ch.url;
  videoPlayer.play().catch(() => alert("Failed to play channel"));
  document.querySelectorAll('.channel').forEach(el => el.classList.remove('selected'));
  document.querySelectorAll('.channel')[index].classList.add('selected');
}
