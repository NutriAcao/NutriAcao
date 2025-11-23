// src/controllers/doacaoEmpresaController.js
import { supabase } from '../config/supabaseClient.js';

// Função para cadastrar doação da empresa
export async function cadastrarDoacaoEmpresa(req, res) {
    try {
        const usuario_id = req.usuario.id;
        const { 
            titulo, 
            descricao, 
            categoria_id, 
            quantidade, 
            unidade_medida_id, 
            data_validade,
            observacoes,
            telefone_contato,
            cep_retirada
        } = req.body;

        // Validações básicas
        if (!titulo || !quantidade || !categoria_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Título, quantidade e categoria são obrigatórios' 
            });
        }

        // Buscar ID da empresa associada ao usuário
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (empresaError || !empresaData) {
            return res.status(400).json({ 
                success: false,
                message: 'Empresa não encontrada para este usuário' 
            });
        }

        // 1. Primeiro cadastra o excedente
        const { data: excedenteData, error: excedenteError } = await supabase
            .from('excedentes')
            .insert({
                empresa_id: empresaData.id,
                titulo: titulo,
                descricao: descricao,
                categoria_id: categoria_id,
                quantidade: quantidade,
                unidade_medida_id: unidade_medida_id,
                data_validade: data_validade,
                status: 'disponível',
                data_criacao: new Date().toISOString()
            })
            .select()
            .single();

        if (excedenteError) {
            console.error('Erro ao cadastrar excedente:', excedenteError);
            return res.status(500).json({ 
                success: false,
                message: 'Erro ao cadastrar excedente',
                error: excedenteError.message 
            });
        }

        // 2. Depois cadastra na tabela de doações disponíveis
        const { data: doacaoData, error: doacaoError } = await supabase
            .from('doacoes_disponiveis')
            .insert({
                empresa_id: empresaData.id,
                excedente_id: excedenteData.id,
                titulo: titulo,
                descricao: descricao,
                quantidade: quantidade,
                data_validade: data_validade,
                status: 'disponível',
                data_publicacao: new Date().toISOString(),
                observacoes: observacoes,
                telefone_contato: telefone_contato,
                cep_retirada: cep_retirada
            })
            .select()
            .single();

        if (doacaoError) {
            console.error('Erro ao cadastrar doação disponível:', doacaoError);
            
            // Rollback: remove o excedente se a doação falhar
            await supabase
                .from('excedentes')
                .delete()
                .eq('id', excedenteData.id);
                
            return res.status(500).json({ 
                success: false,
                message: 'Erro ao cadastrar doação',
                error: doacaoError.message 
            });
        }

        console.log(`✅ Doação cadastrada com sucesso - ID: ${doacaoData.id}`);
        
        res.status(201).json({
            success: true,
            message: 'Doação cadastrada com sucesso!',
            data: doacaoData
        });

    } catch (error) {
        console.error('❌ Erro interno ao cadastrar doação:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor',
            error: error.message 
        });
    }
}

// Outras funções exportadas (se necessário)
export async function getExcedentesDisponiveisEmpresa(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (empresaError || !empresaData) {
            return res.status(400).json({ message: 'Empresa não encontrada' });
        }

        const { data: excedentes, error } = await supabase
            .from('excedentes')
            .select(`
                id,
                titulo,
                descricao,
                quantidade,
                data_validade,
                status,
                data_criacao,
                categoria:categorias(nome),
                unidade_medida:unidades_medida(abreviacao)
            `)
            .eq('empresa_id', empresaData.id)
            .eq('status', 'disponível')
            .order('data_criacao', { ascending: false });

        if (error) throw error;

        res.json(excedentes || []);
    } catch (error) {
        console.error('Erro ao buscar excedentes disponíveis:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export async function getExcedentesReservadosEmpresa(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (empresaError || !empresaData) {
            return res.status(400).json({ message: 'Empresa não encontrada' });
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
                ong:ongs(nome_ong, email_institucional)
            `)
            .eq('empresa_id', empresaData.id)
            .eq('status', 'reservado')
            .order('data_publicacao', { ascending: false });

        if (error) throw error;

        res.json(doacoes || []);
    } catch (error) {
        console.error('Erro ao buscar excedentes reservados:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export async function getExcedentesConcluidosEmpresa(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (empresaError || !empresaData) {
            return res.status(400).json({ message: 'Empresa não encontrada' });
        }

        const { data: doacoes, error } = await supabase
            .from('doacoes_concluidas')
            .select(`
                id,
                titulo,
                descricao,
                quantidade,
                data_validade,
                status,
                data_publicacao,
                ong:ongs(nome_ong)
            `)
            .eq('empresa_id', empresaData.id)
            .eq('status', 'concluída')
            .order('data_publicacao', { ascending: false });

        if (error) throw error;

        res.json(doacoes || []);
    } catch (error) {
        console.error('Erro ao buscar excedentes concluídos:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export async function getSolicitacoesDisponiveisEmpresa(req, res) {
    try {
        const { data: solicitacoes, error } = await supabase
            .from('solicitacoes_ong')
            .select(`
                id,
                titulo,
                descricao,
                quantidade_desejada,
                status,
                data_criacao,
                ong:ongs(nome_ong, email_institucional),
                categoria:categorias(nome)
            `)
            .eq('status', 'disponivel')
            .order('data_criacao', { ascending: false });

        if (error) throw error;

        res.json(solicitacoes || []);
    } catch (error) {
        console.error('Erro ao buscar solicitações disponíveis:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export async function getSolicitacoesReservadasEmpresa(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (empresaError || !empresaData) {
            return res.status(400).json({ message: 'Empresa não encontrada' });
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
                ong:ongs(nome_ong, email_institucional),
                categoria:categorias(nome)
            `)
            .eq('empresa_id', empresaData.id)
            .eq('status', 'reservado')
            .order('data_criacao', { ascending: false });

        if (error) throw error;

        res.json(solicitacoes || []);
    } catch (error) {
        console.error('Erro ao buscar solicitações reservadas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export async function getSolicitacoesConcluidasEmpresa(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        const { data: empresaData, error: empresaError } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (empresaError || !empresaData) {
            return res.status(400).json({ message: 'Empresa não encontrada' });
        }

        const { data: solicitacoes, error } = await supabase
            .from('solicitacoes_ong_concluido')
            .select(`
                id,
                titulo,
                descricao,
                quantidade_desejada,
                status,
                data_criacao,
                ong:ongs(nome_ong),
                categoria:categorias(nome)
            `)
            .eq('empresa_id', empresaData.id)
            .eq('status', 'concluído')
            .order('data_criacao', { ascending: false });

        if (error) throw error;

        res.json(solicitacoes || []);
    } catch (error) {
        console.error('Erro ao buscar solicitações concluídas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}