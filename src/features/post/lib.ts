import { getCollection, type CollectionEntry } from 'astro:content';
import { assets } from '../../config';

/** 归档/上下篇等通用：剔除草稿后按发布日期倒序的文章列表 */
export type PostEntry = CollectionEntry<'posts'>;

export async function sortedPosts(): Promise<PostEntry[]> {
  const posts = await getCollection('posts');
  return posts
    .filter((post) => !post.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

/** 文章未声明 cover 时，按文章 id 从 config.assets.fallbackCovers 稳定挑选一张预置背景 */
export function fallbackCoverFor(id: string): string {
  const covers = assets.fallbackCovers;
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) % 9973;
  }
  return covers[hash % covers.length];
}
