import { visit, SKIP } from 'unist-util-visit';
import type { Root, RootContent, Text } from 'mdast';

/**
 * remark 扩展：`==高亮==` → <mark>（GFM 未内置该语法）。
 * 阅读器 parse-post 与 astro.config 的 markdown.remarkPlugins 共用。
 */
export function remarkMark() {
  return (tree: Root) => {
    visit(tree, 'text', (node: Text, index, parent) => {
      if (typeof index !== 'number' || !parent) return;
      if (!node.value.includes('==')) return;
      const parts = node.value.split(/==([^=\n]+)==/g);
      const replacement: RootContent[] = parts.map((part, i) =>
        i % 2 === 1 ? { type: 'html', value: `<mark>${part}</mark>` } : { type: 'text', value: part }
      );
      parent.children.splice(index, 1, ...replacement);
      return [SKIP, index + replacement.length];
    });
  };
}
