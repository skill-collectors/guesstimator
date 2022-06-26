import { defineConfig } from "windicss/helpers";
import colors from "windicss/colors";

export default defineConfig({
  shortcuts: {
    btn: "rounded font-semibold p-2",
    "btn-primary": "bg-sky-700 text-sky-50",
    "btn-secondary": "bg-stone-800 text-stone-50",
    "btn-danger": "bg-red-800 text-red-50",
    heading: "font-bold font-sans",
    "h-title": "uppercase text-6xl",
    "h-main": "text-4xl",
    "h-sub": "text-2xl text-gray-700",
    link: "text-sky-600 font-medium",
  },
});
