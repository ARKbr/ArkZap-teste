// whatsapp
const qrcode_terminal = require('qrcode-terminal');
const { Client, Events, LegacySessionAuth } = require('whatsapp-web.js');
const fs = require('fs');
const qrcode = require('qrcode');
const SESSION_FILE_PATH = `${__dirname}/session.json`;
const cfg = require('../configs/configs');
const Util = require('../util/util');

let sessionData;
if (fs.existsSync(SESSION_FILE_PATH)) {
    sessionData = JSON.parse(fs.readFileSync(SESSION_FILE_PATH));
    Util.logSucess('[WPP] Configurações importdas');
}

const client = module.exports = new Client({
    authStrategy: new LegacySessionAuth({
        session: sessionData
    }),
    puppeteer: { headless: cfg.global.pupp_headless, executablePath: cfg.global.pupp_path },
});

const orchestrator = require('../orchestrator/orchestrator');

//#region -------------- WPP Setup --------------

client.on(Events.QR_RECEIVED, qr => {
    if (cfg.global.log_qrcode) qrcode_terminal.generate(qr, { small: true });
    qrcode.toDataURL(qr, (err, url) => {
        Util.emitQr(url);
        Util.emitLog('Novo código QR gerado');
    });
});

client.on(Events.AUTHENTICATED, (session) => {
    sessionData = session;
    fs.writeFile(SESSION_FILE_PATH, JSON.stringify(session), (err) => {
        if (err) {
            Util.logError('Erro ao salvar arquivo de auth -> ', err);
        }
    });

    Util.logSucess('[WPP] Autenticado');
    Util.emitLog('WhatsApp Autenticado');
    Util.emitStatus(Events.AUTHENTICATED);
    Util.emitQr(cfg.assets.svg_check);
});

client.on(Events.READY, () => {
    Util.logSucess('[WPP] Client Iniciado');
    Util.emitLog('WhatsApp Pronto!');
    Util.emitQr(cfg.assets.svg_check);
    Util.emitStatus(Events.READY);
});

client.on(Events.MESSAGE_REVOKED_EVERYONE, async (after, before) => {
    // Fired whenever a message is deleted by anyone (including you)
    Util.log('Alguem apagou uma mensagem! Agora ficou -> ', after); // message after it was deleted.
    if (before) {
        Util.log('Antes era: ', before); // message after it was deleted.
    }
});

client.on(Events.BATTERY_CHANGED, (batteryInfo) => {
    // Battery percentage for attached device has changed
    const { battery, plugged } = batteryInfo;
    Util.log(`[WPP] Bateria em ${battery}% - Está carregando? ${plugged ? 'sim' : 'não'}`);
    Util.emitLog(`Bateria em ${battery}% - Está carregando? ${plugged ? 'sim' : 'não'}`);
});

client.on(Events.STATE_CHANGED, state => {
    Util.log(`[WPP] Mudança de estado para ${state}`);
    Util.emitLog(`WhatsApp status = ${state}`);
    Util.emitStatus(state);
});

client.on(Events.DISCONNECTED, (reason) => {
    Util.logWarning(`[WPP] Cliente fez logoff motivo -> ${reason}`);
    Util.emitLog('WhatsApp desconectado!');
    Util.emitStatus(Events.DISCONNECTED);
    Util.emitQr(cfg.assets.svg_disconnected);
    fs.rm(SESSION_FILE_PATH, async () => {
        await client.destroy().then((data) => Util.logWarning(`[WPP] Cliente destruido -> ${data}`));
        await client.initialize().then((data) => Util.logSucess(`[WPP] Término Inicialização -> ${data}`));
    });
});

client.on(Events.AUTHENTICATION_FAILURE, async (reason) => {
    Util.logError(`[WPP] Falha na autenticação motivo -> ${reason}`);
    Util.emitLog('WhatsApp Falha na autenticação!');
    Util.emitStatus(Events.AUTHENTICATION_FAILURE);
    Util.emitQr(cfg.assets.svg_disconnected);
    // fs.rm(SESSION_FILE_PATH, () => { throw new Error(reason); });
});

client.on(Events.MESSAGE_RECEIVED, async (mensagemUsuario) => {
    await orchestrator.onMessage(client, mensagemUsuario);
});

//#endregion
