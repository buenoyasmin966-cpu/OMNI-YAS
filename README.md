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

## Treino de entrevista

O arquivo `desafio.js` define título, subtítulo, campos, botão, aviso, modelo e prompt. O formulário envia os campos para `POST /api/ia`, disponível apenas com uma sessão válida. A rota retorna texto simples e mantém a chave da OpenRouter apenas no servidor.

O projeto começa com `modoTeste: true`: a resposta é um exemplo identificado como simulação e nenhuma chamada à IA é feita. Ainda não há gravação do histórico no Supabase; ela será implementada na Etapa C da apostila.

Para ativar a IA real, configure `OPENROUTER_API_KEY` nas variáveis de ambiente da Vercel (sem prefixo `NEXT_PUBLIC_`), altere `modoTeste` para `false` e publique novamente. O modelo é `openrouter/free` e o limite por resposta é 900 tokens. Se a chave for adicionada depois da publicação, faça Redeploy. Nunca coloque a chave no código ou no GitHub.

Execute `npm test` para verificar montagem do prompt, modo de teste, payload da OpenRouter e erros do provedor sem gastar cota. Execute `npm run build` para validar a aplicação.

Para conferir no navegador, entre na sua conta, preencha os campos e clique em "Avaliar minhas respostas". Durante o pedido, o botão deve mostrar "Analisando..." e ficar desabilitado. O resultado deve preservar as quebras de linha. São permitidas respostas em branco para que a avaliação siga o prompt, mas é necessário preencher pelo menos um campo; cada campo aceita até 6.000 caracteres.
