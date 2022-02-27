const client = require('../client/wpp');
const cfg = require('../configs/configs');
const axios = require('axios').default;
const moment = require('moment-timezone');
const timezone = 'America/Sao_Paulo';
const Util = require('../util/util');
const { debug } = require('../database/mongo');
const path = require('path');
const fs = require('fs');
const readFile = require('util').promisify(fs.readFile);
// const utils = require('util');
// const readFile = utils.promisify(fs.readFile);
const puppeteer = require('puppeteer');
const hbs = require('handlebars');
const PrintNodeClient = require('../libs/PrintNode/index');
const pnClient = new PrintNodeClient({ api_key: cfg.global.printnode_apikey, default_printer_id: cfg.global.printnode_printer });

async function routes(fastify, options) {

    // ------------- GET -------------
    // ------------- POST -------------
    fastify.post('/printPedido', printPedido);
    fastify.post('/horarioFuncionamento', horarioFuncionamento);
    fastify.post('/sendMessage', sendMessage);
}

// envia pedido para printnode
async function printPedido(request, reply) {

    const dados = {
        pedido: request.body.pedido,
        estabelecimento_nome: request.body.estabelecimento,
        cliente_nome: request.body.cliente.nome,
        cliente_contato: request.body.cliente.contato,
        cliente_endereco: request.body.endereco,
        // data:'12/01/2020 - 12:00:00',
        data: moment().tz(timezone).format('DD/MM/YYYY - hh:mm:ss')
    };

    const docPath = path.resolve(__dirname, '../', './assets/nota.html');
    const base = await readFile(docPath, 'utf8');
    // const template = hb.compile(res, { strict: true });
    const template = hbs.compile(base);
    const result = template(dados);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(result);
    await page.pdf({ path: __dirname + `/nota_${moment().tz(timezone).format('YYYY_MM_DD_hhmmss')}.pdf`, width: 200 });
    // const pdf = await page.pdf({ width: 200 });

    // const options = {
    //     title: 'teste raw',
    //     source: 'PrintNode-NodeJS',
    //     content: Buffer.from(pdf).toString('base64'),
    //     contentType: 'pdf_base64'
    // };
    // await pnClient.createPrintJob(options).then(res => Util.logSucess(`PrintJob criado -> ${res}`));

    console.log('pedido recebido');
    await debug(request.body).save();
    reply.code(200).send({ status: 'ok' });
}

// retorna horario de funcionamento e saudação
async function horarioFuncionamento(request, reply) {

    if (request.body.googleURL == undefined) {
        Util.logWarning('Erro na rota POST - horarioFuncionamento -> googleURL não especificada');
        reply.code(400).send({ message: 'Faltam dados na requisição' });
        return;
    }

    // constantes
    const axiosOptions = {
        method: 'GET',
        url: request.body.googleURL,
        params: {
            context: 'horarioFuncionamento',
        }
    };

    try {
        // configurações de funcionamento
        const diasFuncionamento = (await axios.request(axiosOptions)).data;
        const agora = moment().tz(timezone);
        // console.log(`agora -> ${agora.format()}`);

        // saudação
        let saudacao = 'Boa noite';
        const hora = agora.get('hour');
        if (hora > 5 && hora < 13) saudacao = 'Bom dia';
        if (hora > 13 && hora < 18) saudacao = 'Boa tarde';

        // horarios de funcionamento
        let funcionamentoHoje = diasFuncionamento.find(el => el.dia == agora.get('day'));
        let funcionamentoOntem;
        if (agora.get('day') == 0)
            funcionamentoOntem = diasFuncionamento.find(el => el.dia == 6);
        else
            funcionamentoOntem = diasFuncionamento.find(el => el.dia == agora.get('day') - 1);

        // calculando funcionamento de ontem
        const funInicioHorarioOntem = funcionamentoOntem.inicio.split(':');
        let funcionamentoInicioOntem = moment(agora).subtract(1, 'day');
        funcionamentoInicioOntem.set('hour', funInicioHorarioOntem[0]);
        funcionamentoInicioOntem.set('minute', funInicioHorarioOntem[1]);
        funcionamentoInicioOntem.set('second', funInicioHorarioOntem[2]);
        // console.log(`funcionamentoInicioOntem -> ${funcionamentoInicioOntem.format()}`);

        const funFinalHorarioOntem = funcionamentoOntem.fim.split(':');
        let funcionamentoFimOntem = moment(agora).subtract(1, 'day');
        if (funFinalHorarioOntem[0] < funInicioHorarioOntem[0]) funcionamentoFimOntem.add(1, 'day');
        funcionamentoFimOntem.set('hour', funFinalHorarioOntem[0]);
        funcionamentoFimOntem.set('minute', funFinalHorarioOntem[1]);
        funcionamentoFimOntem.set('second', funFinalHorarioOntem[2]);
        // console.log(`funcionamentoFimOntem -> ${funcionamentoFimOntem.format()}`);

        // calculando funcionamento de hoje
        const funInicioHorarioHj = funcionamentoHoje.inicio.split(':');
        let funcionamentoInicioHj = moment(agora);
        funcionamentoInicioHj.set('hour', funInicioHorarioHj[0]);
        funcionamentoInicioHj.set('minute', funInicioHorarioHj[1]);
        funcionamentoInicioHj.set('second', funInicioHorarioHj[2]);
        // console.log(`funcionamentoInicioHj -> ${funcionamentoInicioHj.format()}`);

        const funFinalHorarioHj = funcionamentoHoje.fim.split(':');
        let funcionamentoFimHj = moment(agora);
        if (funFinalHorarioHj[0] < funInicioHorarioHj[0]) funcionamentoFimHj.add(1, 'day');
        funcionamentoFimHj.set('hour', funFinalHorarioHj[0]);
        funcionamentoFimHj.set('minute', funFinalHorarioHj[1]);
        funcionamentoFimHj.set('second', funFinalHorarioHj[2]);
        // console.log(`funcionamentoFimHj -> ${funcionamentoFimHj.format()}`);

        const funcionando = agora.isBetween(funcionamentoInicioOntem, funcionamentoFimOntem) || agora.isBetween(funcionamentoInicioHj, funcionamentoFimHj);

        reply.code(200).send({
            funcionando: funcionando,
            saudacao: saudacao,
            horariosFuncionamento: diasFuncionamento
        });

    }
    catch (err) {
        Util.logError(`Erro na rota POST - horarioFuncionamento -> ${err.message}`);
        reply.code(500).send({ message: 'Erro ao definir horario de funcionamento', error: err });
    }

}

// envia mensagem simples
async function sendMessage(request, reply) {
    try {
        // request.body.sendTo;
        // request.body.message;
        await client.sendMessage(request.body.sendTo, request.body.message)
            .then(data => { reply.code(200).send({ status: data }); });
    } catch (err) {
        Util.logError(`Erro na rota POST - sendMessage -> ${err.message}`);
        reply.code(500).send({ message: 'Erro ao enviar mensagem', error: err });
    }
}

module.exports = routes;