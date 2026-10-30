import { visit } from "unist-util-visit";
import type { Root, RootContent, Parent } from "mdast";
import type { LeafDirective } from "mdast-util-directive";
import process from "node:process";
import { githubCard } from "../../config";

/**
 * remark 扩展：`::github{repo="owner/repo"}` → GitHub 仓库卡片（fuwari 同款语法）。
 *
 * 与 remark-mark 同思路：指令节点替换为 raw HTML 节点，remarkRehype(allowDangerousHtml) /
 * React dangerouslySetInnerHTML 均原样输出；卡片为纯静态标记（不含 script），
 * 因此 Astro 页面与阅读场景（打字机会反复重写 innerHTML）表现一致。
 *
 * 徽章为自绘内联 chip（图标 + 数值），不依赖徽标外链服务：
 * - 徽章列表由 config.githubCard.badges 决定，留空则不渲染徽章、也不再请求指标；
 * - 需要展示时，仓库指标在构建时经 GitHub 官方 API 拉取（带 TTL 缓存与超时）；
 * - 拉取失败/超时/限速一律降级为 countFallback 占位，绝不阻断构建；
 * - 数值固化到产物，重新构建时刷新。
 * 书写不合法时输出隐藏提示，避免误发布（fuwari 同款处理）。
 */

/** 文本 → HTML 转义（指令值来自用户 Markdown，进入属性与 URL 前转义） */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (ch) => {
    switch (ch) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

/** 模板占位替换：{owner} / {repo} */
function fillTemplate(template: string, owner: string, repo: string): string {
  return template.replace(/\{owner\}/g, owner).replace(/\{repo\}/g, repo);
}

/** 语法错误提示（隐藏，fuwari 同款行为） */
function hiddenNote(key: keyof typeof githubCard.messages): string {
  return `<div class="hidden">${escapeHtml(githubCard.messages[key])}</div>`;
}

/* ===== 仓库指标拉取（构建时） ===== */

/** 某仓库当前指标；字段名由 config.githubCard.statsMetricFields 决定 */
type RepoStats = Partial<Record<"stars" | "forks", number>>;

interface CacheSlot {
  value: RepoStats | null;
  at: number;
}

/** 进程级缓存：同一构建/dev 进程内同仓库只拉一次；失败值也给较短的 TTL 以便尽快重试 */
const statsCache = new Map<string, CacheSlot>();

/**REST 指标字段 → badge metric 的共享映射常量（由 config 声明） */
const METRIC_FIELDS = githubCard.statsMetricFields as Record<"stars" | "forks", string>;

const FAILURE_TTL_MS = 60 * 1000;

/** 拉取仓库指标；任何失败返回 null（构建不中断，徽章显示占位值） */
async function fetchRepoStats(repo: string): Promise<RepoStats | null> {
  const cached = statsCache.get(repo);
  const ttl = cached !== undefined && cached.value !== null ? githubCard.statsTtlMs : FAILURE_TTL_MS;
  if (cached && Date.now() - cached.at < ttl) return cached.value;

  const token = process.env[githubCard.statsApiTokenEnv];
  try {
    const res = await fetch(githubCard.statsApiBase.replace("{repo}", repo), {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "vnblog-static",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      signal: AbortSignal.timeout(githubCard.statsTimeoutMs),
    });
    if (!res.ok) throw new Error(`GitHub ${res.status}`);
    const data = (await res.json()) as Record<string, unknown>;
    const value: RepoStats = {};
    for (const key of Object.keys(METRIC_FIELDS)) {
      const field = METRIC_FIELDS[key as keyof typeof METRIC_FIELDS];
      const raw = data[field];
      value[key as "stars" | "forks"] = typeof raw === "number" ? raw : undefined;
    }
    statsCache.set(repo, { value, at: Date.now() });
    return value;
  } catch {
    statsCache.set(repo, { value: null, at: Date.now() });
    return null;
  }
}

/** 1.2k / 123 / 1.3m 计数缩写 */
function formatCount(value: number): string {
  if (value < 1000) return String(value);
  if (value < 1_000_000) return `${(value / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}m`;
}

/** lucide 图标 stroke path（24 viewBox，风格与站内 lucide-react 图标一致） */
const BADGE_ICONS = {
  stars:
    "M11.525 2.295a.53.53 0 0 1 .95 0l2.266 4.593 5.07.737a.53.53 0 0 1 .394.907l-3.664 3.571.864 5.034a.53.53 0 0 1-.771.56l-4.534-2.384-4.534 2.384a.53.53 0 0 1-.771-.56l.864-5.034L3.094 8.535a.53.53 0 0 1 .394-.907l5.07-.737z",
  forks: "M6 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm12 0a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm-6 12a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 9v1a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9m-6 4v3",
} as const;

/** 自绘徽章 chip：图标 + 数值（无次要文字），语义仅进 aria */
function badgeChip(
  metric: "stars" | "forks",
  label: string,
  stats: RepoStats | null
): string {
  const value =
    stats == null || stats[metric] == null
      ? githubCard.countFallback
      : formatCount(stats[metric] as number);
  return (
    `<span class="github-card-badge${stats === null || stats[metric] == null ? " is-missing" : ""}" aria-label="${escapeHtml(label)}">` +
    `<svg class="github-card-badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">` +
    `<path d="${BADGE_ICONS[metric]}" />` +
    `</svg>` +
    `<span class="github-card-badge-value">${escapeHtml(value)}</span>` +
    `</span>`
  );
}

/** 指令节点 → 卡片 HTML；返回 null 表示书写不合法（交由 hiddenNote 提示） */
async function cardHtml(node: LeafDirective): Promise<string | null> {
  if ((node.children ?? []).length > 0) return hiddenNote("unsupported");

  const repoRaw = node.attributes?.repo;
  if (typeof repoRaw !== "string") return hiddenNote("repoFormat");
  const match = /^\s*([\w.-]+)\/([\w.-]+)\s*$/.exec(repoRaw);
  if (!match) return hiddenNote("repoFormat");

  const owner = match[1];
  const name = match[2];
  const repo = `${owner}/${name}`;
  /* 未配置任何徽章时跳过指标请求，卡片只保留头像与仓库名 */
  const hasBadges = githubCard.badges.length > 0;
  const stats = hasBadges ? await fetchRepoStats(repo) : null;

  const href = escapeHtml(fillTemplate(githubCard.repoUrlTemplate, owner, repo));
  const avatar = escapeHtml(fillTemplate(githubCard.avatarTemplate, owner, repo));
  const badges = githubCard.badges
    .map((badge) => badgeChip(badge.metric, badge.label, stats))
    .join("");

  return [
    `<a class="github-card" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(githubCard.linkLabel)}">`,
    `<img class="github-card-avatar" src="${avatar}" alt="${escapeHtml(owner)}" width="24" height="24" loading="lazy" />`,
    `<span class="github-card-name">`,
    `<span class="github-card-owner">${escapeHtml(owner)}</span>`,
    `<span class="github-card-sep">/</span>`,
    `<span class="github-card-repo">${escapeHtml(name)}</span>`,
    `</span>`,
    badges ? `<span class="github-card-badges">${badges}</span>` : "",
    `</a>`,
  ].join("");
}

export function remarkGithubCard() {
  return async (tree: Root): Promise<void> => {
    /* 先收集全部 github 指令（含所处父节点与索引），再统一处理：
       并行拉取指标 + 从后向前替换，避免索引位移 */
    const found: { node: LeafDirective; parent: Parent; index: number }[] = [];
    visit(tree, "leafDirective", (node: LeafDirective, index, parent) => {
      if (node.name !== "github" || typeof index !== "number" || !parent) return;
      found.push({ node, parent, index });
    });

    const htmls = await Promise.all(found.map((item) => cardHtml(item.node)));
    for (let i = found.length - 1; i >= 0; i--) {
      const html = htmls[i];
      if (html == null) continue;
      const { parent, index } = found[i];
      parent.children.splice(index, 1, { type: "html", value: html } as RootContent);
    }
  };
}
