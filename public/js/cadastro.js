/* arquivo: public/js/cadastro.js - script do frontend: funcionalidades relacionadas a cadastro - funções/constantes: dadosONG, senha, menuButton, modalOng, dadosEmpresa */

export function initMenu() {
  const menuButton = document.getElementById("menu-button");
  const navMenu = document.getElementById("menu");
  const navLinks = document.querySelectorAll(
    "#nav-list .nav-link, #nav-list .btn-login, #nav-list .btn-cadastro",
  );

  if (menuButton && navMenu) {
    menuButton.addEventListener("click", () => {
      navMenu.classList.toggle("active");
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
      });
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const btnCadastrarOng = document.getElementById("btn-cadastrar-ong");
  const modalOng = document.getElementById("modal-ong");
  const formOng = document.getElementById("form-cadastro-ong");

  const btnCadastrarEmpresa = document.getElementById("btn-cadastrar-empresa");
  const modalEmpresa = document.getElementById("modal-empresa");
  const formEmpresa = document.getElementById("form-cadastro-empresa");

  const closeButtons = document.querySelectorAll(".close-button");

  if (btnCadastrarOng)
    btnCadastrarOng.addEventListener("click", () => {
      modalOng.style.display = "block";
    });
  if (btnCadastrarEmpresa)
    btnCadastrarEmpresa.addEventListener("click", () => {
      modalEmpresa.style.display = "block";
    });

  closeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      if (modalOng) modalOng.style.display = "none";
      if (modalEmpresa) modalEmpresa.style.display = "none";
      if (formOng) formOng.reset();
      if (formEmpresa) formEmpresa.reset();
    });
  });

  window.addEventListener("click", (event) => {
    if (event.target === modalOng) {
      modalOng.style.display = "none";
      formOng.reset();
    }
    if (event.target === modalEmpresa) {
      modalEmpresa.style.display = "none";
      formEmpresa.reset();
    }
  });

  if (formOng) {
    formOng.addEventListener("submit", async (event) => {
      event.preventDefault();

      const senha = document.getElementById("senha").value;
      const confirmaSenha = document.getElementById("confirma-senha").value;

      if (senha !== confirmaSenha) {
        alert("As senhas não coincidem!");
        return;
      }

      const formData = new FormData(formOng);
      const dadosCompletos = Object.fromEntries(formData.entries());

      const dadosONG = {
        nome: dadosCompletos.nome,
        cnpj: dadosCompletos.cnpj,
        area_atuacao: dadosCompletos.area_atuacao,
        cep: dadosCompletos.cep,
        endereco: dadosCompletos.endereco,
        telefone: dadosCompletos.telefone,
        email: dadosCompletos.email,
        nome_responsavel_ong: dadosCompletos.nome_responsavel_ong,
        cpf_responsavel_ong: dadosCompletos.cpf_responsavel_ong,
        cargo_responsavel_ong: dadosCompletos.cargo_responsavel_ong,
        email_responsavel_ong: dadosCompletos.email_responsavel_ong,
        telefone_responsavel_ong: dadosCompletos.telefone_responsavel_ong,

        login: dadosCompletos.login,
        senha: dadosCompletos.senha,
      };

      try {
        const response = await fetch("/api/cadastro/ong", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosONG),
        });

        const resultado = await response.json();

        if (response.ok) {
          alert(` SUCESSO!`);
          modalOng.style.display = "none";
          formOng.reset();
        } else {
          alert("FALHA: Erro de servidor desconhecido.");
        }
      } catch (error) {
        console.error("Erro de rede ao comunicar com o servidor:", error);
        alert("Ocorreu um erro de conexão. Tente novamente mais tarde.");
      }
    });
  }

  if (formEmpresa) {
    formEmpresa.addEventListener("submit", async (event) => {
      event.preventDefault();

      const senha = document.getElementById("senha-empresa").value;
      const confirmaSenha = document.getElementById(
        "confirma-senha-empresa",
      ).value;

      if (senha !== confirmaSenha) {
        alert("As senhas não coincidem!");
        return;
      }

      const formData = new FormData(formEmpresa);
      const dadosCompletos = Object.fromEntries(formData.entries());

      const dadosEmpresa = {
        nome: dadosCompletos.nome,
        cnpj: dadosCompletos.cnpj,
        area_atuacao: dadosCompletos.area_atuacao,
        cep: dadosCompletos.cep,
        endereco: dadosCompletos.endereco,
        telefone: dadosCompletos.telefone,
        email: dadosCompletos.email,
        senha: dadosCompletos.senha,
        nome_responsavel_empresa: dadosCompletos.nome_responsavel_empresa,
        cpf_responsavel_empresa: dadosCompletos.cpf_responsavel_empresa,
        cargo_responsavel_empresa: dadosCompletos.cargo_responsavel_empresa,
        email_responsavel_empresa: dadosCompletos.email_responsavel_empresa,
        telefone_responsavel_empresa:
          dadosCompletos.telefone_responsavel_empresa,
      };

      try {
        const response = await fetch("/api/cadastro/empresa", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(dadosEmpresa),
        });

        const resultado = await response.json();

        if (response.ok) {
          alert(`SUCESSO! Empresa cadastrada com sucesso!`);
          document.getElementById("modal-empresa").style.display = "none";
          formEmpresa.reset();
        } else {
          alert(`FALHA'}`);
        }
      } catch (error) {
        console.error("Erro de rede ou falha ao processar a resposta:", error);
        alert("Ocorreu um erro de conexão. Tente novamente mais tarde.");
      }
    });
  }
});

initMenu();
