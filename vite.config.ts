import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean
  ),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  base: "/",
  build: {
    rollupOptions: {
      output: {
        // Phaser is ~1.5MB minified; split it out so the React/UI shell and the
        // game engine cache independently and the initial parse isn't blocked.
        manualChunks: {
          phaser: ["phaser"],
        },
      },
    },
  },
}));
