const path = require('path');
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
        const media = MessageMedia.fromFilePath(path.join(__dirname, '..', '..', '\\assets\\audio.mp3'));
        await _msg.reply(media);
    } catch (err) {
        Util.logError(`[SKILL] Erro na resposta padrão de audio -> ${err}`);
        await _msg.reply('Não consegui processar seu áudio 😵')
            .catch(err => Util.logError(`[SKILL] Erro na reply de audio -> ${err}`));
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
        const media = MessageMedia.fromFilePath(path.join(__dirname, '..', '..', '\\assets\\video.mp4'));
        await _client.sendMessage(_msg.from, media, {
            sendMediaAsSticker: true,
            stickerName: 'Seu Vídeo',
            stickerAuthor: 'ArkBot'
        });
    } catch (err) {
        Util.logError(`[SKILL] Erro na resposta padrão de sticker -> ${err}`);
        await _msg.reply('Não consegui processar sua figurinha 😵')
            .catch(err => Util.logError(`[SKILL] Erro na reply de sticker -> ${err}`));
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

        } catch (err) {
            Util.logError(`[SKILL] Erro na resposta padrão de video -> ${err}`);
            await _msg.reply('Não consegui processar seu vídeo 😵')
                .catch(err => Util.logError(`[SKILL] Erro na reply de video -> ${err}`));
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
        Util.logError(`[SKILL] Erro na resposta padrão de imagem -> ${err}`);
        await _msg.reply('Não consegui processar sua imagem 😵')
            .catch(err => Util.logError(`[SKILL] Erro na reply de imagem -> ${err}`));
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
        Util.logError(`[SKILL] Erro na resposta padrão de contato -> ${err}`);
        await _msg.reply('Não consegui processar seu contato 😵')
            .catch(err => Util.logError(`[SKILL] Erro na reply de contato -> ${err}`));
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
            await _msg.reply(`Acho que seu endereço é ${address.results[0].formatted}`);
        } else {
            await _msg.reply('Não encontrei seu endereço :/');
        }
    } catch (err) {
        Util.logError(`[SKILL] Erro na resposta padrão de location -> ${err}`);
        await _msg.reply('Não consegui processar sua localização 😵')
            .catch(err => Util.logError(`[SKILL] Erro na reply de location -> ${err}`));
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
        Util.logError(`[SKILL] Erro na resposta padrão de documento -> ${err}`);
        await _msg.reply('Não consegui processar seu documento 😵')
            .catch(err => Util.logError(`[SKILL] Erro na reply de documento -> ${err}`));
    }
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
