const client = require('../client/wpp');

async function routes(fastify, options) {

    fastify.get('/', async (request, reply) => {
        return { hello: 'world' };
    });

    fastify.post('/sendMessage', sendMessage);
}

// envia mensagem simples
async function sendMessage(request, reply) {

    // request.body.sendTo;
    // request.body.message;
    await client.sendMessage(request.body.sendTo, request.body.message)
        .then(data => {reply.code(200).send({ status: data });})
        .catch(err => {reply.code(500).send({ message:'Erro ao enviar mensagem', error: err });});
}
module.exports = routes;