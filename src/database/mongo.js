//mongo
const mongoose = require('mongoose');
const Util = require('../util/util');
const cfg = require('../configs/configs');

const CustomObjSchema = new mongoose.Schema({}, { strict: false });
const msgDescartada = mongoose.model('logRejected', CustomObjSchema);
const msgUser = mongoose.model('logUsers', CustomObjSchema);
const msgChatbot = mongoose.model('logChatbot', CustomObjSchema);

// const UsuarioObjSchema = new mongoose.Schema({ nome: { type: String }, tel: { type: String } }, { strict: false });
// const usuariosHabilitados = mongoose.model('users', UsuarioObjSchema);

// const mongoString = `mongodb://${DB_USER}:${DB_PASS}@${DB_IP}:${DB_PORT}/${DB_DATABASE}`;
mongoose.connect(`mongodb://${cfg.mongo.ip}/${cfg.mongo.database}`, { autoIndex: false }, (err) => {
    if (err) {

        Util.logError(`Erro ao iniciar mongo -> ${err}`);
        throw new Error(`Erro ao iniciar mongo -> ${err}`);
    }
});
Util.logSucess('Mongoose iniciado');

// mongoose.initialize = async () => {

// };

module.exports = {
    msgDescartada,
    msgUser,
    msgChatbot
};