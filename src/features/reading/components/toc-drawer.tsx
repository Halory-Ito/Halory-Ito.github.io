import type { DrawerShape, PostSection } from '../types';

interface TocDrawerProps {
  show: boolean;
  drawerPx: number;
  shape: DrawerShape;
  drawerBg: string;
  tocLabel: string;
  sections: PostSection[];
  currentIndex: number;
  onJump: (index: number) => void;
}

/** 计算当前阅读位置所属的小节（最后一个 index <= currentIndex 的分区） */
function activeSectionIndex(sections: PostSection[], currentIndex: number): number {
  let active = -1;
  sections.forEach((s, i) => {
    if (s.index <= currentIndex) active = i;
  });
  return active;
}

/**
 * 右侧 TOC 卡片：外形由 config.theme.drawerShape 决定（含边距/高度/圆角）；
 * 鼠标靠近右缘滑入，点击可直接跳转到对应进度。
 */
export default function TocDrawer({
  show,
  drawerPx,
  shape,
  drawerBg,
  tocLabel,
  sections,
  currentIndex,
  onJump
}: TocDrawerProps) {
  const activeIdx = activeSectionIndex(sections, currentIndex);

  return (
    <aside
      id="toc-drawer"
      data-ui-block
      className={`vn-ui fixed z-40 flex flex-col gap-2 overflow-y-auto px-7 pt-10 pb-8 [scrollbar-width:thin] ${
        show ? 'translate-x-0' : 'translate-x-full'
      }`}
      style={{
        right: shape.offset,
        top: shape.top,
        height: shape.height,
        width: `min(${drawerPx}px, 86vw)`,
        borderRadius: shape.borderRadius,
        backgroundColor: drawerBg
      }}
    >
      <p className="mb-2 text-[0.7rem] tracking-[0.5em] text-white/45 uppercase">{tocLabel}</p>
      {sections.map((s, i) => (
        <button
          key={s.label}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onJump(s.index);
          }}
          className={`cursor-pointer rounded-lg px-3 py-2 text-left font-serif tracking-[0.2em] text-white/75 transition-all hover:bg-[rgba(196,190,255,0.12)] hover:text-white ${
            i === activeIdx ? 'bg-[rgba(196,190,255,0.18)] text-white' : ''
          }`}
        >
          {s.label}
        </button>
      ))}
    </aside>
  );
}
