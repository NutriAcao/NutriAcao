// doacaoEmpresaController.js - VERSÃO COMPLETA
import { supabase } from '../config/supabaseClient.js';

export async function cadastrarDoacaoEmpresa(req, res) {
    console.log('Dados recebidos no req.body:', req.body); 
    
    // CAMPOS DO NOVO SISTEMA
    const { 
      nome_alimento,           // ← novo campo (era 'nome')
      quantidade,
      data_validade,
      cep_retirada,
      telefone,
      email,
      id_empresa,
      categoria_id,           // ← novo campo
      unidade_medida_id,      // ← novo campo
      descricao               // ← novo campo
    } = req.body;

    // Verificação de segurança - campos obrigatórios do NOVO sistema
    if (!nome_alimento || !quantidade || !data_validade || !id_empresa) {
        return res.status(400).json({
            success: false,
            message: "Campos essenciais não podem estar vazios. Campos obrigatórios: nome_alimento, quantidade, data_validade, id_empresa"
        });
    }
    
    try {
        // VERIFICAR SE A EMPRESA EXISTE (no novo sistema)
        const { data: empresa, error: empresaError } = await supabase
            .from('empresas')
            .select('id, nome_fantasia')
            .eq('id', id_empresa)
            .single();

        if (empresaError || !empresa) {
            console.error('Empresa não encontrada:', id_empresa);
            return res.status(400).json({
                success: false,
                message: "Empresa não encontrada. ID: " + id_empresa
            });
        }

        console.log('Empresa encontrada:', empresa);

        // 1. Inserir na tabela excedentes (NOVO SISTEMA)
        const { data: excedente, error: excedenteError } = await supabase
            .from('excedentes')
            .insert([
                { 
                    empresa_id: id_empresa,
                    titulo: nome_alimento,
                    descricao: descricao || `Doação de ${nome_alimento} - CEP: ${cep_retirada}`,
                    categoria_id: categoria_id || 1,
                    quantidade: quantidade,
                    unidade_medida_id: unidade_medida_id || 1,
                    data_validade: data_validade,
                    status: 'disponivel',
                    data_criacao: new Date()
                } 
            ])
            .select()
            .single();

        if (excedenteError) {
            console.error('Erro ao cadastrar excedente:', excedenteError);
            return res.status(500).json({
                success: false,
                message: "Falha no cadastro do excedente. Erro: " + excedenteError.message
            });
        }

        console.log('Excedente criado:', excedente);

        // 2. Inserir na tabela doacoes_disponiveis (NOVO SISTEMA)
        const { data: doacao, error: doacaoError } = await supabase
            .from('doacoes_disponiveis')
            .insert([
                { 
                    empresa_id: id_empresa,
                    excedente_id: excedente.id,
                    titulo: nome_alimento,
                    descricao: descricao || `Doação de ${nome_alimento} - CEP: ${cep_retirada}`,
                    quantidade: quantidade,
                    data_validade: data_validade,
                    status: 'disponível',
                    data_publicacao: new Date(),
                    // NOVOS CAMPOS ADICIONADIS
                    cep_retirada: cep_retirada,
                    telefone_contato: telefone,
                    email_contato: email
                } 
            ])
            .select();

        if (doacaoError) {
            console.error('Erro ao criar doação disponível:', doacaoError);
            // Rollback: deletar o excedente criado
            await supabase.from('excedentes').delete().eq('id', excedente.id);
            return res.status(500).json({
                success: false,
                message: "Falha ao criar doação disponível. Erro: " + doacaoError.message
            });
        }

        console.log('Doação disponível criada:', doacao);

        return res.status(201).json({ 
            success: true,
            message: 'Doação cadastrada com sucesso!', 
            data: {
                excedente: excedente,
                doacao: doacao
            }
        });

    } catch (e) {
        console.error('Erro interno do servidor no cadastro da doação:', e);
        return res.status(500).json({
            success: false,
            message: "Erro fatal ao processar a requisição."
        });
    }
}

// FUNÇÃO ADICIONADA PARA A ROTA /meus-excedentes-disponiveis
export async function getMeusExcedentesDisponiveis(req, res) {
    // Pega o ID do usuário logado (do middleware de autenticação)
    const usuario_id = req.usuario.id; 

    if (!usuario_id) {
        return res.status(401).json({ message: 'Usuário não autenticado.' });
    }

    try {
        // Primeiro, buscar o ID da empresa associada ao usuário
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (empresaError || !empresaData) {
            return res.status(400).json({ 
                message: 'Usuário não possui uma empresa cadastrada' 
            });
        }

        const empresa_id = empresaData.id;

        // Buscar excedentes disponíveis da empresa
        const { data, error } = await supabase
            .from('doacoes_disponiveis')
            .select('*')
            .eq('status', 'disponível')
            .eq('empresa_id', empresa_id);

        if (error) throw error;
        
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar excedentes:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}