import { redirect } from 'next/navigation';
import { createClient } from '../../lib/supabase/server';
import LoginForm from './form';

export const dynamic = 'force-dynamic';

export default async function Login() {
  const supabase = await createClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) redirect('/');
  }
  return (
    <main className="pagina">
      <section className="cartao">
        <span className="marca">OMNI-YAS</span>
        <h1>Seu espaço começa aqui.</h1>
        <p className="descricao">Entre com seu e-mail e senha ou crie sua conta.</p>
        <LoginForm />
      </section>
    </main>
  );
}
