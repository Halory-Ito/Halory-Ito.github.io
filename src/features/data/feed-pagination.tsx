import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * 数据页分页（客户端切片）：
 * 数据已整体拉取到内存，按每页条数切片展示；页码从 0 开始，越界时自动收敛到末页。
 */

/** 分页状态：page 为当前页（0 基），start/end 为切片区间，reset 用于切换分组时回到首页 */
export function usePagination(totalItems: number, perPage: number) {
  const [rawPage, setPage] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
  const page = Math.min(rawPage, totalPages - 1);
  const start = page * perPage;
  return { page, totalPages, start, end: start + perPage, setPage, reset: () => setPage(0) };
}

/** 分页导航：图标翻页 + 页码文案；仅一页时不渲染 */
export function FeedPagination({
  page,
  totalPages,
  onChange,
  navLabel,
  prevLabel,
  nextLabel,
  pageLabel,
}: {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  /** 导航区无障碍名称 */
  navLabel: string;
  prevLabel: string;
  nextLabel: string;
  /** 页码文案模板：{page} 当前页，{total} 总页数 */
  pageLabel: string;
}) {
  if (totalPages <= 1) return null;

  const label = pageLabel.replace("{page}", String(page + 1)).replace("{total}", String(totalPages));
  const buttonClass =
    "cursor-pointer rounded-lg bg-[rgba(15,12,34,0.6)] p-2 text-white/60 transition-colors hover:bg-[rgba(196,190,255,0.16)] hover:text-white disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-[rgba(15,12,34,0.6)] disabled:hover:text-white/60";

  return (
    <nav aria-label={navLabel} className="mt-8 flex items-center justify-center gap-2">
      <button
        type="button"
        aria-label={prevLabel}
        className={buttonClass}
        disabled={page === 0}
        onClick={() => onChange(page - 1)}
      >
        <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
      </button>
      <span className="min-w-20 text-center text-[0.72rem] tracking-[0.3em] text-white/45 tabular-nums">{label}</span>
      <button
        type="button"
        aria-label={nextLabel}
        className={buttonClass}
        disabled={page >= totalPages - 1}
        onClick={() => onChange(page + 1)}
      >
        <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </nav>
  );
}
