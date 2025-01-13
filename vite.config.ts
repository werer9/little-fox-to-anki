import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";

// https://vite.dev/config/
export default defineConfig({
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
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    outDir: "build",
    rollupOptions: {
      input: {
        main: "./index.html",
        content: "src/scripts/content.ts",
      },
      output: {
        entryFileNames: `[name].js`,
        sourcemapExcludeSources: false
      },
    },
  },
});
