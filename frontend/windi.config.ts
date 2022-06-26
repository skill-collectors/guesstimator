import { defineConfig } from "windicss/helpers";
import colors from "windicss/colors";

export default defineConfig({
  shortcuts: {
    "ap-heading": "font-bold uppercase font-sans",
    "ap-button": "rounded-md font-semibold text-stone-50 p-2",
  },
  safelist: [
    colors.stone.toString(),
    colors.sky.toString(),
    colors.green.toString(),
    colors.red.toString(),
  ],
});
