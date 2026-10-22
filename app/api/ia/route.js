import { desafio } from '../../../desafio';
import { createClient } from '../../../lib/supabase/server';
import { ErroIA, gerarResposta } from '../../../lib/ia';

export const runtime = 'nodejs';
export const maxDuration = 60;

function texto(body, status = 200) {
  return new Response(body, {
    status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

export async function POST(request) {
  try {
    const supabase = await createClient();
    if (!supabase) return texto('O acesso ainda não foi configurado. Verifique as variáveis do Supabase.', 503);
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) return texto('Sua sessão expirou. Entre novamente para continuar.', 403);

    let campos;
    try {
      const body = await request.text();
      if (body.length > 30000) return texto('O texto enviado é muito longo. Reduza os campos e tente novamente.', 413);
      campos = JSON.parse(body);
    } catch {
      return texto('Não foi possível ler os campos enviados. Confira os textos e tente novamente.', 400);
    }
    if (!campos || typeof campos !== 'object' || Array.isArray(campos)) return texto('Envie os campos do formulário.', 400);
    const valores = {};
    for (const { id } of desafio.campos) {
      const value = campos[id] ?? '';
      if (typeof value !== 'string') return texto('Os campos devem conter apenas texto.', 400);
      if (value.length > 6000) return texto('Cada campo pode ter no máximo 6.000 caracteres.', 400);
      valores[id] = value;
    }
    if (!Object.values(valores).some(value => value.trim())) return texto('Preencha pelo menos um campo para começar.', 400);
    return texto(await gerarResposta(desafio, valores, process.env.OPENROUTER_API_KEY));
  } catch (error) {
    if (error instanceof ErroIA) return texto(error.message, error.status);
    return texto('Não foi possível concluir a análise. Tente novamente em instantes.', 500);
  }
}
