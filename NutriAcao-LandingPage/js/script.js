document.addEventListener("DOMContentLoaded", function () {
  const burger = document.getElementById("burger");
  const nav = document.querySelector("nav");
  let isOpen = false;

  burger.addEventListener("click", () => {
    if (isOpen) {
      nav.style.display = "none";
      isOpen = false;
    } else {
      nav.style.display = "flex";
      isOpen = true;
    }
  });

  //fechar se clicar fora do menu
  document.addEventListener("click", function (event) {
    if (isOpen && !nav.contains(event.target) && event.target !== burger) {
      nav.style.display = "none";
      isOpen = false;
    }
  });
});

  window.addEventListener("scroll", function(){
    let header = document.querySelector('#header');
    header.classList.toggle('rolagem', window.scrollY > 200);
  });
  document.querySelectorAll('.accordion-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    const item = this.parentElement;
    item.classList.toggle('active');
  });
});