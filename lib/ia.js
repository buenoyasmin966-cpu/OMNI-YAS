export class ErroIA extends Error {
  constructor(message, status = 502) {
    super(message);
    this.status = status;
  }
}

export function preencherPrompt(config, valores) {
  // A single replacement pass keeps placeholders inside user input literal.
  const ids = new Set(config.campos.map(({ id }) => id));
  return config.prompt.replace(/\{([a-zA-Z0-9_]+)\}/g, (original, id) => (
    ids.has(id) ? valores[id] : original
  ));
}

const exemplo = `MODO DE TESTE — Esta é uma resposta de exemplo, sem avaliação real e sem chamada à IA.

RESPOSTA 1
NOTA: 7 de 10 (exemplo)
O QUE FICOU BOM: Você relacionou uma atividade do dia a dia com a vaga.
O QUE MELHORAR: Explique o que você fez e qual foi o resultado.
COMO FICARIA MELHOR: Conte uma atividade real, sua responsabilidade e o que aprendeu.

RESPOSTA 2
NOTA: 6 de 10 (exemplo)
O QUE FICOU BOM: Você mostrou interesse em aprender.
O QUE MELHORAR: Diga o que chamou sua atenção nesta vaga.
COMO FICARIA MELHOR: Relacione uma tarefa da vaga com algo que você quer aprender.

RESPOSTA 3
NOTA: 7 de 10 (exemplo)
O QUE FICOU BOM: Você apresentou uma situação difícil.
O QUE MELHORAR: Conte como agiu para resolvê-la.
COMO FICARIA MELHOR: Explique a situação, sua ação e o resultado, usando uma história verdadeira.

Continue praticando: suas experiências do dia a dia também têm valor!`;

export async function gerarResposta(config, valores, apiKey, fetchImpl = fetch) {
  if (config.modoTeste) return exemplo;
  if (!apiKey) throw new ErroIA('A IA ainda não foi configurada. Adicione OPENROUTER_API_KEY na Vercel e publique novamente.', 503);

  let response;
  try {
    response = await fetchImpl('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.modelo,
        messages: [{ role: 'user', content: preencherPrompt(config, valores) }],
        max_tokens: 900,
      }),
      signal: AbortSignal.timeout(45000),
      cache: 'no-store',
    });
  } catch {
    throw new ErroIA('Não foi possível conectar à IA a tempo. Tente novamente em instantes.', 504);
  }
  if (response.status === 429) throw new ErroIA('Você atingiu o limite de uso de hoje.', 429);
  if (response.status === 401) throw new ErroIA('Chave da IA inválida.', 401);
  if (!response.ok) throw new ErroIA('A IA está indisponível no momento. Tente novamente em instantes.');

  let data;
  try {
    data = await response.json();
  } catch {
    throw new ErroIA('A IA enviou uma resposta inválida. Tente novamente.');
  }
  const texto = data?.choices?.[0]?.message?.content;
  if (typeof texto !== 'string' || !texto.trim()) throw new ErroIA('A IA não retornou uma resposta. Tente novamente.');
  return texto;
}
