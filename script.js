function playStream(url) {
  const video = document.getElementById('previewVideo');
  if (Hls.isSupported()) {
    if (window.hls) {
      window.hls.destroy();
    }
    window.hls = new Hls();
    window.hls.loadSource(url);
    window.hls.attachMedia(video);
    video.play();
  } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
    video.src = url;
    video.play();
  } else {
    console.log('HLS not supported');
  }
}
