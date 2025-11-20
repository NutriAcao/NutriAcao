// public/js/cadastroDoacoesOng.js
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
    
    // Carregar categorias para ONG também
    await carregarCategorias();
  
  } catch (erro) {
    console.error('Erro ao buscar usuário:', erro);
  }
}

async function carregarCategorias() {
  try {
    const catResponse = await fetch('/api/categorias');
    const catData = await catResponse.json();
    
    if (catData.success) {
      const categoriaSelect = document.getElementById('categoria');
      if (categoriaSelect) {
        catData.data.forEach(categoria => {
          const option = document.createElement('option');
          option.value = categoria.id;
          option.textContent = categoria.nome;
          categoriaSelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

let formDoacaoOng = document.getElementById("form-cadastro-ong");

if (formDoacaoOng) {
  formDoacaoOng.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(formDoacaoOng);
    const dadosCompletos = Object.fromEntries(formData.entries());

    const dadosSolicitacao = {
      // Dados para o novo modelo
      titulo: dadosCompletos.nome_alimento,
      descricao: dadosCompletos.descricao || `Solicitação de ${dadosCompletos.nome_alimento}`,
      categoria_id: dadosCompletos.categoria || 1, // Categoria padrão
      quantidade_desejada: dadosCompletos.quantidade,
      telefone_contato: dadosCompletos.telefone,
      email_contato: dadosCompletos.email,
      ong_id: dadosUsuario.id
    };

    function validarDados(dados) {
      const erros = [];

      //validação da quantidade
      const quantidade = Number(dados.quantidade_desejada);
      if (isNaN(quantidade) || quantidade < 0 || quantidade > 500) {
        erros.push("A quantidade deve ser um número entre 0 e 500.");
      }

      //validação do telefone
      const telefoneValido = /^\(?\d{2}\)?[\s-]?\d{4,5}-?\d{4}$/.test(dados.telefone_contato);
      if (!telefoneValido) {
        erros.push("O número de telefone informado é inválido.");
      }

      return erros;
    }

    let checagem = validarDados(dadosSolicitacao);

    if (checagem.length > 0) {
      alert("Erros encontrados:\n\n" + checagem.join("\n"));
      return;
    }

    try {
      const response = await fetch('/api/solicitacoes-ong', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dadosSolicitacao)
      });

      const resultado = await response.json();

      if (resultado.success) {
        alert('✅ Solicitação cadastrada com sucesso!');
        formDoacaoOng.reset();
      } else {
        alert('❌ Erro ao cadastrar a solicitação: ' + resultado.message);
      }

    } catch (error) {
      console.error('Erro de rede ao comunicar com o servidor:', error);
      alert('Ocorreu um erro de conexão. Tente novamente mais tarde.');
    }
  });
}
async function carregarCategorias() {
  try {
    const catResponse = await fetch('/api/categorias');
    const catData = await catResponse.json();
    
    if (catData.success) {
      const categoriaSelect = document.getElementById('categoria');
      if (categoriaSelect) {
        categoriaSelect.innerHTML = '<option value="">Selecione a categoria</option>';
        
        catData.data.forEach(categoria => {
          const option = document.createElement('option');
          option.value = categoria.id;
          option.textContent = categoria.nome;
          categoriaSelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error('Erro ao carregar categorias:', error);
  }
}

window.addEventListener('DOMContentLoaded', carregarUsuario);