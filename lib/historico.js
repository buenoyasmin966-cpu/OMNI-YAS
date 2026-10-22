export function formatarEntrada(config, valores) {
  return config.campos.map(({ id, rotulo }) => `${rotulo}:\n${valores[id] ?? ''}`).join('\n\n');
}

export async function salvarResposta(supabase, config, valores, resposta) {
  // user_id comes from the authenticated session via the database default auth.uid().
  const { error } = await supabase.from('respostas').insert({
    entrada: formatarEntrada(config, valores),
    resposta,
  });
  if (error) throw new Error('Não foi possível salvar esta resposta no histórico.');
}

export async function carregarHistorico(supabase, userId) {
  // RLS remains required; the explicit filter also limits the query to this user.
  return supabase.from('respostas')
    .select('id, entrada, resposta, criado_em')
    .eq('user_id', userId)
    .order('criado_em', { ascending: false })
    .order('id', { ascending: false });
}
