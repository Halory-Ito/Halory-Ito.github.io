import type { ReaderMode } from './types';

/** 三种阅读模式的切换循环：adv → nvl → article → adv */
export const MODE_ORDER: ReaderMode[] = ['adv', 'nvl', 'article'];

/** 模式按钮上显示的“下一个模式”名称 */
export const NEXT_MODE_LABEL: Record<ReaderMode, string> = {
  adv: 'NVL',
  nvl: 'ARTICLE',
  article: 'ADV'
};

export function nextMode(m: ReaderMode): ReaderMode {
  return MODE_ORDER[(MODE_ORDER.indexOf(m) + 1) % MODE_ORDER.length];
}

/** 从 localStorage 校验并读取持久化的阅读模式；不可用时返回默认 adv */
export function loadMode(key: string): ReaderMode {
  try {
    const saved = window.localStorage.getItem(key);
    if (saved === 'adv' || saved === 'nvl' || saved === 'article') return saved;
  } catch {
    /* localStorage 不可用时保持默认 */
  }
  return 'adv';
}

/** 持久化阅读模式 */
export function saveMode(key: string, mode: ReaderMode): void {
  try {
    window.localStorage.setItem(key, mode);
  } catch {
    /* ignore */
  }
}
