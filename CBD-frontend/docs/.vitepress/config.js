/*
 * @Author: Mli-TB mli.bio@outlook.com
 * @Date: 2025-08-29 09:18:07
 * @LastEditors: Mli-TB mli.bio@outlook.com
 * @LastEditTime: 2025-11-26 16:23:51
 * @FilePath: \CBD3-vue\CBD-frontend\docs\.vitepress\config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
export default {
  title: 'CBD docs',
  description: 'CBD docs',
  base: '/docs/',
  outDir: '../public/docs',

  appearance: false,

  vite: {
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg']
  },

  markdown: {
    config: async (md) => {
      const taskLists = await import('markdown-it-task-lists')
      md.use(taskLists.default)
    }
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
