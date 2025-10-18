document.addEventListener('DOMContentLoaded', function() {

//Essa função carrega os dados do usuário logado
   async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuario');
    const dados = await res.json();
    console.log(dados); // Aqui sim: dados reais do usuário
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
  }
}

carregarUsuario();
});