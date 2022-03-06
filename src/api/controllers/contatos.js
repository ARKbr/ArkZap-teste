const Util = require('../../util/util');
const { usuariosCadastrados: dbUsers } = require('../../database/mongo');

// nome: { type: String },
// sobrenome: { type: String },
// nomeAuto: { type: String },
// tel: { type: String },

// busca todos contatos
async function getContatos(request, reply) {
    try {
        const contatos = await dbUsers.find();
        reply.code(200).send(contatos);
    } catch (err) {
        Util.logError(`[API] ERRO CONTATO -> getContatos -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// cria ou atualiza contato
async function putContato(request, reply) {
    try {
        const where = { tel: request.params.tel };
        const data = request.body.contato;
        const options = { upsert: true };
        const contato = await dbUsers.updateOne(where, data, options);
        reply.code(200).send(contato);
    } catch (err) {
        Util.logError(`[API] ERRO CONTATO -> postContato -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// eslint-disable-next-line no-unused-vars
const ctt = module.exports = {
    putContato,
    getContatos
};
