const client = require('../client/wpp');
const axios = require('axios').default;
const moment = require('moment-timezone'); // require
const Util = require('../util/util');

async function routes(fastify, options) {

    // fastify.get('/', async (request, reply) => {
    //     return { hello: 'world' };
    // });

    // ------------- GET -------------
    fastify.get('/horarioFuncionamento', horarioFuncionamento);
    // ------------- POST -------------
    fastify.post('/sendMessage', sendMessage);
}

async function horarioFuncionamento(request, reply) {

    if (! request.body.googleURL) {
        Util.logWarning('Erro na rota GET - horarioFuncionamento -> googleURL não especificada');
        reply.code(400).send({ message: 'Faltam dados na requisição' });
        return;
    }

    // constantes
    const timezone = 'America/Sao_Paulo';
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
        Util.logError(`Erro na rota GET - horarioFuncionamento -> ${err.message}`);
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