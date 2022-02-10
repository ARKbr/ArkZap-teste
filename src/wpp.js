const { MessageMedia, MessageTypes } = require('whatsapp-web.js');
const opencage = require('opencage-api-client');
const Util = require('../util/util');

/**
 * Valida se a mensagem é passível de resposta
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 * @returns bool
 */
async function validadeMessage(_client, _msg) {
    // caso for de tipos que não interessam, descarta
    switch (_msg.type) {
    case MessageTypes.CONTACT_CARD_MULTI:
    case MessageTypes.REVOKED:
    case MessageTypes.ORDER:
    case MessageTypes.PRODUCT:
    case MessageTypes.PAYMENT:
    case MessageTypes.UNKNOWN:
    case MessageTypes.GROUP_INVITE:
    case 'e2e_notification':
    case 'ciphertext':
        Util.log(`Rejeição ${_msg.type} from ${_msg.from}`);
        return false;
    }

    // caso for mensagem de broadcast
    if (_msg.from.contains('broadcast') || _msg.broadcast) {
        Util.log(`Rejeição ${_msg.type} from ${_msg.from}`);
        return false;
    }

    // caso for mensagem de grupo
    const chat = await _msg.getChat();
    if (chat.isGroup) {
        Util.log(`Rejeição ${_msg.type} do grupo ${_msg.from}, saindo do grupo`);
        chat.leave();
    }

    // caso passar em todas validações
    return true;

}

/**
 * Responde mensagens do tipo texto
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerText(_client, _msg) {
    await _msg.reply(`${_msg.body} :)`);
}

/**
 * Responde mensagens do tipo audio
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerAudio(_client, _msg) {
    _msg.reply('Ainda não sei lidar com áudios 😕');
}

/**
 * Responde mensagens do tipo sticker
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerSticker(_client, _msg) {
    _msg.reply('Ainda não sei lidar com figurinhas 😕');
    // const media = MessageMedia.fromFilePath(__dirname + '\\hmm.mp4');
    // await _client.sendMessage(_msg.from, media, {
    //     sendMediaAsSticker: true,
    //     stickerName: 'Hmmm',
    //     stickerAuthor: 'Bot'
    // });
}

/**
 * Responde mensagens do tipo video
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerVideo(_client, _msg) {
    _msg.reply('Ainda não sei lidar com imagens 😕');
    // if (_msg.hasMedia) {

    //     try {
    //         let video = await _msg.downloadMedia();

    //         // await _client.sendMessage(_msg.from, imag);
    //         await _client.sendMessage(_msg.from, video, {
    //             sendVideoAsGif: true,
    //             caption: '🌚'
    //         });

    //     } catch (error) {
    //         console.log('erro na resposta de video -> ', error);
    //         _msg.reply('Não consegui processar seu vídeo 😵');
    //     }
    // }
}

/**
 * Responde mensagens do tipo imagem
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerImage(_client, _msg) {
    _msg.reply('Ainda não sei lidar com imagens 😕');
    // let image = MessageMedia.fromFilePath(__dirname + '\\assets\\logo.png');
    // await _client.sendMessage(_msg.from, image, {
    //     sendMediaAsSticker: true,
    //     stickerName: 'ARK',
    //     stickerAuthor: 'ARK Bot'
    // });
}

/**
 * Responde mensagens do tipo contato
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerVCard(_client, _msg) {
    _msg.reply('Ainda não sei lidar com contatos 😕');
    // const Vcard = 'BEGIN:VCARD\n' +
    //     'VERSION:3.0\n' +
    //     'FN:Leonardo (ARKBOT)\n' +
    //     'TEL;type=CELL;waid=553791984628:+55 37 9198-4628\n' +
    //     'END:VCARD';

    // _client.sendMessage(_msg.from, Vcard);
}

/**
 * Responde mensagens do tipo localização
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerLocation(_client, _msg) {
    const address = await opencage.geocode({ q: `${_msg.location.latitude},${_msg.location.longitude}`, language: 'pt' }).catch(err => console.log('geocoding error', err.message));

    if (address.results.length > 0) {
        _msg.reply(`Acho que seu endereço é ${address.results[0].formatted}`);
    } else {
        _msg.reply('Não encontrei seu endereço :/');
    }

    // msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
}

/**
 * Responde mensagens do tipo documento
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerDocument(_client, _msg) {

    _msg.reply('Ainda não sei lidar com documentos 😕');
    // const attachmentData = await _msg.downloadMedia();
    // _msg.reply(`
    //         *Dados do seu arquivo*
    //         MimeType: ${attachmentData.mimetype}
    //         Nome: ${attachmentData.filename}
    //         Tamanho dos dados: ${attachmentData.data.length}
    //     `);
}

module.exports = {
    answerAudio,
    answerDocument,
    answerImage,
    answerLocation,
    answerSticker,
    answerText,
    answerVCard,
    answerVideo,
    validadeMessage
};