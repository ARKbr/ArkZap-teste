const { createServer } = require('http');
const { Server } = require('socket.io');
const httpServer = createServer();
const io = module.exports = new Server(httpServer, { cors: { origin: '*' } });

const cfg = require('../configs/configs');
const Util = require('../util/util');
const client = require('../client/wpp');
const { WAState } = require('whatsapp-web.js');

httpServer.listen(cfg.global.socket_port, () => {
    Util.logSucess(`[Socket] Servidor iniciado em http://localhost:${cfg.global.socket_port}`);
});

io.on('connection', async socket => {
    Util.log(`[Socket] Nova conexão ID -> ${socket.id}`);

    const status = await client.getState();
    Util.emitLog(`WhatsApp Status = ${status}`);

    if (status == WAState.CONNECTED) {
        io.emit('qr', cfg.assets.svg_check);
    }
    else {
        io.emit('qr', cfg.assets.svg_alert);
    }

});

// module.exports = { io, httpServer };