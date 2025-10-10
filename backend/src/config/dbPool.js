// /backend/src/config/dbPool.js

// o objetivo deste arquivo é configurar e estabelecer uma conexão com o banco de dados PostgreSQL
// biblioteca dotenv que serve para configurar o ambiente: 
// 'dotenv' é a biblioteca que permite carregar variaveis de ambiente geralmente de arquivos chamados de .env ou .process.env
// biblioteca pg que serve para criar a conexão:
// Pool é a classe geralmente usada para estabelecer conexões

// depois dados do arquivo .env são puxados para validar a conexão.

import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';

const DATABASE_URL = process.env.DATABASE_URL;

const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export { pool };