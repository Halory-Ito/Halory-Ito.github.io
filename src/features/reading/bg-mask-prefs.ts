/** 背景蒙层实时偏好：封面蒙层的透明度与模糊（BG 面板调节结果） */
export interface BgMaskPrefs {
  opacity: number;
  blur: number;
}

/** 从 localStorage 校验读取背景蒙层偏好；不可用/缺失/非法时返回 fallback（config.theme.maskCover） */
export function loadBgMaskPrefs(key: string, fallback: BgMaskPrefs): BgMaskPrefs {
  try {
    const saved = window.localStorage.getItem(key);
    if (!saved) return fallback;
    const parsed: unknown = JSON.parse(saved);
    if (parsed && typeof parsed === 'object') {
      const { opacity, blur } = parsed as Record<string, unknown>;
      const opacityOk = typeof opacity === 'number' && Number.isFinite(opacity);
      const blurOk = typeof blur === 'number' && Number.isFinite(blur) && blur >= 0;
      return {
        opacity: opacityOk ? Math.min(1, Math.max(0, opacity)) : fallback.opacity,
        blur: blurOk ? Math.min(100, blur) : fallback.blur
      };
    }
  } catch {
    /* localStorage 不可用时保持默认（config.theme.maskCover） */
  }
  return fallback;
}

/** 持久化背景蒙层偏好（写入失败时静默忽略） */
export function saveBgMaskPrefs(key: string, prefs: BgMaskPrefs): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(prefs));
  } catch {
    /* ignore */
  }
}
