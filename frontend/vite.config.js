import { sveltekit } from "@sveltejs/kit/vite";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit()],
  preview: {
    host: "localhost",
    port: 3001, // Don't conflict with dev server, if running
  },
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.ts"],
  },
};

export default config;
