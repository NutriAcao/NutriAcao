// backend/src/controllers/doacaoDetalhesController.js
import { 
    buscarDetalhesExcedente,
    buscarDetalhesSolicitacao 
} from '../model/doacoesEmpresaModel.js';

/**
 * Rota unificada para buscar detalhes de excedentes ou pedidos.
 * @param {object} req - Requisição.
 * @param {object} req.params - Deve conter 'tipo' ('excedente' ou 'solicitacao') e 'id'.
 */
export async function getDetalhesDoacao(req, res) {
    const { tipo, id } = req.params;
    console.log('Tentando buscar detalhes para Tipo:', tipo, 'ID:', id);

    if (!id || !tipo) {
        return res.status(400).json({ message: 'ID e Tipo são obrigatórios.' });
    }

    try {
        let detalhes = null;

        if (tipo === 'excedente') {
            detalhes = await buscarDetalhesExcedente(id);
        } else if (tipo === 'solicitacao') {
            detalhes = await buscarDetalhesSolicitacao(id);
        } else {
            return res.status(400).json({ message: 'Tipo de detalhe inválido. Use "excedente" ou "solicitacao".' });
        }

        if (!detalhes) {
            return res.status(404).json({ message: 'Detalhes do item não encontrados.' });
        }

        res.status(200).json(detalhes);

    } catch (error) {
        console.error(`Erro ao buscar detalhes de ${tipo} ${id}:`, error);
        res.status(500).json({ message: 'Erro interno ao carregar detalhes.', error: error.message });
    }
}