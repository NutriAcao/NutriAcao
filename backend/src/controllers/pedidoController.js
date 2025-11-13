import { buscarPedidosDisponiveisParaEmpresa } from '../model/doacoesONGModel.js';
export async function getPedidosDisponiveis(req, res) {
    try {
        const pedidos = await buscarPedidosDisponiveisParaEmpresa();
        res.status(200).json(pedidos);
    } catch (error) {
        console.error('Erro no controller getPedidosDisponiveis:', error);
        res.status(500).json({ message: 'Erro interno ao buscar pedidos disponíveis.' });
    }
}