import adapter from "@sveltejs/adapter-static";
import { resolve } from "path";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";

/** @type {import('@sveltejs/kit').Config} */
const config = {
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: vitePreprocess(),

  kit: {
    adapter: adapter({
      fallback: "index.html",
    }),
    alias: {
      $routes: resolve("./src/routes"),
    },
  },
};

export default config;
