const video = document.getElementById('videoPlayer');
const preview = document.getElementById('previewPlayer');
const channelList = document.getElementById('channelList');
const epgGrid = document.getElementById('epgGrid');
const muteBtn = document.getElementById('muteBtn');
const volumeSlider = document.getElementById('volumeSlider');

let currentPreviewUrl = '';
let currentMainUrl = '';

const channels = [
  {
    id: 'bbc1',
    name: 'BBC One',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/b/bb/BBC_One_logo_2021.svg/320px-BBC_One_logo_2021.svg.png',
    stream: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    epg: [
      { start: '13:00', end: '14:00', title: 'BBC News' },
      { start: '14:00', end: '15:00', title: 'BBC Drama' },
      { start: '15:00', end: '16:00', title: 'Documentary' },
    ]
  },
  {
    id: 'bbc2',
    name: 'BBC Two',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8a/BBC_Two_logo_2021.svg/320px-BBC_Two_logo_2021.svg.png',
    stream: 'https://test-streams.mux.dev/test_001/stream.m3u8',
    epg: [
      { start: '13:00', end: '14:00', title: 'Cooking Show' },
      { start: '14:00', end: '15:30', title: 'Science Hour' },
      { start: '15:30', end: '16:00', title: 'Kids Program' },
    ]
  },
  {
    id: 'itv',
    name: 'ITV',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/ITV_logo_2013.svg/320px-ITV_logo_2013.svg.png',
    stream: 'https://test-streams.mux.dev/pts_shift/master.m3u8',
    epg: [
      { start: '13:00', end: '14:00', title: 'ITV Drama' },
      { start: '14:00', end: '15:00', title: 'Game Show' },
      { start: '15:00', end: '16:00', title: 'Reality TV' },
    ]
  },
  {
    id: 'ch4',
    name: 'Channel 4',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Channel4_logo_1996.svg/320px-Channel4_logo_1996.svg.png',
    stream: 'https://test-streams.mux.dev/dai-discontinuity-daterange/dai.m3u8',
    epg: [
      { start: '13:00', end: '14:00', title: 'Channel 4 Movie' },
      { start: '14:00', end: '15:00', title: 'Talk Show' },
      { start: '15:00', end: '16:00', title: 'Comedy' },
    ]
  }
];

function channelClicked(url) {
  if (currentPreviewUrl !== url) {
    preview.src = url;
    preview.load();
    currentPreviewUrl = url;
    setActiveChannel(url);
  } else {
    video.src = url;
    video.load();
    video.play();
    preview.src = '';
    currentMainUrl = url;
    currentPreviewUrl = '';
    setActiveChannel(null);
  }
}

function setActiveChannel(url) {
  const items = channelList.querySelectorAll('li');
  items.forEach(item => {
    if (item.dataset.stream === url) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

function buildChannelList() {
  channels.forEach(ch => {
    const li = document.createElement('li');
    li.dataset.stream = ch.stream;
    li.onclick = () => channelClicked(ch.stream);

    const img = document.createElement('img');
    img.src = ch.logo;
    img.alt = ch.name;

    const span = document.createElement('span');
    span.textContent = ch.name;

    li.appendChild(img);
    li.appendChild(span);
    channelList.appendChild(li);
  });
}

function buildEpgGrid() {
  // Header Row: Time Slots
  const headerRow = document.createElement('tr');
  headerRow.appendChild(document.createElement('th')); // empty corner cell

  // Times for EPG columns (1 hour slots from 13:00 to 16:00)
  const times = ['13:00', '14:00', '15:00', '16:00'];
  times.forEach(time => {
    const th = document.createElement('th');
    th.textContent = time;
    headerRow.appendChild(th);
  });
  epgGrid.appendChild(headerRow);

  // Rows per channel
  channels.forEach(ch => {
    const tr = document.createElement('tr');
    const chNameCell = document.createElement('td');
    chNameCell.textContent = ch.name;
    tr.appendChild(chNameCell);

    // For each time slot, fill with show title or blank
    for (let i = 0; i < times.length -1; i++) {
      const start = times[i];
      const end = times[i + 1];
      const td = document.createElement('td');

      const show = ch.epg.find(
        s => s.start === start && s.end === end
      );

      if (show) {
        td.textContent = show.title;

        if (isCurrentShow(start, end)) {
          td.classList.add('current-show');
        }
      } else {
        td.textContent = '-';
      }
      tr.appendChild(td);
    }
    epgGrid.appendChild(tr);
  });
}

// Helper to check if a show is the current one (simple check)
function isCurrentShow(start, end) {
  const now = new Date();
  const [startH, startM] = start.split(':').map(Number);
  const [endH, endM] = end.split(':').map(Number);

  const startTime = new Date();
  startTime.setHours(startH, startM, 0, 0);

  const endTime = new Date();
  endTime.setHours(endH, endM, 0, 0);

  return now >= startTime && now < endTime;
}

// Volume controls
muteBtn.onclick = () => {
  if (video.muted) {
    video.muted = false;
    muteBtn.textContent = '🔊';
  } else {
    video.muted = true;
    muteBtn.textContent = '🔇';
  }
};

volumeSlider.oninput = () => {
  video.volume = volumeSlider.value;
  video.muted = video.volume === 0;
  muteBtn.textContent = video.muted ? '🔇' : '🔊';
};

window.onload = () => {
  buildChannelList();
  buildEpgGrid();

  // Autoplay first channel preview
  if (channels.length > 0) {
    channelClicked(channels[0].stream);
  }
};
