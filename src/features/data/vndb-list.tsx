import { useEffect, useRef, useState } from "react";
import { vndb } from "../../config";
import { FeedFootnote, FeedNotice, FeedTabBar } from "./feed-parts";
import { FeedPagination, usePagination } from "./feed-pagination";
import { FeedGrid, type FeedItem } from "./feed-views";

/**
 * VNDB 游玩记录列表（客户端岛屿）：
 * 公开数据通过 Kana API 的 POST /ulist 拉取，仅需要 userId，不涉及任何密钥；
 * 按标签分组后以 Tabs 呈现（仅非空分组），组内以网格展示并按页切片。
 */

/** POST /ulist 单条记录（仅声明本页用到的字段） */
interface VndbEntry {
  id: string;
  /** 个人评分，10~100，未打分为 null */
  vote: number | null;
  labels: { id: number; label: string }[];
  vn: {
    title: string;
    alttitle: string | null;
    titles?: { lang: string; title: string }[] | null;
    image?: { thumbnail: string; dims: number[] } | null;
  };
}

interface VndbUlistResponse {
  more: boolean;
  results: VndbEntry[];
}

interface VndbGroup {
  key: string;
  label: string;
  items: VndbEntry[];
}

/** /ulist 的 fields 串（写成常量便于与 config 分离维护） */
const ULIST_FIELDS =
  "id, vote, labels{id,label}, vn.title, vn.alttitle, vn.titles{lang,title}, vn.image{thumbnail,dims}";

/** 拉取全部允许页数的数据；超出展示上限时以 truncated 告知 */
async function fetchUlist(): Promise<{ entries: VndbEntry[]; truncated: boolean }> {
  const entries: VndbEntry[] = [];
  for (let page = 1; page <= vndb.maxPages; page++) {
    const res = await fetch(`${vndb.apiBase}/ulist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: vndb.userId,
        fields: ULIST_FIELDS,
        filters: [],
        sort: "lastmod",
        reverse: true,
        results: vndb.pageSize,
        page,
      }),
    });
    if (!res.ok) throw new Error(`VNDB request ${res.status}`);
    const data = (await res.json()) as VndbUlistResponse;
    entries.push(...data.results);
    if (!data.more) return { entries, truncated: false };
    if (entries.length >= vndb.pageSize * vndb.maxPages) return { entries, truncated: true };
  }
  return { entries, truncated: true };
}

/** 标题选择链：中文标题 → 原文标题 → 罗马字标题（不额外展示原名） */
function titleOf(entry: VndbEntry): string {
  const vn = entry.vn;
  return vn.titles?.find((t) => t.lang === vndb.cjkLang)?.title ?? vn.alttitle ?? vn.title;
}

/** 10~100 分制 → 10 分制一位小数文本 */
function scale(score: number): string {
  return (score / 10).toFixed(1);
}

/** 归一化为共享视图模型（中文标题优先；仅个人评分 chip，不展示日期与原名） */
function toFeedItem(entry: VndbEntry): FeedItem {
  const main = titleOf(entry);
  return {
    id: entry.id,
    href: vndb.entryUrlTemplate.replace("{id}", entry.id),
    imageUrl: entry.vn.image?.thumbnail ?? null,
    imageAlt: main,
    title: main,
    primaryBadge: entry.vote != null ? scale(entry.vote) : undefined,
  };
}

/** 按 config 顺序把记录归到各标签分组（一个条目只归入命中的第一个分组；空分组剔除） */
function groupEntries(entries: VndbEntry[]): VndbGroup[] {
  const claimed = new Set<string>();
  return vndb.labels
    .map((label) => ({
      key: String(label.id),
      label: label.name,
      items: entries.filter((entry) => {
        if (claimed.has(entry.id)) return false;
        const hit = entry.labels.some((l) => l.id === label.id);
        if (hit) claimed.add(entry.id);
        return hit;
      }),
    }))
    .filter((group) => group.items.length > 0);
}

export default function VndbList() {
  const [state, setState] = useState<"loading" | "error" | "done">("loading");
  const [payload, setPayload] = useState<{ entries: VndbEntry[]; truncated: boolean }>({ entries: [], truncated: false });
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetchUlist()
      .then((result) => {
        if (cancelled) return;
        setPayload(result);
        setState("done");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  /* 分组数据在早退分支前算好，保证 Hook 调用顺序稳定 */
  const groups = groupEntries(payload.entries);
  const activeGroup = groups.find((group) => group.key === activeTab) ?? groups[0] ?? null;
  const items = activeGroup ? activeGroup.items.map(toFeedItem) : [];
  const pager = usePagination(items.length, vndb.pagination.perPage);

  /** 翻页后回到列表顶部，避免停留在旧页的底部 */
  const goToPage = (next: number) => {
    pager.setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!vndb.userId) return <FeedNotice message={vndb.unconfiguredLabel} />;
  if (state === "loading") return <FeedNotice message={vndb.loadingLabel} />;
  if (state === "error") {
    return <FeedNotice message={vndb.errorLabel} actionLabel={vndb.retryLabel} onAction={() => window.location.reload()} />;
  }
  if (!activeGroup) return <FeedNotice message={vndb.emptyLabel} />;

  return (
    <div ref={topRef}>
      <FeedTabBar
        tabs={groups.map((group) => ({ key: group.key, label: group.label, count: group.items.length }))}
        active={activeGroup.key}
        onChange={(key) => {
          setActiveTab(key);
          pager.reset();
        }}
      />
      <div className="mt-6">
        <FeedGrid items={items.slice(pager.start, pager.end)} />
      </div>
      <FeedPagination
        page={pager.page}
        totalPages={pager.totalPages}
        onChange={goToPage}
        navLabel={vndb.pagination.navLabel}
        prevLabel={vndb.pagination.prevLabel}
        nextLabel={vndb.pagination.nextLabel}
        pageLabel={vndb.pagination.pageLabel}
      />
      {payload.truncated && <FeedFootnote message={vndb.outOfRangeLabel} />}
    </div>
  );
}
