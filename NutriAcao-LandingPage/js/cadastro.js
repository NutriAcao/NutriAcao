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

const ong = document.getElementById("input_ong");
const empresa = document.getElementById("input_empresa");
const pessoa_fisica = document.getElementById("input_pessoa-fisica");
const erro = document.getElementById("mensagem-erro")
    
    document.querySelector('form').addEventListener('submit', function (e) {
     
     

     if (!ong.checked && !empresa.checked && !pessoa_fisica.checked) {
      e.preventDefault();
      erro.style.display = "flex" 
      
     }
    });

    document.querySelector('form').addEventListener('click', function () {
      if (ong.checked || empresa.checked || pessoa_fisica.checked) {
      
      erro.style.display = "none"
      
     }
    })
    






initMenu()