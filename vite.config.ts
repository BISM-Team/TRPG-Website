/// <reference types="vitest" />
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";
import { SvelteKitPWA } from "@vite-pwa/sveltekit";
import basicSsl from "@vitejs/plugin-basic-ssl";

export default defineConfig({
  plugins: [sveltekit(), SvelteKitPWA(), basicSsl()],
  test: {
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
});
