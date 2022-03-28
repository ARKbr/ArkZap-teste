// ------------------------ imports ------------------------
// dotenv
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '\\.env' });
const cfg = require('./src/configs/configs');
const Util = require('./src/util/util');

// Require the framework and instantiate it
const fastify = require('fastify')({ logger: cfg.global.full_logs });
fastify.register(require('fastify-cors'), { origin: '*' });
fastify.register(require('fastify-formbody'));
fastify.register(require('./src/api/routes'));

fastify.addHook('onRequest', (request, reply, done) => {
    // validação de autorização
    if (request.headers.auth != cfg.global.api_auth) {
        reply.code(400).send({ error: 'not allowed' });
        Util.logWarning(`[API] Conexão recusada vinda do IP ${request.ip}, esperado ${cfg.global.api_auth}, recebido ${request.headers.auth}`);
        return;
    }
    done();
});

// Run the server!
const bootstrap = async () => {

    try {
        await fastify.listen(cfg.global.api_port);
        Util.logSucess(`[API] Servidor iniciado em http://localhost:${cfg.global.api_port}`);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }

    try {
        await require('./src/client/wpp').initialize()
            .then(() => {
                Util.log('[WPP] Término Inicialização');
            });
    } catch (err) {
        Util.logError(`Erro na inicialização do client WPP -> ${err}`);
        process.exit(1);
    }
};

bootstrap();
// (async () => {
//     await bootstrap();
// })();