// src/controllers/doacaoOngController.js
import { supabase } from '../config/supabaseClient.js';

// Função para cadastrar solicitação de doação da ONG
export async function cadastrarDoacaoOng(req, res) {
    try {
        const usuario_id = req.usuario.id;
        const { 
            titulo, 
            descricao, 
            categoria_id, 
            quantidade_desejada,
            telefone_contato,
            email_contato
        } = req.body;

        // Validações básicas
        if (!titulo || !quantidade_desejada || !categoria_id) {
            return res.status(400).json({ 
                success: false, 
                message: 'Título, quantidade desejada e categoria são obrigatórios' 
            });
        }

        // Buscar ID da ONG associada ao usuário
        const { data: ongData, error: ongError } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (ongError || !ongData) {
            return res.status(400).json({ 
                success: false,
                message: 'ONG não encontrada para este usuário' 
            });
        }

        // Cadastrar a solicitação da ONG
        const { data: solicitacaoData, error: solicitacaoError } = await supabase
            .from('solicitacoes_ong')
            .insert({
                ong_id: ongData.id,
                titulo: titulo,
                descricao: descricao,
                categoria_id: categoria_id,
                quantidade_desejada: quantidade_desejada,
                status: 'disponivel',
                data_criacao: new Date().toISOString(),
                telefone_contato: telefone_contato,
                email_contato: email_contato
            })
            .select()
            .single();

        if (solicitacaoError) {
            console.error('Erro ao cadastrar solicitação da ONG:', solicitacaoError);
            return res.status(500).json({ 
                success: false,
                message: 'Erro ao cadastrar solicitação',
                error: solicitacaoError.message 
            });
        }

        console.log(`✅ Solicitação da ONG cadastrada com sucesso - ID: ${solicitacaoData.id}`);
        
        res.status(201).json({
            success: true,
            message: 'Solicitação cadastrada com sucesso!',
            data: solicitacaoData
        });

    } catch (error) {
        console.error('❌ Erro interno ao cadastrar solicitação da ONG:', error);
        res.status(500).json({ 
            success: false,
            message: 'Erro interno do servidor',
            error: error.message 
        });
    }
}

// Função para buscar doações reservadas pela ONG
export async function getDoacoesReservadasONG(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        // Buscar ID da ONG
        const { data: ongData, error: ongError } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (ongError || !ongData) {
            return res.status(400).json({ message: 'ONG não encontrada' });
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

        if (error) throw error;

        res.json(doacoes || []);
    } catch (error) {
        console.error('Erro ao buscar doações reservadas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

// Função para buscar doações concluídas pela ONG
export async function getDoacoesConcluidasONG(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        // Buscar ID da ONG
        const { data: ongData, error: ongError } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (ongError || !ongData) {
            return res.status(400).json({ message: 'ONG não encontrada' });
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
                empresa:empresas(nome_fantasia, razao_social)
            `)
            .eq('ong_id', ongData.id)
            .eq('status', 'concluída')
            .order('data_publicacao', { ascending: false });

        if (error) throw error;

        res.json(doacoes || []);
    } catch (error) {
        console.error('Erro ao buscar doações concluídas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

// Funções antigas mantidas para compatibilidade
export async function getMeusPedidosReservados(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        const { data: ongData, error: ongError } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (ongError || !ongData) {
            return res.status(400).json({ message: 'ONG não encontrada' });
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

        if (error) throw error;

        res.json(solicitacoes || []);
    } catch (error) {
        console.error('Erro ao buscar pedidos reservados:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}

export async function getDoacoesQueReservei(req, res) {
    try {
        const usuario_id = req.usuario.id;
        
        const { data: ongData, error: ongError } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (ongError || !ongData) {
            return res.status(400).json({ message: 'ONG não encontrada' });
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

        if (error) throw error;

        res.json(doacoes || []);
    } catch (error) {
        console.error('Erro ao buscar doações reservadas:', error);
        res.status(500).json({ message: 'Erro interno do servidor' });
    }
}