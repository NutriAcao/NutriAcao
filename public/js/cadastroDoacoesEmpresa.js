let dadosUsuario = {};
let nomeUsuario = document.getElementById('textNomeUsuario')
let nomeInstituicao = document.getElementById('textNomeInstituicao')

async function carregarUsuario() {
  try {
    const res = await fetch('/api/usuarioToken');
    const dados = await res.json();

    dadosUsuario = dados

    nomeUsuario.innerHTML = dadosUsuario.nome
    nomeInstituicao.innerHTML = dadosUsuario.nomeInstituicao
    
  
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
  }
}


let formDoacaoEmpresa = document.getElementById("form-cadastro-empresa");

if (formDoacaoEmpresa) {
  formDoacaoEmpresa.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(formDoacaoEmpresa);
    const dadosCompletos = Object.fromEntries(formData.entries());

    const dadosEmpresa = {
      // Dados da Empresa
      nome: dadosUsuario.nomeInstituicao,
      email_Institucional: dadosUsuario.email,
      nome_alimento: dadosCompletos.nome_alimento,
      quantidade: dadosCompletos.quantidade,
      data_validade: dadosCompletos.data_validade,
      cep_retirada: dadosCompletos.cep_retirada,
      telefone: dadosCompletos.telefone,
      email: dadosCompletos.email,
      id_empresa: dadosUsuario.id
    };

    function validarDados(dados) {
  const erros = [];

  // Validação da quantidade
  const quantidade = Number(dados.quantidade);
  if (isNaN(quantidade) || quantidade < 1 || quantidade > 500) {
    erros.push("A quantidade deve ser um número entre 1 e 500.");
  }

  // Validação do CEP (formato brasileiro: 00000-000 ou 00000000)
  const cepValido = /^\d{5}-?\d{3}$/.test(dados.cep_retirada);
  if (!cepValido) {
    erros.push("O CEP informado é inválido.");
  }

  // Validação do telefone (formato brasileiro: (XX) XXXXX-XXXX ou similar)
  const telefoneValido = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(dados.telefone);
  if (!telefoneValido) {
    erros.push("O número de telefone informado é inválido.");
  }

  // Validação da data (não pode ser passada)
  const hoje = new Date();
  const dataValidade = new Date(dados.data_validade);
  if (isNaN(dataValidade.getTime()) || dataValidade < hoje) {
    erros.push("A data de validade não pode ser uma data passada.");
  }

  return erros;
}

let checagem = validarDados(dadosEmpresa);

if (checagem.length > 0) {
  alert("Erros encontrados:\n\n" + checagem.join("\n"));
  return;
}


    try {
      const response = await fetch('/api/cadastro/doacaoEmpresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosEmpresa)
      });

      const resultado = await response.json();

      if (response.ok) {
        alert('✅ Doação cadastrada com sucesso!');
        formDoacaoEmpresa.reset();
        // Se houver modalEmpresa, você pode fechá-lo aqui:
        // modalEmpresa.style.display = 'none';
      } else {
        alert('❌ Erro ao cadastrar a doação. Verifique os dados e tente novamente.');
      }

    } catch (error) {
      console.error('Erro de rede ao comunicar com o servidor:', error);
      alert('Ocorreu um erro de conexão. Tente novamente mais tarde.');
    }
  });
}

window.addEventListener('DOMContentLoaded', carregarUsuario);

