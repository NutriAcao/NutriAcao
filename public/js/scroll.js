export function initScrollHeader() {
  const header = document.getElementById('header');

  if (!header) return; // Não fazer nada se o header não existir

  window.addEventListener('scroll', () => {
    if (window.scrollY > 0) {
      header.classList.add('rolagem');
    } else {
      header.classList.remove('rolagem');
    }
  });
}
