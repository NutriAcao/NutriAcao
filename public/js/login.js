/* arquivo: public/js/login.js - script do frontend: funcionalidades relacionadas a login - funções/constantes: form, senha, senhaInput, usuario, resultado */

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("formulario-login");
  const usuarioInput = document.getElementById("user");
  const senhaInput = document.getElementById("password");
  const empresaRadio = document.getElementById("empresa");
  const ongRadio = document.getElementById("ong");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const usuario = usuarioInput.value.trim();
    const senha = senhaInput.value;

    if (!usuario || !senha || (!empresaRadio.checked && !ongRadio.checked)) {
      alert("Por favor, selecione uma das opções e preencha todos os campos!");
      return;
    }

    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: usuario,
          senha,
          tipo: empresaRadio.checked ? "empresa" : "ong",
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        alert(`Erro: ${resultado.message}`);
        return;
      }

      if (resultado.tipo === "ong" && ongRadio.checked) {
        alert("Login bem-sucedido!");
        window.location.href = "/visualizacaoDoacoes.html";
      } else if (resultado.tipo === "empresa" && empresaRadio.checked) {
        alert("Login bem-sucedido!");
        window.location.href = "/visualizacaoOngs.html";
      } else {
        alert("Erro: Usuário não encontrado no tipo selecionado !");
      }
    } catch (error) {
      console.error("Erro de rede:", error);
      alert("Falha na comunicação com o servidor");
    }
  });
});
