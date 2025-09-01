export default {
  title: 'CBD docs',
  description: 'CBD docs',
  base: '/docs/',
  outDir: '../public/docs',

  appearance: false,

  vite: {
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg']
  },

  themeConfig: {
    siteTitle: false,

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Introduction', link: '/Introduction' },
      { text: 'User Guide', link: '/Biomarkers' },
      { text: 'FAQ', link: '/FAQ' }
    ],

    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Introduction', link: '/Introduction' }
        ]
      },
      {
        text: 'User Guide',
        items: [
          { text: 'Biomarkers', link: '/Biomarkers' },
          { text: 'Statistics', link: '/Statistics' },
          { text: 'Explore & Search', link: '/Explore' },
          { text: 'Download', link: '/Download' },
          { text: 'Submission', link: '/Submission' }
        ]
      },
      {
        text: 'Help',
        items: [
          { text: 'FAQ', link: '/FAQ' },
          { text: 'How to Cite', link: '/Cite' },
          { text: 'Updatelog', link: '/Updatelog' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/WhyLIM/CBD-vue' }
    ],

    search: {
      provider: 'local'
    }

  }
}