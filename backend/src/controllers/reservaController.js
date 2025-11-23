// src/controllers/reservaController.js
import { supabase } from '../config/supabaseClient.js';

// =========================================================================
// FUNÇÕES DE RESERVA ATUALIZADAS PARA NOVO BANCO
// =========================================================================

// ONG reserva uma doação disponível (excedente de empresa)
export async function reservarDoacaoONG(req, res) {
    try {
        const { doacao_id } = req.body;
        const usuario_id = req.usuario.id;

        if (!doacao_id) {
            return res.status(400).json({ message: "ID da doação é obrigatório." });
        }

        // Buscar ID da ONG associada ao usuário
        const { data: ongData, error: ongError } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        if (ongError || !ongData) {
            return res.status(400).json({ 
                message: 'Usuário não possui uma ONG cadastrada' 
            });
        }

        const id_ong = ongData.id;

        // 1. Buscar dados da doação disponível
        const { data: doacaoData, error: doacaoError } = await supabase
            .from('doacoes_disponiveis')
            .select('*')
            .eq('id', doacao_id)
            .eq('status', 'disponível')
            .single();

        if (doacaoError || !doacaoData) {
            return res.status(409).json({ 
                message: "Doação não encontrada ou já foi reservada" 
            });
        }

        // 2. Inserir na tabela de doações reservadas
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
                data_publicacao: doacaoData.data_publicacao,
                observacoes: doacaoData.observacoes,
                telefone_contato: doacaoData.telefone_contato,
                cep_retirada: doacaoData.cep_retirada
            })
            .select(`
                id,
                titulo,
                quantidade,
                status,
                empresa:empresas(nome_fantasia, razao_social)
            `);

        if (reservaError) {
            console.error('❌ Erro ao criar reserva:', reservaError);
            return res.status(500).json({ 
                message: "Falha ao reservar a doação",
                error: reservaError.message 
            });
        }

        // 3. Remover da tabela de doações disponíveis
        const { error: deleteError } = await supabase
            .from('doacoes_disponiveis')
            .delete()
            .eq('id', doacao_id);

        if (deleteError) {
            console.error('❌ Erro ao remover doação disponível:', deleteError);
            // Não retornar erro aqui, pois a reserva já foi criada
        }

        console.log(`✅ Doação ${doacao_id} reservada pela ONG ${id_ong}`);
        res.json({ 
            success: true,
            message: 'Doação reservada com sucesso!',
            data: reservaData[0]
        });

    } catch (error) {
        console.error('❌ Erro interno:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor',
            error: error.message 
        });
    }
}

// Empresa reserva uma solicitação de ONG
export async function reservarSolicitacaoEmpresa(req, res) {
    try {
        const { solicitacao_id } = req.body;
        const usuario_id = req.usuario.id;

        if (!solicitacao_id) {
            return res.status(400).json({ message: "ID da solicitação é obrigatório." });
        }

        // Buscar ID da empresa associada ao usuário
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

        const id_empresa = empresaData.id;

        // 1. Buscar dados da solicitação disponível
        const { data: solicitacaoData, error: solicitacaoError } = await supabase
            .from('solicitacoes_ong')
            .select('*')
            .eq('id', solicitacao_id)
            .eq('status', 'disponivel')
            .single();

        if (solicitacaoError || !solicitacaoData) {
            return res.status(409).json({ 
                message: "Solicitação não encontrada ou já foi reservada" 
            });
        }

        // 2. Inserir na tabela de solicitações reservadas
        const { data: reservaData, error: reservaError } = await supabase
            .from('solicitacoes_ong_reservada')
            .insert({
                ong_id: solicitacaoData.ong_id,
                empresa_id: id_empresa,
                titulo: solicitacaoData.titulo,
                descricao: solicitacaoData.descricao,
                categoria_id: solicitacaoData.categoria_id,
                quantidade_desejada: solicitacaoData.quantidade_desejada,
                status: 'reservado',
                data_criacao: solicitacaoData.data_criacao,
                telefone_contato: solicitacaoData.telefone_contato,
                email_contato: solicitacaoData.email_contato
            })
            .select(`
                id,
                titulo,
                quantidade_desejada,
                status,
                ong:ongs(nome_ong, email_institucional)
            `);

        if (reservaError) {
            console.error('❌ Erro ao criar reserva de solicitação:', reservaError);
            return res.status(500).json({ 
                message: "Falha ao reservar a solicitação",
                error: reservaError.message 
            });
        }

        // 3. Remover da tabela de solicitações disponíveis
        const { error: deleteError } = await supabase
            .from('solicitacoes_ong')
            .delete()
            .eq('id', solicitacao_id);

        if (deleteError) {
            console.error('❌ Erro ao remover solicitação disponível:', deleteError);
        }

        console.log(`✅ Solicitação ${solicitacao_id} reservada pela empresa ${id_empresa}`);
        res.json({ 
            success: true,
            message: 'Solicitação reservada com sucesso!',
            data: reservaData[0]
        });

    } catch (error) {
        console.error('❌ Erro interno:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor',
            error: error.message 
        });
    }
}

// =========================================================================
// FUNÇÕES DE CONCLUSÃO ATUALIZADAS
// =========================================================================

// Concluir doação (excedente) - tanto empresa quanto ONG podem concluir
export async function concluirDoacao(req, res) {
    try {
        const { doacao_id } = req.body;
        const usuario_id = req.usuario.id;

        if (!doacao_id) {
            return res.status(400).json({ message: "ID da doação é obrigatório." });
        }

        // 1. Buscar dados da doação reservada
        const { data: reservaData, error: reservaError } = await supabase
            .from('doacoes_reservadas')
            .select('*')
            .eq('id', doacao_id)
            .eq('status', 'reservado')
            .single();

        if (reservaError || !reservaData) {
            return res.status(409).json({ 
                message: "Doação reservada não encontrada" 
            });
        }

        // Verificar se o usuário tem permissão (é a ONG ou a empresa envolvida)
        const { data: ongData } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const { data: empresaData } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const userOngId = ongData?.id;
        const userEmpresaId = empresaData?.id;

        if (reservaData.ong_id !== userOngId && reservaData.empresa_id !== userEmpresaId) {
            return res.status(403).json({ 
                message: "Você não tem permissão para concluir esta doação" 
            });
        }

        // 2. Inserir na tabela de doações concluídas
        const { data: conclusaoData, error: conclusaoError } = await supabase
            .from('doacoes_concluidas')
            .insert({
                empresa_id: reservaData.empresa_id,
                ong_id: reservaData.ong_id,
                excedente_id: reservaData.excedente_id,
                titulo: reservaData.titulo,
                descricao: reservaData.descricao,
                quantidade: reservaData.quantidade,
                data_validade: reservaData.data_validade,
                status: 'concluída',
                data_publicacao: reservaData.data_publicacao,
                observacoes: reservaData.observacoes
            })
            .select();

        if (conclusaoError) {
            console.error('❌ Erro ao criar conclusão:', conclusaoError);
            return res.status(500).json({ 
                message: "Falha ao concluir a doação",
                error: conclusaoError.message 
            });
        }

        // 3. Remover da tabela de doações reservadas
        const { error: deleteError } = await supabase
            .from('doacoes_reservadas')
            .delete()
            .eq('id', doacao_id);

        if (deleteError) {
            console.error('❌ Erro ao remover doação reservada:', deleteError);
        }

        // 4. Atualizar métricas
        await atualizarMetricas(reservaData.empresa_id, reservaData.ong_id, reservaData.quantidade);

        console.log(`✅ Doação ${doacao_id} concluída`);
        res.json({ 
            success: true,
            message: 'Doação concluída com sucesso!'
        });

    } catch (error) {
        console.error('❌ Erro interno:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor',
            error: error.message 
        });
    }
}

// Concluir solicitação da ONG
export async function concluirSolicitacao(req, res) {
    try {
        const { solicitacao_id } = req.body;
        const usuario_id = req.usuario.id;

        if (!solicitacao_id) {
            return res.status(400).json({ message: "ID da solicitação é obrigatório." });
        }

        // 1. Buscar dados da solicitação reservada
        const { data: reservaData, error: reservaError } = await supabase
            .from('solicitacoes_ong_reservada')
            .select('*')
            .eq('id', solicitacao_id)
            .eq('status', 'reservado')
            .single();

        if (reservaError || !reservaData) {
            return res.status(409).json({ 
                message: "Solicitação reservada não encontrada" 
            });
        }

        // Verificar permissão
        const { data: ongData } = await supabase
            .from('ongs')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const { data: empresaData } = await supabase
            .from('empresas')
            .select('id')
            .eq('usuario_id', usuario_id)
            .single();

        const userOngId = ongData?.id;
        const userEmpresaId = empresaData?.id;

        if (reservaData.ong_id !== userOngId && reservaData.empresa_id !== userEmpresaId) {
            return res.status(403).json({ 
                message: "Você não tem permissão para concluir esta solicitação" 
            });
        }

        // 2. Inserir na tabela de solicitações concluídas
        const { data: conclusaoData, error: conclusaoError } = await supabase
            .from('solicitacoes_ong_concluido')
            .insert({
                ong_id: reservaData.ong_id,
                empresa_id: reservaData.empresa_id,
                titulo: reservaData.titulo,
                descricao: reservaData.descricao,
                categoria_id: reservaData.categoria_id,
                quantidade_desejada: reservaData.quantidade_desejada,
                status: 'concluído',
                data_criacao: reservaData.data_criacao
            })
            .select();

        if (conclusaoError) {
            console.error('❌ Erro ao criar conclusão:', conclusaoError);
            return res.status(500).json({ 
                message: "Falha ao concluir a solicitação",
                error: conclusaoError.message 
            });
        }

        // 3. Remover da tabela de solicitações reservadas
        const { error: deleteError } = await supabase
            .from('solicitacoes_ong_reservada')
            .delete()
            .eq('id', solicitacao_id);

        if (deleteError) {
            console.error('❌ Erro ao remover solicitação reservada:', deleteError);
        }

        // 4. Atualizar métricas
        await atualizarMetricas(reservaData.empresa_id, reservaData.ong_id, reservaData.quantidade_desejada);

        console.log(`✅ Solicitação ${solicitacao_id} concluída`);
        res.json({ 
            success: true,
            message: 'Solicitação concluída com sucesso!'
        });

    } catch (error) {
        console.error('❌ Erro interno:', error);
        res.status(500).json({ 
            message: 'Erro interno do servidor',
            error: error.message 
        });
    }
}

// =========================================================================
// FUNÇÃO AUXILIAR
// =========================================================================

async function atualizarMetricas(empresa_id, ong_id, quantidade) {
    try {
        const { error } = await supabase
            .from('metricas')
            .insert({
                empresa_id: empresa_id,
                ong_id: ong_id,
                quantidade_kg: quantidade,
                data_metrica: new Date().toISOString().split('T')[0],
                tipo_metrica: 'doacao_concluida'
            });

        if (error) {
            console.error('❌ Erro ao atualizar métricas:', error);
        }
    } catch (error) {
        console.error('❌ Erro ao atualizar métricas:', error);
    }
}