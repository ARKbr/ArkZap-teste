// ------------------------ imports ------------------------
// dotenv
const dotenv = require('dotenv');
dotenv.config({ path: __dirname + '\\.env' });
const cfg = require('./src/configs/configs');
const Util = require('./src/util/util');

// Util.log('Configs -> ' + JSON.stringify(cfg));

// Require the framework and instantiate it
const fastify = require('fastify')({ logger: true });
fastify.register(require('./src/api/routes'));
fastify.addHook('onRequest', (request, reply, done) => {
    // validação de autorização
    if (request.headers.auth != cfg.global.api_auth) {
        reply.code(400).send({ error:'not allowed' });
        Util.logWarning(`Conexão recusada vinda do IP ${request.ip}`);
        return;
    }
    done();
});

// Run the server!
const bootstrap = async () => {

    try {
        await fastify.listen(cfg.global.api_port);
    } catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }

    try {
        await require('./src/client/wpp').initialize();
    } catch (err) {
        Util.logError(`Erro na inicialização do client WPP -> ${err}`);
        process.exit(1);
    }

};

bootstrap();