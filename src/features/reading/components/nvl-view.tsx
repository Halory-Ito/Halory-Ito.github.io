import { useEffect, useRef } from 'react';
import type { ReaderBeat, ReaderTheme, NvlStyle, PostParagraph } from '../types';
import { maskAttrs, maskVars } from '../../theme/mask-style';

interface NvlViewProps {
  progress: string;
  /** 已完成 beat（正文与插图铺开显示） */
  doneBeats: ReaderBeat[];
  /** 当前 beat */
  currentBeat?: ReaderBeat;
  /** 文本 beat 已打出的部分 */
  typedText: string;
  typing: boolean;
  /** 外观配置（config.theme + config.reading.nvl） */
  theme: ReaderTheme;
  style: NvlStyle;
}

const P_CLASS = 'md-rich mb-7 text-[1.15rem] leading-[2.15] tracking-[0.08em] text-white/90';
const IMG_CLASS =
  'mx-auto my-6 block max-h-[50vh] w-auto max-w-full rounded-xl';
const CODE_CLASS =
  'my-6 max-h-[46vh] overflow-auto rounded-xl text-left text-[0.85rem] [&_pre]:m-0 [&_pre]:min-h-0 [&_pre]:bg-transparent';
const CAPTION_CLASS = 'mb-6 text-center text-[0.85rem] tracking-[0.1em] text-white/60';

/** beat 图片（尺寸由页面侧解析注入，防止布局抖动） */
function BeatImage({ beat }: { beat: PostParagraph }) {
  return (
    <img
      src={beat.content}
      width={beat.width}
      height={beat.height}
      alt={beat.alt ?? ''}
      className={IMG_CLASS}
    />
  );
}

/** 静态正文 beat：文本 → 富文本 HTML；代码 → Shiki 高亮块 */
function BeatHtml({ beat }: { beat: ReaderBeat }) {
  if (beat.type === 'code') {
    return <div className={CODE_CLASS} dangerouslySetInnerHTML={{ __html: beat.content }} />;
  }
  return <p className={P_CLASS} dangerouslySetInnerHTML={{ __html: beat.content }} />;
}

/**
 * NVL 模式的全屏文本视图：已读 beat 铺开、当前 beat 打字机输出、容器自动滚底。
 * 滚动条与正文宽度由 config.reading.nvl 控制。
 */
export default function NvlView({
  progress,
  doneBeats,
  currentBeat,
  typedText,
  typing,
  theme,
  style
}: NvlViewProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [doneBeats.length, typedText]);

  return (
    <div
      data-ui-block
      {...maskAttrs('nvl')}
      className="vn-ui absolute inset-0 flex flex-col px-[clamp(2rem,8vw,6rem)] pb-10 pt-24"
      style={maskVars(theme.maskNvl)}
    >
      <div className="flex items-center justify-end">
        <span className="text-[0.75rem] tracking-[0.35em] text-white/55">{progress}</span>
      </div>
      <div
        ref={scrollRef}
        id="nvl-column"
        className="mx-auto flex-1 overflow-y-auto px-2 py-4"
        style={{
          width: style.textWidth,
          maxWidth: '100%',
          paddingRight: style.scrollbar === 'gap' ? style.scrollbarGap : undefined,
          scrollbarWidth: style.scrollbar === 'none' ? 'none' : undefined
        }}
      >
        {doneBeats.map((beat, i) =>
          beat.type === 'image' ? (
            <span key={`i${i}`}>
              <BeatImage beat={beat} />
              {beat.alt && <p className={CAPTION_CLASS}>{beat.alt}</p>}
            </span>
          ) : (
            <BeatHtml key={i} beat={beat} />
          )
        )}
        {currentBeat?.type === 'image' ? (
          <>
            <BeatImage beat={currentBeat} />
            {currentBeat.alt && !typing && <p className={CAPTION_CLASS}>{currentBeat.alt}</p>}
          </>
        ) : currentBeat?.type === 'code' ? (
          <div className={CODE_CLASS} dangerouslySetInnerHTML={{ __html: currentBeat.content }} />
        ) : (
          <p
            className={P_CLASS}
            dangerouslySetInnerHTML={{
              __html: typedText + (typing ? '<span class="vn-caret"></span>' : '<span class="vn-next-arrow text-[0.8rem] text-white/50">▸</span>')
            }}
          />
        )}
      </div>
    </div>
  );
}
