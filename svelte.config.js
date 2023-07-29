import adapter from "@sveltejs/adapter-vercel";
import { vitePreprocess } from "@sveltejs/kit/vite";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://kit.svelte.dev/docs/integrations#preprocessors
  // for more information about preprocessors
  preprocess: [vitePreprocess()],
  compilerOptions: {
    customElement: true,
  },
  kit: {
    adapter: adapter(),
    csp: {
      directives: {
        "connect-src": ["self", "vitals.vercel-insights.com"],
      },
    },
  },
};

export default config;

