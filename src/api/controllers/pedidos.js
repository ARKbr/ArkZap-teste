// const cfg = require('../../configs/configs');
const Util = require('../../util/util');
const { debug: dbDbug, pedidos: dbPedidos } = require('../../database/mongo');
const path = require('path');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
// const utils = require('util');
// const readFile = utils.promisify(fs.readFile);
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
// const PrintNodeClient = require('../../libs/PrintNode/index');
// const pnClient = new PrintNodeClient({ api_key: cfg.global.printnode_apikey, default_printer_id: cfg.global.printnode_printer });
const client = require('../../client/wpp');

// enum para status do pedido
const pedidoStatus = {
    aceito: 'aceito',
    pendente: 'pendente',
    entregue: 'entregue',
    recusado: 'recusado'
};

// aceita pedido especifico
async function recusaPedido(request, reply) {
    try {
        const where = { _id: request.params.id };
        const options = { upsert: true };

        const data = {
            status: pedidoStatus.recusado,
            motivoRecusa: request.body.motivoRecusa
        };

        const pedido = await dbPedidos.findOneAndUpdate(where, data, options);

        let msgString = `Olá ${pedido.cliente_nome.split(' ')[0]}! \n\n`;
        msgString += 'Infelizmente não vamos conseguir atender seu pedido 😞 \n\n';
        msgString += `Fui informado que *${request.body.motivoRecusa}*. \n\n`;
        msgString += 'Pedimos desculpas pelo acontecido, mas tenha certeza que vamos melhorar para poder lhe atender em uma outra oportunidade';

        await client.sendMessage(pedido.wpp, msgString);

        reply.code(200).send(pedido);
    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> aceitaPedido -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// retorna todos os pedidos
async function getPedidosPendentes(request, reply) {
    try {
        const where = { status: pedidoStatus.pendente };
        const pedidos = await dbPedidos.find(where);

        const res = {
            pedidos: pedidos,
            dataAtualizacao: Util.momentCustom('DD/MM/YYYY hh:mm:ss')
        };

        reply.code(200).send(res);
    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> getPedidosPendentes -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// aceita pedido especifico
async function aceitaPedido(request, reply) {
    try {
        const where = { _id: request.params.id };
        const options = { upsert: true };

        const data = {
            status: pedidoStatus.aceito,
            tempoEntrega: request.body.tempoEntrega
        };

        // Util.logWarning(`[API] aceitaPedido request.body -> ${JSON.stringify(request.body)}`);

        let pedido = await dbPedidos.findOneAndUpdate(where, data, options);

        Util.logWarning(`[API] pedido -> ${JSON.stringify(pedido)}`);
        Util.logWarning(`[API] pedido.itens -> ${JSON.stringify(pedido.itens)}`);
        Util.logWarning(`[API] pedido.endereco -> ${JSON.stringify(pedido.endereco)}`);

        // {"_id":"62413dde58a696a3e15850d5","cliente_nome":"Leonardo Coelho Gomide",
        // "itens":[{"item":{"id":22,"nome":"*X-Divina Gula*🍔",
        // "descricao":"Pão, 2 bifes, lombo, ovo, presunto, muçarela, tomate, frango, bacon, milho, batata e maionese",
        // "categoria":"Lanches","adicionais":"Lanches","preco":23,"desconto":1},"adicionais":[],
        // "observacao":""}],"cliente_contato":"3791984628","descricao":"*Cliente:* 
        // Leonardo Coelho Gomide \n \n*Itens:* \n- *X-Divina Gula*🍔 R$22 \n\n*Forma de pagamento:* 
        // Cartão  \n \n*Local de entrega:* Rua X número 1 \n \n*Total R$22.00*","valor":"22.00",
        // "endereco":"Rua X número 1","formaPagamento":"Cartão ","wpp":"553791984628@c.us","status":"pendente",
        // "dataCriacao":"28/03/2022 01:47:26","timestampCriacao":1648442846576,"__v":0}

        let itensPedido = '*Itens:* \n';
        pedido.itens.forEach(item => {
            itensPedido += ` - ${item.nome} \n`;
            item.adicionais.forEach(adicional => {
                itensPedido += `  + ${adicional.nome} \n`;
            });
        });
        let msgString = `Olá ${pedido.cliente_nome.split(' ')[0]}! \n\n`;
        msgString += 'Passando para te avisar que seu pedido abaixo foi aceito e já está sendo preparado 😄 \n\n';
        msgString += itensPedido + '\n';

        // personaliza mensagem de acordo com o tipo de pedido
        if (String(pedido.endereco).includes('Buscar no local')) {

            msgString += `Em cerca de *${request.body.tempoEntrega}* já estará disponível para retirada no local.`;
        }
        else if (String(pedido.endereco).includes('Comer no local')) {

            msgString += `Em cerca de *${request.body.tempoEntrega}* já estará pronto e te esperando para degustação 😋`;
        }
        else {

            msgString += `Nossa previsão de tempo de entrega do seu pedido é de *${request.body.tempoEntrega}*.`;
        }

        await client.sendMessage(pedido.wpp, msgString);

        reply.code(200).send(pedido);
    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> aceitaPedido -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

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

        const res = {
            pedidos: pedidos,
            dataAtualizacao: Util.momentCustom('DD/MM/YYYY hh:mm:ss')
        };

        reply.code(200).send(res);
    } catch (err) {
        Util.logError(`[API] ERRO PEDIDOS -> getPedidos -> ${err.message}`);
        reply.code(500).send({ message: 'Erro', error: err });
    }
}

// cria um pedido
async function criaPedido(request, reply) {
    try {

        const data = request.body.pedido;
        data.status = pedidoStatus.pendente;
        data.dataCriacao = Util.momentCustom('DD/MM/YYYY hh:mm:ss');
        data.timestampCriacao = Util.momentNow();

        const pedido = await dbPedidos.create(data);

        Util.log(`[API] Pedido ${pedido._id} criado`);
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

        const docPath = path.resolve(__dirname, '../', '../', './assets/nota.html');
        const base = await readFile(docPath, 'utf8');
        // const template = hb.compile(res, { strict: true });
        const template = hbs.compile(base);
        const result = template(dados);

        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(result);
        const outDir = path.resolve(__dirname, '../', '../', '../', './documentos');
        fs.mkdirSync(outDir, { recursive: true });
        await page.pdf({ path: outDir + `/nota_${Util.momentCustom('YYYY_MM_DD_hhmmss')}.pdf`, width: 200 });
        // const pdf = await page.pdf({ width: 200 });

        // const options = {
        //     title: 'teste raw',
        //     source: 'PrintNode-NodeJS',
        //     content: Buffer.from(pdf).toString('base64'),
        //     contentType: 'pdf_base64'
        // };
        // await pnClient.createPrintJob(options).then(res => Util.logSucess(`PrintJob criado -> ${res}`));

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
    putPedido,
    aceitaPedido,
    getPedidosPendentes,
    recusaPedido
};