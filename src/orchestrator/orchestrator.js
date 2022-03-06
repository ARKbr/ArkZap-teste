const { MessageTypes, MessageMedia, Buttons, List, Location } = require('whatsapp-web.js');
const axios = require('axios').default;
const { msgDescartada, msgUser, msgChatbot, usuariosCadastrados: bdUsers } = require('../database/mongo');
const Util = require('../util/util');
const cfg = require('../configs/configs');
const DefaultLogic = require('../skills/default');

let CustomLogic;
if (cfg.logics.custom_skill != 'false') {
    CustomLogic = require(`../skills/${cfg.logics.custom_skill}.js`);
}

// // associa evento de mensagem a função
// client.on('message', onMessage);

// lógica executada ao receber mensagem
async function onMessage(client, mensagemUsuario) {

    //#region -------------- MSG Descartada --------------
    // caso for de tipos que não interessam
    switch (mensagemUsuario.type) {
    case MessageTypes.TEXT:
    case MessageTypes.BUTTONS_RESPONSE:
    case MessageTypes.LIST_RESPONSE:
    case MessageTypes.CIPHERTEXT:
    case MessageTypes.AUDIO:
    case MessageTypes.VOICE:
    case MessageTypes.STICKER:
    case MessageTypes.VIDEO:
    case MessageTypes.IMAGE:
    case MessageTypes.CONTACT_CARD:
    case MessageTypes.DOCUMENT:
    case MessageTypes.LOCATION:
        break;
    default: {
        if (cfg.global.full_logs) await msgDescartada.create(mensagemUsuario);
        Util.logWarning(`[ORCHESTRATOR] Mensagem do tipo ${mensagemUsuario.type} recebida de ${mensagemUsuario.from}, descartada`);
        return;
    }
    }

    // caso for mensagem de broadcast
    if (mensagemUsuario.from.includes('broadcast') || mensagemUsuario.broadcast) {
        if (cfg.global.full_logs) await msgDescartada.create(mensagemUsuario);
        Util.logWarning(`[ORCHESTRATOR] Mensagem do tipo ${mensagemUsuario.type} recebida de ${mensagemUsuario.from}, rejeitada broadcast`);
        return;
    }

    // caso for mensagem de grupo, sai do grupo
    const chat = await mensagemUsuario.getChat();
    if (chat.isGroup) {
        if (cfg.global.full_logs) await msgDescartada.create(mensagemUsuario);
        Util.logWarning(`[ORCHESTRATOR] Mensagem do tipo ${mensagemUsuario.type} recebida do grupo ${mensagemUsuario.from}, saindo do grupo`);
        chat.leave();
        return;
    }

    //#endregion

    //#region -------------- MSG Normal --------------
    Util.log(`[ORCHESTRATOR] Mensagem do tipo ${mensagemUsuario.type} recebida de ${mensagemUsuario.from}`);
    Util.emitLog(`Mensagem de ${mensagemUsuario.from.substring(2).replace('@c.us', '')}`);
    if (cfg.global.full_logs) await msgUser.create(mensagemUsuario);

    // cria ou atualiza contato
    const contact = await mensagemUsuario.getContact();
    const where = { tel: mensagemUsuario.from };
    const data = { nomeAuto: contact.pushname };
    await bdUsers.updateOne(where, data, { upsert: true })
        .then(() => { Util.log(`[ORCHESTRATOR] Contato atualizado ${mensagemUsuario.from} nomeAuto ${contact.pushname}`); })
        .catch(err => { Util.logError(`[ORCHESTRATOR] Erro no upsert de contato -> ${err}`); });

    // identifica tipo de resposta
    switch (mensagemUsuario.type) {

    case MessageTypes.TEXT:
    case MessageTypes.BUTTONS_RESPONSE:
    case MessageTypes.LIST_RESPONSE:
    case MessageTypes.CIPHERTEXT:
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

    try {

        const chat = await _msg.getChat();
        await chat.sendStateTyping();

        //#region -------------- Autenticação no BOT --------------
        const botAuthURL = `http://${cfg.botpress.url}/api/v1/auth/login/basic/default`;
        const botAuthBody = { email: cfg.botpress.login, password: cfg.botpress.pass };
        let [response, err] = await Util.encapsulaPost(axios.post, botAuthURL, botAuthBody);

        if (err) {
            Util.logError(`[ORCHESTRATOR] Erro na autenticação do bot -> ${err}`);
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
            Util.logError(`[ORCHESTRATOR] Erro na resposta do bot -> ${error}`);
            await _msg.reply('Ocorreu um erro de resposta no meu servidor :X, entre em contato com o suporte técnico por gentileza');
            return;
        }

        // log no banco

        if (cfg.global.full_logs) await msgChatbot.create(resposta_bot.data)
            .catch((err) => Util.logError(`[ORCHESTRATOR] Erro insert chatbot mongo -> ${err}`));

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
                    .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de texto -> ${err}`));
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
                        .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de btns -> ${err}`));
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
                        .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de listas -> ${err}`));
                }

                break;
            }

            // resposta de imagem
            // caso "typing" for true, manda como figurinha
            case 'image': {
                const media = await MessageMedia.fromUrl(element.image.replace(cfg.botpress.media_url, cfg.botpress.url));
                if (element.typing) {
                    await _client.sendMessage(_msg.from, media, { sendMediaAsSticker: true, stickerAuthor: 'ArkBot', stickerName: element.title })
                        .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de img figurinhas -> ${err}`));
                }
                else {
                    await _client.sendMessage(_msg.from, media, { caption: element.title })
                        .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de imagens -> ${err}`));
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
                        .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de video figurinhas -> ${err}`));
                }
                else if (element.typing) {
                    await _client.sendMessage(_msg.from, media, { caption: element.title, sendVideoAsGif: true })
                        .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de video gif -> ${err}`));
                }
                else {
                    await _client.sendMessage(_msg.from, media, { caption: element.title })
                        .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de video -> ${err}`));
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
                    .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de cards -> ${err}`));
                break;
            }

            // resposta de audio
            case 'audio': {
                const media = await MessageMedia.fromUrl(element.audio.replace(cfg.botpress.media_url, cfg.botpress.url));
                await _client.sendMessage(_msg.from, media)
                    .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de audio -> ${err}`));
                break;
            }

            // resposta de localização
            case 'location': {
                await _client.sendMessage(_msg.from, new Location(element.latitude, element.longitude, element.title))
                    .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de location -> ${err}`));
                break;
            }

            // resposta de arquivo
            case 'file': {
                let media = await MessageMedia.fromUrl(element.file.replace(cfg.botpress.media_url, cfg.botpress.url));
                media.filename = element.title;
                await _client.sendMessage(_msg.from, media)
                    .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de arquivo -> ${err}`));
                break;
            }

            default:
                break;

            }

            await Util.sleep(Number(cfg.global.delay_min), Number(cfg.global.delay_max));
        }
        //#endregion

        //#region -------------- Actions do bot --------------

        // action de lista
        if (resposta_bot.data.state.session.action == 'list') {
            const params = resposta_bot.data.state.session.actionParams;
            await _client.sendMessage(_msg.from, new List(params.description, params.btnTitle, params.sections, params.title, ''))
                .catch(err => Util.logError(`[ORCHESTRATOR] Erro na resposta de action lista -> ${err}`));

        }
        //#endregion

        Util.log(`[ORCHESTRATOR] Mensagem de ${_msg.from} do tipo ${_msg.type} respondida`);

    } catch (err) {
        Util.logError(`[ORCHESTRATOR] Erro ao responder mensagem de texto -> ${err}`);
    }
}

module.exports = {
    onMessage
};