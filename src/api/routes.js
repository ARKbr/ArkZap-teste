const fs = require('fs');
const path = require('path');

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
    
    fastify.post('/aceitapedido/:id', pedidoController.aceitaPedido);
    // fastify.post('/recusapedido/:id', pedidoController.recusaPedido);

    // fastify.delete('/pedido/:id',);

    // ------------- Genéricas -------------
    fastify.post('/cardapio', googleController.cardapio);
    fastify.post('/configs', googleController.configs);
    fastify.post('/sendMessage', whatsappController.sendMessage);

    fastify.get('/testehtml', (req, reply) => {
        const htmlpath = path.resolve(__dirname, '../', './assets/teste.html');
        const stream = fs.createReadStream(htmlpath);
        reply.type('text/html').send(stream);
    });

    done();
}

module.exports = routes;