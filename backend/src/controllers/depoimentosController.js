// /backend/src/controllers/depoimentosController.js

import { pool } from '../config/dbPool.js';

export const depoimentosController = {
  // Buscar todos os depoimentos aprovados
  async getDepoimentosAprovados(req, res) {
    try {
      const result = await pool.query(
        `SELECT id, nome, tipo, mensagem, avaliacao, data_depoimento 
         FROM depoimentos 
         WHERE aprovado = true 
         ORDER BY data_depoimento DESC 
         LIMIT 50`
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar depoimentos:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Criar novo depoimento
  async createDepoimento(req, res) {
    const { nome, tipo, mensagem, avaliacao, usuario_id } = req.body;
    
    // Validações básicas
    if (!nome || !tipo || !mensagem || !avaliacao) {
      return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
    }
    
    if (avaliacao < 1 || avaliacao > 5) {
      return res.status(400).json({ error: 'Avaliação deve ser entre 1 e 5 estrelas' });
    }

    try {
      // Verificar se usuário já tem depoimento (limite de 1 por usuário)
      let depoimentoExistente = null;
      if (usuario_id) {
        const existing = await pool.query(
          'SELECT id FROM depoimentos WHERE usuario_id = $1',
          [usuario_id]
        );
        depoimentoExistente = existing.rows[0];
      }

      if (depoimentoExistente) {
        // Atualizar depoimento existente
        const result = await pool.query(
          `UPDATE depoimentos 
           SET nome = $1, tipo = $2, mensagem = $3, avaliacao = $4, data_atualizacao = CURRENT_TIMESTAMP 
           WHERE id = $5 
           RETURNING *`,
          [nome, tipo, mensagem, avaliacao, depoimentoExistente.id]
        );
        
        res.status(200).json({
          message: 'Depoimento atualizado com sucesso! Aguarde aprovação.',
          depoimento: result.rows[0]
        });
      } else {
        // Criar novo depoimento
        const result = await pool.query(
          `INSERT INTO depoimentos (nome, tipo, mensagem, avaliacao, usuario_id, aprovado, data_depoimento, data_atualizacao) 
           VALUES ($1, $2, $3, $4, $5, false, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) 
           RETURNING *`,
          [nome, tipo, mensagem, avaliacao, usuario_id || null]
        );
        
        res.status(201).json({
          message: 'Depoimento enviado com sucesso! Aguarde aprovação.',
          depoimento: result.rows[0]
        });
      }
    } catch (error) {
      console.error('Erro ao criar/atualizar depoimento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Aprovar depoimento (apenas admin)
  async approveDepoimento(req, res) {
    const { id } = req.params;
    
    try {
      const result = await pool.query(
        'UPDATE depoimentos SET aprovado = true WHERE id = $1 RETURNING *',
        [id]
      );
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Depoimento não encontrado' });
      }
      
      res.json({ message: 'Depoimento aprovado com sucesso', depoimento: result.rows[0] });
    } catch (error) {
      console.error('Erro ao aprovar depoimento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Buscar depoimentos pendentes (apenas admin)
  async getDepoimentosPendentes(req, res) {
    try {
      const result = await pool.query(
        `SELECT id, nome, tipo, mensagem, avaliacao, data_depoimento, usuario_id 
         FROM depoimentos 
         WHERE aprovado = false 
         ORDER BY data_depoimento DESC`
      );
      
      res.json(result.rows);
    } catch (error) {
      console.error('Erro ao buscar depoimentos pendentes:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  },

  // Deletar depoimento (apenas admin)
  async deleteDepoimento(req, res) {
    const { id } = req.params;
    
    try {
      const result = await pool.query('DELETE FROM depoimentos WHERE id = $1 RETURNING *', [id]);
      
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Depoimento não encontrado' });
      }
      
      res.json({ message: 'Depoimento deletado com sucesso' });
    } catch (error) {
      console.error('Erro ao deletar depoimento:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
};