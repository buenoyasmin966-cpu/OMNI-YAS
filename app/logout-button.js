'use client';

import { useActionState } from 'react';
import { sair } from './auth/actions';

export default function LogoutButton() {
  const [state, action, pending] = useActionState(sair, {});
  return (
    <form action={action}>
      <button className="secundario" disabled={pending}>{pending ? 'Saindo…' : 'Sair'}</button>
      {state?.error && <p className="erro" role="alert">{state.error}</p>}
    </form>
  );
}
