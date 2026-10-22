import test from 'node:test';
import assert from 'node:assert/strict';
import { desafio } from '../desafio.js';
import { ErroIA, preencherPrompt, gerarResposta } from '../lib/ia.js';

const valores = { vaga: 'Aprendiz', resposta1: 'Cuido do meu irmão', resposta2: '', resposta3: 'Organizei a casa' };
const real = { ...desafio, modoTeste: false };

test('substitui todos os campos sem interpretar marcadores ou cifrões no texto da pessoa', () => {
  const prompt = preencherPrompt({ ...desafio, prompt: '{vaga}|{vaga}|{resposta1}|{resposta2}|{resposta3}' }, {
    ...valores, vaga: '$& {resposta1}',
  });
  assert.equal(prompt, '$& {resposta1}|$& {resposta1}|Cuido do meu irmão||Organizei a casa');
});

test('modo de teste funciona sem chave e nunca chama a OpenRouter', async () => {
  const resposta = await gerarResposta(desafio, valores, undefined, () => assert.fail('Não deve fazer chamada externa'));
  assert.match(resposta, /MODO DE TESTE/);
  for (const numero of [1, 2, 3]) assert.match(resposta, new RegExp(`RESPOSTA ${numero}`));
});

test('modo real exige a chave no servidor', async () => {
  await assert.rejects(gerarResposta(real, valores, ''), error => error instanceof ErroIA && error.status === 503);
});

test('envia modelo, chave, prompt preenchido e limite de 900 tokens; retorna somente o texto', async () => {
  const resposta = await gerarResposta(real, valores, 'chave-ficticia', async (url, options) => {
    assert.equal(url, 'https://openrouter.ai/api/v1/chat/completions');
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer chave-ficticia');
    assert.equal(options.cache, 'no-store');
    assert.ok(options.signal instanceof AbortSignal);
    const body = JSON.parse(options.body);
    assert.equal(body.model, desafio.modelo);
    assert.equal(body.max_tokens, 900);
    assert.equal(body.messages[0].content, preencherPrompt(real, valores));
    return Response.json({ choices: [{ message: { content: 'Retorno\nEm duas linhas' } }] });
  });
  assert.equal(resposta, 'Retorno\nEm duas linhas');
});

for (const [status, message] of [
  [401, 'Chave da IA inválida.'],
  [429, 'Você atingiu o limite de uso de hoje.'],
  [500, 'A IA está indisponível no momento. Tente novamente em instantes.'],
]) {
  test(`traduz erro ${status} sem expor o corpo do provedor`, async () => {
    await assert.rejects(gerarResposta(real, valores, 'chave-ficticia', async () => new Response('Detalhes internos', { status })),
      error => error instanceof ErroIA && error.message === message && error.status === (status === 500 ? 502 : status));
  });
}

test('resposta vazia, JSON inválido e erro de conexão geram erros claros', async () => {
  for (const response of [Response.json({ choices: [] }), new Response('não é JSON')]) {
    await assert.rejects(gerarResposta(real, valores, 'chave-ficticia', async () => response), error => error.status === 502);
  }
  await assert.rejects(gerarResposta(real, valores, 'chave-ficticia', async () => { throw new Error('conexão'); }),
    error => error.status === 504 && error.message.includes('Não foi possível conectar'));
});
