import { defineConfig } from "windicss/helpers";
import colors from "windicss/colors";

export default defineConfig({
  /* configurations... */
  theme: {
    colors: {
      // TODO https://paletton.com/#uid=72J0S0kchgO5tZw8orWjw99tc1a
      primary: {
        100: "#DCFDD2",
        200: "#97BD8B",
        300: "#507246",
        400: "#213E18",
        500: "#020801",
      },
      secondary1: {
        100: "#D3E7FB",
        200: "#6E7F91",
        300: "#384757",
        400: "#15222F",
        500: "#010306",
      },
      secondary2: {
        100: "#FFEED4",
        200: "#DFC7A4",
        300: "#867153",
        400: "#49371C",
        500: "#090601",
      },
      complement: {
        100: "#FED3D9",
        200: "#D49CA4",
        300: "#7F4F55",
        400: "#451B21",
        500: "#090102",
      },
    },
    extends: {
      fontFamily: {
        sans: ["Graphik", "sans-serif"],
        serif: ["Merriweather", "serif"],
      },
    },
  },
});
