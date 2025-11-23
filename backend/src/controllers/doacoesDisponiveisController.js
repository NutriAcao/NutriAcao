// src/controllers/doacoesDisponiveisController.js
import { supabase } from '../config/supabaseClient.js';

export async function getDoacoesDisponiveisONG(req, res) {
    // ... código existente
}

export async function reservarDoacaoONG(req, res) {
    // ... código existente
}

// ADICIONE ESTA FUNÇÃO SE NÃO EXISTIR
export async function concluirDoacao(req, res) {
    try {
        const { doacao_id } = req.body;
        const usuario_id = req.usuario.id;

        if (!doacao_id) {
            return res.status(400).json({ message: "ID da doação é obrigatório." });
        }

        // Buscar ID da ONG
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

        // 1. Buscar dados da doação reservada
        const { data: reservaData, error: reservaError } = await supabase
            .from('doacoes_reservadas')
            .select('*')
            .eq('id', doacao_id)
            .eq('ong_id', id_ong)
            .eq('status', 'reservado')
            .single();

        if (reservaError || !reservaData) {
            return res.status(409).json({ 
                message: "Doação reservada não encontrada" 
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
                data_publicacao: reservaData.data_publicacao
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

        console.log(`✅ Doação ${doacao_id} concluída pela ONG ${id_ong}`);
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