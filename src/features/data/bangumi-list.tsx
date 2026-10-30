import { useEffect, useRef, useState } from "react";
import { bangumi } from "../../config";
import { FeedFootnote, FeedNotice, FeedTabBar } from "./feed-parts";
import { FeedPagination, usePagination } from "./feed-pagination";
import { FeedGrid, type FeedItem } from "./feed-views";

/**
 * Bangumi 追番记录列表（客户端岛屿）：
 * 通过官方 API 的 GET /users/{uid}/collections?subject_type=<n>&type=<收藏状态> 拉取公开收藏，
 * 仅需要 userId；各状态分组并发请求后以 Tabs 呈现（仅非空分组），组内以网格展示并按页切片。
 */

/** collections 单条记录（仅声明本页用到的字段） */
interface BgmItem {
  updated_at: string;
  /** 我的评分（0~10，仅“看过”等打分状态大于 0） */
  rate: number;
  /** 收藏状态：1 想看 / 2 看过 / 3 在看 / 4 搁置 / 5 抛弃 */
  type: number;
  ep_status: number;
  comment: string | null;
  subject: {
    id: number;
    name: string;
    name_cn: string;
    eps: number;
    images: { grid: string; small: string };
  };
}

interface BgmCollectionsResponse {
  data: BgmItem[];
  total: number;
}

/** 一个状态分组：配置名 + 数据 + 是否超出展示上限 */
interface BgmGroup {
  name: string;
  items: BgmItem[];
  truncated: boolean;
}

/** Bangumi v0 硬限制：offset ≤ 30，故单状态最多取 offset 0/30 两页（去重合并约 80 条） */
const OFFSET_CAP = 30;

/** 数字形态的用户标识先用 legacy 接口解析为用户名（v0 收藏接口仅接受用户名） */
async function resolveUsername(): Promise<string> {
  if (!/^\d+$/.test(bangumi.userId)) return bangumi.userId;
  const res = await fetch(bangumi.userLookupTemplate.replace("{id}", bangumi.userId));
  if (!res.ok) throw new Error(`Bangumi user ${res.status}`);
  const data = (await res.json()) as { username?: string };
  return data.username ?? bangumi.userId;
}

/** 单状态拉取：offset 0→OFFSET_CAP 两页，按 subject id 去重合并 */
async function fetchStatus(code: number, username: string): Promise<{ items: BgmItem[]; truncated: boolean }> {
  const items: BgmItem[] = [];
  const seen = new Set<number>();
  let total = 0;
  for (const offset of [0, OFFSET_CAP]) {
    const url =
      `${bangumi.apiBase}/users/${encodeURIComponent(username)}/collections` +
      `?subject_type=${bangumi.subjectType}&type=${code}&limit=${bangumi.perPage}&offset=${offset}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Bangumi request ${res.status}`);
    const data = (await res.json()) as BgmCollectionsResponse;
    total = data.total;
    for (const item of data.data) {
      if (!seen.has(item.subject.id)) {
        seen.add(item.subject.id);
        items.push(item);
      }
    }
    if (offset >= OFFSET_CAP || total <= bangumi.perPage) break;
  }
  return { items, truncated: total > items.length };
}

async function fetchAllStatuses(): Promise<BgmGroup[]> {
  const username = await resolveUsername();
  const groups = await Promise.all(
    bangumi.statuses.map(async (status) => {
      const { items, truncated } = await fetchStatus(status.code, username);
      return { name: status.name, items, truncated };
    })
  );
  return groups.filter((group) => group.items.length > 0);
}

/** 归一化为共享视图模型（中文标题优先；仅进度/评分 chip，不展示日期与原名） */
function toFeedItem(item: BgmItem): FeedItem {
  const s = item.subject;
  const main = s.name_cn || s.name;
  const eps = s.eps > 0 ? String(s.eps) : "—";
  const watchingLike = item.type !== 2; // 在看/搁置/抛弃都存在部分进度语义
  return {
    id: String(s.id),
    href: bangumi.entryUrlTemplate.replace("{id}", String(s.id)),
    imageUrl: s.images.small ?? s.images.grid,
    imageAlt: main,
    title: main,
    primaryBadge: watchingLike ? `${item.ep_status}/${eps}` : undefined,
    secondaryBadge: item.rate > 0 && item.type === 2 ? String(item.rate) : undefined,
  };
}

export default function BangumiList() {
  const [state, setState] = useState<"loading" | "error" | "done">("loading");
  const [groups, setGroups] = useState<BgmGroup[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setState("loading");
    fetchAllStatuses()
      .then((result) => {
        if (cancelled) return;
        setGroups(result);
        setState("done");
      })
      .catch(() => !cancelled && setState("error"));
    return () => {
      cancelled = true;
    };
  }, []);

  /* 以分组名为 key；未命中（首次进入）时回到第一个非空分组 */
  const activeGroup = groups.find((group) => group.name === activeTab) ?? groups[0] ?? null;
  const items = activeGroup ? activeGroup.items.map(toFeedItem) : [];
  const pager = usePagination(items.length, bangumi.pagination.perPage);

  /** 翻页后回到列表顶部，避免停留在旧页的底部 */
  const goToPage = (next: number) => {
    pager.setPage(next);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  if (!bangumi.userId) return <FeedNotice message={bangumi.unconfiguredLabel} />;
  if (state === "loading") return <FeedNotice message={bangumi.loadingLabel} />;
  if (state === "error") {
    return (
      <FeedNotice message={bangumi.errorLabel} actionLabel={bangumi.retryLabel} onAction={() => window.location.reload()} />
    );
  }
  if (!activeGroup) return <FeedNotice message={bangumi.emptyLabel} />;

  return (
    <div ref={topRef}>
      <FeedTabBar
        tabs={groups.map((group) => ({ key: group.name, label: group.name, count: group.items.length }))}
        active={activeGroup.name}
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
        navLabel={bangumi.pagination.navLabel}
        prevLabel={bangumi.pagination.prevLabel}
        nextLabel={bangumi.pagination.nextLabel}
        pageLabel={bangumi.pagination.pageLabel}
      />
      {activeGroup.truncated && <FeedFootnote message={bangumi.outOfRangeLabel} />}
    </div>
  );
}
