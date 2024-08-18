import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "The Guesstimator",
  description: "Project documentation",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' }
    ],
    sidebar: [
      {
        text: 'Sections',
        items: [
          { text: 'How-to', link: '/how-to' },
          { text: 'Context', link: '/context' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/skill-collectors/guesstimator' }
    ]
  }
})
