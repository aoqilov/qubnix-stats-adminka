/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend manzili — hozircha ishlatilmaydi, barcha so'rovlar mock (api-config/mock.ts). */
  readonly VITE_API_URL?: string;
}

/** package.json `version` — vite.config.ts `define` orqali build vaqtida qo'yiladi. */
declare const __APP_VERSION__: string;

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
