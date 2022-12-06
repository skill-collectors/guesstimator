import { defineConfig } from "windicss/helpers";
import { default as pluginAnimations } from "@windicss/plugin-animations";

export default defineConfig({
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
