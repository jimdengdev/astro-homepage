---
name: 集成 Memos 日记功能
overview: 在博客中新增一个独立的「日记」页面，通过 Memos API 获取笔记内容，左侧展示日历，右侧展示对应日期的笔记。支持通过日历日期定位笔记、切换月份、显示最近记录列表。
design:
  architecture:
    framework: react
    component: shadcn
  styleKeywords:
    - Minimalism
    - Clean
    - Light Blue
    - White Space
    - Card-based
    - Elegant
  fontSystem:
    fontFamily: 寒蝉全圆体
    heading:
      size: 24px
      weight: 700
    subheading:
      size: 18px
      weight: 500
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#29b6f6"
      - "#4fc3f7"
      - "#0288d1"
    background:
      - "#f0f9ff"
      - "#ffffff"
      - "#0f172a"
    text:
      - "#1e293b"
      - "#64748b"
      - "#ffffff"
    functional:
      - "#29b6f6"
      - "#94a3b8"
      - "#ef4444"
todos:
  - id: setup-memos-module
    content: 创建 Memos API 模块（types + api + index）在 src/lib/memos/
    status: pending
  - id: setup-memos-hook
    content: 创建 useMemosData React hook 在 src/hooks/
    status: pending
    dependencies:
      - setup-memos-module
  - id: setup-memos-components
    content: 创建 Memos 日记 UI 组件（MemosDiary + CalendarPanel + DiaryContent）在 src/components/memos/
    status: pending
    dependencies:
      - setup-memos-hook
  - id: create-diary-page
    content: 创建日记页面 diary.astro 和多语言路由 [lang]/diary.astro
    status: pending
    dependencies:
      - setup-memos-components
  - id: update-config
    content: 更新配置：site.yaml 添加 memos 配置节、router.ts 添加 diary 到保留路由、env.d.ts 添加环境变量类型
    status: pending
    dependencies:
      - create-diary-page
  - id: add-i18n
    content: 添加 i18n 翻译键到 zh.ts / en.ts / ja.ts
    status: pending
    dependencies:
      - update-config
  - id: lint-build-verify
    content: 运行 pnpm lint:fix 和 pnpm build 验证
    status: pending
    dependencies:
      - add-i18n
---

## Product Overview

在博客中新增一个独立的「日记」页面，集成 Memos 日记服务。页面采用左右分栏布局：左侧为日历组件（支持月份切换、日期选择、今天快捷按钮），右侧为笔记内容展示区域（大卡片留白风格）。用户可通过点击日历日期定位到对应创建时间的笔记。Memos API 通过环境变量配置访问。

## Core Features

- 独立日记页面路由 `/diary`
- 左侧日历组件：月份导航、星期标题、日期网格、当前日期高亮、选中日期蓝色高亮
- 左侧下方最近记录列表：显示最近几条笔记的日期和摘要
- 右侧笔记内容展示：大卡片区域，顶部显示日期和标题，下方展示笔记内容，支持 Markdown 渲染
- 无笔记日期显示默认「留白」提示文案
- 日历日期与笔记数据联动：点击日期切换右侧内容
- 导航菜单自动注入（参考 Bangumi 模式）
- 页面配置支持在 `site.yaml` 中启用/禁用
- Memos API Token 通过环境变量 `MEMOS_TOKEN` 配置

## Tech Stack

- **Framework**: Astro 5.x + React (与现有项目一致)
- **Styling**: Tailwind CSS + shadcn/ui 设计规范
- **Date handling**: date-fns (项目已有依赖)
- **State**: React useState/useCallback (客户端数据获取)
- **HTTP**: 原生 fetch API
- **Markdown rendering**: 复用项目现有 CustomContent 或 markdown 渲染能力

## Implementation Approach

参考现有 Bangumi 第三方 API 集成模式（`src/lib/bangumi/` + `src/hooks/useBangumiData.ts` + `src/components/bangumi/`），采用相同的模块分层结构：

1. **API Layer** (`src/lib/memos/`): 封装 Memos API 调用，提供 `fetchMemos()` 纯函数
2. **Data Hook** (`src/hooks/useMemosData.ts`): React hook 封装数据获取、加载状态、错误处理
3. **UI Components** (`src/components/memos/`): 日历组件 + 日记内容展示组件
4. **Page** (`src/pages/diary.astro`): Astro 页面文件，使用 TwoColumnLayout 布局
5. **Config** (`config/site.yaml`): 新增 `memos` 配置节，支持启用/禁用和自定义导航

### Key Technical Decisions

- **客户端数据获取**: Memos API 是外部服务，在客户端通过 React 组件获取数据（参考 BangumiCollection 的 `client:load` 模式），避免构建时依赖外部 API
- **日历组件自实现**: 使用 date-fns 的 `getWeeksInMonth`、`startOfMonth`、`endOfMonth` 等函数构建日历网格，不引入额外依赖
- **Memos API 版本**: 使用 Memos v0.22+ 的 OpenAPI 格式（`GET /api/v1/memos` 带 `filter` 参数按日期范围查询）
- **环境变量**: 使用 `import.meta.env.PUBLIC_MEMOS_TOKEN` 和 `import.meta.env.PUBLIC_MEMOS_HOST`（PUBLIC_ 前缀确保客户端可访问），同时支持 `site.yaml` 中的 fallback 配置
- **错误处理**: API 失败时显示友好错误提示和重试按钮，参考 Bangumi 的 error/retry 模式

### Performance Considerations

- 日历数据计算使用 `useMemo` 缓存
- Memos 数据获取一次加载全部（Memos 通常数据量不大），按日期分组后客户端过滤
- 使用 `client:load` 而非 `client:only` 以支持渐进增强

## Architecture Design

```plain
src/pages/diary.astro          # 页面入口
  └─ TwoColumnLayout
      ├─ Cover (slot="cover")
      ├─ HomeSider (slot="sider")
      └─ MemosDiary (client:load)
          ├─ CalendarPanel      # 左侧日历
          │   ├─ CalendarHeader (月份切换 + 今天按钮)
          │   ├─ CalendarGrid   (星期标题 + 日期网格)
          │   └─ RecentList     (最近记录)
          └─ DiaryContent       # 右侧笔记内容
              ├─ ContentHeader  (日期 + 标题)
              └─ ContentBody    (笔记正文 / 留白提示)

src/lib/memos/
  ├─ api.ts                    # Memos API 客户端
  ├─ types.ts                  # Memos 数据类型
  └─ index.ts                  # Barrel export

src/hooks/useMemosData.ts      # 数据获取 hook

src/components/memos/
  ├─ MemosDiary.tsx            # 主容器组件
  ├─ CalendarPanel.tsx         # 日历面板
  ├─ DiaryContent.tsx            # 内容展示
  └─ index.ts                  # Barrel export
```

## Directory Structure

```plain
project-root/
├── src/
│   ├── lib/memos/
│   │   ├── api.ts              # [NEW] Memos API 客户端，fetchMemos 函数
│   │   ├── types.ts            # [NEW] MemosMemo, MemosListResponse 类型定义
│   │   └── index.ts            # [NEW] Barrel export
│   ├── hooks/
│   │   └── useMemosData.ts     # [NEW] React hook 封装数据获取
│   ├── components/memos/
│   │   ├── MemosDiary.tsx      # [NEW] 主容器，管理 calendarSelectedDate 状态
│   │   ├── CalendarPanel.tsx   # [NEW] 日历面板（月份切换 + 日期网格 + 最近记录）
│   │   ├── DiaryContent.tsx    # [NEW] 右侧笔记内容展示
│   │   └── index.ts            # [NEW] Barrel export
│   ├── pages/
│   │   ├── diary.astro         # [NEW] 日记页面
│   │   └── [lang]/diary.astro  # [NEW] 多语言路由包装器
│   ├── constants/
│   │   └── router.ts           # [MODIFY] RESERVED_ROUTES 添加 'diary'
│   └── i18n/translations/
│       ├── zh.ts               # [MODIFY] 添加 diary.* 翻译键
│       ├── en.ts               # [MODIFY] 添加 diary.* 翻译键
│       └── ja.ts               # [MODIFY] 添加 diary.* 翻译键
├── config/
│   └── site.yaml               # [MODIFY] 添加 memos 配置节
├── .env.example                # [MODIFY] 添加 MEMOS_HOST, MEMOS_TOKEN
└── src/env.d.ts                # [MODIFY] 添加环境变量类型声明
```

## Key Code Structures

```typescript
// src/lib/memos/types.ts
export interface MemosMemo {
  id: number;
  name: string;
  content: string;
  createTime: string; // ISO 8601
  updateTime: string;
  visibility: string;
}

export interface MemosListResponse {
  memos: MemosMemo[];
  nextPageToken?: string;
}

// src/lib/memos/api.ts
export async function fetchMemos(host: string, token: string): Promise<MemosMemo[]> {
  const url = new URL(`${host}/api/v1/memos`);
  url.searchParams.set('pageSize', '100');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Memos API error: ${res.status}`);
  const data: MemosListResponse = await res.json();
  return data.memos;
}
```

```typescript
// src/hooks/useMemosData.ts
interface UseMemosDataReturn {
  memos: MemosMemo[];
  isLoading: boolean;
  error: string | null;
  retry: () => void;
}
export function useMemosData(host: string, token: string): UseMemosDataReturn;
```

```typescript
// src/components/memos/MemosDiary.tsx
interface MemosDiaryProps {
  host: string;
  token: string;
}
export function MemosDiary({ host, token }: MemosDiaryProps);
```

## Design Style

采用「留白日记」风格，与博客整体浅蓝色调保持一致。参考图片中的设计：

- 整体浅灰色背景（`bg-gray-50` / `dark:bg-gray-900`）
- 左侧日历卡片：白色圆角卡片，轻微阴影，蓝色选中态
- 右侧内容区域：大面积白色留白卡片，顶部细线分隔标题和日期
- 无笔记时的空状态：优雅的斜体灰色提示文字，营造「留白」意境
- 底部装饰：手写签名 SVG 装饰元素

## Page Planning

### Diary Page (单页面)

1. **Cover 区域**: 使用博客统一的 Cover 组件，标题「日记」
2. **主内容区**: 左右分栏布局（左侧 320px 固定，右侧自适应）

- **左侧 CalendarPanel**:
    - 日历头部：左右箭头切换月份 + 「今天」按钮 + 年月显示
    - 日历网格：日一二三四五六标题行 + 6x7 日期网格，当前月日期深色，非当前月日期浅灰
    - 有笔记的日期显示蓝色小圆点指示器
    - 选中日期蓝色背景高亮
    - 最近记录列表：显示最近 5 条笔记的日期和摘要（`05/08 - 无题` 格式）
- **右侧 DiaryContent**:
    - 内容头部：左侧大标题（笔记标题或「留白」），右侧日期 + 天气图标
    - 分隔线：细蓝色渐变线
    - 内容正文：Markdown 渲染的笔记内容，或空状态提示文案
    - 底部装饰：手写签名 SVG（右下角）

3. **响应式**: 移动端改为上下布局（日历在上，内容在下）

## Font System

使用项目默认字体（寒蝉全圆体），笔记内容正文使用稍大字号（16px）增强阅读体验。

## Color System

与博客浅蓝色主题一致：

- 选中日期背景：`#29b6f6`（primary）
- 有笔记日期指示点：`#4fc3f7`
- 分隔线：蓝色渐变
- 空状态文字：灰色斜体
- 卡片背景：白色（light）/ 深色（dark）

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 在实现过程中搜索项目中的类似模式（如 Bangumi 集成、日历相关代码、Markdown 渲染组件），确保代码风格一致
- Expected outcome: 提供相关代码片段和文件路径作为实现参考

### Skill

- **Impeccable（前端设计工具集）**
- Purpose: 在实现日历组件和日记内容展示 UI 时，提供高质量的前端设计指导和代码优化建议
- Expected outcome: 确保日历和日记卡片的 UI 设计精美、交互流畅，符合现代 web 设计最佳实践