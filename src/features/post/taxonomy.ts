import { sortedPosts, type PostEntry } from './lib';
import { routes } from '../../config';

export interface TaxonomyGroup {
  name: string;
  count: number;
  posts: PostEntry[];
}

export type TaxonomyKind = 'category' | 'tag';

/** 分类/标签详情页的路由链接（CJK 等字符统一编码，getStaticPaths 内保持原值） */
export function taxonomyHref(kind: TaxonomyKind, name: string): string {
  const encoded = encodeURIComponent(name);
  return kind === 'category' ? `${routes.categories}/${encoded}` : `${routes.tags}/${encoded}`;
}

function pushTo(map: Map<string, PostEntry[]>, key: string, post: PostEntry): void {
  const bucket = map.get(key) ?? [];
  bucket.push(post);
  map.set(key, bucket);
}

/** 分类分组：保持归档顺序，组内按名称排序，数量多的在前 */
export async function categoryGroups(): Promise<TaxonomyGroup[]> {
  const posts = await sortedPosts();
  const map = new Map<string, PostEntry[]>();
  for (const post of posts) pushTo(map, post.data.category, post);
  return [...map.entries()]
    .map(([name, list]) => ({ name, count: list.length, posts: list }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));
}

/** 标签分组：一篇文章可属于多个标签 */
export async function tagGroups(): Promise<TaxonomyGroup[]> {
  const posts = await sortedPosts();
  const map = new Map<string, PostEntry[]>();
  for (const post of posts) for (const tag of post.data.tags) pushTo(map, tag, post);
  return [...map.entries()]
    .map(([name, list]) => ({ name, count: list.length, posts: list }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh'));
}

export async function postsByCategory(name: string): Promise<PostEntry[]> {
  return (await sortedPosts()).filter((post) => post.data.category === name);
}

export async function postsByTag(name: string): Promise<PostEntry[]> {
  return (await sortedPosts()).filter((post) => post.data.tags.includes(name));
}
