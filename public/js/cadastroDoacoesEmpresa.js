// public/js/cadastroDoacoesEmpresa.js
let dadosUsuario = {};

async function carregarUsuario() {
  try {
    console.log('1. Iniciando carregarUsuario...');
    
    // PRIMEIRO: Buscar dados básicos do token
    const tokenRes = await fetch('/api/usuarioToken');
    console.log('2. Resposta token status:', tokenRes.status);
    
    if (!tokenRes.ok) throw new Error(`HTTP ${tokenRes.status}`);
    
    const tokenData = await tokenRes.json();
    console.log('3. Dados do token:', tokenData);

    // SEGUNDO: Buscar dados completos do usuário
    console.log('4. Buscando dados completos...');
    const userRes = await fetch('/api/usuario');
    console.log('5. Resposta usuario status:', userRes.status);
    
    if (!userRes.ok) throw new Error(`HTTP ${userRes.status}`);
    
    const userData = await userRes.json();
    console.log('6. Dados completos:', userData);

    // Combina os dados
    dadosUsuario = {
      ...tokenData,
      ...userData.data // Dados completos da API /api/usuario
    };
    
    console.log('7. Dados combinados:', dadosUsuario);

    // Atualiza a interface
    const nomeUsuario = document.getElementById('textNomeUsuario');
    const nomeInstituicao = document.getElementById('textNomeInstituicao');
    
    if (nomeUsuario) {
      nomeUsuario.textContent = dadosUsuario.nome || dadosUsuario.nome_fantasia || 'Usuário';
      console.log('8. Nome atualizado:', dadosUsuario.nome || dadosUsuario.nome_fantasia);
    }
    
    if (nomeInstituicao) {
      nomeInstituicao.textContent = dadosUsuario.nome_fantasia || dadosUsuario.razao_social || 'Instituição';
      console.log('9. Instituição atualizada:', dadosUsuario.nome_fantasia || dadosUsuario.razao_social);
    }
    
    console.log('10. Chamando carregarSelects...');
    await carregarSelects();
    console.log('11. carregarSelects concluído');
    
  } catch (erro) {
    console.error('ERRO em carregarUsuario:', erro);
    // Fallback
    const nomeUsuario = document.getElementById('textNomeUsuario');
    const nomeInstituicao = document.getElementById('textNomeInstituicao');
    if (nomeUsuario) nomeUsuario.textContent = 'Usuário';
    if (nomeInstituicao) nomeInstituicao.textContent = 'Instituição';
  }
}

// O RESTANTE DO CÓDIGO PERMANECE IGUAL...
async function carregarSelects() {
  try {
    console.log('12. Carregando selects...');
    
    // Categorias
    const catResponse = await fetch('/api/categorias');
    const catData = await catResponse.json();
    
    if (catData.success) {
      const select = document.getElementById('categoria');
      if (select) {
        select.innerHTML = '<option value="">Selecione a categoria</option>';
        catData.data.forEach(cat => {
          const option = document.createElement('option');
          option.value = cat.id;
          option.textContent = cat.nome;
          select.appendChild(option);
        });
        console.log('13. Categorias carregadas:', catData.data.length);
      }
    }

    // Unidades de medida
    const unidResponse = await fetch('/api/unidades-medida');
    const unidData = await unidResponse.json();
    
    if (unidData.success) {
      const select = document.getElementById('unidade_medida');
      if (select) {
        select.innerHTML = '<option value="">Selecione a unidade</option>';
        unidData.data.forEach(unidade => {
          const option = document.createElement('option');
          option.value = unidade.id;
          option.textContent = `${unidade.nome} (${unidade.abreviacao})`;
          select.appendChild(option);
        });
        console.log('14. Unidades carregadas:', unidData.data.length);
      }
    }
    
  } catch (error) {
    console.error('ERRO em carregarSelects:', error);
  }
}

function configurarFormulario() {
  console.log('15. Configurando formulário...');
  
  const form = document.getElementById("form-cadastro-empresa");
  
  if (form) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      console.log('16. Formulário submetido!');

      const formData = new FormData(form);
      const dadosCompletos = Object.fromEntries(formData.entries());
      console.log('17. Dados do formulário:', dadosCompletos);

      // Verifica se dadosUsuario está carregado
      if (!dadosUsuario.id) {
        alert('❌ Erro: Dados do usuário não carregados. Recarregue a página.');
        return;
      }

      const dadosEmpresa = {
        nome: dadosUsuario.nome_fantasia || dadosUsuario.razao_social || dadosUsuario.nome,
        email_Institucional: dadosUsuario.email,
        nome_alimento: dadosCompletos.nome_alimento,
        quantidade: parseFloat(dadosCompletos.quantidade),
        data_validade: dadosCompletos.data_validade,
        cep_retirada: dadosCompletos.cep_retirada,
        telefone: dadosCompletos.telefone,
        email: dadosCompletos.email,
        id_empresa: dadosUsuario.id,
        categoria_id: parseInt(dadosCompletos.categoria),
        unidade_medida_id: parseInt(dadosCompletos.unidade_medida),
        descricao: dadosCompletos.descricao || `Doação de ${dadosCompletos.nome_alimento} - CEP: ${dadosCompletos.cep_retirada}`
      };

      console.log('18. Dados para envio:', dadosEmpresa);

      // ... resto do código do formulário permanece igual
      try {
        const response = await fetch('/api/cadastro/doacaoEmpresa', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(dadosEmpresa)
        });

        const resultado = await response.json();
        console.log('19. Resposta do servidor:', resultado);

        if (resultado.success) {
          alert('✅ Doação cadastrada com sucesso!');
          form.reset();
        } else {
          alert('❌ Erro ao cadastrar a doação: ' + resultado.message);
        }
      } catch (error) {
        console.error('ERRO no envio:', error);
        alert('Ocorreu um erro de conexão. Tente novamente mais tarde.');
      }
    });
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  console.log('0. DOM Carregado - Iniciando...');
  carregarUsuario();
  configurarFormulario();
});