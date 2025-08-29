import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // The 'base' property is not needed for a gh-pages site hosted at the root of a domain.
  // Vite defaults to '/', which is the correct path.
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development'
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
