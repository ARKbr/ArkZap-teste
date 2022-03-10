const client = require('../../client/wpp');
const Util = require('../../util/util');

// envia mensagem simples
async function sendMessage(request, reply) {
    try {

        Util.logWarning(`Enviando mensagem para ${request.body.sendTo}`);
        const status = await client.sendMessage(request.body.sendTo, request.body.message);
        reply.code(200).send(status);
    } catch (err) {
        Util.logError(`[API] Erro na rota POST - sendMessage -> ${err.message}`);
        reply.code(500).send({ message: 'Erro ao enviar mensagem', error: err });
    }
}

// eslint-disable-next-line no-unused-vars
const wpp = module.exports = {
    sendMessage
};