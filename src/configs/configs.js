/**
 * Configurações globais
 */
module.exports = {
    global: {
        nome_cliente: process.env.GLOBAL_CLIENTE_NOME,
        api_port: process.env.GLOBAL_API_PORT,
        api_auth: process.env.GLOBAL_API_AUTH,
        delay_min: process.env.GLOBAL_RESPONSE_DELAY_MIN,
        delay_max: process.env.GLOBAL_RESPONSE_DELAY_MAX,
        pupp_path: process.env.GLOBAL_PUPP_CHROME_PATH,
        pupp_headless: process.env.GLOBAL_PUPP_HEADLESS,
        full_logs: process.env.GLOBAL_LOGIC_FULL_LOGS,
        printnode_apikey: process.env.GLOBAL_PRINTNODE_APIKEY,
        printnode_printer: process.env.GLOBAL_PRINTNODE_PRINTER,
        socket_port: process.env.GLOBAL_SOCKET_PORT,
    },
    logics: {
        custom_audio: process.env.CUSTOM_LOGIC_AUDIO === 'true',
        custom_document: process.env.CUSTOM_LOGIC_DOCUMENT === 'true',
        custom_image: process.env.CUSTOM_LOGIC_IMAGE === 'true',
        custom_location: process.env.CUSTOM_LOGIC_LOCATION === 'true',
        custom_sticker: process.env.CUSTOM_LOGIC_STICKER === 'true',
        custom_vcard: process.env.CUSTOM_LOGIC_VCARD === 'true',
        custom_video: process.env.CUSTOM_LOGIC_VIDEO === 'true',
        custom_skill: process.env.CUSTOM_SKILL,
    },
    botpress: {
        id: process.env.BOTPRESS_BOT_ID,
        url: process.env.BOTPRESS_BOT_URL,
        media_url: process.env.BOTPRESS_BOT_MEDIA_URL,
        login: process.env.BOTPRESS_AUTH_EMAIL,
        pass: process.env.BOTPRESS_AUTH_PASS,
    },
    mongo: {
        database: process.env.GLOBAL_CLIENTE_NOME,
        ip: process.env.DB_MONGO_IP,
        port: process.env.DB_MONGO_PORT,
        user: process.env.DB_MONGO_USER,
        pass: process.env.DB_MONGO_PASS,
    },
    assets: {
        svg_check: 'https://img.icons8.com/material-outlined/100/000000/checked--v3.png',
        svg_disconnected: 'https://img.icons8.com/ios/100/000000/wi-fi-disconnected.png',
        svg_alert: 'https://img.icons8.com/external-xnimrodx-lineal-xnimrodx/100/000000/external-alert-warehouse-xnimrodx-lineal-xnimrodx.png',
    }

};