import type { PostParagraph } from '../../post/parse-post';

interface BacklogPanelProps {
  open: boolean;
  title: string;
  /** 截至当前进度的全部 beat（滚动脚本） */
  beats: PostParagraph[];
  imageLabel: string;
  panelBg: string;
  panelRadius: string;
  onClose: () => void;
}

const ROW_CLASS = 'rounded-lg bg-[rgba(226,222,255,0.04)] px-4 py-2';

/**
 * 阅读记录面板：汇总截至当前进度的全部台词。
 * ADV/NVL 下在内容区域外向上滚动滚轮打开；点击面板以外区域关闭。
 */
export default function BacklogPanel({
  open,
  title,
  beats,
  imageLabel,
  panelBg,
  panelRadius,
  onClose
}: BacklogPanelProps) {
  if (!open) return null;

  return (
    <div
      className="z-[45] fixed inset-0 flex items-center justify-center bg-[rgba(9,7,24,0.6)] p-6"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <section
        className="flex max-h-[80vh] w-[min(760px,92vw)] flex-col overflow-hidden"
        style={{ backgroundColor: panelBg, borderRadius: panelRadius }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between px-7 py-4">
          <p className="text-sm tracking-[0.5em] text-white/75 uppercase">{title}</p>
          <span className="text-[0.7rem] tracking-[0.3em] text-white/40">{beats.length}</span>
        </header>
        <div className="flex flex-1 flex-col overflow-y-auto px-5 py-4 [scrollbar-width:thin]">
          {beats.map((beat, i) => (
            <article key={i} className={ROW_CLASS}>
              <p className="text-[1.02rem] leading-7 tracking-[0.06em] text-white/90">
                {beat.type === 'image' ? (beat.alt ?? imageLabel) : beat.content}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
