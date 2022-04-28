const axios = require('axios').default;
const Util = require('../../util/util');

// retorna ingredientes para montagem do lanche 
async function ingredientes(request, reply) {

    if (request.body.googleURL == undefined) {
        Util.logWarning('[API] ERRO GOOGLE ingredientes -> googleURL não especificada');
        reply.code(400).send({ message: 'Faltam dados na requisição' });
        return;
    }

    // constantes
    const axiosOptions = {
        method: 'POST',
        url: request.body.googleURL,
        params: {
            context: 'ingredientes',
        }
    };
    
    try {
        const data = (await axios.request(axiosOptions)).data;

        // data = {opcionais:[idx, nome, desc, preco], obrigatorios:[idx, nome, desc, preco]}
        reply.code(200).send(data);

    } catch (err) {
        Util.logError(`[API] ERRO GOOGLE -> ingredientes -> ${err.message}`);
        reply.code(500).send({ message: 'Erro ao buscar ingredientes', error: err });
    }

}

// retorna cardápio 
async function cardapio(request, reply) {
    if (request.body.googleURL == undefined) {
        Util.logWarning('[API] ERRO GOOGLE cardapio -> googleURL não especificada');
        reply.code(400).send({ message: 'Faltam dados na requisição' });
        return;
    }

    // constantes
    const axiosOptions = {
        method: 'POST',
        url: request.body.googleURL,
        params: {
            context: 'cardapio',
        }
    };

    try {
        const data = (await axios.request(axiosOptions)).data;

        let promocionais = [];
        data.listaProdutos.forEach((el) => {
            if (el.desconto > 0) {
                promocionais.push(el);
            }
        });

        reply.code(200).send({
            promocionais: promocionais,
            cardapio: data.cardapio,
            listaAdicionais: data.listaAdicionais,
            listaProdutos: data.listaProdutos
        });

    } catch (err) {
        Util.logError(`[API] ERRO GOOGLE -> cardapio -> ${err.message}`);
        reply.code(500).send({ message: 'Erro ao buscar cardápio', error: err });
    }

}

// retorna horario de funcionamento e saudação
async function configs(request, reply) {

    if (request.body.googleURL == undefined) {
        Util.logWarning('[API] ERRO GOOGLE -> configs -> googleURL não especificada');
        reply.code(400).send({ message: 'Faltam dados na requisição' });
        return;
    }

    // constantes
    const axiosOptions = {
        method: 'POST',
        url: request.body.googleURL,
        params: {
            context: 'configs',
        }
    };

    Util.log(`[API] Google - axiosOptions -> ${JSON.stringify(axiosOptions)}`);

    try {
        // configurações de funcionamento
        const data = (await axios.request(axiosOptions)).data;
        const diasFuncionamento = data.listaHorarios;
        const listaConfiguracoes = data.listaConfigs;

        const agora = Util.momentNow();
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
        let funcionamentoInicioOntem = Util.moment(agora).subtract(1, 'day');
        funcionamentoInicioOntem.set('hour', funInicioHorarioOntem[0]);
        funcionamentoInicioOntem.set('minute', funInicioHorarioOntem[1]);
        funcionamentoInicioOntem.set('second', funInicioHorarioOntem[2]);
        // console.log(`funcionamentoInicioOntem -> ${funcionamentoInicioOntem.format()}`);

        const funFinalHorarioOntem = funcionamentoOntem.fim.split(':');
        let funcionamentoFimOntem = Util.moment(agora).subtract(1, 'day');
        if (funFinalHorarioOntem[0] < funInicioHorarioOntem[0]) funcionamentoFimOntem.add(1, 'day');
        funcionamentoFimOntem.set('hour', funFinalHorarioOntem[0]);
        funcionamentoFimOntem.set('minute', funFinalHorarioOntem[1]);
        funcionamentoFimOntem.set('second', funFinalHorarioOntem[2]);
        // console.log(`funcionamentoFimOntem -> ${funcionamentoFimOntem.format()}`);

        // calculando funcionamento de hoje
        const funInicioHorarioHj = funcionamentoHoje.inicio.split(':');
        let funcionamentoInicioHj = Util.moment(agora);
        funcionamentoInicioHj.set('hour', funInicioHorarioHj[0]);
        funcionamentoInicioHj.set('minute', funInicioHorarioHj[1]);
        funcionamentoInicioHj.set('second', funInicioHorarioHj[2]);
        // console.log(`funcionamentoInicioHj -> ${funcionamentoInicioHj.format()}`);

        const funFinalHorarioHj = funcionamentoHoje.fim.split(':');
        let funcionamentoFimHj = Util.moment(agora);
        if (funFinalHorarioHj[0] < funInicioHorarioHj[0]) funcionamentoFimHj.add(1, 'day');
        funcionamentoFimHj.set('hour', funFinalHorarioHj[0]);
        funcionamentoFimHj.set('minute', funFinalHorarioHj[1]);
        funcionamentoFimHj.set('second', funFinalHorarioHj[2]);
        // console.log(`funcionamentoFimHj -> ${funcionamentoFimHj.format()}`);

        const funcionando = agora.isBetween(funcionamentoInicioOntem, funcionamentoFimOntem) || agora.isBetween(funcionamentoInicioHj, funcionamentoFimHj);

        reply.code(200).send({
            funcionando: funcionando,
            saudacao: saudacao,
            horariosFuncionamento: diasFuncionamento,
            msgs: listaConfiguracoes
        });

    }
    catch (err) {
        Util.logError(`[API] ERRO GOOGLE -> configs -> ${err.message}`);
        reply.code(500).send({ message: 'Erro ao definir configurações', error: err });
    }

}

// eslint-disable-next-line no-unused-vars
const google = module.exports = {
    configs,
    cardapio,
    ingredientes
};