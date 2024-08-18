import { defineConfig } from "vitepress";
import { generateSidebar } from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "The Guesstimator",
  description: "Project documentation",
  base: "/guesstimator",
  lastUpdated: true,
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [{ text: "Home", link: "/" }],
    sidebar: generateSidebar({
      documentRootPath: "/docs",
      hyphenToSpace: true,
      capitalizeFirst: false,
      capitalizeEachWords: false,
      manualSortFileNameByPriority: [
        "tutorials",
        "how-to",
        "context",
        "reference",
      ],
    }),
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/skill-collectors/guesstimator",
      },
    ],
  },
});
