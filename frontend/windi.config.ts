import { defineConfig } from "windicss/helpers";
import colors from "windicss/colors";

export default defineConfig({
  shortcuts: {
    "btn-primary": "bg-sky-700 text-sky-50",
    "btn-secondary": "bg-stone-800 text-stone-50",
    "btn-danger": "bg-red-800 text-red-50",
  },
  safelist: [
    colors.stone.toString(),
    colors.sky.toString(),
    colors.green.toString(),
    colors.red.toString(),
  ],
});
