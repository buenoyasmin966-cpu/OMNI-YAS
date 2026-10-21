'use client';

import { useActionState, useState } from 'react';
import { autenticar } from '../auth/actions';

export default function LoginForm() {
  const [state, action, pending] = useActionState(autenticar, {});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  return (
    <form action={action}>
      <label htmlFor="email">E-mail</label>
      <input id="email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
      <label htmlFor="password">Senha</label>
      <input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
      <p className="ajuda">Para criar uma conta, use uma senha com pelo menos 6 caracteres.</p>
      <div className="acoes">
        <button type="submit" name="intent" value="entrar" disabled={pending}>Entrar</button>
        <button className="secundario" type="submit" name="intent" value="criar" disabled={pending}>Criar conta</button>
      </div>
      {pending && <p role="status">Aguarde…</p>}
      {state.error && <p className="erro" role="alert">{state.error}</p>}
      {state.message && <p role="status">{state.message}</p>}
    </form>
  );
}
