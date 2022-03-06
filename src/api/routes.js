// controllers
const pedidoController = require('./controllers/pedidos');
const googleController = require('./controllers/google');
const whatsappController = require('./controllers/whatsapp');
const contatoController = require('./controllers/contatos');

// associação de rotas
async function routes(fastify, options, done) {

    // ------------- CONTATOS -------------
    fastify.get('/contato', contatoController.getContatos);
    fastify.put('/contato/:tel', contatoController.putContato);

    // ------------- PEDIDOS -------------
    fastify.get('/pedido', pedidoController.getPedidos);
    fastify.get('/pedido/:id', pedidoController.getPedido);
    fastify.post('/pedido', pedidoController.criaPedido);
    fastify.post('/printPedido', pedidoController.printPedido);
    fastify.put('/pedido/:id', pedidoController.putPedido);
    // fastify.delete('/pedido/:id',);

    // ------------- Genéricas -------------
    fastify.post('/cardapio', googleController.cardapio);
    fastify.post('/configs', googleController.configs);
    fastify.post('/sendMessage', whatsappController.sendMessage);

    done();
}

module.exports = routes;