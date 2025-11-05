import { supabase } from "../config/supabaseClient.js";

export async function buscarDoacoesConcluidasPorEmailEmpresa(email) {
    const { data, error } = await supabase
        .from('doacoesDisponiveis') 
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
