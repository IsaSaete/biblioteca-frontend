/// <reference types="vitest/config" />
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react()],
    server: {
      // Igual que en Netlify: la API se sirve bajo /api del mismo origen.
      proxy: {
        "/api": {
          target: env.API_PROXY_TARGET || "http://localhost:4000",
          changeOrigin: true,
          rewrite: (path: string) => path.replace(/^\/api/, ""),
        },
      },
    },
    test: {
      globals: true,
      // Los tests con MUI y escritura simulada superan los 5 s por defecto en
      // máquinas cargadas o en CI.
      testTimeout: 15000,
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      env: { VITE_API_URL: "http://localhost:3000" },
    },
  };
});
