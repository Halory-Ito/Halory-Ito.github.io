/** 蒙层配置：颜色 + 不透明度 + 模糊度（px，0 表示关闭） */
export interface MaskConfig {
  color: string;
  opacity: number;
  blur?: number;
}

/**
 * 把蒙层配置转成可同时用于 Astro style 属性与 React style 的对象。
 * 透明度通过 color-mix 烘焙进背景色（元素 opacity 会连子元素一起淡化，仅适用于无内容的蒙层）。
 */
export function maskStyle(mask: MaskConfig): Record<string, string> {
  const style: Record<string, string> = {
    backgroundColor: `color-mix(in srgb, ${mask.color} ${mask.opacity * 100}%, transparent)`
  };
  const blur = mask.blur ?? 0;
  if (blur > 0) style.backdropFilter = `blur(${blur}px)`;
  return style;
}

/** 蒙层类型（与 config.theme.masks 的键一致），全局调节按类型生成覆盖样式 */
export type MaskKind = "page" | "cover" | "title" | "nvl";

/**
 * 标记蒙层元素，供全局蒙层调节的样式规则（[data-vn-mask="..."]）选中。
 * 阅读页封面使用自己的 BG 面板，不加标记，因此不会被全局设置覆盖。
 */
export function maskAttrs(kind: MaskKind): { "data-vn-mask": MaskKind } {
  return { "data-vn-mask": kind };
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
