import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import { carregarHistorico } from '../../lib/historico';
import SessionHeader from '../session-header';

export const dynamic = 'force-dynamic';

export const metadata = { title: 'Meu histórico | OMNI-YAS' };

function formatarData(value) {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) return 'Data não disponível';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo',
  }).format(date);
}

export default async function Historico() {
  const supabase = await createClient();
  if (!supabase) redirect('/login');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  let registros = [];
  let falhou = false;
  try {
    const { data, error } = await carregarHistorico(supabase, user.id);
    falhou = Boolean(error);
    registros = error ? [] : data ?? [];
  } catch {
    falhou = true;
  }

  return (
    <main className="pagina">
      <section className="cartao">
        <SessionHeader email={user.email} />
        <span className="marca">OMNI-YAS</span>
        <h1>Meu histórico</h1>
        <p className="descricao">Suas análises, da mais recente para a mais antiga. Horários de Brasília.</p>
        <Link className="voltar" href="/">Voltar para o treino</Link>
        {falhou ? (
          <p className="erro" role="alert">Não foi possível carregar seu histórico. Tente recarregar a página. Se continuar, confira a tabela respostas e as regras de segurança do Supabase.</p>
        ) : registros.length === 0 ? (
          <p className="historico-vazio">Você ainda não tem análises salvas. Faça seu primeiro treino para começar.</p>
        ) : (
          <ol className="historico-lista">
            {registros.map(registro => (
              <li key={registro.id}>
                <article className="historico-item">
                  <h2>Análise de <time dateTime={registro.criado_em || undefined}>{formatarData(registro.criado_em)}</time></h2>
                  <h3>O que você escreveu</h3>
                  <p>{registro.entrada}</p>
                  <h3>Resposta</h3>
                  <p>{registro.resposta}</p>
                </article>
              </li>
            ))}
          </ol>
        )}
      </section>
    </main>
  );
}
