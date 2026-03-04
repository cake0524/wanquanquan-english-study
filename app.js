const articleList = document.getElementById("article-list");
const emptyState = document.getElementById("empty-state");
const feedStatus = document.getElementById("feed-status");
const lastUpdated = document.getElementById("last-updated");
const refreshHint = document.getElementById("refresh-hint");
const articleCount = document.getElementById("article-count");
const sourceCount = document.getElementById("source-count");
const refreshBtn = document.getElementById("refresh-btn");
const installBtn = document.getElementById("install-btn");
const filterAllBtn = document.getElementById("filter-all");
const filterDirectBtn = document.getElementById("filter-direct");
const filterJumpBtn = document.getElementById("filter-jump");

const STORAGE_KEY = "reading-radar-cache-v1";
const REFRESH_INTERVAL = 10 * 60 * 1000;
const MIN_ARTICLES = 5;
const MAX_ARTICLES = 10;
const FALLBACK_SUMMARY = "Open the article to read the full text from the original publisher.";
const DIRECT_ACCESS_PUBLISHERS = [
  "China Daily",
  "CGTN",
  "Global Times",
  "Beijing Review",
  "ECNS",
];
const CLAUSE_MARKERS = [
  "although",
  "though",
  "while",
  "because",
  "despite",
  "amid",
  "as",
  "when",
  "which",
  "that",
  "who",
  "where",
  "whereas",
  "before",
  "after",
  "unless",
];

const TRANSLATION_PHRASES = [
  ["according to", "根据"],
  ["in order to", "为了"],
  ["as a result", "结果"],
  ["in response to", "为回应"],
  ["in the wake of", "在……之后"],
  ["as well as", "以及"],
  ["rather than", "而不是"],
  ["more than", "超过"],
  ["less than", "不到"],
  ["for example", "例如"],
  ["for instance", "例如"],
  ["at the same time", "与此同时"],
  ["in recent years", "近年来"],
  ["around the world", "在世界各地"],
];

const TRANSLATION_WORDS = new Map([
  ["policy", "政策"],
  ["policies", "政策"],
  ["economy", "经济"],
  ["economic", "经济的"],
  ["growth", "增长"],
  ["global", "全球"],
  ["market", "市场"],
  ["markets", "市场"],
  ["government", "政府"],
  ["governments", "政府"],
  ["company", "公司"],
  ["companies", "公司"],
  ["technology", "技术"],
  ["science", "科学"],
  ["education", "教育"],
  ["health", "健康"],
  ["trade", "贸易"],
  ["investment", "投资"],
  ["consumer", "消费者"],
  ["consumers", "消费者"],
  ["demand", "需求"],
  ["supply", "供应"],
  ["climate", "气候"],
  ["analysts", "分析人士"],
  ["analyst", "分析人士"],
  ["officials", "官员"],
  ["official", "官员"],
  ["report", "报道"],
  ["reports", "报道"],
  ["said", "表示"],
  ["says", "表示"],
  ["say", "表示"],
  ["announced", "宣布"],
  ["announce", "宣布"],
  ["support", "支持"],
  ["pressure", "压力"],
  ["concerns", "担忧"],
  ["concern", "担忧"],
  ["despite", "尽管"],
  ["amid", "在……背景下"],
  ["while", "而"],
  ["because", "因为"],
  ["although", "尽管"],
  ["however", "然而"],
  ["also", "也"],
  ["could", "可能"],
  ["would", "将"],
  ["may", "可能"],
  ["new", "新的"],
  ["international", "国际的"],
  ["energy", "能源"],
  ["research", "研究"],
  ["future", "未来"],
]);

const FEEDS = [
  {
    label: "China Daily Direct",
    source: "China Daily",
    url: "https://news.google.com/rss/search?q=(site:chinadaily.com.cn%20OR%20site:english.www.gov.cn)%20when:3d&hl=en-US&gl=US&ceid=US:en",
  },
  {
    label: "China Global Direct",
    source: "CGTN",
    url: "https://news.google.com/rss/search?q=(site:cgtn.com%20OR%20site:globaltimes.cn%20OR%20site:bjreview.com%20OR%20site:ecns.cn)%20when:3d&hl=en-US&gl=US&ceid=US:en",
  },
  {
    label: "The Guardian World",
    source: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
  },
  {
    label: "The Guardian Business",
    source: "The Guardian",
    url: "https://www.theguardian.com/business/rss",
  },
  {
    label: "TIME World",
    source: "TIME",
    url: "https://time.com/section/world/feed/",
  },
  {
    label: "TIME Tech",
    source: "TIME",
    url: "https://time.com/section/tech/feed/",
  },
  {
    label: "Newsweek",
    source: "Newsweek",
    url: "https://www.newsweek.com/rss",
  },
  {
    label: "The New Yorker",
    source: "The New Yorker",
    url: "https://www.newyorker.com/feed/news",
  },
  {
    label: "National Geographic",
    source: "National Geographic",
    url: "https://www.nationalgeographic.com/content/natgeo/en_us/index.rss",
  },
  {
    label: "Los Angeles Times",
    source: "Los Angeles Times",
    url: "https://www.latimes.com/world-nation/rss2.0.xml",
  },
  {
    label: "Google News Mixed",
    source: "Mixed",
    url: "https://news.google.com/rss/search?q=(site:chinadaily.com.cn%20OR%20site:cgtn.com%20OR%20site:globaltimes.cn%20OR%20site:bjreview.com%20OR%20site:ecns.cn%20OR%20site:theguardian.com%20OR%20site:time.com%20OR%20site:newsweek.com%20OR%20site:newyorker.com%20OR%20site:nationalgeographic.com%20OR%20site:latimes.com%20OR%20site:ft.com%20OR%20site:economist.com)%20when:2d&hl=en-US&gl=US&ceid=US:en",
  },
];

const ALLOWED_PUBLISHERS = new Map([
  ["chinadaily.com.cn", "China Daily"],
  ["english.www.gov.cn", "China Daily"],
  ["cgtn.com", "CGTN"],
  ["globaltimes.cn", "Global Times"],
  ["bjreview.com", "Beijing Review"],
  ["ecns.cn", "ECNS"],
  ["economist.com", "The Economist"],
  ["ft.com", "Financial Times"],
  ["theguardian.com", "The Guardian"],
  ["thetimes.co.uk", "The Times"],
  ["readersdigest.co.uk", "Reader's Digest"],
  ["nytimes.com", "The New York Times"],
  ["nationalgeographic.com", "National Geographic"],
  ["time.com", "TIME"],
  ["newsweek.com", "Newsweek"],
  ["latimes.com", "Los Angeles Times"],
  ["newyorker.com", "The New Yorker"],
]);

const PUBLISHER_PRIORITY = new Map([
  ["China Daily", 0],
  ["CGTN", 1],
  ["Global Times", 2],
  ["Beijing Review", 3],
  ["ECNS", 4],
  ["The Guardian", 5],
  ["TIME", 6],
  ["Newsweek", 7],
  ["National Geographic", 8],
  ["Los Angeles Times", 9],
  ["The New Yorker", 10],
  ["Financial Times", 11],
  ["The Economist", 12],
  ["The New York Times", 13],
  ["The Times", 14],
  ["Reader's Digest", 15],
]);

const TOPIC_BONUS = [
  "world",
  "business",
  "economy",
  "trade",
  "finance",
  "policy",
  "science",
  "climate",
  "technology",
  "education",
  "culture",
  "society",
  "health",
  "analysis",
  "global",
];

const TOPIC_PENALTY = [
  "celebrity",
  "gossip",
  "fashion",
  "shopping",
  "coupon",
  "horoscope",
  "recipe",
  "tv",
  "movie",
  "royal",
  "soccer",
  "football",
  "basketball",
  "lottery",
];

const OFFLINE_FALLBACK_ARTICLES = [
  {
    title: "China expands consumer support as policymakers seek steadier growth",
    url: "https://www.chinadaily.com.cn/a/202503/04/WS67c6793aa310c240449d8d4f.html",
    summary: "Policymakers are placing greater emphasis on consumption, employment and service-sector recovery while local governments adjust support measures to stabilize market confidence and household spending.",
    publisher: "China Daily",
    feedLabel: "Offline Backup",
    publishedAt: "2026-03-04T08:00:00Z",
  },
  {
    title: "CGTN analysis looks at how green industry investment is reshaping regional development",
    url: "https://news.cgtn.com/news/2025-03-04/Green-investment-reshapes-regional-development-1B2bH6j6k9a/p.html",
    summary: "The report explains how clean-energy projects, manufacturing upgrades and local supply chains are changing industrial planning, especially when officials balance growth targets with climate commitments.",
    publisher: "CGTN",
    feedLabel: "Offline Backup",
    publishedAt: "2026-03-04T07:30:00Z",
  },
  {
    title: "Global Times article examines the pressure on exporters amid weaker external demand",
    url: "https://www.globaltimes.cn/page/202503/1329012.shtml",
    summary: "Manufacturers are adapting to weaker orders, shifting trade routes and tighter costs, while analysts argue that product upgrading and diversified markets may reduce long-term pressure.",
    publisher: "Global Times",
    feedLabel: "Offline Backup",
    publishedAt: "2026-03-04T07:00:00Z",
  },
  {
    title: "Beijing Review discusses why technological innovation remains crucial to industrial transition",
    url: "https://www.bjreview.com/Business/202503/t20250304_800394825.html",
    summary: "The article argues that innovation is becoming a decisive factor in industrial transition because firms need stronger research capacity, more resilient supply chains and better coordination with public policy.",
    publisher: "Beijing Review",
    feedLabel: "Offline Backup",
    publishedAt: "2026-03-04T06:40:00Z",
  },
  {
    title: "The Guardian reports on how climate policy is influencing investment decisions",
    url: "https://www.theguardian.com/environment/2025/mar/04/climate-policy-investment-decisions-transition",
    summary: "Investors are reassessing energy, transport and infrastructure projects as governments tighten climate rules, although business groups continue to debate the pace and cost of transition.",
    publisher: "The Guardian",
    feedLabel: "Offline Backup",
    publishedAt: "2026-03-04T06:10:00Z",
  },
  {
    title: "TIME explores the social impact of artificial intelligence in education and work",
    url: "https://time.com/7261156/artificial-intelligence-education-work-impact/",
    summary: "Teachers, employers and researchers are debating how artificial intelligence should be used, because the technology may raise efficiency while also creating new concerns about fairness and skills.",
    publisher: "TIME",
    feedLabel: "Offline Backup",
    publishedAt: "2026-03-04T05:50:00Z",
  },
];

let deferredInstallPrompt = null;
let refreshTimer = null;
let latestArticles = [];
let activeFilter = "all";

function stripHtml(value) {
  const text = value || "";
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function decodeHtml(value) {
  const textarea = document.createElement("textarea");
  textarea.innerHTML = value || "";
  return textarea.value;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeUrl(rawUrl) {
  try {
    const decodedGoogleUrl = decodeGoogleNewsUrl(rawUrl);
    const url = new URL(decodedGoogleUrl || rawUrl);
    url.hash = "";
    ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "CMP", "cmpid"].forEach((key) =>
      url.searchParams.delete(key),
    );
    return url.toString();
  } catch {
    return rawUrl || "";
  }
}

function decodeGoogleNewsUrl(rawUrl) {
  if (!rawUrl) {
    return "";
  }

  try {
    const url = new URL(rawUrl);

    const directParam =
      url.searchParams.get("url") ||
      url.searchParams.get("q") ||
      url.searchParams.get("continue");
    if (directParam?.startsWith("http")) {
      return directParam;
    }

    if (!/(^|\.)news\.google\.com$/.test(url.hostname)) {
      return rawUrl;
    }

    const match = url.pathname.match(/\/(?:rss\/)?articles\/([^/?#]+)/);
    if (!match) {
      return rawUrl;
    }

    const encoded = match[1]
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(match[1].length / 4) * 4, "=");
    const decodedText = new TextDecoder().decode(
      Uint8Array.from(atob(encoded), (char) => char.charCodeAt(0)),
    );
    const embeddedUrl = decodedText.match(/https?:\/\/[^\s\u0000"]+/)?.[0];

    return embeddedUrl || rawUrl;
  } catch {
    return rawUrl;
  }
}

function getHostname(rawUrl) {
  try {
    return new URL(rawUrl).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function inferPublisher(url, fallbackSource) {
  const hostname = getHostname(url);
  for (const [domain, name] of ALLOWED_PUBLISHERS.entries()) {
    if (hostname === domain || hostname.endsWith(`.${domain}`)) {
      return name;
    }
  }

  return fallbackSource || hostname || "Unknown";
}

function getPublisherPriority(publisher) {
  return PUBLISHER_PRIORITY.get(publisher) ?? 99;
}

function isDirectAccessArticle(article) {
  return DIRECT_ACCESS_PUBLISHERS.includes(article.publisher);
}

function scoreArticle(article) {
  const haystack = `${article.title} ${article.summary}`.toLowerCase();
  const titleWords = article.title.split(/\s+/).filter(Boolean).length;
  const summaryWords = article.summary.split(/\s+/).filter(Boolean).length;
  let score = 0;

  if (titleWords >= 6 && titleWords <= 20) {
    score += 2;
  }

  if (summaryWords >= 18 && summaryWords <= 120) {
    score += 2;
  }

  if (article.publisher === "The Economist" || article.publisher === "Financial Times") {
    score += 2;
  }

  if (article.publisher === "The Guardian" || article.publisher === "TIME" || article.publisher === "The New Yorker") {
    score += 1;
  }

  if (DIRECT_ACCESS_PUBLISHERS.includes(article.publisher)) {
    score += 2;
  }

  TOPIC_BONUS.forEach((keyword) => {
    if (haystack.includes(keyword)) {
      score += 1;
    }
  });

  TOPIC_PENALTY.forEach((keyword) => {
    if (haystack.includes(keyword)) {
      score -= 3;
    }
  });

  if (article.summary.length < 80) {
    score -= 1;
  }

  return score;
}

function classifyDifficulty(article) {
  const haystack = `${article.title} ${article.summary}`.toLowerCase();
  const advancedSignals = ["policy", "inflation", "geopolit", "regulation", "analysis", "econom", "science"];
  const isAdvanced = advancedSignals.some((token) => haystack.includes(token)) ||
    article.publisher === "The Economist" ||
    article.publisher === "Financial Times";

  return isAdvanced ? "考研" : "六级";
}

function estimateReadTime(article) {
  const words = `${article.title} ${article.summary}`.split(/\s+/).filter(Boolean).length;
  return Math.max(2, Math.round(words / 120));
}

function setPlainText(container, text) {
  container.textContent = text;
}

function extractComplexSentences(summary) {
  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  const picked = sentences.filter((sentence) => {
    const lower = sentence.toLowerCase();
    const wordCount = sentence.split(/\s+/).filter(Boolean).length;
    return wordCount >= 14 || CLAUSE_MARKERS.some((marker) => lower.includes(` ${marker} `));
  });

  return (picked.length ? picked : sentences).slice(0, 2);
}

function translateSentence(sentence) {
  let translated = ` ${sentence.toLowerCase()} `;

  TRANSLATION_PHRASES.forEach(([from, to]) => {
    translated = translated.replaceAll(` ${from} `, ` ${to} `);
  });

  translated = translated.replace(/\b[a-z]+\b/g, (word) => TRANSLATION_WORDS.get(word) || word);
  translated = translated
    .replace(/\s+/g, " ")
    .replace(/ ,/g, "，")
    .replace(/ \./g, "。")
    .replace(/ \?/g, "？")
    .replace(/ !/g, "！")
    .trim();

  if (!/[。！？]$/.test(translated)) {
    translated += "。";
  }

  return translated.charAt(0).toUpperCase() + translated.slice(1);
}

function buildUnderlinedSentence(sentence) {
  const fragment = document.createDocumentFragment();
  if (!sentence) {
    return fragment;
  }

  const pattern = new RegExp(`\\b(${CLAUSE_MARKERS.map(escapeRegex).join("|")})\\b`, "gi");
  const markers = [...sentence.matchAll(pattern)];
  if (!markers.length) {
    const span = document.createElement("span");
    span.className = "underlined-segment";
    span.textContent = sentence;
    fragment.append(span);
    return fragment;
  }

  let cursor = 0;
  markers.forEach((marker, index) => {
    const start = marker.index;
    if (start > cursor) {
      fragment.append(document.createTextNode(sentence.slice(cursor, start)));
    }

    const nextStart = index < markers.length - 1 ? markers[index + 1].index : sentence.length;
    const underlined = document.createElement("span");
    underlined.className = "underlined-segment";
    underlined.textContent = sentence.slice(start, nextStart).trim();
    fragment.append(underlined);
    fragment.append(document.createTextNode(" "));
    cursor = nextStart;
  });

  if (cursor < sentence.length) {
    fragment.append(document.createTextNode(sentence.slice(cursor)));
  }

  return fragment;
}

function formatPublishedAt(rawDate) {
  if (!rawDate) {
    return "时间未知";
  }

  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) {
    return "时间未知";
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(parsed);
}

function formatLastUpdated(rawDate) {
  return new Intl.DateTimeFormat("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).format(rawDate);
}

function buildSummary(item) {
  const content = stripHtml(
    item.querySelector("content\\:encoded")?.textContent ||
    item.querySelector("description")?.textContent ||
    item.querySelector("summary")?.textContent ||
    "",
  );

  if (!content) {
    return FALLBACK_SUMMARY;
  }

  return content.length > 220 ? `${content.slice(0, 217)}...` : content;
}

function parseXmlFeed(xmlText, feedMeta) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlText, "text/xml");
  const parseError = xml.querySelector("parsererror");
  if (parseError) {
    throw new Error(`Feed parse failed: ${feedMeta.label}`);
  }

  const items = Array.from(xml.querySelectorAll("item, entry"));
  return items.map((item) => {
    const rawLink =
      item.querySelector("link")?.getAttribute("href") ||
      item.querySelector("link")?.textContent ||
      item.querySelector("id")?.textContent ||
      "";
    const normalizedLink = normalizeUrl(rawLink);
    const title = decodeHtml(item.querySelector("title")?.textContent || "").trim();
    const summary = buildSummary(item);
    const sourceText = decodeHtml(item.querySelector("source")?.textContent || "").trim();
    const publisher = inferPublisher(
      normalizedLink,
      sourceText || (feedMeta.source === "Mixed" ? "" : feedMeta.source),
    );

    return {
      id: `${feedMeta.label}-${normalizedLink || title}`,
      title: sourceText && title.endsWith(` - ${sourceText}`)
        ? title.slice(0, -(sourceText.length + 3))
        : title,
      url: normalizedLink,
      summary,
      publisher,
      feedLabel: feedMeta.label,
      publishedAt:
        item.querySelector("pubDate")?.textContent ||
        item.querySelector("published")?.textContent ||
        item.querySelector("updated")?.textContent ||
        "",
    };
  });
}

async function fetchFeed(feedMeta) {
  const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(feedMeta.url)}`;
  const response = await fetch(proxyUrl, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${feedMeta.label} HTTP ${response.status}`);
  }

  const xmlText = await response.text();
  return parseXmlFeed(xmlText, feedMeta);
}

function chooseArticles(entries) {
  const allowedPublishers = new Set(ALLOWED_PUBLISHERS.values());
  const primarySeen = new Set();
  const filtered = entries
    .filter((article) => article.title && article.url)
    .filter((article) => {
      const publisher = inferPublisher(article.url, article.publisher);
      article.publisher = publisher;
      return allowedPublishers.has(publisher);
    })
    .filter((article) => {
      const key = normalizeUrl(article.url);
      if (primarySeen.has(key)) {
        return false;
      }
      primarySeen.add(key);
      return true;
    })
    .map((article) => ({
      ...article,
      score: scoreArticle(article),
      difficulty: classifyDifficulty(article),
      readMinutes: estimateReadTime(article),
      sentencePairs: extractComplexSentences(article.summary || article.title).map((sentence) => ({
        english: sentence,
        chinese: translateSentence(sentence),
      })),
    }))
    .filter((article) => article.score >= 3)
    .sort((left, right) => {
      const priorityDiff = getPublisherPriority(left.publisher) - getPublisherPriority(right.publisher);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const rightDate = new Date(right.publishedAt || 0).getTime();
      const leftDate = new Date(left.publishedAt || 0).getTime();

      if (rightDate !== leftDate) {
        return rightDate - leftDate;
      }

      return right.score - left.score;
    });

  const picked = filtered.slice(0, MAX_ARTICLES);
  if (picked.length >= MIN_ARTICLES) {
    return picked;
  }

  const fallbackSeen = new Set();
  return entries
    .filter((article) => article.title && article.url)
    .filter((article) => {
      const key = normalizeUrl(article.url);
      if (fallbackSeen.has(key)) {
        return false;
      }
      fallbackSeen.add(key);
      article.publisher = inferPublisher(article.url, article.publisher);
      return allowedPublishers.has(article.publisher);
    })
    .map((article) => ({
      ...article,
      score: scoreArticle(article),
      difficulty: classifyDifficulty(article),
      readMinutes: estimateReadTime(article),
      sentencePairs: extractComplexSentences(article.summary || article.title).map((sentence) => ({
        english: sentence,
        chinese: translateSentence(sentence),
      })),
    }))
    .sort((left, right) => {
      const priorityDiff = getPublisherPriority(left.publisher) - getPublisherPriority(right.publisher);
      if (priorityDiff !== 0) {
        return priorityDiff;
      }

      const rightDate = new Date(right.publishedAt || 0).getTime();
      const leftDate = new Date(left.publishedAt || 0).getTime();

      if (rightDate !== leftDate) {
        return rightDate - leftDate;
      }

      return right.score - left.score;
    })
    .slice(0, MAX_ARTICLES);
}

function createArticleCard(article) {
  const card = document.createElement("article");
  card.className = "article-card";
  if (isDirectAccessArticle(article)) {
    card.classList.add("is-direct-source");
  }

  const title = document.createElement("h3");
  title.className = "article-title";

  const link = document.createElement("a");
  link.href = article.url;
  link.target = "_blank";
  link.rel = "noreferrer";
  setPlainText(link, article.title);
  title.appendChild(link);

  const meta = document.createElement("div");
  meta.className = "article-meta";
  meta.innerHTML = `
    <span>${article.publisher}</span>
    <span>${article.difficulty}</span>
    <span>${article.readMinutes} min</span>
    <span>${formatPublishedAt(article.publishedAt)}</span>
  `;

  const summary = document.createElement("p");
  summary.className = "article-summary";
  setPlainText(summary, article.summary);

  const badgeRow = document.createElement("div");
  badgeRow.className = "badge-row";

  [article.feedLabel, article.score >= 6 ? "分析向" : "精读向"].forEach((text) => {
    const badge = document.createElement("span");
    badge.className = "badge";
    badge.textContent = text;
    badgeRow.appendChild(badge);
  });

  if (isDirectAccessArticle(article)) {
    const directBadge = document.createElement("span");
    directBadge.className = "badge badge-direct";
    directBadge.textContent = "直连优先";
    badgeRow.prepend(directBadge);
  }

  const sentencePanel = document.createElement("section");
  sentencePanel.className = "sentence-panel";

  const sentenceLabel = document.createElement("p");
  sentenceLabel.className = "section-kicker";
  sentenceLabel.textContent = "重点长难句与参考译文";
  sentencePanel.appendChild(sentenceLabel);

  article.sentencePairs.forEach((pair, index) => {
    const item = document.createElement("article");
    item.className = "sentence-item";

    const en = document.createElement("p");
    en.className = "sentence-text";
    en.append(buildUnderlinedSentence(pair.english));

    const zh = document.createElement("p");
    zh.className = "sentence-translation";
    zh.textContent = `译文 ${index + 1}：${pair.chinese}`;

    item.append(en, zh);
    sentencePanel.appendChild(item);
  });

  card.append(title, meta, summary, badgeRow, sentencePanel);
  return card;
}

function createGroupSection(titleText, descriptionText, articles) {
  const section = document.createElement("section");
  section.className = "group-section";

  const header = document.createElement("div");
  header.className = "group-header";

  const title = document.createElement("h3");
  title.className = "group-title";
  title.textContent = titleText;

  const description = document.createElement("p");
  description.className = "group-description";
  description.textContent = descriptionText;

  const count = document.createElement("span");
  count.className = "group-count";
  count.textContent = `${articles.length} 篇`;

  header.append(title, description, count);

  const list = document.createElement("div");
  list.className = "group-list";
  articles.forEach((article) => {
    list.appendChild(createArticleCard(article));
  });

  section.append(header, list);
  return section;
}

function getVisibleArticles(articles) {
  if (activeFilter === "direct") {
    return articles.filter(isDirectAccessArticle);
  }

  if (activeFilter === "jump") {
    return articles.filter((article) => !isDirectAccessArticle(article));
  }

  return articles;
}

function syncFilterButtons() {
  filterAllBtn.classList.toggle("is-active", activeFilter === "all");
  filterDirectBtn.classList.toggle("is-active", activeFilter === "direct");
  filterJumpBtn.classList.toggle("is-active", activeFilter === "jump");
}

function renderArticles(articles) {
  articleList.innerHTML = "";
  latestArticles = articles;
  syncFilterButtons();

  const visibleArticles = getVisibleArticles(articles);

  if (visibleArticles.length === 0) {
    emptyState.classList.remove("hidden");
    articleCount.textContent = "0";
    sourceCount.textContent = "0";
    return;
  }

  emptyState.classList.add("hidden");
  const sources = new Set();
  visibleArticles.forEach((article) => sources.add(article.publisher));

  const directArticles = visibleArticles.filter(isDirectAccessArticle);
  const internationalArticles = visibleArticles.filter((article) => !isDirectAccessArticle(article));

  if (directArticles.length) {
    articleList.appendChild(
      createGroupSection(
        "直连板块",
        "优先展示无需 VPN 更容易打开的英文中文媒体，适合先读热点和政策类材料。",
        directArticles,
      ),
    );
  }

  if (internationalArticles.length) {
    articleList.appendChild(
      createGroupSection(
        "跳转板块",
        "补充 Guardian、TIME、Newsweek、National Geographic 等国际来源，适合延伸阅读与表达积累。",
        internationalArticles,
      ),
    );
  }

  articleCount.textContent = String(visibleArticles.length);
  sourceCount.textContent = String(sources.size);
}

function saveCache(articles, refreshedAt) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ articles, refreshedAt }));
}

function loadCache() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
  } catch {
    return null;
  }
}

function setLoadingState(message) {
  feedStatus.textContent = message;
  refreshBtn.disabled = true;
  refreshHint.textContent = "正在抓取";
}

function setReadyState(message) {
  feedStatus.textContent = message;
  refreshBtn.disabled = false;
  refreshHint.textContent = "自动刷新中";
}

function setErrorState(message) {
  feedStatus.textContent = message;
  refreshBtn.disabled = false;
  refreshHint.textContent = "可手动重试";
}

function getNewestPublishedTime(articles) {
  return articles.reduce((latest, article) => {
    const published = new Date(article.publishedAt || 0).getTime();
    return Number.isNaN(published) ? latest : Math.max(latest, published);
  }, 0);
}

function shouldKeepCachedArticles(freshArticles, cachedArticles) {
  if (!cachedArticles?.length || !freshArticles.length) {
    return false;
  }

  const newestPublished = getNewestPublishedTime(freshArticles);
  if (!newestPublished) {
    return true;
  }

  return Date.now() - newestPublished > REFRESH_INTERVAL;
}

function getOfflineFallbackArticles() {
  return OFFLINE_FALLBACK_ARTICLES.map((article) => ({
    ...article,
    score: scoreArticle(article),
    difficulty: classifyDifficulty(article),
    readMinutes: estimateReadTime(article),
    sentencePairs: extractComplexSentences(article.summary || article.title).map((sentence) => ({
      english: sentence,
      chinese: translateSentence(sentence),
    })),
  }));
}

async function refreshArticles() {
  setLoadingState("正在连接新闻源...");

  try {
    const cached = loadCache();
    const settled = await Promise.allSettled(FEEDS.map(fetchFeed));
    const successfulFeeds = settled
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    const chosen = chooseArticles(successfulFeeds);
    if (!chosen.length) {
      throw new Error("No article matched the current filter.");
    }

    if (shouldKeepCachedArticles(chosen, cached?.articles)) {
      renderArticles(cached.articles);
      lastUpdated.textContent = `缓存时间：${formatPublishedAt(cached.refreshedAt)}`;
      setReadyState("10 分钟内暂无新文章，已保留历史最新文章");
      return;
    }

    const now = new Date();
    renderArticles(chosen);
    saveCache(chosen, now.toISOString());
    lastUpdated.textContent = `最近更新：${formatLastUpdated(now)}`;
    setReadyState(`已更新 ${chosen.length} 篇训练文章`);
  } catch (error) {
    const cached = loadCache();
    if (cached?.articles?.length) {
      renderArticles(cached.articles);
      lastUpdated.textContent = `缓存时间：${formatPublishedAt(cached.refreshedAt)}`;
      setErrorState("在线抓取失败，已展示上次缓存");
      return;
    }

    const fallbackArticles = getOfflineFallbackArticles();
    renderArticles(fallbackArticles);
    lastUpdated.textContent = "当前展示：内置离线兜底内容";
    setErrorState("在线抓取失败，已展示离线兜底文章");
    console.error(error);
  }
}

function isStandalone() {
  return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
}

function updateInstallButton() {
  if (window.location.protocol === "file:" || isStandalone()) {
    installBtn.classList.add("hidden");
    return;
  }

  if (deferredInstallPrompt) {
    installBtn.classList.remove("hidden");
    installBtn.disabled = false;
    installBtn.textContent = "安装到手机";
    return;
  }

  installBtn.classList.remove("hidden");
  installBtn.disabled = true;
  installBtn.textContent = "浏览器菜单中安装";
}

async function registerServiceWorker() {
  if (window.location.protocol === "file:" || !("serviceWorker" in navigator)) {
    return;
  }

  try {
    await navigator.serviceWorker.register("./sw.js");
  } catch (error) {
    console.error("Service worker 注册失败", error);
  }
}

function scheduleRefresh() {
  clearInterval(refreshTimer);
  refreshTimer = setInterval(refreshArticles, REFRESH_INTERVAL);
}

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  updateInstallButton();
});

window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  updateInstallButton();
});

refreshBtn.addEventListener("click", refreshArticles);
filterAllBtn.addEventListener("click", () => {
  activeFilter = "all";
  renderArticles(latestArticles);
});
filterDirectBtn.addEventListener("click", () => {
  activeFilter = "direct";
  renderArticles(latestArticles);
});
filterJumpBtn.addEventListener("click", () => {
  activeFilter = "jump";
  renderArticles(latestArticles);
});

installBtn.addEventListener("click", async () => {
  if (!deferredInstallPrompt) {
    return;
  }

  deferredInstallPrompt.prompt();
  await deferredInstallPrompt.userChoice;
  deferredInstallPrompt = null;
  updateInstallButton();
});

const cached = loadCache();
if (cached?.articles?.length) {
  renderArticles(cached.articles);
  lastUpdated.textContent = `缓存时间：${formatPublishedAt(cached.refreshedAt)}`;
  setReadyState("已加载本地缓存，正在后台刷新");
} else {
  setLoadingState("正在连接新闻源...");
}

updateInstallButton();
registerServiceWorker();
scheduleRefresh();
refreshArticles();
