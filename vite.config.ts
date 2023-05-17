/// <reference types="vitest" />
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { zeroAPI } from "sveltekit-zero-api";

export default defineConfig({
  plugins: [sveltekit(), basicSsl(), zeroAPI({ outputDir: "src/lib" })],
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
