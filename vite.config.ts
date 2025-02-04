/// <reference types="vitest" />

import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
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
  ],
  test: {
    globals: true,
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    outDir: "build",
    rollupOptions: {
      external: ["open"],
      input: {
        main: "./index.html",
        content: "src/scripts/content.ts",
      },
      output: {
        chunkFileNames: `[name].js`,
        entryFileNames: `[name].js`,
        sourcemapExcludeSources: false,
      },
    },
  },
});
