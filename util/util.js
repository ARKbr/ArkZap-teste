const cfg = require('../configs/configs');

/**
 * Retorna um número aleatório entre a faixa fornecida
 * @param {Number} min  Mínimo
 * @param {Number} max  Máximo
 */
async function sleep(min, max) {
    const sleeptime = Math.floor(
        Math.random() * (max - min + 1) + min);

    return new Promise((resolve) => {
        setTimeout(resolve, sleeptime);
    });
}

/**
 * Vcard padrão
 * @returns Vcard padrão da Ark
 */
function getVcard() {
    return 'BEGIN:VCARD\n' + 
    'VERSION:3.0\n' + 
    'FN:Leonardo (ARKBOT)\n' + 
    'TEL;type=CELL;waid=553791984628:+55 37 9198-4628\n' +
    'END:VCARD\n';
}

//#region -------------- AXIOS --------------
/**
 * Encapsula promisse de POST do axios para ser usada em apenas uma linha 
 * @param {Promisse<any>} promisse prmisse a ser encapsulada
 * @param {String} url Url base a ser usada
 * @param {String} body Data da requisição
 * @returns [value, error]
 */
async function encapsulaPost(promisse, url, body) {
    try {
        const value = await promisse(url, body);
        return [value, null];
    } catch (error) {
        // console.log('Erro na promisse', error);
        return [null, error];
    }
}

/**
 * Encapsula promisse geral do axios para ser usada em apenas uma linha 
 * @param {Promisse<any>} promisse prmisse a ser encapsulada
 * @param {Object} options opções da requisição a ser encapsulada
 * @returns 
 */
async function encapsulaPostCustom(promisse, options) {
    try {
        const value = await promisse(options);
        return [value, null];
    } catch (error) {
        // console.log('Erro na promisse', error);
        return [null, error];
    }
}

//#endregion

//#region -------------- LOGS --------------

// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color 
/**
 * Faz log no console com data/hora
 * @param {*} text 
 */
function log(text) {
    if (cfg.global.full_logs == 'false'){    
        return;
    }
    console.log('\x1b[37m%s\x1b[0m', `${new Date().toLocaleString()} -> ${text}`);
}

/**
 * Faz log VERDE no console com data/hora
 * @param {*} text 
 */
function logSucess(text) {
    console.log('\x1b[32m%s\x1b[0m', `${new Date().toLocaleString()} -> ${text}`);
}

/**
 * Faz log AMARELO no console com data/hora
 * @param {*} text 
 */
function logWarning(text) {
    console.log('\x1b[33m%s\x1b[0m', `${new Date().toLocaleString()} -> ${text}`);
}

/**
 * Faz log VERMELHO no console com data/hora
 * @param {*} text 
 */
function logError(text) {
    console.log('\x1b[31m%s\x1b[0m', `${new Date().toLocaleString()} -> ${text}`);
}

//#endregion

module.exports = {
    sleep,
    log,
    logSucess,
    logWarning,
    logError,
    getVcard,
    encapsulaPost,
    encapsulaPostCustom
};