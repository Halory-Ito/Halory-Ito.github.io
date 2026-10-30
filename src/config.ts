/**
 * 全站可定制内容统一配置。
 * 禁止在组件中硬编码这些内容，页面/组件只从这里读取。
 * 各模块以 "===== 模块：名称 =====" 分组，新增可定制内容时按归属就近放置。
 */

/* ===== 模块：站点基础信息（页头、标题界面） ===== */
export const site = {
  name: "Halory",
  description: "我很可爱，请给我钱",
} as const;

/* ===== 模块：图片资源路径 ===== */
export const assets = {
  titleBackground: "/images/title-background/renewal-cg.webp",
  /** 文章无封面时的兜底背景，随机或按序取用 */
  fallbackCovers: [
    "/images/cg/ev1013a.png",
    "/images/cg/ev4005.png",
    "/images/cg/ev5015.png",
    "/images/cg/ev0007.png",
  ],
  layoutBackgrounds: {
    archive: "/images/cg/ev4005.png",
    categories: "/images/cg/ev0007.png",
    tags: "/images/cg/ev5015.png",
    log: "/images/cg/ev1013a.png",
    extra: "/images/cg/ev5015.png",
    vndb: "/images/cg/ev1013a.png",
    bangumi: "/images/cg/ev0007.png",
    about: "/images/cg/ev4005.png",
    title: "/images/title-background/renewal-cg.webp",
  },
} as const;

/* ===== 模块：主题外观（背景、蒙层、卡片外形，值均可直接写入 CSS） ===== */
export const theme = {
  /** 各处面板背景色 */
  panel: "rgba(22, 18, 56, 0.62)" as string,
  topBar: "rgba(15, 12, 34, 0.72)" as string,
  drawer: "rgba(15, 12, 34, 0.82)" as string,
  paper: "rgba(24, 20, 60, 0.4)" as string,
  /** 无边框内容衬底：横向“左-中-右”透明度为高-低-高的渐变（About 页使用） */
  veil: {
    color: "#0f0c22",
    /** 左右边缘的不透明度（高） */
    edgeOpacity: 0.7,
    /** 中间的不透明度（低） */
    centerOpacity: 0.14,
    /** 中心低透明度平台的两端位置（0~1，从左到右） */
    centerSpan: [0.4, 0.6],
  } as const,
  /** 蒙层：颜色 + 不透明度 + 模糊（blur 为 px，0 表示关闭） */
  masks: {
    /** 全屏封面（阅读页背景、文章头图） */
    cover: { color: "#090718", opacity: 0.45, blur: 0 },
    /** 列表 / 文章页背景 */
    page: { color: "#15122d", opacity: 0.6, blur: 0 },
    /** 标题界面背景 */
    title: { color: "#090718", opacity: 0.45, blur: 0 },
    /** NVL 全文视图内衬（ARTICLE 模式共用） */
    nvl: { color: "#0f0c22", opacity: 0.78, blur: 0 },
    /** 内容补底后的全屏锚定蒙层（About 现用 theme.veil，此蒙层保留备用） */
    about: { color: "#090718", opacity: 0.4, blur: 0 },
  },
  /** 元数据 / TOC 侧栏外形（不贴边、自定义高度与圆角） */
  drawerShape: {
    offset: "1rem",
    top: "4rem",
    height: "calc(100dvh - 8rem)",
    borderRadius: "1.25rem",
  },
  /** Image 组件参数（public 目录图片无法自动测尺寸，需显式给定） */
  imageDefaults: {
    /** 背景图的固有尺寸 */
    background: { width: 1920, height: 1080 },
    /** 文章插图的管处理宽度 */
    beatWidth: 1280,
  },
} as const;

/* ===== 模块：全局蒙层调节（右下角悬浮按钮） ===== */
/**
 * 悬浮按钮实时调整全站蒙层的透明度与模糊度：按蒙层类型重新生成一条覆盖样式规则，
 * 只作用于带 data-vn-mask 标记的蒙层，偏好保存在 localStorage。
 * 阅读页封面蒙层有独立的 BG 面板，不会被这里的全局值覆盖。
 */
export const maskControl = {
  /** 持久化键（与阅读页 BG 面板的 vnblog-bg-mask 相互独立） */
  storageKey: "vnblog-global-mask",
  /** 未保存偏好时的滑杆初值（以列表页蒙层为基准） */
  defaults: {
    opacity: theme.masks.page.opacity,
    blur: theme.masks.page.blur ?? 0,
  },
  /** 透明度范围（0~1）与步进 */
  opacityMin: 0,
  opacityMax: 1,
  opacityStep: 0.02,
  /** 模糊范围（px）与步进 */
  blurMin: 0,
  blurMax: 24,
  blurStep: 1,
  /* ===== 按钮与面板文案 ===== */
  labels: {
    open: "蒙层设置",
    title: "蒙层",
    opacity: "透明度",
    blur: "模糊",
    reset: "重置",
  },
} as const;

/* ===== 模块：路由（所有页面链接统一从这里拼接，避免组件硬编码） ===== */
export const routes = {
  read: "/read/",
  article: "/article/",
  archive: "/archive",
  categories: "/categories",
  tags: "/tags",
  extra: "/extra",
  /** Extra 内嵌数据页（VNDB 游玩记录 / Bangumi 追番记录） */
  vndb: "/extra/vndb",
  bangumi: "/extra/bangumi",
  about: "/about",
} as const;

/* ===== 模块：页头导航链接（archive/categories/tags/extra/about 页头共用；品牌位由 site.name 承担） ===== */
export const navLinks = [
  { label: "ARCHIVE", href: routes.archive },
  { label: "CATEGORIES", href: routes.categories },
  { label: "TAGS", href: routes.tags },
  { label: "EXTRA", href: routes.extra },
  { label: "ABOUT", href: routes.about },
] as const;

/* ===== 模块：布局公共 chrome（Layout 级 Header/Footer，标题界面与阅读场景会关闭） ===== */
export const layout = {
  /** header/footer 是否随鼠标移向屏幕边缘自动隐藏（false = 常驻） */
  autoHide: true,
  /** 鼠标靠近顶部该距离内唤出 header（px） */
  topTriggerPx: 64,
  /** 鼠标靠近底部该距离内唤出 footer（px） */
  bottomHideZonePx: 36,
  /** 列表内容容器（archive / categories / tags 及其过滤页）顶部内边距，避让公共 Header 的遮挡 */
  listTopPadding: "8rem",
  /**
   * 页面跳转动画（Astro View Transitions / ClientRouter）：
   * - fade：交叉淡出（新页渐渐浮现、旧页渐渐隐去）
   * - slide：旧页滑出新页滑入
   * - none：关闭过渡动画
   * duration 为单程动画时长（ms，进出共用），easing 为 CSS timing function。
   */
  pageTransition: {
    kind: "fade" as "fade" | "slide" | "none",
    duration: 340,
    easing: "cubic-bezier(0.45, 0, 0.2, 1)",
  },
} as const;

/* ===== 模块：文章视图（article 页专用文案） ===== */
export const article = {
  prevLabel: "上一篇",
  nextLabel: "下一篇",
  advLabel: "ADV MODE",
} as const;

/* ===== 模块：分类与标签（taxonomy 页面） ===== */
export const taxonomy = {
  /** 索引页眉标 */
  categoryEyebrow: "CATEGORIES",
  tagEyebrow: "TAGS",
  /** 过滤页眉标 */
  categoryEyebrowSingular: "CATEGORY",
  tagEyebrowSingular: "TAG",
  /** 文章计数单位 */
  unitArticle: "篇",
} as const;

/* ===== 模块：标题界面菜单 ===== */
/* START 的 href 为 'start' 哨兵值，由标题页解析为最新文章的阅读地址 */
export const titleMenu = [
  { label: "START", href: "start" },
  { label: "ARCHIVE", href: routes.archive },
  { label: "CATEGORIES", href: routes.categories },
  { label: "TAGS", href: routes.tags },
  { label: "EXTRA", href: routes.extra },
  { label: "ABOUT", href: routes.about },
] as const;

/* ===== 模块：阅读器（scene） ===== */
export const reading = {
  /** 打字机速度：每个字的间隔毫秒数 */
  typeSpeedMs: 20,
  /** AUTO 模式：段落打完到自动进入下一段的间隔毫秒数 */
  autoDelayMs: 1500,
  /** 鼠标靠近左右边缘该范围内触发侧栏（px） */
  edgeTriggerPx: 64,
  /** 侧栏宽度（px），与样式保持一致 */
  sideDrawerPx: 320,
  /** 进度切分：单个进度（beat）的最大字数，超过则按句末标点进一步切分（0 表示不切分） */
  beatMaxChars: 30,
  /** 进度切分依据的句末标点 */
  beatDelimiters: ["。", "！", "？", "；", "…"] as string[],
  /** 代码块高亮主题（Astro 内置 shiki 与阅读器共用） */
  codeTheme: "github-dark-default",
  /** 背景蒙层调整（控制条 BG 按键）：读者可实时调节封面蒙层的透明度与模糊，范围/步进与持久化键在此配置 */
  maskPanel: {
    storageKey: "vnblog-bg-mask",
    /** 封面蒙层背景模糊范围（px，min 为 0） */
    blurMin: 0,
    blurMax: 24,
    blurStep: 1,
    /** 封面蒙层透明度范围（0~1） */
    opacityMin: 0,
    opacityMax: 1,
    opacityStep: 0.02,
  },
  /** NVL 全文呈现 */
  nvl: {
    /** 正文列宽（直接写 CSS 尺寸） */
    textWidth: "44rem",
    /** 'none'：隐藏滚动条；'gap'：保留滚动条并在正文与滚动条之间拉开距离 */
    scrollbar: "none" as "none" | "gap",
    /** scrollbar 为 'gap' 时，正文与滚动条之间的距离 */
    scrollbarGap: "2.5rem",
  },
  /** ARTICLE 模式（阅读场景内的第三种呈现） */
  article: {
    /** 正文列宽（直接写 CSS 尺寸） */
    textWidth: "48rem",
    /** 'none'：隐藏滚动条；'gap'：保留滚动条并在正文与滚动条之间拉开距离 */
    scrollbar: "none" as "none" | "gap",
    /** scrollbar 为 'gap' 时，正文与滚动条之间的距离 */
    scrollbarGap: "2.5rem",
  },
  /** 阅读模式存储键（adv / nvl / article 三种） */
  modeStorageKey: "vnblog-mode",
  /** 左侧元数据的字段（label 固定，value 由文章数据填充） */
  metaLabels: {
    author: "作者",
    date: "日期",
    category: "分类",
    tags: "标签",
    words: "字数",
    progress: "进度",
  },
  /** 阅读指示文案（信息/目录/backlog/背景 面板的标签、图片 beat 文字占位、HIDE 按键与背景滑杆标签） */
  hints: {
    info: "INFO",
    toc: "TOC",
    image: "图片",
    backlog: "阅读记录",
    code: "代码块",
    hideLabel: "HIDE",
    bgLabel: "背景",
    blurLabel: "模糊",
    opacityLabel: "透明度",
  },
} as const;

/* ===== 模块：EXTRA 自定义入口分组 ===== */

export const extraGroups = [
  {
    name: "二次元浓度",
    en: "ACGN",
    links: [
      {
        name: "VNDB",
        desc: "我玩游戏",
        url: routes.vndb,
        external: false,
      },
      {
        name: "bangumi",
        desc: "我追番剧",
        url: routes.bangumi,
        external: false,
      },
    ],
  },
] as const;

/* ===== 模块：::github 卡片（Markdown 中 `::github{repo="owner/repo"}` 渲染为仓库卡片） ===== */
export const githubCard = {
  /** 仓库头像外链模板：{owner} 会替换为仓库所有者 */
  avatarTemplate: "https://github.com/{owner}.png",
  /** 跳转地址模板：{repo} 会替换为 "owner/repo" */
  repoUrlTemplate: "https://github.com/{repo}",
  /**
   * 徽章列表（自绘内联 chip：图标 + 数值，样式由 CSS 定义，不依赖任何徽标外链服务）。
   * metric 为要展示的仓库指标，label 用于无障碍命名；留空则不展示徽章、也不再请求指标。
   * 目前默认不展示 stars / forks，需要时把 `{ metric: "stars", label: "GitHub stars" }`
   * 与 `{ metric: "forks", label: "GitHub forks" }` 加回即可。
   */
  badges: [] as readonly { metric: "stars" | "forks"; label: string }[],
  /**
   * 仓库指标取数（构建时拉取 GitHub 官方 API，数值固化到产物）：
   * - apiBase 指向 REST v3；指标字段在此映射（stars→stargazers_count 等）
   * - 每仓库结果带 TTL 缓存，拉取失败时以 countFallback 占位，不会阻断构建
   * - 可选令牌：设置环境变量（默认 GITHUB_TOKEN，repo scope 不需要）后走鉴权请求，提高速率上限
   */
  statsApiBase: "https://api.github.com/repos/{repo}",
  statsMetricFields: {
    stars: "stargazers_count",
    forks: "forks_count",
  } as Record<"stars" | "forks", string>,
  statsApiTokenEnv: "GITHUB_TOKEN",
  statsTimeoutMs: 5000,
  statsTtlMs: 15 * 60 * 1000,
  /** 指标拉取失败时的占位数值文本 */
  countFallback: "—",
  /** 卡片无障碍标签 */
  linkLabel: "GitHub 仓库",
  /** 书写不合法时的提示（隐藏元素展示，fuwari 同款处理） */
  messages: {
    unsupported:
      'Invalid directive. (“github” 需以 :: 前缀独占一段使用：::github{repo="owner/repo"})',
    repoFormat: "Invalid repo. (repo 必须为 “owner/repo” 形式)",
  },
} as const;

/* ===== 模块：VNDB 游玩记录（/extra/vndb 数据页） ===== */
/**
 * 数据由客户端从 VNDB 公共 API（Kana）拉取：只需填自己的用户 ID，无需任何密钥。
 * 页面不会展示私密标签/条目（API 对未鉴权请求本就不返回私密数据），
 * 若希望展示私密列表，请把对应标签在 VNDB 上设为公开。
 */
export const vndb = {
  /** 你的 VNDB 用户 ID（形如 'u12345'，个人资料页链接中的那串）；留空时页面显示配置引导 */
  userId: "u335444",
  /** API 基址（官方 Kana API；本地调试可换 https://beta.vndb.org/api/kana） */
  apiBase: "https://api.vndb.org/kana",
  /** 每页条数（API 上限 100）与最多串页数，两者相乘即为单次展示的条目上限 */
  pageSize: 100,
  maxPages: 3,
  /**
   * 展示哪些标签分组（按数组顺序分块展示，命中前序分组优先归属）。
   * id 为 VNDB 官方标签枚举：1 在玩 / 2 全通 / 3 搁置 / 4 弃坑 / 5 愿望单；
   * 自定义标签需显示时按其真实 id+名称增删即可。
   */
  labels: [
    { id: 1, name: "在玩" },
    { id: 2, name: "全通" },
    { id: 3, name: "搁置" },
    { id: 4, name: "弃坑" },
    { id: 5, name: "愿望单" },
  ] as readonly { id: number; name: string }[],
  /** 优先选用的中文标题语言代码（titles 列表内匹配；匹配不到则回退 alttitle/title） */
  cjkLang: "zh-Hans",
  /** 单个条目的跳转模板（{id} 替换为 vndbid，如 v17） */
  entryUrlTemplate: "https://vndb.org/{id}",
  /** 页脚按钮的跳转地址（仅在未配置 userId、按钮显示时使用） */
  homeUrl: "https://vndb.org",
  /* ===== 分页（网格视图按页切片，客户端即时切换） ===== */
  pagination: {
    /** 每页条目数 */
    perPage: 12,
    /** 分页导航的无障碍名称 */
    navLabel: "游玩记录分页",
    prevLabel: "上一页",
    nextLabel: "下一页",
    /** 页码文案模板：{page} 当前页，{total} 总页数 */
    pageLabel: "{page} / {total}",
  },
  /* ===== 页面文案 ===== */
  eyebrow: "VNDB",
  title: "游玩记录",
  loadingLabel: "读取 VNDB 列表…",
  errorLabel: "列表拉取失败，稍后再试。",
  retryLabel: "重试",
  emptyLabel: "这个标签下还没有公开条目。",
  unconfiguredLabel:
    "尚未配置：在 src/config.ts 的 vndb.userId 填入你的 VNDB 用户 ID（形如 u12345）。",
  outOfRangeLabel: "仅展示最近更新的部分条目，完整列表见 VNDB。",
  /** 页脚按钮文案（仅在未配置 userId 时显示） */
  footerLabel: "前往 VNDB",
} as const;

/* ===== 模块：Bangumi 追番记录（/extra/bangumi 数据页） ===== */
/**
 * 数据由客户端从 Bangumi 官方 API 拉取：只需填用户名或数字 ID（个人主页 bgm.tv/user/xxx 里的那串），
 * 展示公开收藏；标记为“仅自己可见”的条目 API 不会返回。
 * 注意：v0 收藏接口仅接受用户名（数字 ID 会先用 legacy 接口解析为用户名），
 * 且服务器限制 offset ≤ 30，单状态最多约 80 条（超出部分页面会提示前往 Bangumi 查看）。
 */
export const bangumi = {
  /** 你的 Bangumi 用户名或数字 ID；留空时页面显示配置引导 */
  userId: "karaku",
  /** API 基址 */
  apiBase: "https://api.bgm.tv/v0",
  /** 数字 ID → 用户名解析（legacy 用户接口，同时接受两种形态） */
  userLookupTemplate: "https://api.bgm.tv/user/{id}",
  /** 收藏的条目类型（1 书籍 / 2 动画 / 3 音乐 / 4 游戏 / 6 三次元）；追番记录即 2 */
  subjectType: 2,
  /** 展示哪些收藏状态分组（v0 收藏状态枚举） */
  statuses: [
    { code: 3, name: "在看" },
    { code: 2, name: "看过" },
    { code: 4, name: "搁置" },
    { code: 5, name: "抛弃" },
  ] as readonly { code: number; name: string }[],
  /** 每页条数（API 上限 50） */
  perPage: 50,
  /** 单个条目的跳转模板（{id} 替换为 subject id） */
  entryUrlTemplate: "https://bgm.tv/subject/{id}",
  /** 页脚按钮的跳转地址（仅在未配置 userId、按钮显示时使用） */
  homeUrl: "https://bgm.tv",
  /* ===== 分页（网格视图按页切片，客户端即时切换） ===== */
  pagination: {
    /** 每页条目数 */
    perPage: 12,
    /** 分页导航的无障碍名称 */
    navLabel: "追番记录分页",
    prevLabel: "上一页",
    nextLabel: "下一页",
    /** 页码文案模板：{page} 当前页，{total} 总页数 */
    pageLabel: "{page} / {total}",
  },
  /* ===== 页面文案 ===== */
  eyebrow: "BANGUMI",
  title: "bangumi",
  loadingLabel: "读取追番记录…",
  errorLabel: "记录拉取失败，稍后再试。",
  retryLabel: "重试",
  emptyLabel: "这个状态下还没有公开收藏。",
  unconfiguredLabel:
    "尚未配置：在 src/config.ts 的 bangumi.userId 填入你的 Bangumi 用户名或数字 ID。",
  outOfRangeLabel: "仅展示最近的收藏，完整记录见 Bangumi。",
  /** 页脚按钮文案（仅在未配置 userId 时显示） */
  footerLabel: "前往 Bangumi",
} as const;
