# Relatório de revisão de segurança

Data: 2026-06-30

## Escopo

Revisão do projeto Next.js/Supabase/Mercado Pago com foco em validação de entrada, autorização, uso de credenciais, webhooks, dependências, build e experiência de uso.

## Problemas corrigidos

- Rotas de QR aceitavam payloads sem validação forte. Agora UUIDs, JSON, URLs HTTP/HTTPS, nomes e datas são validados em helpers compartilhados.
- Atualização e exclusão de QR dependiam demais de RLS. Agora exigem usuário autenticado e filtram explicitamente por `user_id`.
- Usuário free podia tentar criar ou reativar QR permanente via API. Agora QRs free/anônimos expiram em 14 dias e datas acima desse limite exigem plano Pro.
- Redirecionamento público aceitava conteúdo sem validar esquema de URL. Agora somente `http://` e `https://` são aceitos.
- Analytics gravava IP bruto. Agora o IP é armazenado como hash.
- Webhook do Mercado Pago não validava assinatura. Agora valida `x-signature` quando `MP_WEBHOOK_SECRET` está configurado.
- Callback de autenticação usava host encaminhado sem validação. Agora redireciona apenas para caminhos internos usando origem segura.
- Conteúdo HTML do blog era injetado sem sanitização real. Agora passa por DOMPurify antes de `dangerouslySetInnerHTML`.
- Cookie de afiliado aceitava qualquer valor. Agora aceita apenas UUID, usa `encodeURIComponent`, `SameSite=Lax` e `Secure` em HTTPS.
- Build ignorava erros de lint e TypeScript. As flags foram removidas e o build voltou a falhar em regressões.
- Dependências principais foram atualizadas, removendo vulnerabilidades críticas/altas detectadas inicialmente.

## Riscos residuais

- `npm audit --omit=dev` ainda reporta 2 vulnerabilidades moderadas por `postcss@8.4.31` embutido em `next@15.5.19`. O fix automático sugere downgrade para `next@9.3.3`, então não foi aplicado.
- O webhook só falha fechado quando `MP_WEBHOOK_SECRET` estiver definido. Defina essa variável no ambiente de produção.
- Falta uma política CSP com nonce. Foi evitada por enquanto para não quebrar JSON-LD/analytics sem um desenho completo.
- O build mostra warning de runtime Edge vindo de `@supabase/supabase-js` no middleware. Não bloqueia build, mas deve ser acompanhado em atualização de dependências.
- A idempotência de comissões em webhooks ainda deve ser formalizada com uma chave/event id persistido em banco.

## Verificações executadas

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `npm audit --omit=dev`
- `git diff --check`
