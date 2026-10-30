import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const posts = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/posts' }),
  schema: z
    .object({
      title: z.string(),
      description: z.string().optional(),
      /** 发布日期：兼容 pubDate 与常见迁移约定 published */
      pubDate: z.coerce.date().optional(),
      published: z.coerce.date().optional(),
      /** 作者；缺省时文章页不展示作者位（避免硬编码品牌名） */
      author: z.string().default(''),
      category: z.string().default('随笔'),
      tags: z.array(z.string()).default([]),
      /** 草稿不进入归档与路由 */
      draft: z.boolean().default(false),
      /** 文章头图/阅读页背景；缺省时由 config.assets.fallbackCovers 兜底 */
      cover: z.string().optional()
    })
    .transform((d) => ({ ...d, pubDate: d.pubDate ?? d.published ?? new Date(0) }))
});

/** 关于页：单一 markdown 文件驱动（src/content/about.md），frontmatter 仅提供页头信息 */
const about = defineCollection({
  loader: glob({ pattern: 'about.md', base: './src/content' }),
  schema: z.object({
    /** 页面 H1；缺省时回退 site.name */
    title: z.string().optional(),
    /** ListShell 眉标；缺省时由 about 页给出页名 */
    eyebrow: z.string().optional()
  })
});

export const collections = { posts, about };
