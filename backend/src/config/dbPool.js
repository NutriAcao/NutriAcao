/* arquivo: backend/src/config/dbPool.js - arquivo do backend: src/config/dbpool.js - funções/constantes: pool, DATABASE_URL */

/*
    configuração do pool postgresql:
    - lê DATABASE_URL do ambiente e cria um Pool do pg
    - ssl: rejectUnauthorized false para permitir conexões gerenciadas (ajustar conforme ambiente)
    - exporta 'pool' para ser usado em queries por todo o backend
*/
import dotenv from "dotenv";
dotenv.config();

import { Pool } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export { pool };
