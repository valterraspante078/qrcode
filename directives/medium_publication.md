# Diretriz: Publicacao Segura no Medium

Esta diretriz define o fluxo para reaproveitar posts do blog do projeto no Medium sem violar boas praticas de SEO, sem gerar spam e sem publicar nada real por acidente.

## Objetivo

Republicar ou adaptar posts existentes do blog em `src/lib/blog-data.ts` e `src/lib/additional-blog-posts.ts` para o Medium, priorizando:

- uso de `canonicalUrl` apontando para o artigo original do site;
- publicacao inicial como `draft`;
- revisao humana antes de `public`;
- remocao de CTAs agressivos ou duplicados;
- deduplicacao por `slug`;
- rastreabilidade por manifesto local.

## Ferramenta de execucao

Use o script deterministico:

```bash
node execution/medium_publish.js --slug "slug-do-post"
```

O modo padrao e seguro: gera payload JSON e preview HTML em `tmp/medium_payloads/`, sem chamar a API do Medium. Este e o fluxo principal para contas que nao possuem integration token.

Para listar posts disponiveis:

```bash
node execution/medium_publish.js --list
```

Para preparar automaticamente o post do horario atual e gerar tambem um plano para o plugin de Computador:

```bash
node execution/medium_publish.js --scheduled --computer-use
```

Esse comando gera:

- `tmp/medium_payloads/<slug>.json`, com o payload estruturado;
- `tmp/medium_payloads/<slug>.html`, com o artigo renderizado para copiar;
- `tmp/medium_payloads/<slug>.computer-use.json`, com os campos que o fluxo de navegador deve usar;
- `tmp/medium_payloads/<slug>.computer-use.md`, com o passo a passo operacional.

Para publicar como rascunho depois de configurar um token legado:

```bash
node execution/medium_publish.js --slug "slug-do-post" --publish --publish-status draft
```

Publicacao publica exige confirmacao explicita:

```bash
node execution/medium_publish.js --slug "slug-do-post" --publish --publish-status public --confirm-public
```

## Variaveis de ambiente

Configure em `.env` somente se sua conta ja tiver um token legado do Medium:

```env
MEDIUM_INTEGRATION_TOKEN=
MEDIUM_AUTHOR_ID=
MEDIUM_PUBLICATION_ID=
MEDIUM_DEFAULT_PUBLISH_STATUS=draft
MEDIUM_DEFAULT_TAGS=QR Code,Marketing Digital,SEO
```

`MEDIUM_INTEGRATION_TOKEN` e obrigatorio apenas para chamadas reais via API. Em contas sem integration token, nao use `--publish`; use o preview HTML gerado em `tmp/medium_payloads/` e publique/importe manualmente no Medium.

Se houver token legado, `MEDIUM_AUTHOR_ID` pode ser descoberto pelo proprio script:

```bash
node execution/medium_publish.js --me
```

Para listar publicacoes vinculadas ao usuario:

```bash
node execution/medium_publish.js --publications
```

## Fluxo recomendado sem token

1. Liste os posts e verifique duplicidades.
2. Rode dry-run para o `slug` desejado.
3. Abra o preview HTML em `tmp/medium_payloads/`.
4. Revise titulo, conteudo, tags e link canonico.
5. No Medium, use a tela de importacao de historia por URL original, quando disponivel, ou crie uma nova historia e copie o conteudo do preview.
6. Confira se o link canonico aponta para a URL original do blog.
7. Salve como rascunho e publique manualmente apos revisar.

## Fluxo com plugin de Computador

Use este fluxo quando a conta nao possuir token de integracao e a publicacao precisar passar pelo editor visual do Medium.

1. Rode `node execution/medium_publish.js --scheduled --computer-use` ou informe um `--slug` especifico com `--computer-use`.
2. Abra o arquivo `.computer-use.json` gerado para identificar `previewUrl`, `mediumNewStoryUrl`, `canonicalUrl`, tags e imagem principal.
3. Com o navegador ja autenticado no Medium, abra o `previewUrl`.
4. Copie o artigo renderizado, nao o HTML bruto, para preservar imagem, titulos, paragrafos, listas e links.
5. Abra `https://medium.com/new-story` e cole o conteudo no editor.
6. Confira se a imagem principal ficou antes do primeiro paragrafo e se os headings foram preservados.
7. Configure o link canonico/original nas configuracoes da historia quando o Medium disponibilizar esse campo.
8. Adicione no maximo tres tags.
9. Deixe como rascunho e pare para revisao humana. Nao clique em `Publish`.

Guardrail: salvar, postar ou alterar uma historia dentro do Medium e uma acao em conta externa. Mesmo com automacao via Computador, antes de transmitir conteudo para o Medium deve haver confirmacao humana no momento da execucao.

## Agendamento

A Vercel chama apenas rotas HTTP e nao consegue controlar o navegador local nem o plugin de Computador. Por isso o agendamento em producao prepara o slot seguro; o executor de navegador permanece local e assistido.

Arquivos relacionados:

- `vercel.json`: agenda `/api/cron/medium-drafts` nos horarios equivalentes a 12:00, 18:00 e 22:00 em `America/Sao_Paulo`.
- `src/app/api/cron/medium-drafts/route.ts`: valida `Authorization: Bearer CRON_SECRET` e retorna o resumo do payload do rascunho.
- `src/lib/medium-drafts.ts`: seleciona o post do slot, monta o conteudo com imagem, tags, link canonico e status `draft`.

Observacoes:

- Configure `CRON_SECRET` na Vercel antes de depender do cron.
- Em contas Vercel com limite de cron diario, tres execucoes por dia podem exigir plano superior.
- A rota cron nao chama a API do Medium e nao publica conteudo. Ela existe para preparar e auditar o slot agendado sem risco.

## Fluxo opcional com token legado

1. Configure `MEDIUM_INTEGRATION_TOKEN`.
2. Rode `node execution/medium_publish.js --me` para descobrir o autor.
3. Rode `node execution/medium_publish.js --publications` se for publicar em publication.
4. Publique primeiro como `draft`.
5. Revise no painel do Medium.
6. Use `public` apenas com `--confirm-public` e apos revisao humana.

## Regras de conteudo

- Nao publique dezenas de posts em sequencia.
- Nao use apenas trechos curtos criados para levar trafego ao site.
- Prefira republicacao integral com `canonicalUrl`.
- Preserve valor editorial no Medium.
- Remova blocos de CTA excessivamente promocionais.
- Mantenha links internos convertidos para URLs absolutas.
- Use no maximo 3 tags principais.

## Limitacoes do Medium

Com base na documentacao oficial disponivel em 2026 e no comportamento atual da tela de configuracoes:

- a documentacao da API oficial esta arquivada e a API nao e mais recomendada/suportada;
- novas integracoes OAuth nao sao aceitas pela documentacao arquivada;
- o Medium informa que nao emite mais novos integration tokens;
- contas antigas que ja tinham token podem ainda conseguir usar o fluxo legado;
- nao existe sandbox: chamadas reais afetam a conta;
- `publishStatus` pode ser `draft`, `public` ou `unlisted`;
- `canonicalUrl` deve apontar para o post original;
- somente as tres primeiras tags sao usadas;
- tags acima de 25 caracteres podem ser ignoradas;
- o Medium pode restringir conteudo duplicado, spam ou automacao abusiva.

## Self-annealing

Quando houver erro:

1. leia o erro completo retornado pela API;
2. corrija o script se for erro deterministico;
3. teste novamente em dry-run;
4. publique apenas como `draft`;
5. registre nesta diretriz qualquer novo limite, erro comum ou ajuste necessario.

## Observacao local

Foi encontrado um `slug` duplicado em `src/lib/blog-data.ts`: `como-criar-qr-code-personalizado`. O script deve bloquear publicacao ambigua e pedir `--source-index` ou correcao do conteudo.
