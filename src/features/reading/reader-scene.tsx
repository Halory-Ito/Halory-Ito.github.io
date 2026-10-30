import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react';
import { navigate } from 'astro:transitions/client';
import type { ReaderMode, ReaderSceneProps } from './types';
import { loadMode, nextMode, saveMode, NEXT_MODE_LABEL } from './mode';
import { loadBgMaskPrefs, saveBgMaskPrefs, type BgMaskPrefs } from './bg-mask-prefs';
import { useEdgeZones } from './use-edge-zones';
import { useTypewriter } from './use-typewriter';
import { maskStyle } from '../theme/mask-style';
import AdvDialogue from './components/adv-dialogue';
import NvlView from './components/nvl-view';
import ArticlePane, { type ArticlePaneApi } from './components/article-pane';
import MetaDrawer from './components/meta-drawer';
import TocDrawer from './components/toc-drawer';
import BacklogPanel from './components/backlog-panel';
import BgMaskPanel from './components/bg-mask-panel';
import DialogControls from './components/dialog-controls';

/**
 * 阅读场景编排器：ADV / NVL / ARTICLE 三种呈现共用顶栏与抽屉；交互参数一律来自 props。
 * 背景跟随图片 beat（无图片 beat 时回落到封面）；ADV 对话框只承载文字台词；
 * HIDE（明亮模式）下隐藏全部组件只展示图片，点击场景任意位置解除且不推进进度；
 * BG 面板实时调节封面蒙层的透明度与模糊（跨模式生效并持久化）。
 */
export default function ReaderScene(props: ReaderSceneProps) {
  const {
    title, slug, cover, paragraphs, sections, meta,
    theme, drawerShape, nvlStyle, articleStyle, maskPanel,
    typeSpeedMs, autoDelayMs, edgeTriggerPx, sideDrawerPx,
    modeStorageKey, metaLabels, hints
  } = props;

  const last = paragraphs.length - 1;
  /* 模式先按 SSR 默认值水合，再在客户端读取持久化的设置，避免 hydration mismatch */
  const [mode, setMode] = useState<ReaderMode>('adv');
  const [index, setIndex] = useState(0);
  const [auto, setAuto] = useState(false);
  const [backlogOpen, setBacklogOpen] = useState(false);
  /** 背景（蒙层）调整面板的开关 */
  const [bgPanelOpen, setBgPanelOpen] = useState(false);
  /** 明亮模式：隐藏所有组件（含控制条与抽屉），只展示背景图片 */
  const [bright, setBright] = useState(false);
  /** ARTICLE 模式的背景锚点：以“进入视口底部”的最新 beat 为切换基准 */
  const [articleBgIndex, setArticleBgIndex] = useState(0);
  /** 封面蒙层的可调值：初始取 config（maskCover），水合后读取持久化偏好 */
  const [bgMask, setBgMask] = useState<BgMaskPrefs>(() => ({
    opacity: theme.maskCover.opacity,
    blur: theme.maskCover.blur ?? 0
  }));

  /* 客户端水合后读取上次保存的蒙层调节结果（仅一次） */
  const maskPrefsLoaded = useRef(false);
  useEffect(() => {
    maskPrefsLoaded.current = true;
    setBgMask(loadBgMaskPrefs(maskPanel.storageKey, {
      opacity: theme.maskCover.opacity,
      blur: theme.maskCover.blur ?? 0
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* 用户调节时即时落盘（仅在水合完成后） */
  const handleBgMask = useCallback(
    (patch: Partial<BgMaskPrefs>) => {
      setBgMask((prev) => {
        const next = { ...prev, ...patch };
        if (maskPrefsLoaded.current) saveBgMaskPrefs(maskPanel.storageKey, next);
        return next;
      });
    },
    [maskPanel.storageKey]
  );

  const paneRef = useRef<ArticlePaneApi | null>(null);
  const registerPaneApi = useCallback((api: ArticlePaneApi | null) => {
    paneRef.current = api;
  }, []);

  useEffect(() => {
    setMode(loadMode(modeStorageKey));
  }, [modeStorageKey]);

  const isLast = index >= last;

  /* 鼠标边缘行为：底部隐藏 UI、左右缘唤出卡片（use-edge-zones）；顶栏由 Layout chrome 负责 */
  const { metaOpen, tocOpen } = useEdgeZones({
    edgeTriggerPx,
    sideDrawerPx
  });

  /* 打字机：文本 beat 逐字台词、图片 beat 显示描述（use-typewriter） */
  const { typed, typing, skip } = useTypewriter({ paragraphs, index, typeSpeedMs });

  const advance = useCallback(() => {
    if (typing) {
      skip();
      return;
    }
    if (index < last) setIndex(index + 1);
  }, [typing, skip, index, last]);

  /* ---- AUTO：adv/nvl 下自动推进；article 下由面板自动滚动；明亮模式暂停 ---- */
  useEffect(() => {
    if (!auto || typing || mode === 'article' || bright) return;
    if (isLast) {
      setAuto(false);
      return;
    }
    const timer = window.setTimeout(() => setIndex((i) => i + 1), autoDelayMs);
    return () => window.clearTimeout(timer);
  }, [auto, typing, isLast, autoDelayMs, mode, bright]);

  const toggleAuto = useCallback(() => setAuto((v) => !v), []);
  const toggleMode = useCallback(() => {
    setMode((m) => {
      const next = nextMode(m);
      saveMode(modeStorageKey, next);
      return next;
    });
  }, [modeStorageKey]);

  /* ---- SKIP：article 下滚到末尾，其余模式跳过打字 ---- */
  const handleSkip = useCallback(() => {
    if (mode === 'article' && paneRef.current) {
      paneRef.current.scrollToEnd();
      return;
    }
    skip();
  }, [mode, skip]);

  /* ---- 点击推进：明亮模式首次点击先解除 Hide（本击不再推进）；article 由面板自行滚动；顶栏与抽屉内的控件除外 ---- */
  const handleSceneClick = useCallback(
    (e: ReactMouseEvent) => {
      if (bright) {
        setBright(false);
        return;
      }
      if (mode === 'article') return;
      const el = e.target as HTMLElement;
      if (el.closest('a, button, aside, header')) return;
      advance();
    },
    [advance, mode, bright]
  );

  /* ---- 键盘：空格/回车推进（article 忽略，明亮模式只解除 Hide），Esc 回标题 ---- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        /* 走 View Transitions 的客户端导航，Esc 返回同样有过渡动画 */
        navigate('/');
        return;
      }
      if (bright) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          setBright(false);
        }
        return;
      }
      if (mode === 'article') return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        advance();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [advance, mode, bright]);

  /* ---- 滚轮：ADV/NVL 下在内容区域之外向上滚动 → 打开 backlog（明亮模式/背景面板打开时暂停） ---- */
  useEffect(() => {
    const onWheelUp = (e: WheelEvent) => {
      if (backlogOpen || bright || bgPanelOpen) return;
      if ((mode !== 'adv' && mode !== 'nvl') || e.deltaY >= 0) return;
      const el = e.target as HTMLElement;
      if (el.closest('#adv-dialogue, #nvl-column')) return;
      e.preventDefault();
      setBacklogOpen(true);
    };
    window.addEventListener('wheel', onWheelUp, { passive: false });
    return () => window.removeEventListener('wheel', onWheelUp);
  }, [mode, backlogOpen, bright, bgPanelOpen]);

  /* ---- 背景：ADV/NVL 跟随当前 beat 之前最近的图片 beat；ARTICLE 跟随滚动中进入视口底部的最新图片 beat（“底部出现新图片即切换”）；无图片 beat 时回落到封面 ---- */
  const bg = useMemo(() => {
    const anchor = mode === 'article' ? Math.min(articleBgIndex, last) : index;
    for (let i = Math.min(anchor, last); i >= 0; i -= 1) {
      const beat = paragraphs[i];
      if (beat?.type === 'image') return { src: beat.content, width: beat.width, height: beat.height };
    }
    return { src: cover };
  }, [paragraphs, articleBgIndex, index, cover, last, mode]);

  const progress = `${index + 1} / ${paragraphs.length}`;
  const metaLine = [meta.category, meta.tags, meta.date].filter(Boolean).join(' · ');
  const metaRows = [
    { label: metaLabels.author, value: meta.author },
    { label: metaLabels.date, value: meta.date },
    { label: metaLabels.category, value: meta.category },
    { label: metaLabels.tags, value: meta.tags },
    { label: metaLabels.words, value: meta.words },
    { label: metaLabels.progress, value: progress }
  ];

  return (
    <div
      id={`reader-${slug}`}
      className="reading-fullscreen"
      data-mode={mode}
      onClick={handleSceneClick}
    >
      <div className="pointer-events-none absolute inset-0">
        <img src={bg.src} width={bg.width} height={bg.height} alt="阅读背景" className="h-full w-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            ...maskStyle({ ...theme.maskCover, opacity: bgMask.opacity, blur: bgMask.blur }),
            transition: 'opacity 240ms ease',
            opacity: bright ? 0 : 1
          }}
        />
      </div>

      {mode === 'adv' && !bright && (
        <AdvDialogue
          title={title}
          progress={progress}
          typedText={typed}
          typing={typing}
          panelBg={theme.panel}
          codeHtml={paragraphs[index]?.type === 'code' ? paragraphs[index].content : undefined}
        />
      )}
      {mode === 'nvl' && !bright && (
        <NvlView
          progress={progress}
          doneBeats={paragraphs.slice(0, Math.max(0, index))}
          currentBeat={paragraphs[index]}
          typedText={typed}
          typing={typing}
          theme={theme}
          style={nvlStyle}
        />
      )}
      {mode === 'article' && !bright && (
        <ArticlePane
          title={title}
          metaLine={metaLine}
          beats={paragraphs}
          width={articleStyle.textWidth}
          scrollbar={articleStyle.scrollbar}
          scrollbarGap={articleStyle.scrollbarGap}
          maskNvl={theme.maskNvl}
          autoOn={auto}
          initialIndex={index}
          onIndexChange={setIndex}
          onBgIndexChange={setArticleBgIndex}
          registerApi={registerPaneApi}
        />
      )}

      {/* 功能键常驻视图右缘（明亮模式下整条不渲染，点击场景任意位置解除） */}
      <DialogControls
        nextModeLabel={NEXT_MODE_LABEL[mode]}
        autoOn={auto}
        onToggleMode={toggleMode}
        onToggleAuto={toggleAuto}
        onOpenBacklog={() => setBacklogOpen(true)}
        onSkip={handleSkip}
        bgPanelOpen={bgPanelOpen}
        onToggleBgPanel={() => setBgPanelOpen((v) => !v)}
        bgLabel={hints.bgLabel}
        bright={bright}
        onToggleBright={() => {
          setBacklogOpen(false);
          setBgPanelOpen(false);
          setBright(true);
        }}
        hideLabel={hints.hideLabel}
        variant="float"
      />

      <MetaDrawer
        show={metaOpen && !bright} drawerPx={sideDrawerPx} shape={drawerShape} drawerBg={theme.drawer}
        infoLabel={hints.info} title={title} rows={metaRows}
      />
      <TocDrawer
        show={tocOpen && !bright} drawerPx={sideDrawerPx} shape={drawerShape} drawerBg={theme.drawer} tocLabel={hints.toc}
        sections={sections} currentIndex={index}
        onJump={(i) => {
          if (mode === 'article' && paneRef.current) paneRef.current.scrollToIndex(i);
          else setIndex(i);
        }}
      />
      <BacklogPanel
        open={backlogOpen && !bright}
        title={hints.backlog}
        beats={paragraphs.slice(0, index + 1)}
        imageLabel={hints.image}
        panelBg={theme.drawer}
        panelRadius={drawerShape.borderRadius}
        onClose={() => setBacklogOpen(false)}
      />
      <BgMaskPanel
        open={bgPanelOpen && !bright}
        title={hints.bgLabel}
        labels={{ blur: hints.blurLabel, opacity: hints.opacityLabel }}
        config={maskPanel}
        opacity={bgMask.opacity}
        blur={bgMask.blur}
        panelBg={theme.drawer}
        panelRadius={drawerShape.borderRadius}
        onOpacityChange={(v) => handleBgMask({ opacity: v })}
        onBlurChange={(v) => handleBgMask({ blur: v })}
        onClose={() => setBgPanelOpen(false)}
      />
    </div>
  );
}
