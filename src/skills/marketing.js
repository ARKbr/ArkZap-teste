/**
 * Adicionar lógica de respostas de marketing para envio de midias sobre a empresa
 * 
 * (possívelmente futuro padrão)
 */
const { MessageMedia } = require('whatsapp-web.js');

// maps
const opencage = require('opencage-api-client');

async function answerAudio(_client, _msg) {
    _msg.reply('Ainda não sei lidar com áudios 😕');
}

async function answerSticker(_client, _msg) {
    _msg.reply('Ainda não sei lidar com figurinhas 😕');
    // const media = MessageMedia.fromFilePath(__dirname + '\\hmm.mp4');
    // await _client.sendMessage(_msg.from, media, {
    //     sendMediaAsSticker: true,
    //     stickerName: 'Hmmm',
    //     stickerAuthor: 'Bot'
    // });
}

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

async function answerImage(_client, _msg) {
    _msg.reply('Ainda não sei lidar com imagens 😕');
    // let image = MessageMedia.fromFilePath(__dirname + '\\assets\\logo.png');
    // await _client.sendMessage(_msg.from, image, {
    //     sendMediaAsSticker: true,
    //     stickerName: 'ARK',
    //     stickerAuthor: 'ARK Bot'
    // });
}

async function answerVCard(_client, _msg) {
    _msg.reply('Ainda não sei lidar com contatos 😕');
    // const Vcard = 'BEGIN:VCARD\n' +
    //     'VERSION:3.0\n' +
    //     'FN:Leonardo (ARKBOT)\n' +
    //     'TEL;type=CELL;waid=553791984628:+55 37 9198-4628\n' +
    //     'END:VCARD';

    // _client.sendMessage(_msg.from, Vcard);
}

async function answerLocation(_client, _msg) {
    const address = await opencage.geocode({ q: `${_msg.location.latitude},${_msg.location.longitude}`, language: 'pt' }).catch(err => console.log('geocoding error', err.message));

    if (address.results.length > 0) {
        _msg.reply(`Acho que seu endereço é ${address.results[0].formatted}`);
    } else {
        _msg.reply('Não encontrei seu endereço :/');
    }

    // msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
}

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
    answerVideo
};