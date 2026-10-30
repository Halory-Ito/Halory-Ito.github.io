interface DialogControlsProps {
  /** 模式按钮显示的“下一个模式”名 */
  nextModeLabel: string;
  autoOn: boolean;
  onToggleMode: () => void;
  onToggleAuto: () => void;
  onOpenBacklog: () => void;
  onSkip: () => void;
  /** 背景蒙层调整面板（config.reading.maskPanel） */
  bgPanelOpen: boolean;
  onToggleBgPanel: () => void;
  bgLabel: string;
  /** 明亮模式：本控制条与视图全部组件均已隐藏，点击场景任意位置恢复 */
  bright: boolean;
  onToggleBright: () => void;
  hideLabel: string;
  /** dialog：置于对话框内右缘；float：浮动于视图（NVL / ARTICLE 模式）右缘 */
  variant: 'dialog' | 'float';
}

const BTN =
  'flex w-[4.25rem] cursor-pointer items-center justify-center rounded-lg px-2 py-2.5 text-[0.65rem] tracking-[0.25em] uppercase transition-all';
const BTN_IDLE =
  ' bg-[rgba(15,12,34,0.6)] text-white/70 hover:bg-[rgba(196,190,255,0.16)] hover:text-white';
const ACTIVE = 'text-[#c4beff] bg-[rgba(196,190,255,0.22)]';

/**
 * 对话框/视图右侧的功能按键：HIDE（明亮模式）、模式切换、AUTO、backlog(LOG)、SKIP。
 * 明亮模式下整条控制不渲染（只展示背景图片），恢复交给场景的任意一次点击。
 */
export default function DialogControls({
  nextModeLabel,
  autoOn,
  onToggleMode,
  onToggleAuto,
  onOpenBacklog,
  onSkip,
  bgPanelOpen,
  onToggleBgPanel,
  bgLabel,
  bright,
  onToggleBright,
  hideLabel,
  variant
}: DialogControlsProps) {
  /* Hide 隐藏所有组件：明亮模式下不做任何渲染，也没有恢复按键 */
  if (bright) return null;

  return (
    <div
      className={`vn-ui pointer-events-auto absolute z-10 flex flex-col gap-2 ${
        variant === 'dialog' ? 'right-3 top-1/2 -translate-y-1/2' : 'right-[clamp(0.75rem,2vw,1.5rem)] top-1/2 -translate-y-1/2'
      }`}
    >
      <button type="button" className={`${BTN}${BTN_IDLE}`} onClick={onToggleBright}>
        <span>{hideLabel}</span>
      </button>
      <button type="button" className={`${BTN}${BTN_IDLE}`} onClick={onToggleMode}>
        <span>{nextModeLabel}</span>
      </button>
      <button
        type="button"
        className={`${BTN}${autoOn ? ` ${ACTIVE}` : BTN_IDLE}`}
        onClick={onToggleAuto}
      >
        <span>AUTO</span>
      </button>
      <button type="button" className={`${BTN}${BTN_IDLE}`} onClick={onOpenBacklog}>
        <span>LOG</span>
      </button>
      <button
        type="button"
        className={`${BTN}${bgPanelOpen ? ` ${ACTIVE}` : BTN_IDLE}`}
        onClick={onToggleBgPanel}
      >
        <span>{bgLabel}</span>
      </button>
      <button type="button" className={`${BTN}${BTN_IDLE}`} onClick={onSkip}>
        <span>SKIP</span>
      </button>
    </div>
  );
}
