# OMNI-YAS

Site Next.js com App Router e JavaScript, criado para a oficina Do Zero ao Ar.

## Rodar localmente

1. Instale o Node.js (versao 20 ou superior).
2. Execute `npm ci`.
3. Copie `.env.example` para `.env.local` e preencha o endereço e a chave pública do Supabase. São aceitos `NEXT_PUBLIC_SUPABASE_ANON_KEY` ou `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (se ambas estiverem definidas, ANON_KEY tem prioridade). Nunca use chaves secret ou service_role.
4. Execute `npm run dev`.
5. Abra http://localhost:3000. Visitantes sem sessão vão para `/login`.

## Publicar na Vercel

Envie estes arquivos para seu repositorio GitHub e importe o repositorio na Vercel. A Vercel detecta automaticamente o Next.js.

Configure na Vercel as mesmas variáveis do Supabase e faça Redeploy após alterá-las. Em Supabase → Authentication, habilite o provedor Email e configure Site URL e Redirect URLs com o domínio do site. Se a confirmação de e-mail estiver habilitada, o cadastro exibirá uma orientação para confirmar antes de entrar; para a oficina, ela pode ser desligada no painel conforme a apostila.

## Conferir o login

- Execute `npm run build` para validar a versão de produção.
- Em janela anônima, abra `/`: deve redirecionar para `/login` sem mostrar o analisador.
- Crie uma conta, confirme o e-mail se solicitado e entre. Confira seu e-mail no topo e o funcionamento de Analisar.
- Recarregue a página: a sessão deve continuar ativa.
- Clique em Sair e tente abrir `/` novamente: deve voltar ao login.
- Entre novamente e repita com outra conta em uma janela anônima.
- Uma senha incorreta deve mostrar uma mensagem em português.

As sessões usam cookies do Supabase SSR, renovados pelo middleware. A página principal valida a identidade no servidor com `auth.getUser()` antes de renderizar. O formulário Analisar continua apenas repetindo o texto; esta etapa não grava dados na tabela `respostas`.

## Personalizar

- Textos: `app/page.js`
- Cores e estilos: `app/globals.css`

O botao Analisar apenas repete o texto digitado. Nao ha integracao com IA ou banco de dados nesta etapa.
