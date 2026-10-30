import { useEffect, useRef } from 'react';
import type { PostParagraph } from '../types';
import { maskAttrs, maskStyle, type MaskConfig } from '../../theme/mask-style';

/** 暴露给 reader-scene 的命令接口（SKIP 跳到末尾、TOC 定位到某 beat） */
export interface ArticlePaneApi {
  scrollToEnd(): void;
  scrollToIndex(index: number): void;
}

interface ArticlePaneProps {
  title: string;
  /** 顶部元信息行（分类 / 标签 / 日期，由 scene 组装） */
  metaLine: string;
  beats: PostParagraph[];
  /** 正文列宽（config.reading.article.textWidth） */
  width: string;
  /** 正文与滚动条呈现（config.reading.article） */
  scrollbar: 'none' | 'gap';
  scrollbarGap: string;
  /** 与 NVL 一致的全视图衬底蒙层（config.theme.masks.nvl） */
  maskNvl: MaskConfig;
  /** AUTO 时自动缓慢向下滚动 */
  autoOn: boolean;
  /** 初始位置：滚动到该 beat */
  initialIndex: number;
  /** 滚动位置变化时回报当前活跃 beat 下标（驱动 TOC / 进度展示） */
  onIndexChange: (index: number) => void;
  /** 滚动位置变化时回报“进入视口底部”的最新 beat 下标（驱动背景随图片切换） */
  onBgIndexChange: (index: number) => void;
  /** 注册命令接口 */
  registerApi: (api: ArticlePaneApi | null) => void;
}

const IMG_CLASS =
  'mx-auto block max-h-[80vh] w-auto max-w-full rounded-2xl';
const CAPTION_CLASS = 'mt-3 text-center text-[0.85rem] tracking-[0.1em] text-white/60';
const CODE_CLASS =
  'my-10 max-h-[70vh] overflow-auto rounded-2xl text-left text-[0.9rem] [&_pre]:m-0 [&_pre]:min-h-0 [&_pre]:bg-transparent';

/** beat 图片（尺寸由页面侧解析注入，防止布局抖动） */
function BeatImage({ beat, className }: { beat: PostParagraph; className?: string }) {
  return (
    <img
      src={beat.content}
      width={beat.width}
      height={beat.height}
      alt={beat.alt ?? ''}
      className={className ?? IMG_CLASS}
    />
  );
}

/**
 * 阅读场景中的 ARTICLE 模式：常规滚动排版。
 * 内容不置于卡片，而是衬在与 NVL 一致的暗化蒙层上（config.theme.masks.nvl）；
 * 滚动位置同时驱动两个锚点：0.4 视线处的活跃 beat（TOC/进度）与进入视口底部的最新 beat（背景切换）；
 * 滚动条按 config.reading.article 处理；功能键由 scene 级 dialog-controls 提供。
 */
export default function ArticlePane({
  title,
  metaLine,
  beats,
  width,
  scrollbar,
  scrollbarGap,
  maskNvl,
  autoOn,
  initialIndex,
  onIndexChange,
  onBgIndexChange,
  registerApi
}: ArticlePaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const beatRefs = useRef<(HTMLElement | null)[]>([]);

  /* 滚动位置 → 活跃 beat + 背景锚点 */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const update = () => {
      const mid = el.scrollTop + el.clientHeight * 0.4;
      const bottom = el.scrollTop + el.clientHeight;
      let active = 0;
      let entered = 0;
      for (let i = 0; i < beatRefs.current.length; i += 1) {
        const node = beatRefs.current[i];
        if (!node) continue;
        if (node.offsetTop <= mid) active = i;
        /* 顶部越过视口底缘即视为“已出现”，最新一个作为背景切换基准 */
        if (node.offsetTop <= bottom) entered = i;
      }
      onIndexChange(active);
      onBgIndexChange(entered);
    };
    update();
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [beats, onIndexChange, onBgIndexChange]);

  /* AUTO：缓慢自动滚动 */
  useEffect(() => {
    if (!autoOn) return;
    const el = scrollRef.current;
    if (!el) return;
    const timer = window.setInterval(() => {
      const atEnd = el.scrollTop + el.clientHeight >= el.scrollHeight - 2;
      if (!atEnd) el.scrollTop += 2;
    }, 32);
    return () => window.clearInterval(timer);
  }, [autoOn]);

  useEffect(() => {
    registerApi({
      scrollToEnd: () => {
        const el = scrollRef.current;
        if (el) el.scrollTop = el.scrollHeight;
      },
      scrollToIndex: (index: number) => {
        const el = scrollRef.current;
        const node = beatRefs.current[index];
        if (el && node) {
          el.scrollTop = Math.max(0, node.offsetTop - 96);
        } else if (el) {
          el.scrollTop = 0;
        }
      }
    });
    return () => registerApi(null);
  }, [registerApi]);

  /* 进入 article 模式时定位到当前进度（仅挂载时执行） */
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const node = beatRefs.current[initialIndex];
    el.scrollTop = node ? node.offsetTop - 96 : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div data-ui-block className="vn-ui absolute inset-0 flex flex-col px-[clamp(2rem,6vw,6rem)] pb-16 pt-24">
      {/* 衬底蒙层：与 NVL 视图一致，固定于视口不随正文滚动 */}
      <div className="absolute inset-0" {...maskAttrs('nvl')} style={maskStyle(maskNvl)} aria-hidden="true" />
      <div
        ref={scrollRef}
        id="article-column"
        className="relative w-full flex-1 overflow-y-auto pr-2"
        style={{
          paddingRight: scrollbar === 'gap' ? scrollbarGap : undefined,
          scrollbarWidth: scrollbar === 'none' ? 'none' : undefined
        }}
      >
        <div className="mx-auto px-8 py-10 sm:px-14 sm:py-14" style={{ width: `min(${width}, 100%)` }}>
          <h1 className="break-all text-4xl tracking-[0.2em]">{title}</h1>
          {metaLine && (
            <p className="mt-3 text-[0.8rem] tracking-[0.35em] text-white/55">{metaLine}</p>
          )}
          <div className="my-10 h-px bg-[rgba(226,222,255,0.25)]"></div>
          <div className="text-[1.05rem] leading-8 tracking-[0.06em] text-white/90">
            {
              beats.map((beat, i) => {
                if (beat.type === 'image') {
                  return (
                    <figure key={i} ref={(node) => { beatRefs.current[i] = node; }} className="my-10">
                      <BeatImage beat={beat} />
                      {beat.alt && <figcaption className={CAPTION_CLASS}>{beat.alt}</figcaption>}
                    </figure>
                  );
                }
                if (beat.type === 'code') {
                  return (
                    <div key={i} ref={(node) => { beatRefs.current[i] = node; }} className={CODE_CLASS}
                      dangerouslySetInnerHTML={{ __html: beat.content }}
                    />
                  );
                }
                return (
                  <p
                    key={i}
                    ref={(node) => { beatRefs.current[i] = node; }}
                    className="md-rich mb-6"
                    dangerouslySetInnerHTML={{ __html: beat.content }}
                  />
                );
              })
            }
          </div>
        </div>
      </div>
    </div>
  );
}
