/**
 * Lógicas padrão do chabot para mensagens que naão são de texto
 */
const Util = require('../util/util');

/**
 * Responde mensagens do tipo audio
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerAudio(_client, _msg) {
    await _msg.reply('Ainda não sei lidar com áudios 😕')
        .catch(err => Util.logError('[SKILL] Erro na resposta padrão de audio -> ', err));
}

/**
 * Responde mensagens do tipo sticker
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerSticker(_client, _msg) {
    await _msg.reply('Ainda não sei lidar com figurinhas 😕')
        .catch(err => Util.logError('[SKILL] Erro na resposta padrão de sticker -> ', err));
}

/**
 * Responde mensagens do tipo video
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerVideo(_client, _msg) {
    await _msg.reply('Ainda não sei lidar com vídeos 😕')
        .catch(err => Util.logError('[SKILL] Erro na resposta padrão de video -> ', err));
}

/**
 * Responde mensagens do tipo imagem
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerImage(_client, _msg) {
    await _msg.reply('Ainda não sei lidar com imagens 😕')
        .catch(err => Util.logError('[SKILL] Erro na resposta padrão de imagem -> ', err));
}

/**
 * Responde mensagens do tipo contato
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerVCard(_client, _msg) {
    await _msg.reply('Ainda não sei lidar com contatos 😕')
        .catch(err => Util.logError('[SKILL] Erro na resposta padrão de contato -> ', err));
}

/**
 * Responde mensagens do tipo localização
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerLocation(_client, _msg) {
    await _msg.reply('Ainda não sei lidar com localizações 😕')
        .catch(err => Util.logError('[SKILL] Erro na resposta padrão de local -> ', err));
    // msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
}

/**
 * Responde mensagens do tipo documento
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerDocument(_client, _msg) {
    await _msg.reply('[SKILL] Ainda não sei lidar com documentos 😕')
        .catch(err => Util.logError('[SKILL] Erro na resposta padrão de local -> ', err));
}

// eslint-disable-next-line no-unused-vars
const skill = module.exports = {
    answerAudio,
    answerDocument,
    answerImage,
    answerLocation,
    answerSticker,
    answerVCard,
    answerVideo,
};