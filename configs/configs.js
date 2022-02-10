/**
 * Configurações globais
 */
module.exports = {
    global: {
        delay_min: process.env.GLOBAL_RESPONSE_DELAY_MIN,
        delay_max: process.env.GLOBAL_RESPONSE_DELAY_MAX,
        pupp_path: process.env.GLOBAL_PUPP_CHROME_PATH,
        pupp_headless: process.env.GLOBAL_PUPP_HEADLESS,
    },
    answers: {
        audio: process.env.CUSTOM_ANSWER_AUDIO,
        document: process.env.CUSTOM_ANSWER_DOCUMENT,
        image: process.env.CUSTOM_ANSWER_IMAGE,
        location: process.env.CUSTOM_ANSWER_LOCATION,
        sticker: process.env.CUSTOM_ANSWER_STICKER,
        text: process.env.CUSTOM_ANSWER_TEXT,
        vcard: process.env.CUSTOM_ANSWER_VCARD,
        video: process.env.CUSTOM_ANSWER_VIDEO,
    },
    botpress: {
        id: process.env.BOTPRESS_BOT_ID,
        url: process.env.BOTPRESS_BOT_URL,
        media_url: process.env.BOTPRESS_BOT_MEDIA_URL,
    },
    mongo: {
        ip: process.env.DB_MONGO_IP,
        port: process.env.DB_MONGO_PORT,
        user: process.env.DB_MONGO_USER,
        pass: process.env.DB_MONGO_PASS,
        database: process.env.DB_MONGO_DATABASE,
    }

};