import { supabase } from "../config/supabaseClient.js";

export async function buscarDoacoesConcluidasPorEmailONG(email) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas') // Corrigido: nome da tabela como string
        .select('id, nome_alimento, quantidade') // Corrigido: campos como string única
        .eq('email_Institucional', email);

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return null;
    }

    return data?.length ? data : null;
}
