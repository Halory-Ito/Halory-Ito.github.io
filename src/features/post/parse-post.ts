import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import remarkDirective from 'remark-directive';
import { toHtml } from 'hast-util-to-html';
import { remarkMark } from './remark-mark';
import { remarkGithubCard } from './remark-github-card';
import type { Root, RootContent, Text } from 'mdast';

/**
 * 将 Markdown 解析为阅读脚本（beats），统一走 Astro 推荐的 remark/rehype 管线：
 * - 段落/引用/表格等串行化为 HTML，文本 beat 承载内联富文本（加粗/删除线/==高亮==/内联码）
 * - 列表、代码块（```lang）为独立 beat；代码高亮由 resolvePostScript 后处理
 * - 独立成段的 `![alt](src)` 解析为图片 beat
 * - `##` 二级标题生成 TOC 分区，index 指向其后第一个 beat
 */

export interface PostParagraph {
  /** text：富文本段落（打字机/铺开展示）；image：独立成段的插图；code：代码块 */
  type: 'text' | 'image' | 'code';
  /** text → 内联/块级 HTML；image → 归一化引用（页面侧替换为最终 src）；code → 原始代码（页面侧替换为高亮 HTML） */
  content: string;
  /** image 的替换文本 */
  alt?: string;
  /** code 的语言（如 ts / bash，空串表示未标注） */
  lang?: string;
  /** code beat 在 ADV 对话框中的提示台词（resolvePostScript 组装） */
  announce?: string;
  /** image 的固有尺寸（页面侧经 postImageAttrs 解析，供岛屿防抖动渲染） */
  width?: number;
  height?: number;
  /** 内容包含块级富文本（列表/引用/表格等），跳过按标点切分 */
  rich?: boolean;
}

export interface PostSection {
  label: string;
  index: number;
}

export interface PostScript {
  paragraphs: PostParagraph[];
  sections: PostSection[];
  wordCount: number;
}

interface ParseOptions {
  /** md 文件所在目录（项目相对），用于解析文章内相对路径的图片 */
  baseDir?: string;
  /** 单个 beat 最大字数；超过则按句末标点切分（0 / 未设置表示不切分） */
  maxChars?: number;
  /** 切分依据的句末标点 */
  delimiters?: string[];
}

/* remark 扩展 ==高亮== 与 ::github 卡片由共享模块提供（astro.config 同样使用） */

const mdParser = unified().use(remarkParse).use(remarkGfm).use(remarkMark).use(remarkDirective).use(remarkGithubCard);
/** mdast 单节点 → hast（in-place，remarkRehype）→ 同步串行化 HTML（raw 节点如 <mark> 原样保留） */
const mdToHast = unified().use(remarkRehype, { allowDangerousHtml: true });

function nodeHtml(node: RootContent): string {
  const tree: Root = { type: 'root', children: [node] };
  const hast = mdToHast.runSync(tree as never);
  return toHtml(hast as never, { allowDangerousHtml: true }).trim();
}

/** 单段文本去掉外层 <p>，便于在阅读器内自由排布 */
function unwrapHtml(node: RootContent): string {
  const html = nodeHtml(node).trim();
  const match = /^<p[^>]*>([\s\S]*)<\/p>$/.exec(html);
  return match ? match[1] : html;
}

/** 是否包含可见的块级结构 */
function looksRich(node: RootContent): boolean {
  return node.type === 'blockquote' || node.type === 'table' || node.type === 'list' || node.type === 'html' || node.type === 'heading';
}

/** 贪心切分：优先按最近的句末标点断句，使每个单元尽量不超过 maxChars */
function splitBeat(text: string, maxChars: number, delimiters: string[]): string[] {
  if (maxChars <= 0 || text.length <= maxChars || delimiters.length === 0) return [text];
  const isDelimiter = new Set(delimiters);
  const units: string[] = [];
  let start = 0;
  while (start < text.length) {
    let best = -1;
    let beyond = -1;
    let i = start;
    while (i < text.length) {
      if (!isDelimiter.has(text[i])) {
        i += 1;
        continue;
      }
      let j = i;
      while (j < text.length && isDelimiter.has(text[j])) j += 1; // 连续标点（如省略号……）一并收进该单元
      const len = j - start;
      if (len <= maxChars) best = j;
      else {
        beyond = j;
        break;
      }
      i = j;
    }
    // 优先取范围内最远的句尾；范围内没有句尾时取其后第一个句尾，保证能推进
    const cut = best >= 0 ? best : beyond >= 0 ? beyond : text.length;
    units.push(text.slice(start, cut));
    start = cut;
  }
  return units;
}

/** 把相对引用归一化为项目内路径；`/` 与 http(s) 开头的引用原样保留 */
function resolveRef(baseDir: string | undefined, src: string): string {
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return src;
  const out: string[] = [];
  for (const part of [...(baseDir ?? '').split('/'), ...src.split('/')]) {
    if (!part || part === '.') continue;
    if (part === '..') out.pop();
    else out.push(part);
  }
  return out.join('/');
}

export async function parsePostScript(body: string, opts: ParseOptions = {}): Promise<PostScript> {
  const beats: PostParagraph[] = [];
  const sections: PostSection[] = [];
  let wordCount = 0;

  const tree = mdParser.parse(body.replace(/[\u200B\u200C\u200D\u2060\uFEFF]/g, ''));
  await mdParser.run(tree); // transformer 阶段：==高亮== → <mark>、::github → 卡片（异步拉取仓库指标）
  for (const node of tree.children as RootContent[]) {
    switch (node.type) {
      case 'heading': {
        if (node.depth === 1) break; // 一级标题与 frontmatter 的 title 重复，忽略
        const label = node.children
          .filter((child): child is Text => child.type === 'text')
          .map((child) => child.value)
          .join('');
        if (node.depth === 2) sections.push({ label, index: beats.length });
        else beats.push({ type: 'text', content: nodeHtml(node).trim(), rich: true });
        break;
      }
      case 'code': {
        beats.push({ type: 'code', content: node.value.replace(/\n$/, ''), lang: node.lang ?? '' });
        break;
      }
      case 'image': {
        beats.push({
          type: 'image',
          content: resolveRef(opts.baseDir, node.url),
          alt: node.alt ?? ''
        });
        break;
      }
      case 'list':
      case 'blockquote':
      case 'table':
      case 'html':
      case 'thematicBreak': {
        const html = nodeHtml(node).trim();
        wordCount += html.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
        beats.push({ type: 'text', content: html, rich: true });
        break;
      }
      case 'paragraph':
      default: {
        const child = (node as { children?: RootContent[] }).children;
        const first = child?.[0];
        if (child?.length === 1 && first?.type === 'image') {
          const url = (first as { url: string; alt?: string }).url;
          beats.push({
            type: 'image',
            content: resolveRef(opts.baseDir, url),
            alt: (first as { alt?: string }).alt ?? ''
          });
          break;
        }
        const html = unwrapHtml(node);
        wordCount += html.replace(/<[^>]*>/g, '').replace(/\s/g, '').length;
        if (looksRich(node)) {
          beats.push({ type: 'text', content: html, rich: true });
          break;
        }
        for (const unit of splitBeat(html.replace(/^&nbsp;+$/, '').trim(), opts.maxChars ?? 0, opts.delimiters ?? [])) {
          beats.push({ type: 'text', content: unit });
        }
        break;
      }
    }
  }

  return { paragraphs: beats, sections, wordCount };
}
