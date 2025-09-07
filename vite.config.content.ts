import { defineConfig } from "vite";
import { resolve } from "node:path";
import { sharedConfig } from "./vite.config";
import packageJson from "./package.json";
import react from "@vitejs/plugin-react";
import { viteStaticCopy } from "vite-plugin-static-copy";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
  ...sharedConfig,
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
  build: {
    emptyOutDir: false,
    sourcemap: true,
    outDir: "build",
    lib: {
      entry: resolve("src/scripts/content.ts"),
      name: packageJson.name,
      formats: ["iife"],
    },
    rollupOptions: {
      external: ["open"],
      output: {
        extend: true,
        entryFileNames: `content/content.js`,
        sourcemapExcludeSources: false,
      },
    },
  },
});
