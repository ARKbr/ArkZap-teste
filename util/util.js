/**
 * Retorna um número aleatório entre a faixa fornecida
 * @param {*} min  Mínimo
 * @param {*} max  Máximo
 */
async function sleep(min, max) {
    const sleeptime = Math.floor(
        Math.random() * (max - min + 1) + min);

    return new Promise((resolve) => {
        setTimeout(resolve, sleeptime);
    });
}

//#region LOGS

// https://stackoverflow.com/questions/9781218/how-to-change-node-jss-console-font-color 
/**
 * Faz log no console com data/hora
 * @param {*} text 
 */
function log(text) {
    console.log('\x1b[37m%s\x1b[1m', `${new Date().toLocaleString()} -> ${text}`);
}

/**
 * Faz log VERDE no console com data/hora
 * @param {*} text 
 */
function logSucess(text) {
    console.log('\x1b[32m%s\x1b[1m', `${new Date().toLocaleString()} -> ${text}`);
}

/**
 * Faz log AMARELO no console com data/hora
 * @param {*} text 
 */
function logWarning(text) {
    console.log('\x1b[33m%s\x1b[1m', `${new Date().toLocaleString()} -> ${text}`);
}

/**
 * Faz log VERMELHO no console com data/hora
 * @param {*} text 
 */
function logError(text) {
    console.log('\x1b[31m%s\x1b[1m', `${new Date().toLocaleString()} -> ${text}`);
}

//#endregion

module.exports = {
    sleep,
    log,
    logSucess,
    logWarning,
    logError
};