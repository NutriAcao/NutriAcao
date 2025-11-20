// public/js/cadastroDoacoesEmpresa.js
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
    
    // Carregar categorias e unidades de medida
    await carregarSelects();
  
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
  }
}

async function carregarSelects() {
  try {
    // Carregar categorias
    const catResponse = await fetch('/api/categorias');
    const catData = await catResponse.json();
    
    if (catData.success) {
      const categoriaSelect = document.getElementById('categoria');
      catData.data.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        categoriaSelect.appendChild(option);
      });
    }

    // Carregar unidades de medida
    const unidResponse = await fetch('/api/unidades-medida');
    const unidData = await unidResponse.json();
    
    if (unidData.success) {
      const unidadeSelect = document.getElementById('unidade_medida');
      unidData.data.forEach(unidade => {
        const option = document.createElement('option');
        option.value = unidade.id;
        option.textContent = `${unidade.nome} (${unidade.abreviacao})`;
        unidadeSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar selects:', error);
  }
}

let formDoacaoEmpresa = document.getElementById("form-cadastro-empresa");

if (formDoacaoEmpresa) {
  formDoacaoEmpresa.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(formDoacaoEmpresa);
    const dadosCompletos = Object.fromEntries(formData.entries());

    const dadosEmpresa = {
      // Dados compatíveis com seu controller existente
      nome: dadosUsuario.nomeInstituicao,
      email_Institucional: dadosUsuario.email,
      nome_alimento: dadosCompletos.nome_alimento,
      quantidade: dadosCompletos.quantidade,
      data_validade: dadosCompletos.data_validade,
      cep_retirada: dadosCompletos.cep_retirada,
      telefone: dadosCompletos.telefone,
      email: dadosCompletos.email,
      id_empresa: dadosUsuario.id,
      // NOVOS CAMPOS para o modelo atualizado
      categoria_id: dadosCompletos.categoria || 1,
      unidade_medida_id: dadosCompletos.unidade_medida || 1,
      descricao: dadosCompletos.descricao || `Doação de ${dadosCompletos.nome_alimento} - CEP: ${dadosCompletos.cep_retirada}`
    };

    function validarDados(dados) {
      const erros = [];

      // validação da quantidade
      const quantidade = Number(dados.quantidade);
      if (isNaN(quantidade) || quantidade < 1 || quantidade > 5000) {
        erros.push("A quantidade deve ser um número entre 1 e 5000.");
      }

      // validação do CEP
      const cepValido = /^\d{5}-?\d{3}$/.test(dados.cep_retirada);
      if (!cepValido) {
        erros.push("O CEP informado é inválido.");
      }

      // validação do telefone
      const telefoneValido = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(dados.telefone);
      if (!telefoneValido) {
        erros.push("O número de telefone informado é inválido.");
      }

      // validação da data
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
      // Mantém a mesma rota que você já usa
      const response = await fetch('/api/cadastro/doacaoEmpresa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosEmpresa)
      });

      const resultado = await response.json();

      if (resultado.success) {
        alert('✅ Doação cadastrada com sucesso!');
        formDoacaoEmpresa.reset();
      } else {
        alert('❌ Erro ao cadastrar a doação: ' + resultado.message);
      }

    } catch (error) {
      console.error('Erro de rede ao comunicar com o servidor:', error);
      alert('Ocorreu um erro de conexão. Tente novamente mais tarde.');
    }
  });
}
async function carregarSelects() {
  try {
    // Carregar categorias
    const catResponse = await fetch('/api/categorias');
    const catData = await catResponse.json();
    
    if (catData.success) {
      const categoriaSelect = document.getElementById('categoria');
      categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>';
      
      catData.data.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.nome;
        categoriaSelect.appendChild(option);
      });
    }

    // Carregar unidades de medida
    const unidResponse = await fetch('/api/unidades-medida');
    const unidData = await unidResponse.json();
    
    if (unidData.success) {
      const unidadeSelect = document.getElementById('unidade_medida');
      unidadeSelect.innerHTML = '<option value="">Selecione a unidade</option>';
      
      unidData.data.forEach(unidade => {
        const option = document.createElement('option');
        option.value = unidade.id;
        option.textContent = `${unidade.nome} (${unidade.abreviacao})`;
        unidadeSelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error('Erro ao carregar selects:', error);
  }
}

window.addEventListener('DOMContentLoaded', carregarUsuario);