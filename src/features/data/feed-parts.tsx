/**
 * 数据页（VNDB / Bangumi 岛屿）共用的无数据 chrome：
 * 加载/错误/空态提示、脚注与状态分组 Tabs。
 * 无边框设计：激活态用填充底色区分，与阅读器控制条按键同一语言。
 */
export function FeedNotice({
  message,
  actionLabel,
  onAction,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex flex-col items-center gap-6 py-24 text-center">
      <p className="animate-pulse text-sm tracking-[0.3em] text-white/45">{message}</p>
      {actionLabel && (
        <button
          type="button"
          className="cursor-pointer rounded-lg bg-[rgba(15,12,34,0.6)] px-5 py-2.5 text-[0.7rem] tracking-[0.3em] text-white/70 uppercase transition-colors hover:bg-[rgba(196,190,255,0.16)] hover:text-white"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/**
 * 状态分组 Tabs：仅展示非空的分组，labels 右侧附带条目数；
 * active 命中项为填充高亮（背景区分，无边框）。
 */
export function FeedTabBar({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string; count: number }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          type="button"
          role="tab"
          aria-selected={tab.key === active}
          className={`cursor-pointer rounded-lg px-4 py-2 text-[0.7rem] tracking-[0.3em] uppercase transition-colors ${
            tab.key === active
              ? "bg-[rgba(196,190,255,0.22)] text-[#c4beff]"
              : "text-white/60 hover:bg-[rgba(196,190,255,0.12)] hover:text-white"
          }`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
          <span className="ml-1.5 text-[0.65rem] text-white/40">{tab.count}</span>
        </button>
      ))}
    </div>
  );
}

/** 数据来源说明（页脚提示行） */
export function FeedFootnote({ message }: { message: string }) {
  return <p className="mt-10 text-[0.72rem] tracking-[0.25em] text-white/35">{message}</p>;
}
