import type { ImageMetadata } from 'astro';

/** 单个图片资源的展示信息：最终 src + 固有尺寸（供 React 岛屿的 <img> 使用） */
export interface PostImageAttrs {
  src: string;
  width?: number;
  height?: number;
}

/** 文章目录内图片的元信息：glob 导入得到的是 `{ default: ImageMetadata }` 模块对象 */
const imageModules = import.meta.glob('/src/content/posts/**/*.{png,jpg,jpeg,webp,gif,avif,svg}', {
  eager: true
}) as Record<string, { default: ImageMetadata }>;

/** 解析文章内图片引用；public（以 / 开头）与 http(s) 引用不属于文章资源，返回 null */
export function postImageMeta(src: string): ImageMetadata | null {
  if (/^(https?:)?\/\//.test(src) || src.startsWith('/')) return null;
  return imageModules[`/${src}`]?.default ?? null;
}

/** 给 React 岛屿的图片使用：可序列化的 src / width / height */
export function postImageAttrs(src: string): PostImageAttrs {
  const meta = postImageMeta(src);
  if (meta) return { src: meta.src, width: meta.width, height: meta.height };
  return { src };
}
