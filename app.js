// ------------------------ imports ------------------------
// dotenv
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '\\.env' });
const cfg = require('./configs/configs');

// whatsapp
const qrcode = require('qrcode-terminal');
const { Client, Buttons, MessageMedia } = require('whatsapp-web.js');
const SESSION_FILE_PATH = 'session.json';
let client;

// gerais
const fs = require('fs');
const Util = require('./util/util');
const axios = require('axios').default;

console.log('Configs -> ', JSON.stringify(cfg));

// const Vcard = 'BEGIN:VCARD\n' +
//     'VERSION:3.0\n' +
//     'N;CHARSET=UTF-8:Coelho;Claudia;Borges;;\n' +
//     'TITLE;CHARSET=UTF-8:Fotógrafa\n' +
//     'FN:Claudia Borges Coelho\n' +
//     'ORG;CHARSET=UTF-8:Studio Claudia Coelho\n' +
//     'TEL;type=CELL;waid=553791929622:+55 37 9192-9622\n' +
//     'END:VCARD';

// --------------------------- início da aplicação
(async () => {

    let sessionData;
    if (fs.existsSync(SESSION_FILE_PATH)) {
        sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH));
        Util.log('WPP - Configurações importdas');
    }

    client = new Client({
        puppeteer: { headless: cfg.global.pupp_headless, executablePath: cfg.global.pupp_path },
        session: sessionData,
    });

    client.on('qr', qr => {
        qrcode.generate(qr, { small: true });
    });

    // Save session values to the file upon successful auth
    client.on('authenticated', (session) => {
        sessionData = session;
        fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
            if (err) {
                console.error('Erro ao salvar arquivo de auth -> ', err);
            }
        });

        Util.logSucess('WPP - Autenticado');
    });
    
    client.on('ready', () => {
        Util.logSucess('WPP - Client OK');
    });

    // client.on('message_revoke_everyone', async (after, before) => {
    //     // Fired whenever a message is deleted by anyone (including you)
    //     console.log('Alguem apagou uma mensagem! Agora ficou -> ', after); // message after it was deleted.
    //     if (before) {
    //         console.log('Antes era: ', before); // message after it was deleted.
    //         console.log(before); // message before it was deleted.
    //     }
    // });

    // adicionar regra para envio de mensagem para ADMIN
    // client.on('change_battery', (batteryInfo) => {
    //     // Battery percentage for attached device has changed
    //     const { battery, plugged } = batteryInfo;
    //     console.log(`Bateria em ${battery}% - Está carregando? ${plugged ? 'sim' : 'não'}`);
    // });

    // client.on('change_state', state => {
    //     console.log('Mudança de estado para ', state);
    // });

    client.on('disconnected', (reason) => {
        Util.logWarning(`WPP - Desconectado! Motivo -> ${reason}`);
    });

    client.on('message', onMessage);

    client.initialize();

})();

// lógica executada ao receber mensagem
async function onMessage(mensagemUsuario) {

    // console.log(`Mensagem recebida de ${mensagemUsuario.from} -> ${mensagemUsuario.body}`);
    // console.log('\n Mensagem do whats -> ', mensagemUsuario);

    // let mensagensResposta = [];

    // // informações do contato
    // const contact = await mensagemUsuario.getContact();

    let msgBody = { type: 'text', text: mensagemUsuario.body };
    // let msgBody = { type: 'text', text: mensagemUsuario.body, nome: contact.pushname };
    // let msgBody = { payload: { text: mensagemUsuario.body } };

    if (mensagemUsuario.type == 'buttons_response') {
        msgBody = { type: 'text', text: mensagemUsuario.selectedButtonId };
    }

    // const botURL = `http://localhost:3555/api/v1/bots/${process.env.BOT_ID}/converse/${mensagemUsuario.from.replace(/(@c.us)/gi, '')}`;
    const botURL = `http://${process.env.BOTPRESS_BOT_URL}/api/v1/bots/${process.env.BOTPRESS_BOT_ID}/converse/${mensagemUsuario.from.replace(/(@c.us)/gi, '')}`;
    // let resposta_bot = await axios.post(botURL, msgBody)
    //     .catch(function (error) {
    //         console.log(error);
    //     });

    let [resposta_bot, error] = await encapsulaPost(axios.post, botURL, msgBody);
    if (error) {
        // console.log('\n Erro na resposta do bot -> ', error);
        console.log('\n url do bot -> ', botURL);
        return;
    }

    // console.log('\n Resposta do bot -> ', JSON.stringify(resposta_bot.data));

    // iterador das respostas
    for (let idx = 0; idx < resposta_bot.data.responses.length; idx ++) {
        const element = resposta_bot.data.responses[idx];

        if (element.type == 'text') {
            // mensagensResposta.push(element.text);

            console.log('mensagem de texto do bot -> ', element);
            await client.sendMessage(mensagemUsuario.from, element.text);
        }

        if (element.type == 'single-choice') {

            let btns = [];

            element.choices.forEach(el => {
                btns.push({ id: el.value, body: el.title });
            });

            // mensagensResposta.push(new Buttons(element.text, btns));
            await client.sendMessage(mensagemUsuario.from, new Buttons(element.text, btns));
        }
        
        if (element.type == 'image') {
            const media = await MessageMedia.fromUrl(element.image.replace(process.env.BOTPRESS_BOT_MEDIA_URL, process.env.BOTPRESS_BOT_URL));
            await client.sendMessage(mensagemUsuario.from, media, { caption: element.title });
            
            // mensagensResposta.push(media);
        }

        // const chat = await mensagemUsuario.getChat();
        // await chat.sendStateTyping();
        await Util.sleep(cfg.global.delay_min, cfg.global.delay_max);
        // await chat.sendStateTyping();
    }

    // devolve mensagem ao usuário
    // if (mensagensResposta.length > 0) {

    //     for (let index = 0; index < mensagensResposta.length; index ++) {
    //         await client.sendMessage(mensagemUsuario.from, mensagensResposta[index]);
    //         // await mensagemUsuario.reply(mensagensResposta[index]);
    //     }
    // }
}

// encapsula a promisse de post do axios
async function encapsulaPost(promisse, url, body) {
    try {
        const value = await promisse(url, body);
        return [value, null];
    } catch (error) {
        // console.log('Erro na promisse', error);
        return [null, error];
    }
}
