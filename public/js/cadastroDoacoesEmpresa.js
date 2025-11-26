// public/js/cadastroDoacoesEmpresa.js
import { showPopup } from './modal.js';
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
        showPopup('Erro: Dados do usuário não carregados. Recarregue a página.', { title: 'Erro', type: 'error', okText: 'OK' });
        return;
      }

      // CORREÇÃO: Mapear campos para os nomes exatos que a API espera
      const dadosEnvio = {
        // CORREÇÃO: Campo obrigatório - usar 'titulo' em vez de 'nome_alimento'
        titulo: dadosCompletos.nome_alimento, // ⬅️ CORREÇÃO AQUI
        
        // CORREÇÃO: Campo obrigatório - garantir que categoria_id seja enviado
        categoria_id: parseInt(dadosCompletos.categoria), // ⬅️ CORREÇÃO AQUI
        
        // Campo obrigatório
        quantidade: parseFloat(dadosCompletos.quantidade),
        
        // Campos opcionais mas importantes
        descricao: dadosCompletos.descricao || `Doação de ${dadosCompletos.nome_alimento} - CEP: ${dadosCompletos.cep_retirada}`,
        data_validade: dadosCompletos.data_validade || null,
        
        // Dados da empresa
        empresa_id: dadosUsuario.id,
        nome_empresa: dadosUsuario.nome_fantasia || dadosUsuario.razao_social || dadosUsuario.nome,
        email_contato: dadosCompletos.email || dadosUsuario.email,
        telefone_contato: dadosCompletos.telefone || '',
        
        // Outros campos
        unidade_medida_id: parseInt(dadosCompletos.unidade_medida),
        cep_retirada: dadosCompletos.cep_retirada
      };

      console.log('18. Dados para envio:', dadosEnvio);

      // VALIDAÇÃO: Verificar campos obrigatórios antes do envio
      const erros = validarDados(dadosEnvio);
      if (erros.length > 0) {
        showPopup('Erros no formulário:\n' + erros.join('\n'), { title: 'Erro', type: 'error', okText: 'OK' });
        return;
      }

      try {
        const response = await fetch('/api/cadastro/doacaoEmpresa', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify(dadosEnvio)
        });

        const resultado = await response.json();
        console.log('19. Resposta do servidor:', resultado);

        if (resultado.success) {
          showPopup('✅ Doação cadastrada com sucesso!', { title: 'Sucesso', type: 'success', okText: 'OK' });
          form.reset();
          // Opcional: redirecionar para outra página
          // window.location.href = '/minhasDoacoes.html';
        } else {
          showPopup('❌ Erro ao cadastrar a doação: ' + resultado.message, { title: 'Erro', type: 'error', okText: 'OK' });
        }
      } catch (error) {
        console.error('ERRO no envio:', error);
        showPopup('Ocorreu um erro de conexão. Tente novamente mais tarde.', { title: 'Erro', type: 'error', okText: 'OK' });
      }
    });
  }
}

// CORREÇÃO: Função de validação para garantir campos obrigatórios
function validarDados(dados) {
  const erros = [];
  
  if (!dados.titulo || dados.titulo.trim() === '') {
    erros.push('• Título é obrigatório');
  }
  
  if (!dados.categoria_id || isNaN(dados.categoria_id)) {
    erros.push('• Categoria é obrigatória');
  }
  
  if (!dados.quantidade || dados.quantidade <= 0 || isNaN(dados.quantidade)) {
    erros.push('• Quantidade deve ser um número maior que zero');
  }
  
  if (!dados.unidade_medida_id || isNaN(dados.unidade_medida_id)) {
    erros.push('• Unidade de medida é obrigatória');
  }
  
  if (!dados.empresa_id) {
    erros.push('• ID da empresa não encontrado');
  }
  
  return erros;
}

// Configurar data mínima para hoje
function configurarDataMinima() {
  const dataInput = document.getElementById('data_validade');
  if (dataInput) {
    const hoje = new Date().toISOString().split('T')[0];
    dataInput.min = hoje;
    console.log('Data mínima configurada:', hoje);
  }
}

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
  console.log('0. DOM Carregado - Iniciando...');
  carregarUsuario();
  configurarFormulario();
  configurarDataMinima();
});