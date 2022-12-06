import { defineConfig } from "windicss/helpers";
import { default as pluginAnimations } from "@windicss/plugin-animations";

export default defineConfig({
  // Entries in the safelist are required for any dynamic classes
  // See https://windicss.org/integrations/svelte.html#safe-list
  safelist: [
    "animate-delay-100",
    "animate-delay-200",
    "animate-delay-300",
    "animate-delay-400",
    "animate-delay-500",
  ],
  plugins: [
    pluginAnimations({
      settings: {
        animatedSpeed: 1000,
        heartBeatSpeed: 1000,
        hingeSpeed: 2000,
        bounceInSpeed: 750,
        bounceOutSpeed: 750,
        animationDelaySpeed: 1000,
      },
    }),
  ],
});
