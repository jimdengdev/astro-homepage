/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
/// <reference types="vite-plugin-svgr/client" />

// Memos API configuration
interface ImportMetaEnv {
  readonly PUBLIC_MEMOS_URL?: string;
  readonly PUBLIC_MEMOS_TOKEN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
