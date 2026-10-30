import { codeToHtml } from 'shiki';
import { reading } from '../../config';

/**
 * 代码高亮：Astro 内置默认语法高亮器 Shiki。
 * 主题统一来自 config.reading.codeTheme（astro.config 的 markdown.shikiConfig 也读取同一配置）。
 */
export async function highlightCode(code: string, lang?: string): Promise<string> {
  try {
    return await codeToHtml(code, { lang: lang?.trim() || 'plaintext', theme: reading.codeTheme });
  } catch {
    // 未知语言回退纯文本；再失败则按转义文本兜底
    try {
      return await codeToHtml(code, { lang: 'plaintext', theme: reading.codeTheme });
    } catch {
      const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<pre style="margin:0"><code>${escaped}</code></pre>`;
    }
  }
}
