# VNBlog 原型（HTML）

这个目录是 ADV（视觉小说）风格博客的页面原型，全部使用纯 HTML + CSS + JavaScript 编写。

## 页面一览

| 文件 | 说明 |
| --- | --- |
| `index.html` | 标题界面（START / ARCHIVE / EXTRA / SETTINGS / ABOUT）。使用 `public/images/title-background/renewal-cg.webp` 作为背景 |
| `scene.html` | **ADV / NVL 双模式阅读（核心）**：ADV 为底部对话框逐段推进；NVL 为全屏文本铺开式阅读；右上角可随时切换（记忆在 localStorage）。内容为博客随笔正文（非角色对白）。附加功能：鼠标移到底部边缘隐藏 UI 只留背景、AUTO 自动阅读、鼠标靠近左缘滑出文章元数据、靠近右缘滑出 TOC（可跳转段落）。背景优先用文章图片，无图时用 cg 兜底 |
| `article.html` | **普通文章视图**：常规滚动排版（标题、标签、正文、引用、配图、上下篇），与 ADV/NVL 模式互相切换 |
| `archive.html` | 归档页：时间轴形式展示每篇文章（紧凑条目），点击进入阅读 |
| `backlog.html` | 阅读记录（LOG）：按顺序回顾本次读过的段落，无角色区分 |
| `about.html` | 关于页：项目概念说明，使用 `public/images/cg/ev4005.png` 作为背景 |
| `extra.html` | EXTRA 入口页：开发者自定义内容，网格布局按分组展示（娱乐：bangumi/vndb；学习：bilibili/youtube/csdn/mdn；友链；留言板） |
| `settings.html` | 设置页：文字速度、自动播放、跳过已读、背景音乐（原型静态展示） |

## 资源对应说明

你在 `public/` 中新增的资源在原型中已按以下思路应用：

- `public/images/title-background/renewal-cg.webp`、`hero.webp`：用于主页标题界面
- `public/images/cg/*.png`：用于场景页背景 fallback（当文章中没有图片时使用 cg）、以及场景页立绘占位

在后续迁移到 Astro + React 时的预期逻辑：
- **标题界面**：优先使用 `title-background` 中的图片
- **文章场景页**：如果文章 frontmatter 中有 `cover`/`image`，则使用文章中的图片作为背景；如果没有，则从 `public/images/cg/` 随机或按顺序选一张作为背景

## 预览方式

直接用浏览器打开 `prototype/index.html` 即可开始体验，推荐顺序：`标题 -> 阅读页（ADV/NVL 可切换） -> 阅读记录（LOG） -> 归档`

## 设计要点

- **图层结构**：背景（BG）→ 正文层（对话框 / NVL 文本 / 侧栏）全用 `position: absolute` 堆叠，还原 ADV 的分层感
- **打字机效果**：`setInterval` 逐字渲染，点击时若正在打字则直接显示全段
- **边缘交互**：鼠标移到底部边缘隐藏全部 UI 只留背景；靠近左缘滑出文章元数据，靠近右缘滑出 TOC
- **氛围细节**：半透明面板（不用玻璃/渐变）、克制的字间距与行高
- **全屏适配**：用 `100dvh/100vw`，主要针对 16:9 观感设计

## 后续迁移方向

这些原型将作为 UI 草案迁移到 `Astro + React`：

1. 将 `scene.html` 拆分为 `BackgroundLayer`、`DialogueBox`（ADV）、`NvlView`、`TypewriterText`、`MetaDrawer`、`TocDrawer` 等 React 组件
2. 在 Content Collections 的 blog schema 中加入 `cover?: string` 字段
3. 在阅读页实现背景选择逻辑：`entry.data.cover || getFallbackCg()`，fallback 从 `public/images/cg/` 中选取
4. 将 Markdown 按段落拆分映射到场景脚本，串联 `[...slug].astro` 动态路由；标题按 `##` 层级生成 TOC 索引
5. 主页使用 `title-background` 的图片作为背景；EXTRA 页的分组与卡片由开发者在配置中自定义
