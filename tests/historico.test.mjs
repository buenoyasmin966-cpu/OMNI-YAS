import test from 'node:test';
import assert from 'node:assert/strict';
import { desafio } from '../desafio.js';
import { formatarEntrada, salvarResposta, carregarHistorico } from '../lib/historico.js';

test('histórico reúne todos os campos com rótulos e preserva quebras de linha', () => {
  const entrada = formatarEntrada(desafio, { vaga: 'Aprendiz\nAtendimento', resposta1: 'Estudante' });
  assert.equal(entrada, 'Cole aqui a descrição da vaga:\nAprendiz\nAtendimento\n\nMe fale um pouco sobre você:\nEstudante\n\nPor que você quer esta vaga?:\n\n\nConte uma situação difícil que você resolveu:\n');
});

test('salva na tabela respostas, deixando o banco atribuir o usuário da sessão', async () => {
  let inserido;
  const supabase = { from(tabela) {
    assert.equal(tabela, 'respostas');
    return { async insert(row) { inserido = row; return { error: null }; } };
  } };
  await salvarResposta(supabase, desafio, { vaga: 'Aprendiz' }, 'Retorno\nDa IA');
  assert.equal(inserido.entrada, formatarEntrada(desafio, { vaga: 'Aprendiz' }));
  assert.equal(inserido.resposta, 'Retorno\nDa IA');
  assert.equal(Object.hasOwn(inserido, 'user_id'), false);
});

test('falha ao salvar é detectada sem expor detalhes do banco', async () => {
  const supabase = { from: () => ({ insert: async () => ({ error: { message: 'Detalhe interno' } }) }) };
  await assert.rejects(salvarResposta(supabase, desafio, {}, 'Resposta'), { message: 'Não foi possível salvar esta resposta no histórico.' });
});

test('histórico consulta apenas o usuário informado e ordena do mais recente ao mais antigo', async () => {
  const calls = [];
  const query = {
    select(columns) { calls.push(['select', columns]); return this; },
    eq(column, value) { calls.push(['eq', column, value]); return this; },
    order(column, options) { calls.push(['order', column, options]); return this; },
  };
  const supabase = { from(table) { assert.equal(table, 'respostas'); return query; } };
  await carregarHistorico(supabase, 'usuario-autenticado');
  assert.deepEqual(calls, [
    ['select', 'id, entrada, resposta, criado_em'],
    ['eq', 'user_id', 'usuario-autenticado'],
    ['order', 'criado_em', { ascending: false }],
    ['order', 'id', { ascending: false }],
  ]);
});
