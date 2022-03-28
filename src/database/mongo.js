//mongo
const Util = require('../util/util');
const cfg = require('../configs/configs');
const mongoose = require('mongoose');
const mongooseSerial = require('mongoose-serial');

// logs
const CustomObjSchema = new mongoose.Schema({}, { strict: false });
CustomObjSchema.plugin(mongooseSerial, { field: 'customId' });
const msgDescartada = mongoose.model('logRejected', CustomObjSchema);
const msgUser = mongoose.model('logUsers', CustomObjSchema);
const msgChatbot = mongoose.model('logChatbot', CustomObjSchema);
const debug = mongoose.model('logDebug', CustomObjSchema);

// cadastro de usuários
const UsuarioObjSchema = new mongoose.Schema({
    nome: { type: String },
    sobrenome: { type: String },
    nomeAuto: { type: String },
    tel: { type: String },
    endereco: { type: String },
}, { strict: false });
const usuariosCadastrados = mongoose.model('users', UsuarioObjSchema);

// tabela de pedidos
const pedidos = mongoose.model('pedido', CustomObjSchema);

// eslint-disable-next-line no-unused-vars
const mongo = module.exports = {
    msgDescartada,
    msgUser,
    msgChatbot,
    debug,
    usuariosCadastrados,
    pedidos
};

// const mongoString = `mongodb://${DB_USER}:${DB_PASS}@${DB_IP}:${DB_PORT}/${DB_DATABASE}`;
mongoose.connect(`mongodb://${cfg.mongo.ip}/${cfg.mongo.database}`, { autoIndex: false }, (err) => {
    if (err) {
        Util.logError(`Erro ao iniciar mongo -> ${err}`);
        throw new Error(`Erro ao iniciar mongo -> ${err}`);
    }
});
Util.logSucess('[DATABASE] Mongoose iniciado');