/* arquivo: backend/src/config/supabaseClient.js - arquivo do backend: src/config/supabaseclient.js - funções/constantes: supabaseUrl, supabaseServiceRole */

/*
	cliente supabase:
	- inicializa o cliente supabase usando variáveis de ambiente (url e service role)
	- exporta 'supabase' para uso em models e controllers
	- atenção: a service role deve ser protegida (não expor em cliente navegador)
*/
import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE;

export const supabase = createClient(supabaseUrl, supabaseServiceRole);
