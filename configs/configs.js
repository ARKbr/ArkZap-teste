/**
 * Configurações globais
 */
module.exports = {
    global: {
        delay_min: process.env.GLOBAL_RESPONSE_DELAY_MIN,
        delay_max: process.env.GLOBAL_RESPONSE_DELAY_MAX,
        pupp_path: process.env.GLOBAL_PUPP_CHROME_PATH,
        pupp_headless: process.env.GLOBAL_PUPP_HEADLESS,
        is_demo: process.env.GLOBAL_LOGIC_ISDEMO,
        full_logs: process.env.GLOBAL_LOGIC_FULL_LOGS,
    },
    logics: {
        custom_audio: process.env.CUSTOM_LOGIC_AUDIO,
        custom_document: process.env.CUSTOM_LOGIC_DOCUMENT,
        custom_image: process.env.CUSTOM_LOGIC_IMAGE,
        custom_location: process.env.CUSTOM_LOGIC_LOCATION,
        custom_sticker: process.env.CUSTOM_LOGIC_STICKER,
        custom_vcard: process.env.CUSTOM_LOGIC_VCARD,
        custom_video: process.env.CUSTOM_LOGIC_VIDEO,
        custom_skill: process.env.CUSTOM_SKILL,
    },
    botpress: {
        id: process.env.BOTPRESS_BOT_ID,
        url: process.env.BOTPRESS_BOT_URL,
        media_url: process.env.BOTPRESS_BOT_MEDIA_URL,
        login:process.env.BOTPRESS_AUTH_EMAIL,
        pass:process.env.BOTPRESS_AUTH_PASS,
    },
    mongo: {
        ip: process.env.DB_MONGO_IP,
        port: process.env.DB_MONGO_PORT,
        user: process.env.DB_MONGO_USER,
        pass: process.env.DB_MONGO_PASS,
        database: process.env.DB_MONGO_DATABASE,
    }

};