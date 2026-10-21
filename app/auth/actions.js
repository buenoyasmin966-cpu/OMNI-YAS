'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient } from '../../lib/supabase/server';

function mensagemErro(error) {
  const messages = {
    invalid_credentials: 'E-mail ou senha incorretos.',
    email_not_confirmed: 'Confirme seu e-mail antes de entrar.',
    user_already_exists: 'Já existe uma conta com este e-mail.',
    email_exists: 'Já existe uma conta com este e-mail.',
    weak_password: 'Escolha uma senha mais forte, com pelo menos 6 caracteres.',
    signup_disabled: 'A criação de contas está desativada neste momento.',
    email_address_invalid: 'Digite um endereço de e-mail válido.',
    over_email_send_rate_limit: 'Muitos e-mails solicitados. Aguarde alguns minutos e tente novamente.',
    over_request_rate_limit: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
    validation_failed: 'Confira o e-mail e a senha informados.',
  };
  return messages[error.code] || 'Não foi possível concluir o acesso. Tente novamente em alguns instantes.';
}

export async function autenticar(previousState, formData) {
  const email = String(formData.get('email') || '').trim();
  const password = String(formData.get('password') || '');
  const intent = formData.get('intent');
  if (!['entrar', 'criar'].includes(intent)) return { error: 'Escolha Entrar ou Criar conta.' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    return { error: 'Preencha um e-mail válido e a senha.' };
  }
  if (intent === 'criar' && password.length < 6) return { error: 'A senha deve ter pelo menos 6 caracteres.' };
  try {
    const supabase = await createClient();
    if (!supabase) return { error: 'O acesso ainda não foi configurado. Configure as variáveis do Supabase e publique o site novamente.' };
    const { data, error } = intent === 'criar'
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: mensagemErro(error) };
    if (!data.session) return { message: 'Confira seu e-mail para confirmar o cadastro. Se você já tem conta, use Entrar.' };
  } catch {
    return { error: 'Não foi possível conectar ao serviço de acesso. Tente novamente.' };
  }
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function sair() {
  try {
    const supabase = await createClient();
    if (supabase) {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) return { error: 'Não foi possível sair. Tente novamente.' };
    }
  } catch {
    return { error: 'Não foi possível sair. Verifique sua conexão e tente novamente.' };
  }
  revalidatePath('/', 'layout');
  redirect('/login');
}
