/* arquivo: public/js/scroll.js - script do frontend: funcionalidades relacionadas a scroll - funções/constantes: header */

export function initScrollHeader() {
  const header = document.getElementById("header");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
      header.classList.add("rolagem");
    } else {
      header.classList.remove("rolagem");
    }
  });
}
