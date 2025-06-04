const video = document.getElementById('videoPlayer');
const preview = document.getElementById('previewPlayer');

let currentPreviewUrl = '';
let currentMainUrl = '';

function channelClicked(url) {
  if (currentPreviewUrl !== url) {
    // First press: just preview
    preview.src = url;
    preview.play();
    currentPreviewUrl = url;
  } else {
    // Second press: play on main player
    video.src = url;
    video.play();
    preview.src = '';
    currentMainUrl = url;
    currentPreviewUrl = '';
  }
}
