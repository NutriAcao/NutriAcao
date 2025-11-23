import { supabase } from '../config/supabaseClient.js';

export async function getDoacoesDisponiveisONG(req, res) {
    try {
        const { data, error } = await supabase
            .from('doacoesDisponiveis')
            .select('*')
            .eq('status', 'disponível');

        if (error) throw error;

        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro ao buscar doações disponíveis:', error.message);
        return res.status(500).json({ message: 'Falha ao buscar dados.' });
    }
}