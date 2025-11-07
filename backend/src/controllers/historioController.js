// backend/controllers/historicoController.js
import { supabase } from '../config/supabaseClient.js';

export async function getMeuHistorico(req, res) {
    const id_usuario_logado = req.user.id;
    // Precisamos saber se o usuário é 'empresa' ou 'ong'
    // Assumo que seu authMiddleware salva isso em req.user.tipo (ex: 'empresa' ou 'ong')
    const tipo_usuario = req.user.tipo; 

    if (!id_usuario_logado || !tipo_usuario) {
         return res.status(401).json({ message: 'Usuário não autenticado ou tipo de usuário desconhecido.' });
    }

    try {
        let queryA, queryB;

        if (tipo_usuario === 'empresa') {
            // Doações que a EMPRESA criou
            queryA = supabase.from('doacoesDisponiveis').select('*')
                        .eq('status', 'concluido').eq('id_empresa', id_usuario_logado);
            // Pedidos que a EMPRESA reservou
            queryB = supabase.from('doacoesSolicitadas').select('*')
                        .eq('status', 'concluido').eq('id_empresa_reserva', id_usuario_logado);

        } else if (tipo_usuario === 'ong') {
            // Doações que a ONG reservou
            queryA = supabase.from('doacoesDisponiveis').select('*')
                        .eq('status', 'concluido').eq('id_ong_reserva', id_usuario_logado);
            // Pedidos que a ONG criou
            queryB = supabase.from('doacoesSolicitadas').select('*')
                        .eq('status', 'concluido').eq('id_ong', id_usuario_logado);
        } else {
            return res.status(400).json({ message: 'Tipo de usuário inválido.' });
        }

        const { data: dataA, error: errorA } = await queryA;
        if (errorA) throw errorA;

        const { data: dataB, error: errorB } = await queryB;
        if (errorB) throw errorB;

        // Junta os dois resultados
        const historicoCompleto = [...dataA, ...dataB];
        return res.status(200).json(historicoCompleto);

    } catch (error) {
        console.error('Erro ao buscar histórico:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}