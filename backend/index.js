import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cadastroRoutes from './src/routes/cadastroRoutes.js';
import loginRoutes from './src/routes/loginRoutes.js';
import './src/config/dbPool.js';
import './src/config/supabaseClient.js';
import dbRoutes from './src/routes/dbRoutes.js';
import testeBDRoute from './src/routes/testeBDRoute.js';
import usuarioRoutes from "./src/routes/usuarioRoutes.js";
import sgMail from '@sendgrid/mail';
import doacoesConcluidasRoutes from './src/routes/doacoesConcluidasRoutes.js';
import rateLimit from 'express-rate-limit';
import historicoRoutes from './src/routes/historicoRoutes.js';
import { supabase } from './src/config/supabaseClient.js'
import crypto from 'crypto';
import reservaRoutes from './src/routes/reservaRoutes.js';
import rotasAcoes from './src/routes/rotasAcoes.js';
import empresaRoutes from './src/routes/empresaRoutes.js';
import ongRoutes from './src/routes/ongRoutes.js';
import minhaContaOngRoutes from "./src/routes/minhaContaOngRoutes.js";
import solicitacoesRoutes from './src/routes/solicitacoesRoutes.js';
import doacoesAtivasRoutes from './src/routes/doacoesAtivasRoutes.js';
import relatorioRoutes from './src/routes/relatorioRoutes.js';
// CORREÇÃO: Importar os controllers corretamente
import { cadastrarExcedente, listarCategorias, listarUnidadesMedida } from './src/controllers/excedentesController.js';
import { cadastrarDoacaoOng } from './src/controllers/doacaoOngController.js';
import { cadastrarDoacaoEmpresa } from './src/controllers/doacaoEmpresaController.js';
import depoimentosRoutes from './src/routes/depoimentosRoutes.js';

// configuração de variáveis
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 5501;
const DATABASE_URL = process.env.DATABASE_URL;
sgMail.setApiKey(process.env.EMAIL_RENDER_SENDGRID_KEY);

// checagem de Erro
if (!DATABASE_URL) {
  console.error('ERRO FATAL: DATABASE_URL não está configurada...');
  process.exit(1);
}

const contactLimiter = rateLimit({
  windowMs: 30 * 60 * 1000,
  max: 5,
  message: {
    message: "Muitas requisições desta origem. Tente novamente após 30 minutos.",
    status: 429
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// inicializa o Express
const app = express();
const publicPath = path.join(__dirname, '..', 'public');
app.use(express.urlencoded({ extended: true })); // Middleware para ler forms
app.use(express.json()); // Middleware para ler JSON
import { verificarToken } from './src/routes/authMiddleware.js';
import { verificarEmpresa, verificarOng } from './src/routes/tipoAuthMiddleware.js'
//Middleware para ler cookies
import cookieParser from 'cookie-parser';
app.use(cookieParser());

app.use(express.static(publicPath));

// usar Rotas
app.use('/', testeBDRoute)
app.use('/', dbRoutes);
app.use('/api/cadastro', cadastroRoutes)
app.use('/api/login', loginRoutes)
app.use("/api", usuarioRoutes);
app.use('/api', historicoRoutes);
app.use('/api/empresas', empresaRoutes);
app.use('/api/ongs', ongRoutes);
app.use('/api/doacoes-concluidas', doacoesConcluidasRoutes);
app.use('/api/minha-conta-ong', minhaContaOngRoutes);
app.use('/api/auth', loginRoutes);
app.use('/api', solicitacoesRoutes);
app.use('/api', rotasAcoes);
app.use('/api', reservaRoutes);
app.use('/api/doacoes-ativas', doacoesAtivasRoutes);
app.use('/api/relatorios', relatorioRoutes);
app.use('/api/depoimentos', depoimentosRoutes); 

// rota padrão para servir a homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "pages", "homepage.html"));
});

// Rota padrão para servir a tela de login
app.get('/loginpage', (req, res) => {
  res.sendFile(path.join(publicPath, 'pages', 'homepage', 'loginpage.html'))
})
app.get('/api/usuarioToken', verificarToken, (req, res) => {
  res.json(req.usuario);
});

// ROTAS PROTEGIDAS PARA EMPRESA
app.get('/visualizacaoOngs.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'visualizacaoOngs.html'));
})

app.get('/cadastrarExcedentes.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'cadastrarExcedentes.html'));
})

app.get('/HistoricoDoacoesEmpresa.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'HistoricoDoacoesEmpresa.html'));
})

app.get('/minhaContaEmpresa.html', verificarToken, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'minhaContaEmpresa.html'));
})

app.get('/suporteEmpresa.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'suporteEmpresa.html'));
})

app.get('/minhasDoacoesAtivasEmpresa.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'minhasDoacoesAtivasEmpresa.html'));
})

app.get('/relatorioImpacto.html', verificarToken, verificarEmpresa, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'empresa', 'relatorioImpacto.html'));
});

//ROTAS PROTEGIDAS PARA ONG
app.get('/visualizacaoDoacoes.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'visualizacaoDoacoes.html'));
})

app.get('/minhasSolicitacoes.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'minhasSolicitacoes.html'));
})

app.get('/HistoricoDoacoesONG.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'HistoricoDoacoesONG.html'));
})

app.get('/cadastrarDoacoesONG.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'cadastrarDoacoesONG.html'));
})

app.get('/relatorioOng.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'relatorioOng.html'));
})

app.get('/suporteONG.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'suporteONG.html'));
})

app.get('/minhaContaOng.html', verificarToken, verificarOng, (req, res) => {
  res.sendFile(path.join(__dirname, '../', 'private', 'ong', 'minhaContaOng.html'));
})

app.get('/resetarSenha.html', (req, res) => {
  res.sendFile(path.join(publicPath, 'pages', 'homepage', 'resetarSenha.html'));
});

app.use('/doacoesConcluidasEmpresa', doacoesConcluidasRoutes);
app.use('/doacoesConcluidasONG', doacoesConcluidasRoutes);

// CORREÇÃO: Rotas dos controllers com importações corretas
app.post('/api/excedentes', verificarToken, verificarEmpresa, cadastrarExcedente);
app.get('/api/categorias', listarCategorias);
app.get('/api/unidades-medida', listarUnidadesMedida);
app.post('/api/solicitacoes-ong', verificarToken, verificarOng, cadastrarDoacaoOng);
app.post('/api/cadastro/doacaoEmpresa', verificarToken, verificarEmpresa, cadastrarDoacaoEmpresa);

// =====================================================
// ROTAS DIRETAS PARA RESERVA E DOAÇÕES DISPONÍVEIS
// =====================================================

// ROTA DE RESERVA CORRIGIDA
// ROTA DE RESERVA CORRIGIDA - COM MAIS LOGS
// ROTA DE RESERVA NOVA - NOME DIFERENTE
app.post('/api/reservar-doacao-ong', verificarToken, verificarOng, async (req, res) => {
  try {
    console.log('🎯🎯🎯 ROTA RESERVA NOVA CHAMADA - doacao_id:', req.body.doacao_id);

    const { doacao_id } = req.body;
    const usuario_id = req.usuario.id;

    if (!doacao_id) {
      return res.status(400).json({
        success: false,
        message: "ID da doação é obrigatório."
      });
    }

    // Buscar ID da ONG
    const { data: ongData, error: ongError } = await supabase
      .from('ongs')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (ongError || !ongData) {
      return res.status(400).json({
        success: false,
        message: 'ONG não encontrada'
      });
    }

    const id_ong = ongData.id;

    // 1. Buscar doação disponível
    const { data: doacaoData, error: doacaoError } = await supabase
      .from('doacoes_disponiveis')
      .select('*')
      .eq('id', doacao_id)
      .eq('status', 'disponível')
      .single();

    if (doacaoError || !doacaoData) {
      return res.status(409).json({
        success: false,
        message: "Doação não encontrada ou já foi reservada"
      });
    }

    // 2. Inserir na tabela de reservadas
    const { data: reservaData, error: reservaError } = await supabase
      .from('doacoes_reservadas')
      .insert({
        empresa_id: doacaoData.empresa_id,
        ong_id: id_ong,
        excedente_id: doacaoData.excedente_id,
        titulo: doacaoData.titulo,
        descricao: doacaoData.descricao,
        quantidade: doacaoData.quantidade,
        data_validade: doacaoData.data_validade,
        status: 'reservado',
        data_publicacao: doacaoData.data_publicacao
      })
      .select();

    if (reservaError) {
      console.error('❌ Erro ao criar reserva:', reservaError);
      return res.status(500).json({
        success: false,
        message: "Erro ao reservar a doação",
        error: reservaError.message
      });
    }

    // 3. Remover da tabela de disponíveis
    await supabase
      .from('doacoes_disponiveis')
      .delete()
      .eq('id', doacao_id);

    console.log(`✅✅✅ Doação ${doacao_id} reservada com sucesso via NOVA ROTA!`);
    res.json({
      success: true,
      message: 'Doação reservada com sucesso!',
      data: reservaData[0]
    });

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});
// ROTA PARA DOAÇÕES DISPONÍVEIS
app.get('/api/doacoes-disponiveis-ong', verificarToken, verificarOng, async (req, res) => {
  try {
    console.log("🔄 Buscando doações disponíveis para ONG...");

    const { data: doacoes, error } = await supabase
      .from('doacoes_disponiveis')
      .select(`
                id,
                titulo,
                descricao,
                quantidade,
                data_validade,
                status,
                data_publicacao,
                empresa:empresas(
                    id,
                    nome_fantasia,
                    razao_social,
                    email_institucional,
                    telefone
                ),
                excedente:excedentes(
                    categoria:categorias(nome),
                    unidade_medida:unidades_medida(abreviacao)
                )
            `)
      .eq('status', 'disponível')
      .order('data_publicacao', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar doações:', error);
      return res.status(500).json({
        message: 'Erro ao carregar doações disponíveis',
        error: error.message
      });
    }

    // Processar dados para formato mais amigável
    const doacoesProcessadas = doacoes.map(doacao => ({
      id: doacao.id,
      titulo: doacao.titulo,
      descricao: doacao.descricao,
      quantidade: doacao.quantidade,
      data_validade: doacao.data_validade,
      status: doacao.status,
      empresa: doacao.empresa,
      categoria: doacao.excedente?.categoria?.nome || 'Não categorizado',
      unidade_medida: doacao.excedente?.unidade_medida?.abreviacao || 'un'
    }));

    console.log(`✅ ${doacoesProcessadas.length} doações encontradas`);
    res.json(doacoesProcessadas);

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});
// =====================================================
// ROTAS PARA MINHAS SOLICITAÇÕES DA ONG
// =====================================================

// Solicitações disponíveis da ONG
app.get('/api/meus-pedidos-disponiveis', verificarToken, verificarOng, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    console.log('📥 Buscando pedidos disponíveis para ONG, usuário:', usuario_id);

    // Buscar ID da ONG
    const { data: ongData, error: ongError } = await supabase
      .from('ongs')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (ongError || !ongData) {
      return res.status(400).json({
        success: false,
        message: 'ONG não encontrada'
      });
    }

    const { data: solicitacoes, error } = await supabase
      .from('solicitacoes_ong')
      .select(`
                id,
                titulo,
                descricao,
                quantidade_desejada,
                status,
                data_criacao,
                categoria:categorias(nome)
            `)
      .eq('ong_id', ongData.id)
      .eq('status', 'disponivel')
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar solicitações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar solicitações',
        error: error.message
      });
    }

    console.log(`✅ ${solicitacoes.length} solicitações encontradas`);
    res.json(solicitacoes);

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Solicitações reservadas da ONG
app.get('/api/meus-pedidos-reservados', verificarToken, verificarOng, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    console.log('📥 Buscando pedidos reservados para ONG, usuário:', usuario_id);

    // Buscar ID da ONG
    const { data: ongData, error: ongError } = await supabase
      .from('ongs')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (ongError || !ongData) {
      return res.status(400).json({
        success: false,
        message: 'ONG não encontrada'
      });
    }

    const { data: solicitacoes, error } = await supabase
      .from('solicitacoes_ong_reservada')
      .select(`
                id,
                titulo,
                descricao,
                quantidade_desejada,
                status,
                data_criacao,
                empresa:empresas(nome_fantasia, razao_social, email_institucional),
                categoria:categorias(nome)
            `)
      .eq('ong_id', ongData.id)
      .eq('status', 'reservado')
      .order('data_criacao', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar solicitações reservadas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar solicitações reservadas',
        error: error.message
      });
    }

    console.log(`✅ ${solicitacoes.length} solicitações reservadas encontradas`);
    res.json(solicitacoes);

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Doações reservadas pela ONG
app.get('/api/doacoes-reservadas-ong', verificarToken, verificarOng, async (req, res) => {
  try {
    const usuario_id = req.usuario.id;

    console.log('📥 Buscando doações reservadas para ONG, usuário:', usuario_id);

    // Buscar ID da ONG
    const { data: ongData, error: ongError } = await supabase
      .from('ongs')
      .select('id')
      .eq('usuario_id', usuario_id)
      .single();

    if (ongError || !ongData) {
      return res.status(400).json({
        success: false,
        message: 'ONG não encontrada'
      });
    }

    const { data: doacoes, error } = await supabase
      .from('doacoes_reservadas')
      .select(`
                id,
                titulo,
                descricao,
                quantidade,
                data_validade,
                status,
                data_publicacao,
                empresa:empresas(nome_fantasia, razao_social, email_institucional)
            `)
      .eq('ong_id', ongData.id)
      .eq('status', 'reservado')
      .order('data_publicacao', { ascending: false });

    if (error) {
      console.error('❌ Erro ao buscar doações reservadas:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao carregar doações reservadas',
        error: error.message
      });
    }

    console.log(`✅ ${doacoes.length} doações reservadas encontradas`);
    res.json(doacoes);

  } catch (error) {
    console.error('❌ Erro interno:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});
// rota de contato/suporte
app.post('/enviar-contato', contactLimiter, async (req, res) => {
  try {
    const { nome, email, assunto, descricao } = req.body;

    const msg = {
      to: process.env.EMAIL_RECIPIENT,
      from: process.env.EMAIL_REMETENTE,
      subject: `[Contato NutriAção] - ${assunto || 'Mensagem de Suporte'}`,
      html: `
        <h2>Nova Mensagem de Contato Recebida</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>De:</strong> ${email}</p>
        <p><strong>Assunto:</strong> ${assunto}</p>
        <hr>
        <p><strong>Mensagem:</strong></p>
        <p>${descricao}</p>
      `,
    };

    await sgMail.send(msg);

    res.status(200).json({ message: 'Mensagem enviada com sucesso! Responderemos em até 3 dias úteis, lembre-se de verificar a caixa de Spam' });

  } catch (error) {
    console.error('Erro ao enviar e-mail via SendGrid:', error);
    res.status(500).json({ message: 'Erro ao enviar a mensagem. Tente novamente.' });
  }
});

// Rota para enviar e-mail de recuperação
app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email required');

  try {
    // consulta paralela em ongs e empresas
    const [ongsRes, empresasRes] = await Promise.all([
      supabase.from('ongs').select('id, email').eq('email', email).limit(1),
      supabase.from('empresa').select('id, email').eq('email', email).limit(1)
    ]);

    if (ongsRes.error || empresasRes.error) {
      console.error('DB error', ongsRes.error || empresasRes.error);
      return res.status(500).send('DB error');
    }

    const ong = ongsRes.data && ongsRes.data[0];
    const empresa = empresasRes.data && empresasRes.data[0];
    const found = ong || empresa;

    if (!found) {
      return res.status(200).json({ message: 'Se o email existir, você receberá um link de recuperação.' });
    }

    // gerar token e salvar hash
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h

    await supabase.from('password_resets').insert({
      user_id: found.id,
      token_hash: tokenHash,
      expires_at: expiresAt
    });

    const resetUrl = `http://localhost:5501/pages/homepage/resetarSenha.html?token=${token}&email=${encodeURIComponent(email)}`;
    const msg = {
      to: email,
      from: process.env.EMAIL_REMETENTE,
      subject: 'Redefina sua senha',
      text: `Clique aqui para redefinir: ${resetUrl}`,
      html: `<p>Clique <a href="${resetUrl}">aqui</a> para redefinir sua senha. Link válido por 1 hora.</p>`
    };

    await sgMail.send(msg);
    return res.status(200).json({ message: 'Email de recuperação enviado com sucesso!' });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao processar solicitação de recuperação de senha.' });
  }
});

// Rota para atualizar senha
app.post('/reset-password', async (req, res) => {
  const { token, newPassword, email } = req.body;

  const cleanToken = token ? token.trim() : '';

  if (!cleanToken || !newPassword || !email) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    const tokenHash = crypto.createHash('sha256').update(cleanToken).digest('hex');

    const { data: resetData, error: resetError } = await supabase
      .from('password_resets')
      .select('user_id, expires_at, token_hash')
      .eq('token_hash', tokenHash)
      .limit(1)
      .single();

    if (resetError || !resetData) {
      return res.status(400).json({ error: 'Token inválido' });
    }

    if (new Date(resetData.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Token expirado' });
    }

    const [ongRes, empresaRes] = await Promise.all([
      supabase.from('ongs').select('id').eq('email', email).limit(1),
      supabase.from('empresa').select('id').eq('email', email).limit(1)
    ]);

    const isOng = ongRes.data && ongRes.data.length > 0;
    const isEmpresa = empresaRes.data && empresaRes.data.length > 0;

    if (!isOng && !isEmpresa) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const bcrypt = await import('bcrypt');
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const tableName = isOng ? 'ongs' : 'empresa';
    const { error: updateError } = await supabase
      .from(tableName)
      .update({ senha_hash: hashedPassword })
      .eq('email', email);

    if (updateError) {
      console.error('Erro ao atualizar senha:', updateError);
      return res.status(500).json({ error: 'Erro ao atualizar senha' });
    }

    await supabase.from('password_resets').delete().eq('token_hash', tokenHash);

    return res.status(200).json({ message: 'Senha atualizada com sucesso!' });

  } catch (err) {
    console.error('Erro no reset de senha:', err);
    return res.status(500).json({ error: 'Erro ao processar solicitação' });
  }
});

// inicia o Servidor
app.listen(PORT, () => {
  console.log(`Servidor Express rodando em http://localhost:${PORT}`);
  console.log(`Teste de conexão DB em: http://localhost:${PORT}/db-test`);
  console.log("Caminho Estático sendo usado:", publicPath);
});

app.get('/api/relatorios-impacto', verificarToken, verificarEmpresa, async (req, res) => {
  try {
    const empresaId = req.usuario.id;

    console.log(`Buscando relatórios para empresa ID: ${empresaId}`);

    const { data: doacoes, error } = await supabase
      .from('doacoes')
      .select(`
                id,
                data_doacao,
                status,
                quantidade_total,
                created_at,
                ong_id,
                empresa_id,
                ongs!inner(
                    id,
                    nome,
                    endereco,
                    telefone
                ),
                empresas!inner(
                    id,
                    nome_fantasia,
                    email
                ),
                itens_doacao(
                    id,
                    alimento_id,
                    quantidade,
                    unidade_medida,
                    alimentos!inner(
                        id,
                        nome,
                        categoria,
                        co2_por_kg
                    )
                )
            `)
      .eq('empresa_id', empresaId)
      .in('status', ['entregue', 'concluido', 'finalizado'])
      .order('data_doacao', { ascending: false });

    if (error) {
      console.error('Erro Supabase:', error);
      throw error;
    }

    console.log(`Encontradas ${doacoes?.length || 0} doações`);

    const doacoesProcessadas = doacoes?.map(doacao => {
      const alimentos = doacao.itens_doacao?.map(item => {
        const refeicoes = calcularRefeicoesAPI(item.quantidade, item.alimentos?.categoria);
        const co2 = calcularCO2EvitadoAPI(item.quantidade, item.alimentos?.co2_por_kg);

        return {
          nome: item.alimentos?.nome || 'Alimento não especificado',
          quantidade: item.quantidade || 0,
          unidade: item.unidade_medida || 'kg',
          refeicoes: refeicoes,
          co2: co2,
          categoria: item.alimentos?.categoria || 'outros'
        };
      }) || [];

      const totalRefeicoes = alimentos.reduce((sum, item) => sum + item.refeicoes, 0);
      const totalCO2 = alimentos.reduce((sum, item) => sum + item.co2, 0);
      const totalAlimentos = alimentos.reduce((sum, item) => sum + item.quantidade, 0);

      return {
        id: doacao.id,
        data: doacao.data_doacao || doacao.created_at,
        alimentos: alimentos,
        ong: doacao.ongs?.nome || 'ONG não especificada',
        status: doacao.status,
        responsavel: doacao.empresas?.nome_fantasia || 'Empresa não especificada',
        endereco: doacao.ongs?.endereco || 'Endereço não especificado',
        telefone: doacao.ongs?.telefone || 'Telefone não informado',
        totalRefeicoes: totalRefeicoes,
        totalCO2: totalCO2,
        totalAlimentos: totalAlimentos
      };
    }) || [];

    res.json({
      success: true,
      data: doacoesProcessadas,
      total: doacoesProcessadas.length,
      empresa: doacoesProcessadas[0]?.responsavel || 'Empresa'
    });

  } catch (error) {
    console.error('Erro ao buscar relatórios:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar dados dos relatórios',
      details: error.message
    });
  }
});

function calcularRefeicoesAPI(quantidade, categoria) {
  const fatores = {
    'graos': 5,
    'frutas': 4,
    'legumes': 6,
    'verduras': 8,
    'laticinios': 2,
    'outros': 3
  };

  return Math.round(quantidade * (fatores[categoria] || 3));
}

function calcularCO2EvitadoAPI(quantidade, co2PorKg) {
  const co2Fator = co2PorKg || 0.5;
  return parseFloat((quantidade * co2Fator).toFixed(2));
}
app.get('/doacoesConcluidasONG/solicitacoesConcluidasONG', verificarToken, verificarOng, async (req, res) => {
  try {
    const ongId = req.query.id;

    const query = `
      SELECT 
        soc.id,
        soc.titulo as nome_alimento,
        soc.quantidade_desejada as quantidade,
        soc.data_criacao,
        soc.status,
        e.nome_fantasia as empresa_nome,
        e.id as empresa_id
      FROM solicitacoes_ong_concluido soc
      INNER JOIN empresas e ON soc.empresa_id = e.id
      WHERE soc.ong_id = $1
      ORDER BY soc.data_criacao DESC
    `;

    const result = await pool.query(query, [ongId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar solicitações concluídas:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// Rota para buscar excedentes concluídos da ONG
app.get('/doacoesConcluidasONG/excedentesConcluidosONG', verificarToken, verificarOng, async (req, res) => {
  try {
    const ongId = req.query.id;

    const query = `
      SELECT 
        dc.id,
        dc.titulo as nome_alimento,
        dc.quantidade,
        dc.data_validade,
        dc.status,
        e.nome_fantasia as nomeempresa,
        e.id as empresa_id
      FROM doacoes_concluidas dc
      INNER JOIN empresas e ON dc.empresa_id = e.id
      WHERE dc.ong_id = $1 AND dc.excedente_id IS NOT NULL
      ORDER BY dc.data_publicacao DESC
    `;

    const result = await pool.query(query, [ongId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar excedentes concluídos:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});