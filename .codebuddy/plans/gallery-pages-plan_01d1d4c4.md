---
name: gallery-pages-plan
overview: 为博客增加相册合集列表页和相册详情页，支持标签过滤、相册封面展示、详情页 Hero 大图和照片网格，并提供灯箱查看。页面风格与首页保持一致，使用 site.yaml 配置相册数据。
design:
  styleKeywords:
    - 二次元
    - 萌系
    - 粉蓝配色
    - 圆角卡片
    - 渐变遮罩
    - 响应式网格
    - 暗色模式
    - 微交互动效
  fontSystem:
    fontFamily: PingFang SC
    heading:
      size: 32px
      weight: 700
    subheading:
      size: 18px
      weight: 500
    body:
      size: 16px
      weight: 400
  colorSystem:
    primary:
      - "#FFC0CB"
      - "#FF85A2"
      - "#87CEEB"
    background:
      - "#F9FAFB"
      - "#FFFFFF"
      - "#111827"
    text:
      - "#1F2937"
      - "#FFFFFF"
      - "#9CA3AF"
    functional:
      - "#3B82F6"
      - "#10B981"
      - "#EF4444"
todos:
  - id: gallery-config
    content: 新增相册配置类型并在 site.yaml 中定义示例相册数据
    status: completed
  - id: gallery-i18n-nav
    content: 新增相册 i18n 翻译键、路由常量与主导航入口
    status: completed
  - id: gallery-list-page
    content: 实现相册列表页与标签过滤组件
    status: completed
    dependencies:
      - gallery-config
      - gallery-i18n-nav
  - id: gallery-detail-page
    content: 实现相册详情页、照片网格与灯箱组件
    status: completed
    dependencies:
      - gallery-config
      - gallery-i18n-nav
  - id: gallery-i18n-routes
    content: 添加英文/日文镜像路由页面
    status: completed
    dependencies:
      - gallery-list-page
      - gallery-detail-page
  - id: gallery-verify
    content: 运行 lint、类型检查与构建验证
    status: completed
    dependencies:
      - gallery-i18n-routes
---

## 产品概述

为 astro-koharu 博客新增一套完整的相册模块，包含相册合集列表页和单相册详情页。列表页展示相册卡片网格、顶部标签过滤栏、页面标题与副标题；详情页展示 Hero 封面、相册元信息、返回入口以及照片网格，并支持点击照片放大查看。

## 核心功能

- **相册列表页** (`/gallery`)：页面标题/副标题、标签过滤（全部 + 各相册标签）、相册卡片网格
- **相册详情页** (`/gallery/:slug`)：Hero 大图、返回列表按钮、标题/描述/日期/地点/照片数/标签、照片网格、图片灯箱
- **配置驱动**：相册数据通过 `config/site.yaml` 的 `gallery` 字段维护
- **多语言路由**：默认中文无前缀，英文/日文走 `/:lang/gallery` 镜像
- **导航入口**：在主导航添加「相册」入口
- **风格一致**：复用首页的卡片、阴影、圆角、粉蓝配色、字体和暗色模式

## 技术栈

- 与项目保持一致：Astro 5 + React 19 + Tailwind CSS 4 + TypeScript
- 配置读取：通过 `@rollup/plugin-yaml` 直接 import `config/site.yaml`
- 状态/交互：React 客户端组件 + nanostores（已有 `useTranslation`）
- 图片：存放在 `public/gallery/`，`/gallery/...` 相对路径引用
- 灯箱：自研轻量 React Lightbox 组件（无需新增第三方依赖）

## 实现方法

1. 在 `src/lib/config/types.ts` 新增 `GalleryConfig`、`GalleryAlbum`、`GalleryPhoto` 类型
2. 在 `config/site.yaml` 新增 `gallery` 配置节点与导航项
3. 在 `src/constants/router.ts` 新增 `Gallery` 路由并加入 `RESERVED_ROUTES`
4. 在 `src/i18n/translations/*.ts` 新增相册相关翻译键
5. 新建 `src/lib/gallery/` 工具模块：加载相册、提取所有标签、按标签过滤
6. 新建 `src/components/gallery/` 组件：

- `AlbumCard.tsx`：相册卡片
- `TagFilter.tsx`：标签过滤栏
- `PhotoGrid.tsx`：照片网格
- `Lightbox.tsx`：图片灯箱
- `AlbumHero.tsx`：详情页 Hero

7. 新建页面：

- `src/pages/gallery.astro`
- `src/pages/gallery/[slug].astro`
- `src/pages/[lang]/gallery.astro`
- `src/pages/[lang]/gallery/[slug].astro`

8. 创建 `public/gallery/` 目录并放置示例照片（复用现有 `/img/cover/` 作为占位图）

## 性能与可维护性

- 相册列表在服务端构建时生成静态页面，标签过滤为客户端交互
- 照片网格使用 `loading="lazy"` 与 `object-cover`
- 灯箱按需加载，仅在用户点击图片时挂载
- 保持组件单一职责，避免大 props 传递
- 所有 Tailwind 类通过 `cn()` 合并，支持暗色模式

## 设计风格

延续 astro-koharu 首页的萌系/二次元/粉蓝配色，相册页面采用与首页一致的视觉语言：

- **列表页**：顶部大标题「相册」+ 副标题，下方是可横向滚动的标签过滤栏，使用 `Badge` 胶囊样式；主体为响应式相册卡片网格，每张卡片为圆角卡片，封面图撑满上半部分，底部叠加渐变遮罩显示标题、描述、日期/地点/照片数，右上角显示「N 张照片」角标
- **详情页**：顶部 Hero 使用相册封面图全宽展示，叠加深色渐变遮罩，左上角放置「返回相册列表」按钮；Hero 底部显示标题、描述、元信息和标签；下方为照片网格，照片等宽不等高或统一高度网格，圆角、hover 微放大
- **交互**：标签过滤有 active 状态高亮；卡片 hover 上浮/阴影加深；照片点击打开灯箱，支持左右切换、关闭按钮、键盘 ESC 退出
- **暗色模式**：所有卡片、Hero 遮罩、标签、灯箱均支持 `dark:` 变体

## Agent Extensions

### SubAgent

- **code-explorer**
- Purpose: 深入探索现有页面（如 friends.astro、index.astro、PostItemCard.astro、Cover.astro）的组件结构、样式类和数据流，确保相册模块与现有架构一致
- Expected outcome: 输出可复用的布局模式、组件拆分建议和 Tailwind 类参考

### Skill

- **Impeccable（前端设计工具集）**
- Purpose: 在实现相册卡片、Hero、灯箱等 UI 时提供高质量的前端设计建议，确保视觉效果与首页一致且不过度设计
- Expected outcome: 提供组件级设计细节、间距、动效和响应式断点建议