export function initMenu() {
  const menuButton = document.getElementById('menu-button');
  const navMenu = document.getElementById('menu');
  const navLinks = document.querySelectorAll('#nav-list .nav-link, #nav-list .btn-login, #nav-list .btn-cadastro');

  menuButton.addEventListener('click', () => {
    navMenu.classList.toggle('active');
  
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
    });
  });
}

initMenu()