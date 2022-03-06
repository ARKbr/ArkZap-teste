const cfg = require('../../configs/configs');
const Util = require('../../util/util');
const { debug: dbDbug, pedidos: dbPedidos } = require('../../database/mongo');
const path = require('path');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
// const utils = require('util');
// const readFile = utils.promisify(fs.readFile);
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const PrintNodeClient = require('../../libs/PrintNode/index');
const pnClient = new PrintNodeClient({ api_key: cfg.global.printnode_apikey, default_printer_id: cfg.global.printnode_printer });

// enum para status do pedido
const pedidoStatus = {
    aceito: 'aceito',
    pendente: 'pendente'
};

// atualiza pedido especifico
async function putPedido(request, reply) {
    try {
        const where = { _id: request.params.id };
        const data = request.body.pedido;
        const options = { upsert: true };
        const pedido = await dbPedidos.updateOne(where, data, options);
        reply.code(200).send(pedido);
    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> getPedido -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// retorna pedido especifico
async function getPedido(request, reply) {
    try {
        const pedido = await dbPedidos.findById(request.params.id);
        reply.code(200).send(pedido);
    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> getPedido -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// retorna todos os pedidos
async function getPedidos(request, reply) {
    try {
        const pedidos = await dbPedidos.find();
        reply.code(200).send(pedidos);
    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> getPedidos -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// cria um pedido
async function criaPedido(request, reply) {
    try {
        const pedido = await dbPedidos.create({
            data: { type: 'string' },
            status: { type: pedidoStatus.aceito },
            cliente_nome: { type: 'string' },
            cliente_contato: { type: 'string' },
            descricao: { type: 'string' },
            valor: { type: 'float' },
        });

        console.log(`obejto ${pedido._id} criado -> `, JSON.stringify(pedido));
        reply.code(200).send(pedido);

    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> criaPedido -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// envia pedido para printnode
async function printPedido(request, reply) {
    try {
        const dados = {
            pedido: request.body.pedido,
            estabelecimento_nome: request.body.estabelecimento,
            cliente_nome: request.body.cliente.nome,
            cliente_contato: request.body.cliente.contato,
            cliente_endereco: request.body.endereco,
            // data:'12/01/2020 - 12:00:00',
            data: Util.momentCustom('DD/MM/YYYY - hh:mm:ss')
        };

        const docPath = path.resolve(__dirname, '../', './assets/nota.html');
        const base = await readFile(docPath, 'utf8');
        // const template = hb.compile(res, { strict: true });
        const template = hbs.compile(base);
        const result = template(dados);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(result);
        await page.pdf({ path: __dirname + `/nota_${Util.momentCustom('YYYY_MM_DD_hhmmss')}.pdf`, width: 200 });
        // const pdf = await page.pdf({ width: 200 });

        // const options = {
        //     title: 'teste raw',
        //     source: 'PrintNode-NodeJS',
        //     content: Buffer.from(pdf).toString('base64'),
        //     contentType: 'pdf_base64'
        // };
        // await pnClient.createPrintJob(options).then(res => Util.logSucess(`PrintJob criado -> ${res}`));

        console.log('pedido recebido');
        await dbDbug(request.body).save();
        reply.code(200).send({ status: 'ok' });

    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> printPedido -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// eslint-disable-next-line no-unused-vars
const ped = module.exports = {
    printPedido,
    criaPedido,
    getPedidos,
    getPedido,
    putPedido
};