/** 蒙层配置：颜色 + 不透明度 + 模糊度（px，0 表示关闭） */
export interface MaskConfig {
  color: string;
  opacity: number;
  blur?: number;
}

/**
 * 把蒙层配置烘焙成内联样式。阅读页封面走自己的 BG 面板，不参与全局调节，用这个。
 * 透明度通过 color-mix 烘焙进背景色（元素 opacity 会连子元素一起淡化，仅适用于无内容的蒙层）。
 */
export function maskStyle(mask: MaskConfig): Record<string, string> {
  const style: Record<string, string> = {
    backgroundColor: `color-mix(in srgb, ${mask.color} ${pct(mask.opacity)}, transparent)`
  };
  const blur = mask.blur ?? 0;
  if (blur > 0) style.backdropFilter = `blur(${blur}px)`;
  return style;
}

/** 蒙层类型（与 config.theme.masks 的键一致） */
export type MaskKind = "page" | "cover" | "title" | "nvl";

/**
 * 标记蒙层元素，供全局蒙层样式（[data-vn-mask]）选中。
 * 阅读页封面使用自己的 BG 面板，不加标记，因此不会被全局设置覆盖。
 */
export function maskAttrs(kind: MaskKind): { "data-vn-mask": MaskKind } {
  return { "data-vn-mask": kind };
}

/**
 * 模糊半径 → 背景图放大倍率，盖住 filter 边缘露白。
 * 与 base-layout 内联脚本里的同一公式保持一致（脚本不能 import 这里）。
 */
export function maskBlurScale(blur: number): string {
  if (blur <= 0) return "1";
  return String(Math.round((1 + blur / 160) * 1000) / 1000);
}

function backdropValue(blur: number): string {
  return blur > 0 ? `blur(${blur}px)` : "none";
}

/**
 * 全局蒙层只在元素上留下颜色和各类型默认值。
 * 实际的透明度 / 模糊由根节点 CSS 变量覆盖（见 global.css 的 [data-vn-mask]），
 * 未保存偏好时回落到这里的默认值，导航时不必重写样式表。
 */
export function maskVars(mask: MaskConfig): Record<string, string> {
  const blur = mask.blur ?? 0;
  return {
    "--vn-mask-color": mask.color,
    "--vn-mask-opacity-default": pct(mask.opacity),
    "--vn-mask-backdrop-default": backdropValue(blur)
  };
}

/**
 * 铺满视口的背景图：模糊直接打在图片上，而不是蒙层的 backdrop-filter。
 * backdrop-filter 进不了 View Transition 快照，换页时会闪回清晰画面。
 */
export function maskBgVars(mask: MaskConfig): Record<string, string> {
  const blur = mask.blur ?? 0;
  return {
    "--vn-mask-backdrop-default": backdropValue(blur),
    "--vn-mask-bg-scale-default": maskBlurScale(blur)
  };
}

/** 无边框内容衬底配置：横向“左-中-右”渐变，左右边缘透明度“高”、中间“低” */
export interface VeilConfig {
  color: string;
  /** 左右边缘的不透明度（高） */
  edgeOpacity: number;
  /** 中间的不透明度（低） */
  centerOpacity: number;
  /** 中心低透明度平台的两端位置（0~1，从左到右） */
  centerSpan: readonly [number, number];
}

/** 不透明度 → 干净的 CSS 百分数（去掉 0.14*100 之类的浮点尾差） */
function pct(value: number): string {
  return `${Math.round(value * 10000) / 100}%`;
}

/**
 * 把衬底配置转成可同时用于 Astro style 属性与 React style 的对象。
 * 用于 About 页与 ARTICLE 阅读模式：内容不再坐在卡片上，而是衬在其后的无边框横向渐变上。
 */
export function veilStyle(veil: VeilConfig): Record<string, string> {
  const edge = `color-mix(in srgb, ${veil.color} ${pct(veil.edgeOpacity)}, transparent)`;
  const center = `color-mix(in srgb, ${veil.color} ${pct(veil.centerOpacity)}, transparent)`;
  const [from, to] = veil.centerSpan;
  return {
    backgroundImage: `linear-gradient(to right, ${edge} 0%, ${center} ${pct(from)}, ${center} ${pct(to)}, ${edge} 100%)`
  };
}
