import type { DrawerShape } from '../types';

interface MetaDrawerProps {
  show: boolean;
  drawerPx: number;
  shape: DrawerShape;
  drawerBg: string;
  infoLabel: string;
  title: string;
  /** 行数据：label 来自 config.reading.metaLabels，值来自文章元数据 */
  rows: { label: string; value: string }[];
}

/**
 * 左侧元数据卡片：外形由 config.theme.drawerShape 决定（含边距/高度/圆角）；
 * 鼠标靠近左缘滑入，指针停留在其上时保持显示（可复制）。
 */
export default function MetaDrawer({
  show,
  drawerPx,
  shape,
  drawerBg,
  infoLabel,
  title,
  rows
}: MetaDrawerProps) {
  return (
    <aside
      id="meta-drawer"
      data-ui-block
      className={`vn-ui fixed z-40 flex flex-col gap-3 overflow-y-auto px-7 pt-10 pb-8 [scrollbar-width:thin] ${
        show ? 'translate-x-0' : '-translate-x-full'
      }`}
      style={{
        left: shape.offset,
        top: shape.top,
        height: shape.height,
        width: `min(${drawerPx}px, 86vw)`,
        borderRadius: shape.borderRadius,
        backgroundColor: drawerBg
      }}
    >
      <p className="text-[0.7rem] tracking-[0.5em] text-white/45 uppercase">{infoLabel}</p>
      <h2 className="text-[1.15rem] tracking-[0.3em]">{title}</h2>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between gap-4 rounded-lg bg-[rgba(226,222,255,0.06)] py-2 text-[0.92rem] text-white/80"
        >
          <span className="tracking-[0.25em] text-white/45">{row.label}</span>
          <span className="select-text">{row.value}</span>
        </div>
      ))}
    </aside>
  );
}
