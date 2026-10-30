import { useCallback, useEffect, useState } from 'react';
import type { PostParagraph } from '../post/parse-post';

interface TypewriterOptions {
  paragraphs: PostParagraph[];
  index: number;
  typeSpeedMs: number;
}

/** 分词：HTML 标签与实体作为整体一次出现，其余字符逐个出现（富文本不被打字机撕裂） */
function tokenizeRich(text: string): string[] {
  return text.match(/&(?:[a-zA-Z]+|#\d+);|<[^>]*>|[\s\S]/g) ?? [text];
}

/**
 * 打字机：文本 beat 的富文本 HTML 以"标签整体"逐字推进；
 * 图片 beat 显示描述文字；代码 beat 显示 announce（如「代码块 · ts」，代码本体另行展示）。
 * 中途补全（skip）：立即展示当前台词全文。
 */
export function useTypewriter({ paragraphs, index, typeSpeedMs }: TypewriterOptions) {
  const [typed, setTyped] = useState('');
  const [typing, setTyping] = useState(true);

  /** 当前进度对应台词 */
  const currentText = useCallback(
    (beatIndex: number) => {
      const beat = paragraphs[beatIndex];
      if (!beat) return '';
      if (beat.type === 'image') return beat.alt ?? '';
      if (beat.type === 'code') return beat.announce ?? '';
      return beat.content;
    },
    [paragraphs]
  );

  useEffect(() => {
    const text = currentText(index);
    const tokens = tokenizeRich(text);
    if (tokens.length === 0) {
      setTyped('');
      setTyping(false);
      return;
    }
    setTyped('');
    setTyping(true);
    let i = 0;
    const timer = window.setInterval(() => {
      i += 1;
      if (i >= tokens.length) {
        window.clearInterval(timer);
        setTyped(text);
        setTyping(false);
      } else {
        setTyped(tokens.slice(0, i).join(''));
      }
    }, typeSpeedMs);
    return () => window.clearInterval(timer);
  }, [index, currentText, typeSpeedMs]);

  const skip = useCallback(() => {
    setTyped(currentText(index));
    setTyping(false);
  }, [currentText, index]);

  return { typed, typing, skip };
}
