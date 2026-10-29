import { redirect } from 'next/navigation';
import { createClient } from '../lib/supabase/server';
import Analisador from './analisador';
import SessionHeader from './session-header';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const supabase = await createClient();
  if (!supabase) redirect('/login');
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  return (
    <main className="pagina">
      <section className="cartao">
        <SessionHeader email={user.email} />
        <Analisador />
      </section>
    </main>
  );
}
