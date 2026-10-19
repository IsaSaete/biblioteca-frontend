/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    // Los tests con MUI y escritura simulada superan los 5 s por defecto en
    // máquinas cargadas o en CI.
    testTimeout: 15000,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    env: { VITE_API_URL: "http://localhost:3000" },
  },
});
