// Highlight active menu item
const menuItems = document.querySelectorAll('.sidebar li');
menuItems.forEach(item => {
  item.addEventListener('click', () => {
    document.querySelector('.sidebar .active')?.classList.remove('active');
    item.classList.add('active');
  });
});
