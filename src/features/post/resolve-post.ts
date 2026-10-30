import { parsePostScript, type PostParagraph, type PostScript } from './parse-post';
import { postImageAttrs } from './post-images';
import { highlightCode } from './highlight';
import { reading } from '../../config';

interface ResolveOptions {
  /** md 文件所在目录（项目相对），用于解析文章内相对路径的图片 */
  baseDir?: string;
}

/**
 * 在 parsePostScript 之上做"渲染后处理"：
 * - 图片 beat → 最终 src + 固有尺寸（进入 Astro 图片管线）
 * - 代码 beat → Shiki 高亮 HTML + ADV 对话框提示台词（如「代码块 · ts」）
 * - 文本 beat 保留 remark/rehype 生成的富文本 HTML
 */
export async function resolvePostScript(body: string, opts: ResolveOptions = {}): Promise<PostScript> {
  const script = await parsePostScript(body, {
    baseDir: opts.baseDir,
    maxChars: reading.beatMaxChars,
    delimiters: reading.beatDelimiters
  });

  const paragraphs: PostParagraph[] = await Promise.all(
    script.paragraphs.map(async (beat) => {
      if (beat.type === 'image') {
        const attrs = postImageAttrs(beat.content);
        return { ...beat, content: attrs.src, width: attrs.width, height: attrs.height };
      }
      if (beat.type === 'code') {
        const html = await highlightCode(beat.content, beat.lang);
        const lang = beat.lang?.trim();
        return { ...beat, content: html, announce: lang ? `${reading.hints.code} · ${lang}` : reading.hints.code };
      }
      return beat;
    })
  );

  return { ...script, paragraphs };
}
