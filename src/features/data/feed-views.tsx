/**
 * 归一化条目的网格呈现（竖版封皮卡片）。
 * VNDB / Bangumi 岛屿把各自的数据映射成 FeedItem 后直接复用；
 * 无边框卡片语言与站点其他条目一致（暗底 + hover 提亮）。
 */
export interface FeedItem {
  id: string;
  href: string;
  imageUrl: string | null;
  imageAlt: string;
  title: string;
  /** 高亮 chip（青紫）：个人评分 / 追番进度 */
  primaryBadge?: string;
  /** 普通 chip（灰）：站点评分等 */
  secondaryBadge?: string;
}

/** 条目 chips：右侧/底部尊享小块 */
function EntryBadges({ item }: { item: FeedItem }) {
  if (!item.primaryBadge && !item.secondaryBadge) return null;
  return (
    <>
      {item.primaryBadge && (
        <span className="rounded-lg bg-[rgba(196,190,255,0.14)] px-2.5 py-1 text-[0.85rem] tracking-[0.15em] text-[#c4beff]">
          {item.primaryBadge}
        </span>
      )}
      {item.secondaryBadge && (
        <span className="rounded-lg bg-[rgba(226,222,255,0.08)] px-2.5 py-1 text-[0.85rem] tracking-[0.15em] text-white/70">
          {item.secondaryBadge}
        </span>
      )}
    </>
  );
}

/** 网格模式：竖版封面卡片（数据页唯一的浏览视图） */
export function FeedGrid({ items }: { items: FeedItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <a
          key={item.id}
          href={item.href}
          target="_blank"
          rel="noopener"
          className="group flex flex-col gap-2 rounded-xl bg-[rgba(15,12,34,0.25)] p-3 transition-colors hover:bg-[rgba(196,190,255,0.12)]"
        >
          <div className="aspect-3/4 w-full overflow-hidden rounded-md bg-[rgba(226,222,255,0.08)]">
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.imageAlt}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover transition-opacity group-hover:opacity-90"
              />
            ) : null}
          </div>
          <p className="line-clamp-2 text-[0.92rem] leading-6 tracking-[0.06em] text-white/90 transition-colors group-hover:text-white">
            {item.title}
          </p>
          <div className="mt-auto flex gap-1.5 pt-1">
            <EntryBadges item={item} />
          </div>
        </a>
      ))}
    </div>
  );
}
