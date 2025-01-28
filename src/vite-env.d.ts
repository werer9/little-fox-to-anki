/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly CREATE_APKG_ENABLED: boolean;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
