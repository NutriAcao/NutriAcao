import { supabase } from "../config/supabaseClient.js";

export async function buscarDoacoesConcluidasONG(email) {
    const { data, error } = await supabase
        .from('doacoesSolicitadas')
        .select('id, nome_alimento, quantidade')
        .eq('email_Institucional', email);

    if (error) {
        if (error.code !== 'PGRST116') {
            console.error('Erro ao buscar doações:', error);
        }
        return null;
    }

    return data?.length ? data : null;
}