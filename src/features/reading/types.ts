import type { PostParagraph, PostSection } from '../post/parse-post';
import type { MaskConfig } from '../theme/mask-style';

export type { PostParagraph, PostSection };

export type ReaderMode = 'adv' | 'nvl' | 'article';

/** NVL 全文呈现（config.reading.nvl） */
export interface NvlStyle {
  /** 正文列宽（直接写 CSS 尺寸） */
  textWidth: string;
  /** 'none' 隐藏滚动条；'gap' 保留滚动条并拉开与正文的距离 */
  scrollbar: 'none' | 'gap';
  /** scrollbar 为 'gap' 时正文与滚动条的距离 */
  scrollbarGap: string;
}

/** ARTICLE 模式的呈现（config.reading.article） */
export interface ArticleStyle {
  /** 正文列宽 */
  textWidth: string;
  /** 'none' 隐藏滚动条；'gap' 保留滚动条并拉开与正文的距离 */
  scrollbar: 'none' | 'gap';
  /** scrollbar 为 'gap' 时正文与滚动条的距离 */
  scrollbarGap: string;
}

/** 阅读脚本条目：正文段落或插图（图片 src 已在页面侧解析完成） */
export type ReaderBeat = PostParagraph;

/** 元数据/TOC 侧栏外形（值可直接写入 CSS） */
export interface DrawerShape {
  /** 距屏幕边缘（左滑栏用左值，右滑栏用右值） */
  offset: string;
  top: string;
  height: string;
  borderRadius: string;
}

/** 阅读器外观（值由 config.theme 提供） */
export interface ReaderTheme {
  /** ADV 对话框背景 */
  panel: string;
  /** 侧栏卡片背景 */
  drawer: string;
  /** NVL / ARTICLE 全视图衬底蒙层（一致的暗化处理） */
  maskNvl: MaskConfig;
  /** 阅读页封面蒙层（读者可通过 BG 面板调节其透明度与模糊） */
  maskCover: MaskConfig;
}

/** 背景蒙层调整面板（config.reading.maskPanel）：滑杆范围/步进与持久化键 */
export interface MaskPanelConfig {
  storageKey: string;
  blurMin: number;
  blurMax: number;
  blurStep: number;
  opacityMin: number;
  opacityMax: number;
  opacityStep: number;
}

/** 阅读器元数据（由文章 frontmatter 组装） */
export interface ReaderMeta {
  author: string;
  date: string;
  category: string;
  tags: string;
  words: string;
}

export interface ReaderSceneProps {
  /** 文章标题（对话框/NVL 顶部展示） */
  title: string;
  slug: string;
  cover: string;
  /** 正文 beats（由 parsePostScript 从 Markdown 解析） */
  paragraphs: PostParagraph[];
  /** TOC 分区 */
  sections: PostSection[];
  meta: ReaderMeta;
  /** 以下值全部来自 src/config.ts */
  theme: ReaderTheme;
  drawerShape: DrawerShape;
  typeSpeedMs: number;
  autoDelayMs: number;
  edgeTriggerPx: number;
  sideDrawerPx: number;
  modeStorageKey: string;
  nvlStyle: NvlStyle;
  articleStyle: ArticleStyle;
  metaLabels: { [K in keyof ReaderMeta | 'progress']: string };
  hints: {
    info: string; toc: string; backlog: string; image: string; code: string;
    hideLabel: string; bgLabel: string; blurLabel: string; opacityLabel: string;
  };
  /** 背景蒙层调整面板（config.reading.maskPanel） */
  maskPanel: MaskPanelConfig;
}
