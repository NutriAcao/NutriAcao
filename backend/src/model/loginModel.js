
import { supabase } from "../config/supabaseClient.js";


export async function buscarUsuarioPorEmail(email) {
    const tabelas = ['empresa', 'ong', 'pessoafisica', 'responsavellegal', 'responsavellegal_empresa'];

    for (const tabela of tabelas) {
        const { data, error } = await supabase
            .from(tabela)
            .select('*')
            .eq('email', email)
            .single(); // retorna apenas 1 registro

        if (error && error.code !== 'PGRST116') { 
            // PGRST116 = no rows returned, ignoramos
            console.error(`Erro ao buscar na tabela ${tabela}:`, error);
        }

        if (data) {
            return { ...data, tipo: tabela }; // Retorna dados do usuário e de qual tabela veio
        }
    }

    return null; // Se não encontrou em nenhuma tabela
}
