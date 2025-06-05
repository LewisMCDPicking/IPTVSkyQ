document.addEventListener("DOMContentLoaded", () => {
  const timeEl = document.getElementById("time");
  const videoPlayer = document.getElementById("videoPlayer");
  const channels = document.querySelectorAll(".channel");
  const navItems = document.querySelectorAll(".nav-item");
  const sections = document.querySelectorAll(".content-section");

  function updateTime() {
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  updateTime();
  setInterval(updateTime, 60000);

  channels.forEach(channel => {
    channel.addEventListener("click", () => {
      const url = channel.getAttribute("data-url");
      videoPlayer.src = url;
      videoPlayer.play().catch(err => console.warn("Stream failed to load", err));
    });
  });

  navItems.forEach(item => {
    item.addEventListener("click", () => {
      navItems.forEach(i => i.classList.remove("active"));
      item.classList.add("active");

      const target = item.getAttribute("data-target");
      sections.forEach(section => {
        section.classList.add("hidden");
        if (section.id === target) section.classList.remove("hidden");
      });
    });
  });
});
