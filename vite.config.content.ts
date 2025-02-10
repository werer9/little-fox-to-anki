import { defineConfig } from "vite";
import { resolve } from "node:path";
import { sharedConfig } from "./vite.config";
import packageJson from "./package.json";

export default defineConfig({
  ...sharedConfig,
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
