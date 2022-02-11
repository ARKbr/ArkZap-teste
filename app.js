// ------------------------ imports ------------------------
// dotenv
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '\\.env' });
const cfg = require('./configs/configs');

/**
 * Lógicas de import de funções básicas
 * 
 * - se isdemo = true -> carrega wpp_demo.js pasta src
 * - se não, carrega wpp.js da pasta src
 * - caso for usar lógica personalizada, indicar nome do arquivo no .env
 * 
 */

let DefaultLogic, CustomLogic;
if (cfg.global.is_demo) {
    DefaultLogic = require('./src/wpp_demo');
}
else {
    DefaultLogic = require('./src/wpp');
}

if (cfg.logics.custom_skill) {
    CustomLogic = require(`./logic/${cfg.logics.custom_skill}.js`);
}

// whatsapp
const qrcode = require('qrcode-terminal');
const { Client, MessageTypes, MessageMedia, Buttons, List, Location } = require('whatsapp-web.js');
const SESSION_FILE_PATH = 'session.json';
let client;

// gerais
const fs = require('fs');
const Util = require('./util/util');
const axios = require('axios').default;

Util.log('Configs -> ', JSON.stringify(cfg));

//mongo
const mongoose = require('mongoose');
const CustomObjSchema = new mongoose.Schema({}, { strict: false });
const msgDescartada = mongoose.model('logRejected', CustomObjSchema);
const msgUser = mongoose.model('logUsers', CustomObjSchema);
const msgChatbot = mongoose.model('logChatbot', CustomObjSchema);

// const UsuarioObjSchema = new mongoose.Schema({ nome: { type: String }, tel: { type: String } }, { strict: false });
// const usuariosHabilitados = mongoose.model('users', UsuarioObjSchema);

// --------------------------- início da aplicação
(async () => {

    //#region -------------- MONGO Setup --------------

    // const mongoString = `mongodb://${DB_USER}:${DB_PASS}@${DB_IP}:${DB_PORT}/${DB_DATABASE}`;
    await mongoose.connect(`mongodb://${cfg.mongo.ip}/${cfg.mongo.database}`, { autoIndex: false })
        .then((data) => { Util.logSucess(`Mongo iniciado ${data}`); })
        .catch((err) => {
            Util.logError('Erro ao iniciar mongo -> ', err);
            throw new Error(`Erro ao iniciar mongo -> ${err}`);
        });

    //#endregion

    //#region -------------- WPP Setup --------------

    let sessionData;
    if (fs.existsSync(SESSION_FILE_PATH)) {
        sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH));
        Util.logSucess('WPP - Configurações importdas');
    }

    client = new Client({
        puppeteer: { headless: cfg.global.pupp_headless, executablePath: cfg.global.pupp_path },
        session: sessionData,
    });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) {
                Util.logError('Erro ao salvar arquivo de auth -> ', err);
            }
        });

        Util.logSucess('WPP - Autenticado');
    });

    client.on('ready', () => {
        Util.logSucess('WPP - Client OK');
    });

    client.on('message_revoke_everyone', async (after, before) => {
        // Fired whenever a message is deleted by anyone (including you)
        Util.log('Alguem apagou uma mensagem! Agora ficou -> ', after); // message after it was deleted.
        if (before) {
            Util.log('Antes era: ', before); // message after it was deleted.
        }
    });

    client.on('change_battery', (batteryInfo) => {
        // Battery percentage for attached device has changed
        const { battery, plugged } = batteryInfo;
        Util.log(`Bateria em ${battery}% - Está carregando? ${plugged ? 'sim' : 'não'}`);
    });

    client.on('change_state', state => {
        Util.log('Mudança de estado para ', state);
    });

    client.on('disconnected', (reason) => {
        Util.logWarning('Cliente fez logoff', reason);
    });

    client.on('message', onMessage);

    client.initialize();

    //#endregion

})();

// lógica executada ao receber mensagem
async function onMessage(mensagemUsuario) {

    //#region -------------- MSG Descartada --------------
    // caso for de tipos que não interessam
    switch (mensagemUsuario.type) {
    case MessageTypes.CONTACT_CARD_MULTI:
    case MessageTypes.REVOKED:
    case MessageTypes.ORDER:
    case MessageTypes.PRODUCT:
    case MessageTypes.PAYMENT:
    case MessageTypes.UNKNOWN:
    case MessageTypes.GROUP_INVITE:
    case 'e2e_notification': {

        await msgDescartada(mensagemUsuario).save();
        Util.logWarning(`Mensagem do tipo ${mensagemUsuario.type} recebida de ${mensagemUsuario.from}, descartada`);
        return;
    }
    }

    // caso for mensagem de broadcast
    if (mensagemUsuario.from.includes('broadcast') || mensagemUsuario.broadcast) {
        await msgDescartada(mensagemUsuario).save();
        Util.logWarning(`Mensagem do tipo ${mensagemUsuario.type} recebida de ${mensagemUsuario.from}, rejeitada broadcast`);
        return;
    }

    // caso for mensagem de grupo, sai do grupo
    const chat = await mensagemUsuario.getChat();
    if (chat.isGroup) {
        await msgDescartada(mensagemUsuario).save();
        Util.logWarning(`Mensagem do tipo ${mensagemUsuario.type} recebida do grupo ${mensagemUsuario.from}, saindo do grupo`);
        chat.leave();
        return;
    }

    //#endregion

    //#region -------------- MSG Normal --------------
    Util.log(`Mensagem do tipo ${mensagemUsuario.type} recebida`);
    await msgUser(mensagemUsuario).save();

    // identifica tipo de resposta
    switch (mensagemUsuario.type) {
    
    case MessageTypes.TEXT:
    case 'buttons_response':
    case 'list_response':
    case 'ciphertext':
        answerText(client, mensagemUsuario);
        break;

    case MessageTypes.AUDIO:
    case MessageTypes.VOICE: 
    {
        if (cfg.logics.custom_audio) {
            CustomLogic.answerAudio(client, mensagemUsuario);
        }
        else {
            DefaultLogic.answerAudio(client, mensagemUsuario);
        }
        break;
    }

    case MessageTypes.STICKER:
    {
        if (cfg.logics.custom_sticker) {
            CustomLogic.answerSticker(client, mensagemUsuario);
        }
        else {
            DefaultLogic.answerSticker(client, mensagemUsuario);
        }
        break;
    }

    case MessageTypes.VIDEO:
    {
        if (cfg.logics.custom_video) {
            CustomLogic.answerVideo(client, mensagemUsuario);
        }
        else {
            DefaultLogic.answerVideo(client, mensagemUsuario);
        }
        break;
    }

    case MessageTypes.IMAGE:
    {
        if (cfg.logics.custom_image) {
            CustomLogic.answerImage(client, mensagemUsuario);
        }
        else {
            DefaultLogic.answerImage(client, mensagemUsuario);
        }
        break;
    }

    case MessageTypes.CONTACT_CARD:
    {
        if (cfg.logics.custom_vcard) {
            CustomLogic.answerVCard(client, mensagemUsuario);
        }
        else {
            DefaultLogic.answerVCard(client, mensagemUsuario);
        }
        break;
    }

    case MessageTypes.LOCATION:
    {
        if (cfg.logics.custom_location) {
            CustomLogic.answerLocation(client, mensagemUsuario);
        }
        else {
            DefaultLogic.answerLocation(client, mensagemUsuario);
        }
        break;
    }

    case MessageTypes.DOCUMENT:
    {
        if (cfg.logics.custom_document) {
            CustomLogic.answerDocument(client, mensagemUsuario);
        }
        else {
            DefaultLogic.answerDocument(client, mensagemUsuario);
        }
        break;
    }

    }

    //#endregion
}

// envia mensagem de texto para o bot
async function answerText(_client, _msg) {

    //#region -------------- Autenticação no BOT --------------
    const botAuthURL = `http://${cfg.botpress.url}/api/v1/auth/login/basic/default`;
    const botAuthBody = { email: cfg.botpress.login, password: cfg.botpress.pass };
    let [response, err] = await Util.encapsulaPost(axios.post, botAuthURL, botAuthBody);

    if (err) {
        Util.logError('erro na autenticação do bot -> ', err);
        await _msg.reply('Ocorreu um erro de autenticação no meu servidor :X, entre em contato com o suporte técnico por gentileza');
        return;
    }
    //#endregion

    //#region -------------- Comunicação com o bot -------------
    // trata tipo de resposta a ser enviada para o bot 
    let botBody = { type: 'text', text: _msg.body };
    if (_msg.type == 'buttons_response') {
        botBody = { type: 'text', text: _msg.selectedButtonId };
    }
    if (_msg.type == 'list_response') {
        botBody = { type: 'text', text: _msg.selectedRowId };
    }
    if (_msg.type == 'ciphertext') {
        botBody = { type: 'text', text: 'ciphertext' };
    }

    // monta requisição
    const botURL = `http://${cfg.botpress.url}/api/v1/bots/${cfg.botpress.id}/converse/${_msg.from}/secured`;
    var reqOptions = {
        method: 'POST',
        url: botURL,
        headers: JSON.parse(`{"Content-Type" : "application/json", "Authorization": "Bearer ${response.data.payload.jwt}"}`),
        params: JSON.parse('{"include": "state"}'),
        data: botBody,
    };

    // envia requisição
    let [resposta_bot, error] = await Util.encapsulaPostCustom(axios.request, reqOptions);
    if (error) {
        Util.logError('Erro na resposta do bot -> ', error);
        await _msg.reply('Ocorreu um erro de resposta no meu servidor :X, entre em contato com o suporte técnico por gentileza');
        return;
    }

    // log no banco
    try {
        await msgChatbot(resposta_bot.data).save();

    } catch (err) {
        Util.logError('Erro insert chatbot mongo -> ', error);
    }
    //#endregion

    //#region -------------- Tratamento de respostas normais do bot --------------

    // iterador das respostas
    const respostasBot = resposta_bot.data.responses;
    for (let idx = 0; idx < respostasBot.length; idx ++) {
        const element = respostasBot[idx];

        switch (element.type) {

        // resposta de texto
        case 'text': {
            await _client.sendMessage(_msg.from, element.text)
                .catch(err => Util.logError('Erro na resposta de texto -> ', err));
            break;
        }

        // resposta de escolha
        case 'single-choice': {
            let btns = [];

            // renderizar btns
            if (element.choices.length <= 3) {

                element.choices.forEach(el => {
                    btns.push({ id: String(el.value), body: el.title });
                });
                await _client.sendMessage(_msg.from, new Buttons(element.text, btns))
                    .catch(err => Util.logError('Erro na resposta de btns -> ', err));
            }
            // renderizar lista caso tiver mais de 3 opções 
            else {
                element.choices.forEach(el => {
                    const titulo = el.title.split('###')[0];
                    const descricao = el.title.split('###')[1];
                    btns.push({ id: String(el.value), title: titulo, description: descricao });
                });

                let sections = [{
                    title: element.text, rows: btns
                }];

                await _client.sendMessage(_msg.from, new List(element.text, element.dropdownPlaceholder, sections, '', ''))
                    .catch(err => Util.logError('Erro na resposta de listas -> ', err));
            }

            break;
        }

        // resposta de imagem
        // caso "typing" for true, manda como figurinha
        case 'image': {
            const media = await MessageMedia.fromUrl(element.image.replace(cfg.botpress.media_url, cfg.botpress.url));
            if (element.typing) {
                await _client.sendMessage(_msg.from, media, { sendMediaAsSticker: true, stickerAuthor: 'ArkBot', stickerName: element.title })
                    .catch(err => Util.logError('Erro na resposta de img figurinhas -> ', err));
            }
            else {
                await _client.sendMessage(_msg.from, media, { caption: element.title })
                    .catch(err => Util.logError('Erro na resposta de imagens -> ', err));
            }
            break;
        }

        // resposta de video
        // caso "typing" for true, manda como gif
        // caso tiver ### no título, manda como sticker
        case 'video': {
            const media = await MessageMedia.fromUrl(element.video.replace(cfg.botpress.media_url, cfg.botpress.url));

            // identifica macro de figurinha
            const titulo = element.title.split('###')[0];
            const isSticker = element.title.split('###')[1];

            if (isSticker) {
                await _client.sendMessage(_msg.from, media, { sendMediaAsSticker: true, stickerAuthor: 'ArkBot', stickerName: titulo })
                    .catch(err => Util.logError('Erro na resposta de video figurinhas -> ', err));
            }
            else if (element.typing) {
                await _client.sendMessage(_msg.from, media, { caption: element.title, sendVideoAsGif: true })
                    .catch(err => Util.logError('Erro na resposta de video gif -> ', err));
            }
            else {
                await _client.sendMessage(_msg.from, media, { caption: element.title })
                    .catch(err => Util.logError('Erro na resposta de video -> ', err));
            }
            break;
        }
        
        // resposta de card (foto com botões)
        case 'card': {
            let btns = [];
            element.actions.forEach(el => {
                btns.push({ body: el.title, id: String(el.text) });
            });

            const media = await MessageMedia.fromUrl(element.image.replace(cfg.botpress.media_url, cfg.botpress.url));
            await _client.sendMessage(_msg.from, new Buttons(media, btns, element.title, element.title))
                .catch(err => Util.logError('Erro na resposta de cards -> ', err));
            break;
        }

        // resposta de audio
        case 'audio': {
            const media = await MessageMedia.fromUrl(element.audio.replace(cfg.botpress.media_url, cfg.botpress.url));
            await _client.sendMessage(_msg.from, media)
                .catch(err => Util.logError('Erro na resposta de audio -> ', err));
            break;
        }

        // resposta de localização
        case 'location': {
            await _client.sendMessage(_msg.from, new Location(element.latitude, element.longitude, element.title))
                .catch(err => Util.logError('Erro na resposta de location -> ', err));
            break;
        }

        // resposta de arquivo
        case 'file': {
            let media = await MessageMedia.fromUrl(element.file.replace(cfg.botpress.media_url, cfg.botpress.url));
            media.filename = element.title;
            await _client.sendMessage(_msg.from, media)
                .catch(err => Util.logError('Erro na resposta de arquivo -> ', err));
            break;
        }

        default:
            break;

        }

        // const chat = await mensagemUsuario.getChat();
        // await chat.sendStateTyping();
        await Util.sleep(Number(cfg.global.delay_min), Number(cfg.global.delay_max));
        // await chat.sendStateTyping();
    }
    //#endregion

    //#region -------------- Actions do bot --------------

    // action de lista
    if (resposta_bot.data.state.session.action == 'list') {
        const params = resposta_bot.data.state.session.actionParams;
        await _client.sendMessage(_msg.from, new List(params.description, params.btnTitle, params.sections, params.title, ''))
            .catch(err => Util.logError('Erro na resposta de action lista -> ', err));

    }
    //#endregion

}
