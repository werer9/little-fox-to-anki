/// <reference types="vitest" />

import path from "path";
import react from "@vitejs/plugin-react";
import { resolve } from "node:path";
import { defineConfig, UserConfig } from "vite";
import AutoImport from "unplugin-auto-import/vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export const sharedConfig: UserConfig = {
  assetsInclude: ["**/*.txt"],
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: "public/manifest.json",
          dest: ".",
        },
      ],
    }),
    AutoImport({
      imports: [
        {
          "webextension-polyfill": [["=", "browser"]],
        },
      ],
      dts: resolve("./src/auto-imports.d.ts"),
    }),
  ],
  optimizeDeps: {
    include: ["webextension-polyfill"],
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
};

export default defineConfig({
  ...sharedConfig,
  build: {
    emptyOutDir: false,
    sourcemap: true,
    outDir: "build",
    rollupOptions: {
      external: ["open"],
      input: {
        main: "./index.html",
      },
      output: {
        extend: true,
        entryFileNames: `[name].js`,
        sourcemapExcludeSources: false,
      },
    },
  },
});
