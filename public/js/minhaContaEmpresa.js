document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("/api/usuario", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });

    const resposta = await res.json();
    console.log("Resposta completa:", resposta);

    if (!resposta.success) {
      alert("Erro: " + resposta.message);
      return;
    }

    const dados = resposta.data;

    // Preenche os dados na tela
    document.getElementById("email").textContent = dados.email;
    document.getElementById("nome").textContent = dados.nome_responsavel_empresa || "Não informado";
    document.getElementById("cpf").textContent = dados.cpf_responsavel_empresa || "Não informado";
    document.getElementById("cargo").textContent = dados.cargo_responsavel_empresa || "Não informado";
    document.getElementById("emailResp").textContent = dados.email_responsavel_empresa || "Não informado";
    document.getElementById("telefone").textContent = dados.telefone_responsavel_empresa || "Não informado";

  } catch (erro) {
    console.error("Erro ao buscar usuário:", erro);
  }
});