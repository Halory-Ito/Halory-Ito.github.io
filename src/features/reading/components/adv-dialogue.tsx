interface AdvDialogueProps {
  title: string;
  progress: string;
  /** 当前要显示的文字：文本 beat 为富文本 HTML；图片 beat 用描述；代码 beat 用 announce（如「代码块 · ts」） */
  typedText: string;
  typing: boolean;
  /** 对话框背景（config.theme.panel） */
  panelBg: string;
  /** 当前 beat 为代码块时传 Shiki 高亮 HTML（正文区域下方展示） */
  codeHtml?: string;
}

/**
 * ADV 模式的底部对话框：标题 + 进度 / 台词 / 末尾指示点。
 * 组件只承载文字（含富文本 HTML）与代码块。
 */
export default function AdvDialogue({
  title,
  progress,
  typedText,
  typing,
  panelBg,
  codeHtml
}: AdvDialogueProps) {
  return (
    <div data-ui-block id="adv-dialogue" className="vn-ui absolute inset-0 flex flex-col justify-end">
      <div
        className="mx-auto mb-[4vh] w-[min(1100px,calc(100vw-3rem))] rounded-2xl px-[clamp(1.2rem,2vw,2.2rem)] py-[clamp(1.2rem,2vw,2.2rem)]"
        style={{ backgroundColor: panelBg }}
      >
        <div className="flex items-center justify-between gap-6">
          <span className="text-[0.9rem] tracking-[0.35em] text-white/65 uppercase">{title}</span>
          <span className="text-[0.75rem] tracking-[0.35em] text-white/55">{progress}</span>
        </div>
        <div className="mt-6 min-h-24 text-[clamp(1rem,1.2vw,1.25rem)] leading-8 tracking-[0.08em]">
          <span className="md-rich" dangerouslySetInnerHTML={{ __html: typedText }} />
          {typing ? <span className="vn-caret" /> : <span className="vn-next-arrow text-[0.8rem] text-white/50">▸</span>}
        </div>
        {codeHtml && (
          <div
            className="mt-4 max-h-[34vh] overflow-auto rounded-xl text-left text-[0.8rem] [&_pre]:m-0 [&_pre]:min-h-0 [&_pre]:bg-transparent"
            dangerouslySetInnerHTML={{ __html: codeHtml }}
          />
        )}
      </div>
    </div>
  );
}
