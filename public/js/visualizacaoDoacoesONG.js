/* arquivo: public/js/visualizacaoDoacoesONG.js - script do frontend: funcionalidades relacionadas a visualizacaodoacoesong - funções/constantes: txtnomeUsuario, res, nomeInstituicao, nomeUsuario, txtnomeInstituicao */

document.addEventListener("DOMContentLoaded", function () {
  async function carregarUsuario() {
    try {
      const res = await fetch("/api/usuarioToken");

      const dados = await res.json();

      let nomeInstituicao = dados.nomeInstituicao;
      let nomeUsuario = dados.nome;

      let txtnomeUsuario = document.getElementById("textNomeUsuario");
      let txtnomeInstituicao = document.getElementById("textNomeInstituicao");

      txtnomeUsuario.innerText = nomeUsuario;
      txtnomeInstituicao.innerText = nomeInstituicao;
    } catch (erro) {
      console.error("Erro ao buscar usuário:", erro);
    }
  }

  carregarUsuario();
});
