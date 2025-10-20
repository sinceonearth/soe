import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: path.resolve(__dirname, "client"), // ✅ Define Vite's root first

  plugins: [react()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client/src"), // ✅ Frontend src folder
      "@shared": path.resolve(__dirname, "shared"), // ✅ Shared utils/types
      "@assets": path.resolve(__dirname, "attached_assets"), // ✅ Optional global assets
    },
  },

  build: {
    outDir: path.resolve(__dirname, "dist/public"), // ✅ Output for production build
    emptyOutDir: true,
  },

  server: {
    host: "0.0.0.0", // ✅ Allow LAN/mobile access
    port: 5173,
    fs: {
      strict: true,
      deny: ["**/.*"], // 🚫 Prevent serving hidden files
    },
    proxy: {
      "/api": {
        target: "http://localhost:5050", // ✅ Express backend
        changeOrigin: true,
        secure: false,
      },
    },
  },

  logLevel: "info",
});
