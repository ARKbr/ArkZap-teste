/**
 * Lógicas para demonstração do chabot
 */

const { MessageMedia } = require('whatsapp-web.js');
const opencage = require('opencage-api-client');
const Util = require('../util/util');

/**
 * Responde mensagens do tipo audio
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerAudio(_client, _msg) {
    try {
        const media = MessageMedia.fromFilePath(__dirname + '\\audio.mp3');
        await _msg.reply(media);
    } catch (err) {
        Util.logError('erro na resposta padrão de audio -> ', err);
        _msg.reply('Não consegui processar seu áudio 😵')
            .catch(err => Util.logError('Erro na reply de audio -> ', err));
    }
}

/**
 * Responde mensagens do tipo sticker
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerSticker(_client, _msg) {
    try {
        const media = MessageMedia.fromFilePath(__dirname + '\\video.mp4');
        await _client.sendMessage(_msg.from, media, {
            sendMediaAsSticker: true,
            stickerName: 'Seu Vídeo',
            stickerAuthor: 'ArkBot'
        });
    } catch (err) {
        Util.logError('erro na resposta padrão de sticker -> ', err);
        _msg.reply('Não consegui processar sua figurinha 😵')
            .catch(err => Util.logError('Erro na reply de sticker -> ', err));
    }
}

/**
 * Responde mensagens do tipo video
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerVideo(_client, _msg) {
    if (_msg.hasMedia) {
        try {
            let video = await _msg.downloadMedia();

            // await _client.sendMessage(_msg.from, imag);
            await _client.sendMessage(_msg.from, video, {
                sendVideoAsGif: true,
                caption: '🌚'
            });

        } catch (error) {
            Util.logError('erro na resposta padrão de video -> ', error);
            _msg.reply('Não consegui processar seu vídeo 😵')
                .catch(err => Util.logError('Erro na reply de video -> ', err));
        }
    }
}

/**
 * Responde mensagens do tipo imagem
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */

async function answerImage(_client, _msg) {
    try {
        let image = await _msg.downloadMedia();
        await _client.sendMessage(_msg.from, image, {
            sendMediaAsSticker: true,
            stickerName: 'Sticker',
            stickerAuthor: 'Bot'
        });
    } catch (err) {
        Util.logError('erro na resposta padrão de imagem -> ', err);
        _msg.reply('Não consegui processar sua imagem 😵')
            .catch(err => Util.logError('Erro na reply de image -> ', err));
    }
}

/**
 * Responde mensagens do tipo contato
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerVCard(_client, _msg) {

    try {
        _client.sendMessage(_msg.from, Util.getVcard());
    } catch (err) {
        Util.logError('erro na resposta padrão de vcard -> ', err);
        _msg.reply('Não consegui processar seu contato 😵')
            .catch(err => Util.logError('Erro na reply de contato -> ', err));
    }

}

/**
 * Responde mensagens do tipo localização
 * 
 * @param {*} _client Classe Client global
 * @param {*} _msg Mensagem recebida pelo onMessage
 */
async function answerLocation(_client, _msg) {

    try {
        const address = await opencage.geocode({ q: `${_msg.location.latitude},${_msg.location.longitude}`, language: 'pt' });

        if (address.results.length > 0) {
            _msg.reply(`Acho que seu endereço é ${address.results[0].formatted}`);
        } else {
            _msg.reply('Não encontrei seu endereço :/');
        }
    } catch (err) {
        Util.logError('erro na resposta padrão de location -> ', err);
        _msg.reply('Não consegui processar sua localização 😵')
            .catch(err => Util.logError('Erro na reply de local -> ', err));
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

    try {
        const attachmentData = await _msg.downloadMedia();

        const fileData = '*Dados do seu arquivo:* \n' +
            `Tipo: ${attachmentData.mimetype} \n` +
            `Nome: ${attachmentData.filename} \n` +
            `Tamanho dos dados: ${attachmentData.data.length}`;
    
        _msg.reply(fileData);
    } catch (err) {
        Util.logError('erro na resposta padrão de documento -> ', err);
        _msg.reply('Não consegui processar seu documento 😵')
            .catch(err => Util.logError('Erro na reply de documento -> ', err));
    }
}

module.exports = {
    answerAudio,
    answerDocument,
    answerImage,
    answerLocation,
    answerSticker,
    answerVCard,
    answerVideo,
};
