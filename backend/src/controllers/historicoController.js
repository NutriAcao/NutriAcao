// backend/controllers/historicoController.js
import { supabase } from '../config/supabaseClient.js';

export async function getHistoricoONG(req, res) {
    console.log('📥 Requisição recebida em /api/historico-ong');
    
    try {
        // CORREÇÃO: usar req.usuario em vez de req.user
        console.log('👤 req.usuario:', req.usuario);
        console.log('🔍 Tipo de req.usuario:', typeof req.usuario);
        console.log('📋 Keys de req.usuario:', Object.keys(req.usuario || {}));
        
        const id_ong = req.usuario?.ong_id;
        const usuario_id = req.usuario?.id;
        const email = req.usuario?.email;
        const tipo = req.usuario?.tipo;

        console.log('🏢 ID da ONG do token:', id_ong);
        console.log('👤 ID do usuário:', usuario_id);
        console.log('📧 Email:', email);
        console.log('🔐 Tipo:', tipo);

        if (!id_ong) {
            console.log('❌ ong_id não encontrado no token');
            return res.status(400).json({ 
                message: 'Usuário não vinculado a uma ONG. Faça login novamente para atualizar o token.' 
            });
        }

        console.log(`🔍 Buscando histórico para ONG ID: ${id_ong}`);

        // Buscar dados reais
        const { data: excedentes, error: exError } = await supabase
            .from('doacoes_concluidas')
            .select('*')
            .eq('ong_id', id_ong);

        console.log('📊 Excedentes encontrados:', excedentes?.length || 0);

        if (exError) {
            console.error('❌ Erro ao buscar excedentes:', exError);
            throw exError;
        }

        const { data: solicitacoes, error: solError } = await supabase
            .from('solicitacoes_ong_concluido')
            .select('*')
            .eq('ong_id', id_ong);

        console.log('📊 Solicitações encontradas:', solicitacoes?.length || 0);

        if (solError) {
            console.error('❌ Erro ao buscar solicitações:', solError);
            throw solError;
        }

        const historico = [];

        // Processar excedentes
        if (excedentes && excedentes.length > 0) {
            excedentes.forEach(item => {
                historico.push({
                    tipo: 'excedente',
                    produto: item.titulo || 'Produto não informado',
                    quantidade: item.quantidade || 0,
                    empresa: 'Empresa Doadora',
                    data_conclusao: item.data_publicacao || new Date().toISOString(),
                    unidade: 'kg'
                });
            });
        }

        // Processar solicitações
        if (solicitacoes && solicitacoes.length > 0) {
            solicitacoes.forEach(item => {
                historico.push({
                    tipo: 'solicitacao',
                    produto: item.titulo || 'Produto não informado',
                    quantidade: item.quantidade_desejada || 0,
                    empresa: 'Empresa Doadora',
                    data_conclusao: item.data_criacao || new Date().toISOString(),
                    unidade: 'kg'
                });
            });
        }

        console.log(`✅ Histórico final: ${historico.length} itens`);
        return res.status(200).json(historico);

    } catch (error) {
        console.error('❌ Erro no histórico:', error);
        return res.status(500).json({ 
            message: 'Erro interno do servidor: ' + error.message 
        });
    }
}