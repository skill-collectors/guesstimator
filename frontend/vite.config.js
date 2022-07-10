import { sveltekit } from "@sveltejs/kit/vite";
import WindiCSS from "vite-plugin-windicss";

/** @type {import('vite').UserConfig} */
const config = {
  plugins: [sveltekit(), WindiCSS()],
  test: {
    globals: true,
    environment: "happy-dom",
    include: ["tests/unit/**/*.test.ts"],
  },
};

export default config;
