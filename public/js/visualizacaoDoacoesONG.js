document.addEventListener('DOMContentLoaded', function() {

//Essa função carrega os dados do usuário logado
   async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuarioToken');

    // A variável dados contém as seguintes informações do usuário logado
    // id
    // email
    // tipo (ong ou empresa)
    // nome
    // nomeInstituicao 
    const dados = await res.json();
    
    //Para acessar os dados, basta usar dados.informação desejada, por exemplo:
    let nomeInstituicao = dados.nomeInstituicao
    let nomeUsuario = dados.nome
    
    let txtnomeUsuario = document.getElementById('textNomeUsuario')
    let txtnomeInstituicao = document.getElementById('textNomeInstituicao')
    
    txtnomeUsuario.innerText = nomeUsuario
    txtnomeInstituicao.innerText = nomeInstituicao

  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
  }
}

carregarUsuario();

});

