import { POSTS, type BlogPost } from "./blog-data";

export const DEFAULT_SITE_URL = "https://www.geradordeqrcode.com.br";
export const MEDIUM_DRAFT_TIMEZONE = "America/Sao_Paulo";

const DEFAULT_TAGS = ["QR Code", "Marketing Digital", "SEO"];

export type MediumDraftPayload = {
  title: string;
  contentFormat: "html";
  content: string;
  canonicalUrl: string;
  tags: string[];
  publishStatus: "draft";
  license: "all-rights-reserved";
};

export type MediumDraftSchedule = {
  timezone: typeof MEDIUM_DRAFT_TIMEZONE;
  date: string;
  time: "12:00" | "18:00" | "22:00";
  slotIndex: number;
  rotationIndex: number;
};

export type ScheduledMediumDraft = {
  schedule: MediumDraftSchedule;
  post: {
    title: string;
    slug: string;
    imageUrl: string | null;
  };
  payload: MediumDraftPayload;
  warnings: string[];
  summary: {
    canonicalUrl: string;
    tags: string[];
    publishStatus: "draft";
    wordCount: number;
    hasHeroImage: boolean;
  };
};

function escapeHtml(value: string) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function absolutizeUrl(url: string | null | undefined, siteUrl: string) {
  const cleanUrl = String(url || "").trim();
  if (!cleanUrl) return cleanUrl;
  if (/^(https?:|mailto:|tel:|#)/i.test(cleanUrl)) return cleanUrl;
  if (cleanUrl.startsWith("//")) return `https:${cleanUrl}`;
  if (cleanUrl.startsWith("/")) return `${siteUrl.replace(/\/$/, "")}${cleanUrl}`;
  return cleanUrl;
}

function absolutizeHtmlLinks(content: string, siteUrl: string) {
  return content.replace(/\b(href|src)=("([^"]*)"|'([^']*)')/gi, (_match, attr, quoted, dbl, sgl) => {
    const quote = quoted[0];
    const url = dbl || sgl || "";
    return `${attr}=${quote}${escapeHtml(absolutizeUrl(url, siteUrl))}${quote}`;
  });
}

function stripRiskyHtml(content: string) {
  let cleaned = String(content || "").replace(/<!--[\s\S]*?-->/g, "");

  for (const tag of ["script", "style", "iframe", "object", "embed", "form", "input", "button"]) {
    const pairPattern = new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "gi");
    const singlePattern = new RegExp(`<${tag}\\b[^>]*?/?>`, "gi");
    cleaned = cleaned.replace(pairPattern, "").replace(singlePattern, "");
  }

  let previous = "";
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
    .replace(/\s(?:class|style|id|target|rel|data-[\w-]+)=(["'])[\s\S]*?\1/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeTitle(title: string) {
  const warnings: string[] = [];
  let cleanTitle = String(title || "").replace(/\s+/g, " ").trim();

  if (cleanTitle.length > 100) {
    warnings.push("Medium title field is limited to 100 characters; title was truncated.");
    cleanTitle = `${cleanTitle.slice(0, 97).trim()}...`;
  }

  return { title: cleanTitle, warnings };
}

function textWordCount(content: string) {
  const text = String(content || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&[^;]+;/g, " ");

  return text.split(/\s+/).filter(Boolean).length;
}

function uniquePostsBySlug(posts: BlogPost[]) {
  const seen = new Set<string>();
  const unique: BlogPost[] = [];

  for (const post of posts) {
    if (!post.slug || seen.has(post.slug)) continue;
    seen.add(post.slug);
    unique.push(post);
  }

  return unique;
}

function saoPauloDateParts(date: Date) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: MEDIUM_DRAFT_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });

  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }

  return parts;
}

export function getMediumDraftSchedule(date: Date): MediumDraftSchedule {
  const parts = saoPauloDateParts(date);
  const hour = Number(parts.hour || 0);
  const slotIndex = hour >= 22 ? 2 : hour >= 18 ? 1 : hour >= 12 ? 0 : 2;
  const time = ["12:00", "18:00", "22:00"][slotIndex] as MediumDraftSchedule["time"];
  const rotationDay = Math.floor(
    Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day)) / 86400000,
  );

  return {
    timezone: MEDIUM_DRAFT_TIMEZONE,
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time,
    slotIndex,
    rotationIndex: rotationDay * 3 + slotIndex,
  };
}

export function getScheduledMediumPost(date: Date) {
  const eligiblePosts = uniquePostsBySlug(POSTS);
  if (eligiblePosts.length === 0) {
    throw new Error("No posts available for Medium draft generation.");
  }

  const schedule = getMediumDraftSchedule(date);
  const post = eligiblePosts[schedule.rotationIndex % eligiblePosts.length];
  return { schedule, post };
}

export function buildMediumDraftPayload(
  post: BlogPost,
  options: {
    siteUrl?: string;
    tags?: string[];
    includeImage?: boolean;
  } = {},
) {
  const siteUrl = options.siteUrl || DEFAULT_SITE_URL;
  const tags = (options.tags?.length ? options.tags : DEFAULT_TAGS).slice(0, 3);
  const canonicalUrl = `${siteUrl.replace(/\/$/, "")}/blog/${post.slug}`;
  const titleResult = normalizeTitle(post.title);
  const title = escapeHtml(post.title);
  const body = absolutizeHtmlLinks(stripRiskyHtml(post.content), siteUrl);
  const warnings = [...titleResult.warnings];
  const imageUrl = absolutizeUrl(post.image_url, siteUrl);
  const hero =
    options.includeImage !== false && imageUrl.startsWith("http")
      ? `<figure><img src="${escapeHtml(imageUrl)}" alt="${title}"></figure>\n`
      : "";
  const canonicalNote =
    `<p><em>Publicado originalmente em ` +
    `<a href="${escapeHtml(canonicalUrl)}">${escapeHtml(canonicalUrl)}</a>.</em></p>`;
  const content = `<h1>${escapeHtml(titleResult.title)}</h1>\n${hero}${body}\n\n${canonicalNote}`.trim();
  const wordCount = textWordCount(content);

  if (wordCount < 300) {
    warnings.push("Prepared content has fewer than 300 words; review before publishing.");
  }

  const payload: MediumDraftPayload = {
    title: titleResult.title,
    contentFormat: "html",
    content,
    canonicalUrl,
    tags,
    publishStatus: "draft",
    license: "all-rights-reserved",
  };

  return {
    payload,
    warnings,
    wordCount,
    hasHeroImage: Boolean(hero),
  };
}

export function buildScheduledMediumDraft(
  date = new Date(),
  options: {
    siteUrl?: string;
    tags?: string[];
    includeImage?: boolean;
  } = {},
): ScheduledMediumDraft {
  const { schedule, post } = getScheduledMediumPost(date);
  const draft = buildMediumDraftPayload(post, options);

  return {
    schedule,
    post: {
      title: post.title,
      slug: post.slug,
      imageUrl: post.image_url,
    },
    payload: draft.payload,
    warnings: draft.warnings,
    summary: {
      canonicalUrl: draft.payload.canonicalUrl,
      tags: draft.payload.tags,
      publishStatus: "draft",
      wordCount: draft.wordCount,
      hasHeroImage: draft.hasHeroImage,
    },
  };
}
