/* arquivo: public/js/cadastroDoacoesOng.js - script do frontend: funcionalidades relacionadas a cadastrodoacoesong - funções/constantes: res, nomeInstituicao, nomeUsuario, quantidade, telefoneValido */

let dadosUsuario = {};
let nomeUsuario = document.getElementById("textNomeUsuario");
let nomeInstituicao = document.getElementById("textNomeInstituicao");

async function carregarUsuario() {
  try {
    const res = await fetch("/api/usuarioToken");
    const dados = await res.json();

    dadosUsuario = dados;

    nomeUsuario.innerHTML = dadosUsuario.nome;
    nomeInstituicao.innerHTML = dadosUsuario.nomeInstituicao;
  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
  }
}

let formDoacaoOng = document.getElementById("form-cadastro-ong");

if (formDoacaoOng) {
  formDoacaoOng.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(formDoacaoOng);
    const dadosCompletos = Object.fromEntries(formData.entries());

    const dadosOng = {
      nome: dadosUsuario.nomeInstituicao,
      email_Institucional: dadosUsuario.email,
      nome_alimento: dadosCompletos.nome_alimento,
      quantidade: dadosCompletos.quantidade,
      telefone: dadosCompletos.telefone,
      email: dadosCompletos.email,
      id_ong: dadosUsuario.id,
    };

    function validarDados(dados) {
      const erros = [];

      const quantidade = Number(dados.quantidade);
      if (isNaN(quantidade) || quantidade < 0 || quantidade > 500) {
        erros.push("A quantidade deve ser um número entre 0 e 500.");
      }

      const telefoneValido = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(
        dados.telefone,
      );
      if (!telefoneValido) {
        erros.push("O número de telefone informado é inválido.");
      }

      return erros;
    }

    let checagem = validarDados(dadosOng);

    if (checagem.length > 0) {
      alert("Erros encontrados:\n\n" + checagem.join("\n"));
      return;
    }

    try {
      const response = await fetch("/api/cadastro/doacaoOng", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosOng),
      });

      const resultado = await response.json();

      if (response.ok) {
        alert("✅ Doação cadastrada com sucesso!");
        formDoacaoOng.reset();
      } else {
        alert(
          "❌ Erro ao cadastrar a doação. Verifique os dados e tente novamente.",
        );
      }
    } catch (error) {
      console.error("Erro de rede ao comunicar com o servidor:", error);
      alert("Ocorreu um erro de conexão. Tente novamente mais tarde.");
    }
  });
}

window.addEventListener("DOMContentLoaded", carregarUsuario);
