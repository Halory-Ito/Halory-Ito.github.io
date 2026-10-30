import type { MaskPanelConfig } from '../types';

interface BgMaskPanelProps {
  open: boolean;
  title: string;
  opacity: number;
  blur: number;
  labels: { blur: string; opacity: string };
  /** 滑杆范围/步进（config.reading.maskPanel） */
  config: MaskPanelConfig;
  panelBg: string;
  panelRadius: string;
  onOpacityChange: (value: number) => void;
  onBlurChange: (value: number) => void;
  onClose: () => void;
}

const HEADER_CLASS = 'flex shrink-0 items-center justify-between px-7 py-4';
const TITLE_CLASS = 'text-sm tracking-[0.5em] text-white/75 uppercase';
const VALUE_CLASS = 'text-[0.7rem] tracking-[0.3em] text-white/40';
const ROW_CLASS = 'flex items-center gap-5';
const LABEL_CLASS = 'w-24 shrink-0 text-[0.85rem] tracking-[0.3em] text-white/70';
const RANGE_CLASS = 'h-1.5 w-full cursor-pointer accent-[#c4beff]';
const HINT_CLASS = 'w-14 shrink-0 text-right text-[0.8rem] text-white/50';

/** 一个滑杆行：标签 + range + 当前值 */
function SliderRow({
  label, valueText, min, max, step, value, onChange
}: {
  label: string;
  valueText: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className={ROW_CLASS}>
      <span className={LABEL_CLASS}>{label}</span>
      <input
        type="range"
        className={RANGE_CLASS}
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <span className={HINT_CLASS}>{valueText}</span>
    </div>
  );
}

/**
 * 背景蒙层调整面板：滑杆实时调节封面蒙层的透明度与模糊（作用于全部阅读模式）。
 * 点击面板以外区域关闭；滑杆范围/步进来自 config.reading.maskPanel，调整结果持久化。
 */
export default function BgMaskPanel({
  open,
  title,
  opacity,
  blur,
  labels,
  config,
  panelBg,
  panelRadius,
  onOpacityChange,
  onBlurChange,
  onClose
}: BgMaskPanelProps) {
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
        className="w-[min(520px,92vw)] overflow-hidden"
        style={{ backgroundColor: panelBg, borderRadius: panelRadius }}
        onClick={(e) => e.stopPropagation()}
      >
        <header className={HEADER_CLASS}>
          <p className={TITLE_CLASS}>{title}</p>
          <span className={VALUE_CLASS}>{Math.round(opacity * 100)}% · {blur}px</span>
        </header>
        <div className="flex flex-col gap-6 px-7 py-6">
          <SliderRow
            label={labels.opacity}
            valueText={`${Math.round(opacity * 100)}%`}
            min={config.opacityMin}
            max={config.opacityMax}
            step={config.opacityStep}
            value={opacity}
            onChange={onOpacityChange}
          />
          <SliderRow
            label={labels.blur}
            valueText={`${blur}px`}
            min={config.blurMin}
            max={config.blurMax}
            step={config.blurStep}
            value={blur}
            onChange={onBlurChange}
          />
        </div>
      </section>
    </div>
  );
}
