#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const vm = require("vm");

const ROOT = path.resolve(__dirname, "..");
const DEFAULT_SITE_URL = "https://www.geradordeqrcode.com.br";
const MEDIUM_API_BASE = "https://api.medium.com/v1";
const VALID_PUBLISH_STATUS = new Set(["draft", "public", "unlisted"]);

function usage() {
  return `
Usage:
  node execution/medium_publish.js --list
  node execution/medium_publish.js --slug "post-slug"
  node execution/medium_publish.js --scheduled --computer-use
  node execution/medium_publish.js --slug "post-slug" --publish --publish-status draft
  node execution/medium_publish.js --me
  node execution/medium_publish.js --publications

Safe default: without --publish, the script only writes tmp/medium_payloads/*.json and *.html.
Medium API publishing requires a legacy integration token. If your account does not show
Integration tokens in Settings, use the generated HTML preview and publish/import manually.
Use --computer-use to also write a local browser-assist plan for creating a Medium draft.
`;
}

function loadDotenv(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || !line.includes("=")) continue;

    const index = line.indexOf("=");
    const key = line.slice(0, index).trim();
    let value = line.slice(index + 1).trim();
    value = value.replace(/^["']|["']$/g, "");
    if (key && !process.env[key]) process.env[key] = value;
  }
}

function parseArgs(argv) {
  const flags = new Set([
    "list",
    "me",
    "publications",
    "publish",
    "confirm-public",
    "force",
    "notify-followers",
    "no-image",
    "scheduled",
    "computer-use",
    "help",
  ]);
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      if (!args._) args._ = [];
      args._.push(token);
      continue;
    }

    const key = token.slice(2);
    if (flags.has(key)) {
      args[key] = true;
      continue;
    }

    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    args[key] = next;
    index += 1;
  }

  return args;
}

function readProjectFile(relativePath) {
  return fs.readFileSync(path.join(ROOT, relativePath), "utf8");
}

function prepareAdditionalPosts(source) {
  return source.replace(/export\s+const\s+ADDITIONAL_POSTS\s*=/, "var ADDITIONAL_POSTS =");
}

function prepareBlogData(source) {
  return source
    .replace(/import\s+\{[^}]+\}\s+from\s+["'][^"']+["'];?\s*/g, "")
    .replace(/export\s+interface\s+BlogPost\s*\{[\s\S]*?\}\s*/g, "")
    .replace(/export\s+const\s+POSTS\s*:\s*BlogPost\[\]\s*=/, "var POSTS =");
}

function loadPosts() {
  const context = {};
  vm.createContext(context);
  vm.runInContext(
    prepareAdditionalPosts(readProjectFile("src/lib/additional-blog-posts.ts")),
    context,
    { filename: "additional-blog-posts.ts" },
  );
  vm.runInContext(
    prepareBlogData(readProjectFile("src/lib/blog-data.ts")),
    context,
    { filename: "blog-data.ts" },
  );

  return (context.POSTS || []).map((post, index) => ({
    source_index: index,
    id: post.id || null,
    title: post.title || "",
    slug: post.slug || "",
    description: post.description || "",
    image_url: post.image_url || null,
    created_at: post.created_at || "",
    updated_at: post.updated_at || "",
    content: post.content || "",
  }));
}

function slugCounts(posts) {
  const counts = {};
  for (const post of posts) {
    counts[post.slug] = (counts[post.slug] || 0) + 1;
  }
  return counts;
}

function listPosts(posts) {
  const counts = slugCounts(posts);
  console.log(`Found ${posts.length} posts.\n`);
  for (const post of posts) {
    const duplicateMarker = counts[post.slug] > 1 ? " DUPLICATE" : "";
    console.log(`[${String(post.source_index).padStart(2, "0")}] ${post.slug}${duplicateMarker}`);
    console.log(`     ${post.title}`);
  }
}

function selectPost(posts, slug, sourceIndex) {
  let matches = posts.filter((post) => post.slug === slug);
  if (sourceIndex !== undefined) {
    const parsedIndex = Number(sourceIndex);
    matches = matches.filter((post) => post.source_index === parsedIndex);
  }

  if (matches.length === 0) {
    throw new Error(`No post found for slug: ${slug}`);
  }

  if (matches.length > 1) {
    const indexes = matches.map((post) => post.source_index).join(", ");
    throw new Error(
      `Slug is ambiguous: ${slug}. Matching source indexes: ${indexes}. ` +
        "Fix the duplicate or pass --source-index.",
    );
  }

  return matches[0];
}

function uniquePostsBySlug(posts) {
  const seen = new Set();
  const unique = [];
  for (const post of posts) {
    if (!post.slug || seen.has(post.slug)) continue;
    seen.add(post.slug);
    unique.push(post);
  }
  return unique;
}

function saoPauloDateParts(date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  return parts;
}

function scheduledSlotForDate(date) {
  const parts = saoPauloDateParts(date);
  const hour = Number(parts.hour || 0);
  const slotIndex = hour >= 22 ? 2 : hour >= 18 ? 1 : hour >= 12 ? 0 : 2;
  const slotHour = [12, 18, 22][slotIndex];
  const dayNumber = Math.floor(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86400000,
  );

  return {
    timezone: "America/Sao_Paulo",
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${String(slotHour).padStart(2, "0")}:00`,
    slot_index: slotIndex,
    rotation_index: dayNumber * 3 + slotIndex,
  };
}

function selectScheduledPost(posts, atValue) {
  const date = atValue ? new Date(atValue) : new Date();
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid --at date: ${atValue}`);
  }

  const eligiblePosts = uniquePostsBySlug(posts);
  if (eligiblePosts.length === 0) {
    throw new Error("No posts available for scheduled Medium draft generation.");
  }

  const schedule = scheduledSlotForDate(date);
  const post = eligiblePosts[schedule.rotation_index % eligiblePosts.length];
  return { post, schedule };
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absolutizeUrl(url, siteUrl) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return cleanUrl;
  if (/^(https?:|mailto:|tel:|#)/i.test(cleanUrl)) return cleanUrl;
  if (cleanUrl.startsWith("//")) return `https:${cleanUrl}`;
  if (cleanUrl.startsWith("/")) return `${siteUrl.replace(/\/$/, "")}${cleanUrl}`;
  return cleanUrl;
}

function absolutizeHtmlLinks(content, siteUrl) {
  return content.replace(/\b(href|src)=("([^"]*)"|'([^']*)')/gi, (match, attr, quoted, dbl, sgl) => {
    const quote = quoted[0];
    const url = dbl || sgl || "";
    return `${attr}=${quote}${escapeHtml(absolutizeUrl(url, siteUrl))}${quote}`;
  });
}

function stripRiskyHtml(content) {
  let cleaned = String(content || "").replace(/<!--[\s\S]*?-->/g, "");
  for (const tag of ["script", "style", "iframe", "object", "embed", "form", "input", "button"]) {
    const pairPattern = new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "gi");
    const singlePattern = new RegExp(`<${tag}\\b[^>]*?/?>`, "gi");
    cleaned = cleaned.replace(pairPattern, "").replace(singlePattern, "");
  }

  let previous = null;
  while (previous !== cleaned) {
    previous = cleaned;
    cleaned = cleaned.replace(
      /<div\b[^>]*class=["'][^"']*(?:cta-box|cta-final)[^"']*["'][^>]*>[\s\S]*?<\/div>/gi,
      "",
    );
  }

  return cleaned
    .replace(/<\/?article\b[^>]*>/gi, "")
    .replace(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi, "")
    .replace(/\s(?:class|style|id|target|rel|data-[\w-]+)=(["']).*?\1/gis, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildCanonicalUrl(slug, siteUrl) {
  return `${siteUrl.replace(/\/$/, "")}/blog/${slug}`;
}

function normalizeTitle(title) {
  const warnings = [];
  let cleanTitle = String(title || "").replace(/\s+/g, " ").trim();
  if (cleanTitle.length > 100) {
    warnings.push("Medium title field is limited to 100 characters; title was truncated.");
    cleanTitle = `${cleanTitle.slice(0, 97).trim()}...`;
  }
  return { title: cleanTitle, warnings };
}

function parseTags(rawTags) {
  const warnings = [];
  const source = rawTags || process.env.MEDIUM_DEFAULT_TAGS || "QR Code,Marketing Digital,SEO";
  const tags = source
    .split(",")
    .map((tag) => tag.replace(/\s+/g, " ").trim())
    .filter(Boolean);

  const accepted = [];
  for (const tag of tags) {
    if (tag.length > 25) {
      warnings.push(`Tag ignored because it is longer than 25 characters: ${tag}`);
      continue;
    }
    accepted.push(tag);
  }

  if (accepted.length > 3) {
    warnings.push("Medium uses only the first 3 tags; extra tags were removed.");
    accepted.length = 3;
  }

  return { tags: accepted, warnings };
}

function buildMediumContent(post, siteUrl, canonicalUrl, includeImage) {
  const title = escapeHtml(post.title);
  const body = absolutizeHtmlLinks(stripRiskyHtml(post.content), siteUrl);

  let hero = "";
  if (includeImage && post.image_url) {
    const imageUrl = absolutizeUrl(post.image_url, siteUrl);
    if (imageUrl.startsWith("http")) {
      hero = `<figure><img src="${escapeHtml(imageUrl)}" alt="${title}"></figure>\n`;
    }
  }

  const canonicalNote =
    `<p><em>Publicado originalmente em ` +
    `<a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a>.</em></p>`;

  return `<h1>${title}</h1>\n${hero}${body}\n\n${canonicalNote}`.trim();
}

function textWordCount(content) {
  const text = String(content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ");
  return text.split(/\s+/).filter(Boolean).length;
}

function buildPayload(post, siteUrl, publishStatus, tags, includeImage, notifyFollowers) {
  if (!VALID_PUBLISH_STATUS.has(publishStatus)) {
    throw new Error(`Invalid publish status: ${publishStatus}`);
  }

  const canonicalUrl = buildCanonicalUrl(post.slug, siteUrl);
  const titleResult = normalizeTitle(post.title);
  const content = buildMediumContent(post, siteUrl, canonicalUrl, includeImage);
  const warnings = [...titleResult.warnings];

  if (textWordCount(content) < 300) {
    warnings.push("Prepared content has fewer than 300 words; review before publishing.");
  }

  const payload = {
    title: titleResult.title,
    contentFormat: "html",
    content,
    canonicalUrl,
    tags,
    publishStatus,
    license: "all-rights-reserved",
  };
  if (notifyFollowers) payload.notifyFollowers = true;

  return { payload, warnings };
}

function writeOutputs(payload, outputDir, slug) {
  fs.mkdirSync(outputDir, { recursive: true });
  const payloadPath = path.join(outputDir, `${slug}.json`);
  const previewPath = path.join(outputDir, `${slug}.html`);

  fs.writeFileSync(payloadPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  fs.writeFileSync(
    previewPath,
    [
      "<!doctype html>",
      '<html lang="pt-BR">',
      "<head>",
      '  <meta charset="utf-8">',
      `  <title>${escapeHtml(payload.title)}</title>`,
      "</head>",
      "<body>",
      payload.content,
      "</body>",
      "</html>",
      "",
    ].join("\n"),
    "utf8",
  );

  return { payloadPath, previewPath };
}

function writeComputerUsePlan(payload, outputDir, slug, post, previewPath) {
  const planPath = path.join(outputDir, `${slug}.computer-use.json`);
  const guidePath = path.join(outputDir, `${slug}.computer-use.md`);
  const previewUrl = pathToFileURL(previewPath).href;
  const plan = {
    mode: "medium_ui_draft",
    status: "requires_human_confirmation_before_medium_save",
    mediumNewStoryUrl: "https://medium.com/new-story",
    previewPath,
    previewUrl,
    title: payload.title,
    canonicalUrl: payload.canonicalUrl,
    tags: payload.tags,
    heroImageUrl: post.image_url || null,
    publishStatus: "draft",
    safety: [
      "Do not click Publish.",
      "Do not transmit content to Medium unless the user confirms at action time.",
      "Create or leave the story as a Medium draft for human review.",
    ],
    computerUseFlow: [
      "Open previewUrl in the browser.",
      "Select the rendered article body and copy it so headings, paragraphs, lists, links, and the hero image are preserved.",
      "Open mediumNewStoryUrl in the same logged-in browser profile.",
      "Paste the rendered article into the Medium editor.",
      "Verify the hero image appears above the first paragraph and headings keep their hierarchy.",
      "Open story settings and add canonicalUrl as the canonical/original link if Medium exposes that field.",
      "Add the first three tags from tags.",
      "Leave the story as a draft and stop for user review.",
    ],
  };

  fs.writeFileSync(planPath, `${JSON.stringify(plan, null, 2)}\n`, "utf8");
  fs.writeFileSync(
    guidePath,
    [
      `# Plano Computer Use: ${payload.title}`,
      "",
      "Este arquivo orienta o fluxo assistido pelo plugin de Computador para criar um rascunho no Medium.",
      "O envio para o Medium e uma acao em conta externa e precisa de confirmacao humana no momento da execucao.",
      "",
      `- Preview local: ${previewUrl}`,
      `- Medium editor: ${plan.mediumNewStoryUrl}`,
      `- Link canonico: ${payload.canonicalUrl}`,
      `- Tags: ${payload.tags.join(", ")}`,
      `- Imagem principal: ${post.image_url || "sem imagem"}`,
      "",
      "## Passos operacionais",
      "",
      "1. Abrir o preview local no navegador.",
      "2. Copiar o artigo renderizado, preservando imagem, titulos, paragrafos, listas e links.",
      "3. Abrir o editor do Medium no perfil ja autenticado.",
      "4. Colar o conteudo no editor.",
      "5. Conferir se a imagem ficou antes do primeiro paragrafo.",
      "6. Configurar o link canonico/original quando o Medium disponibilizar o campo.",
      "7. Adicionar as tags.",
      "8. Deixar como rascunho e parar para revisao humana.",
      "",
      "## Guardrails",
      "",
      "- Nao clicar em Publish.",
      "- Nao repetir publicacoes em massa.",
      "- Nao postar sem link canonico quando o objetivo for republicacao.",
      "- Pedir confirmacao antes de transmitir qualquer conteudo ao Medium.",
      "",
    ].join("\n"),
    "utf8",
  );

  return { planPath, guidePath };
}

async function mediumRequest(method, endpoint, token, payload) {
  const response = await fetch(`${MEDIUM_API_BASE}${endpoint}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Accept-Charset": "utf-8",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const responseBody = await response.text();
  if (!response.ok) {
    throw new Error(`Medium API error ${response.status}:\n${responseBody}`);
  }
  return responseBody ? JSON.parse(responseBody) : {};
}

function requireToken() {
  const token = String(process.env.MEDIUM_INTEGRATION_TOKEN || "").trim();
  if (!token) {
    throw new Error("MEDIUM_INTEGRATION_TOKEN is required for Medium API calls.");
  }
  return token;
}

async function getMe(token) {
  const response = await mediumRequest("GET", "/me", token);
  return response.data || {};
}

async function getAuthorId(token, explicitAuthorId) {
  const authorId = String(explicitAuthorId || process.env.MEDIUM_AUTHOR_ID || "").trim();
  if (authorId) return authorId;

  const me = await getMe(token);
  if (!me.id) {
    throw new Error("Could not discover Medium author id from /me.");
  }
  return me.id;
}

function loadManifest(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function saveManifest(filePath, manifest) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
}

async function publishToMedium(payload, slug, args) {
  if (payload.publishStatus === "public" && !args["confirm-public"]) {
    throw new Error("Refusing public publish without --confirm-public.");
  }

  const token = requireToken();
  const manifestPath = path.join(ROOT, "tmp", "medium_publication_manifest.json");
  const manifest = loadManifest(manifestPath);
  if (manifest[slug] && !args.force) {
    throw new Error(`Slug already exists in manifest: ${slug}. Use --force only after reviewing duplicates.`);
  }

  let endpoint;
  if (args.target === "publication") {
    const publicationId = String(args["publication-id"] || process.env.MEDIUM_PUBLICATION_ID || "").trim();
    if (!publicationId) {
      throw new Error("MEDIUM_PUBLICATION_ID or --publication-id is required for publication target.");
    }
    endpoint = `/publications/${publicationId}/posts`;
  } else {
    const authorId = await getAuthorId(token, args["author-id"]);
    endpoint = `/users/${authorId}/posts`;
  }

  const response = await mediumRequest("POST", endpoint, token, payload);
  const data = response.data || {};
  manifest[slug] = {
    medium_id: data.id,
    medium_url: data.url,
    canonical_url: payload.canonicalUrl,
    publish_status: payload.publishStatus,
    published_at: new Date().toISOString(),
  };
  saveManifest(manifestPath, manifest);
  return data;
}

async function main() {
  loadDotenv(path.join(ROOT, ".env"));

  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  if (args.me) {
    const token = requireToken();
    console.log(JSON.stringify(await getMe(token), null, 2));
    return;
  }

  if (args.publications) {
    const token = requireToken();
    const authorId = await getAuthorId(token, args["author-id"]);
    const response = await mediumRequest("GET", `/users/${authorId}/publications`, token);
    console.log(JSON.stringify(response.data || [], null, 2));
    return;
  }

  const posts = loadPosts();
  if (args.list) {
    listPosts(posts);
    return;
  }

  if (!args.slug && !args.scheduled) {
    throw new Error(`Use --slug, --list, --me, or --publications.\n${usage()}`);
  }

  const siteUrl = args["site-url"] || process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL;
  const publishStatus = args["publish-status"] || process.env.MEDIUM_DEFAULT_PUBLISH_STATUS || "draft";
  const outputDir = args["output-dir"] || path.join(ROOT, "tmp", "medium_payloads");
  const scheduledSelection = args.scheduled ? selectScheduledPost(posts, args.at) : null;
  const post = scheduledSelection
    ? scheduledSelection.post
    : selectPost(posts, args.slug, args["source-index"]);
  const tagResult = parseTags(args.tags);
  const payloadResult = buildPayload(
    post,
    siteUrl,
    publishStatus,
    tagResult.tags,
    !args["no-image"],
    Boolean(args["notify-followers"]),
  );
  const warnings = [...payloadResult.warnings, ...tagResult.warnings];
  const { payloadPath, previewPath } = writeOutputs(payloadResult.payload, outputDir, post.slug);
  const computerUseOutput = args["computer-use"]
    ? writeComputerUsePlan(payloadResult.payload, outputDir, post.slug, post, previewPath)
    : null;

  if (scheduledSelection) {
    console.log(
      `Scheduled slot:            ${scheduledSelection.schedule.date} ${scheduledSelection.schedule.time} ${scheduledSelection.schedule.timezone}`,
    );
  }
  console.log(`Prepared Medium payload: ${payloadPath}`);
  console.log(`Prepared HTML preview:   ${previewPath}`);
  if (computerUseOutput) {
    console.log(`Prepared UI plan:        ${computerUseOutput.planPath}`);
    console.log(`Prepared UI guide:       ${computerUseOutput.guidePath}`);
  }
  console.log(`Canonical URL:           ${payloadResult.payload.canonicalUrl}`);
  console.log(`Publish status:          ${payloadResult.payload.publishStatus}`);
  console.log(`Tags:                    ${payloadResult.payload.tags.join(", ")}`);

  if (warnings.length > 0) {
    console.log("\nWarnings:");
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (!args.publish) {
    console.log("\nDry-run only. No Medium API call was made.");
    console.log("If your Medium account has no Integration Tokens option, use the HTML preview for manual publishing/import.");
    return;
  }

  const data = await publishToMedium(payloadResult.payload, post.slug, args);
  console.log("\nMedium API publish result:");
  console.log(JSON.stringify(data, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
