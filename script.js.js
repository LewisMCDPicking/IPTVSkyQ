const video = document.getElementById('videoPlayer');
const preview = document.getElementById('previewPlayer');

let currentPreviewUrl = '';
let currentMainUrl = '';

function channelClicked(url) {
  if (currentPreviewUrl !== url) {
    // First press: show in preview
    preview.src = url;
    preview.play();
    currentPreviewUrl = url;
  } else {
    // Second press: move to full player
    video.src = url;
    video.play();
    preview.src = '';
    currentMainUrl = url;
    currentPreviewUrl = '';
  }
}
