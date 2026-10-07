import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";
import { readFileSync } from "node:fs";

// Header'dagi versiya — package.json'dagi `version` dan.
const APP_VERSION: string = JSON.parse(readFileSync(path.resolve(__dirname, "package.json"), "utf-8")).version;

export default defineConfig({
  plugins: [react()],
  define: {
    __APP_VERSION__: JSON.stringify(APP_VERSION),
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    // 5173 — asosiy qubnix ilovasi; ikkalasi bir vaqtda ishlay olsin.
    port: 5174,
  },
});
