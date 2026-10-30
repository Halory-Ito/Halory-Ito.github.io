import { useEffect, useState } from 'react';

interface EdgeZoneOptions {
  edgeTriggerPx: number;
  sideDrawerPx: number;
}

/**
 * 鼠标左右缘唤出元数据卡片 / TOC 卡片（停留其上时保持）。
 * 底部贴边隐藏已由 HIDE（明亮模式）取代；阈值来自 config.reading。
 */
export function useEdgeZones({ edgeTriggerPx, sideDrawerPx }: EdgeZoneOptions) {
  const [metaOpen, setMetaOpen] = useState(false);
  const [tocOpen, setTocOpen] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      const el = e.target as HTMLElement;
      const overMeta = Boolean(el.closest('#meta-drawer'));
      const overToc = Boolean(el.closest('#toc-drawer'));
      const inMetaZone =
        e.clientX <= edgeTriggerPx || (metaOpen && e.clientX <= sideDrawerPx + 8) || overMeta;
      const inTocZone =
        e.clientX >= window.innerWidth - edgeTriggerPx ||
        (tocOpen && e.clientX >= window.innerWidth - sideDrawerPx - 8) ||
        overToc;
      setMetaOpen(inMetaZone);
      setTocOpen(inTocZone);
    };
    window.addEventListener('mousemove', onMouseMove);
    return () => window.removeEventListener('mousemove', onMouseMove);
  }, [edgeTriggerPx, sideDrawerPx, metaOpen, tocOpen]);

  return { metaOpen, tocOpen };
}
