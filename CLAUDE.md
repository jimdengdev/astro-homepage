# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`astro-koharu` — an Astro 5 static blog theme (ACG/pink-blue aesthetic, inspired by Hexo's Shoka theme), used here as a personal blog. React powers interactive islands; content lives in Astro Content Collections and retains compatibility with legacy Hexo markdown syntax.

Package manager is **pnpm**. Primary content language is Chinese; `en` is a secondary locale.

## Commands

```bash
pnpm dev                # dev server at http://localhost:4321
pnpm build              # production build (static output to dist/)
pnpm preview            # preview the built site
pnpm check              # Astro + TypeScript type check
pnpm lint               # Biome check
pnpm lint:fix           # Biome check --write (run before finishing a task)
pnpm knip               # find unused files/exports/dependencies
pnpm lint-md            # lint markdown in src/content
```

Content asset generation (see "Generated Assets" below):

```bash
pnpm generate:lqips         # LQIP gradient placeholders  -> src/assets/lqips.json
pnpm generate:summaries     # AI summaries (needs .env)   -> src/assets/summaries.json
pnpm generate:similarities  # related-post vectors        -> src/assets/similarities.json
pnpm generate:all           # all three, in order
```

Interactive TUI wrapping the above plus backup/restore/theme-update:

```bash
pnpm koharu                 # menu; also: koharu backup|restore|update|generate|clean|list
```

Local CMS (separate pnpm workspace in `cms/`, needs `pnpm cms:install` once):

```bash
pnpm cms                    # BlockNote-based editor UI
```

There is **no test runner configured**. `tests/` holds `.patch` files used to manually exercise the featured-series feature, not an automated suite. Verify changes with `pnpm check` + `pnpm build`, and by exercising pages in the dev server.

## Configuration Architecture

**`config/site.yaml` is the control plane for the entire site.** It is not merely theming — it drives routing, the build pipeline, and bundle contents. Understand this before changing behavior:

- It is read **twice**, by two different mechanisms:
  1. `astro.config.mjs` reads it with `node:fs` + the `yaml` package at config-evaluation time (before Vite plugins exist).
  2. Application code imports it as a module (`import yamlConfig from '../../config/site.yaml'`) via `@rollup/plugin-yaml`.
- Because of (1), **the markdown plugin pipeline is assembled conditionally from YAML**. Flags under `content:` (`enableShokaContainers`, `enableMath`, `enableEncryptedBlock`, ……) determine which remark/rehype plugins are registered at all. Turning a feature off removes its plugin rather than no-op'ing it.
- `christmas.features.snowfall: false` makes the `conditionalSnowfall` Vite plugin swap `SnowfallCanvas` for a noop, dropping ~879KB of Three.js from the bundle.
- Astro's `i18n` block is only emitted when more than one locale is configured, so single-locale sites generate no `/[lang]/` routes.

**Changes to `config/site.yaml` require a dev-server restart or rebuild** — the config is resolved at build time.

`config/i18n-content.yaml` is the second config file: translations for *content* strings (category names, series labels), distinct from UI strings in `src/i18n/translations/`.

### Markdown plugin ordering

`astro.config.mjs` builds `remarkPlugins` in a deliberate order; preserve it when editing:

1. `remarkShokaPreprocess` **must run first** — it re-parses raw text to resolve GFM/remark conflicts (`+++`, `~sub~`, `{% links %}` YAML) before any AST-level plugin sees the tree.
2. `remarkMath` must precede the ruby/spoiler/effects plugins so `$…$` is already an `inlineMath` node and won't be mangled by text-scanning plugins.
3. `rehypeEncryptedBlock` / `rehypeEncryptedPost` **must be last** — they encrypt fully-rendered children.

`remarkDirective` is intentionally registered in two places (the main pipeline and inside `remarkShokaPreprocess`'s re-parse pipeline) depending on whether the preprocessor re-parses.

## Content System

Posts are Astro Content Collection entries under `src/content/blog/`, schema in `src/content/config.ts`.

- **URL slug** = frontmatter `link` if present, else the transliterated filename (`getPostSlug` in `src/lib/content/locale.ts`). Chinese filenames are transliterated, so setting `link` explicitly is preferable.
- **Categories are data, not directories.** The `categories` frontmatter drives category URLs and breadcrumbs; the on-disk folder is organizational only. Nested categories use array-of-array form: `categories: [[笔记, 前端]]`. Chinese names map to URL slugs through `categoryMap` in `config/site.yaml` — **a category name absent from `categoryMap` will not produce a working URL.**
- **Dates are parsed in the site's configured timezone**, not UTC. `src/content/config.ts` deliberately reinterprets `Date` objects because gray-matter mis-parses `"2025-12-29 21:55:00"` as UTC.
- Per-post feature toggles in frontmatter (`math`, `quiz`, `catalog`, `tocNumbering`, `comments`, `password`, `excludeFromSummary`) layer on top of the global `content:` flags in `site.yaml`. Global off + per-post on still yields off, since the plugin isn't in the pipeline.
- Translations live under `src/content/blog/<locale>/`; locale is detected from the slug prefix. Non-default locales fall back to default-locale posts that lack a translation.

**Featured Series** (`featuredSeries` in `site.yaml`) turn a category into a standalone section at `/<slug>`, rendered by `src/pages/[seriesSlug].astro`. Each `slug` must not collide with `RESERVED_ROUTES` in `src/constants/router.ts`, and `categoryName` must exist in `categoryMap`.

Note: do **not** enable Astro's i18n `fallback` option in `astro.config.mjs` — it breaks the `[seriesSlug].astro` dynamic routes.

### Generated Assets

`src/assets/{lqips,summaries,similarities}.json` are build inputs produced by the `generate:*` scripts and **are committed**. Regenerate after adding posts or images if you want placeholders/summaries/related-posts to cover them; the site builds fine without regenerating (features degrade gracefully).

`.cache/og-data.json` (OG metadata for link embeds) is **intentionally committed** — `.gitignore` ignores `.cache/*` but explicitly un-ignores this file to speed up CI builds. Do not add it back to the ignore list.

## Code Organization

Dependency direction — keep it acyclic:

```plain
pages/ → components/ → hooks/ → lib/ → constants/ → types/
```

Path aliases are defined in `tsconfig.json` (`@/`, `@lib/*`, `@components/*`, `@hooks/*`, `@constants/*`, `@layouts/*`, `@store/*`, `@types/*`). Use them instead of deep relative paths.

`src/pages/` and `src/pages/[lang]/` mirror each other: the `[lang]` variants are thin wrappers using `getLocaleStaticPaths()`, while root pages derive locale from the URL via `getLocaleFromUrl()`. When adding a page, add both.

State is Nanostores (`src/store/`); `useTranslation()` reads the `$locale` store, which syncs on Astro's `astro:page-load` event.

### Astro vs React

`.astro` for layouts, pages, and static content (ships no JS). `.tsx` for interactive islands. Choose client directives by priority: `client:load` (header/nav/search), `client:idle` (tooltips/modals), `client:visible` (footer/comments), `client:only="react"` (skip SSR).

**Never pass large data as props to client components** — props are serialized into the HTML. Pass precomputed derived values (`wordCount`, `readingTime`) rather than post `body`.

### Astro script initialization

Astro's view transitions mean scripts must handle both first load and subsequent navigations:

```typescript
if (document.readyState !== 'loading') init();
document.addEventListener('astro:page-load', init);
document.addEventListener('astro:before-swap', cleanup);
```

### Style

Biome enforces formatting: 128 columns, 2-space indent, single quotes (double in JSX), trailing commas, semicolons, LF. Tailwind class sorting is auto-fixed by the `useSortedClasses` rule and applies to `class`, `className`, and the `clsx`/`cn`/`cva` helpers. Merge Tailwind classes with `cn()` from `src/lib/utils.ts`. UI components follow shadcn/ui + Radix patterns with `cva` for variants.

A Husky pre-commit hook runs `biome check --write` on staged JS/TS/Astro files and `lint-md --fix` on staged markdown.

## Deployment

Build output is static (`dist/`). `astro.config.mjs` sets **no adapter** — the `@astrojs/vercel`, `@astrojs/netlify`, and `@astrojs/node` packages are present as dependencies but unused in the current config. Deployment is push-to-`main` triggering the host's CI. `scripts/deploy-blog.sh "title"` wraps add/commit (`feat: <title>`)/push. Docker + Nginx self-hosting lives in `docker/` (`pnpm docker:up`).

## Repository Notes

- `CODEBUDDY.md` is a long-form style guide for another agent tool. It overlaps with this file and contains some stale details — prefer this file, and treat `CODEBUDDY.md` claims as needing verification.
- `.codebuddy/skills/` contains skill definitions (blog-writer, blog-deploy, infographic-*). The `blog-writer` skill references a `_config.yml` for the category map; **that file does not exist** — category mappings are in `config/site.yaml` under `categoryMap`.
- `config/site.yaml` contains a `dev.localProjectPath` absolute path used by the in-page "edit this post" button; it is machine-specific.
