import { sharedConfig } from "./vite.config";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import AutoImport from "unplugin-auto-import/vite";
import { resolve } from "node:path";
import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  ...sharedConfig,
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      include: ["**/src"],
      exclude: ["**/src/components/ui/**"],
    },
  },
  build: {
    minify: false,
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
