// whatsapp
const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const fs = require('fs');

const cfg = require('../configs/configs');
const Util = require('../util/util');
const orchestrator = require('../orchestrator/orchestrator');
const SESSION_FILE_PATH = `${__dirname}/session.json`;

//#region -------------- WPP Setup --------------

let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH));
    Util.logSucess('WPP - Configurações importdas');
}

const client = new Client({
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

client.on('message', async (mensagemUsuario) => {
    await orchestrator.onMessage(client, mensagemUsuario);
});

// client.initialize();

//#endregion

module.exports = client;