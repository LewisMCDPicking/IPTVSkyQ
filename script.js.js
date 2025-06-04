const video = document.getElementById('videoPlayer');

function playChannel(url) {
  video.src = url;
  video.play();
}
