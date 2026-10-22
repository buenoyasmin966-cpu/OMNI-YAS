import Link from 'next/link';
import LogoutButton from './logout-button';

export default function SessionHeader({ email }) {
  return (
    <header className="sessao">
      <span>{email}</span>
      <nav className="sessao-acoes" aria-label="Sua conta">
        <Link href="/historico">Meu histórico</Link>
        <LogoutButton />
      </nav>
    </header>
  );
}
