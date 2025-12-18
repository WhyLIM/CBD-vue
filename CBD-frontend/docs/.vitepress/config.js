import { withMermaid } from 'vitepress-plugin-mermaid'
import taskLists from 'markdown-it-task-lists'

export default withMermaid({
  title: 'CBD3 - Colorectal Cancer Biomarker Database',
  description: 'A comprehensive platform for colorectal cancer biomarker analysis',
  base: '/docs/',
  outDir: '../public/docs',

  appearance: false,

  vite: {
    assetsInclude: ['**/*.jpg', '**/*.png', '**/*.gif', '**/*.svg']
  },

  markdown: {
    config: (md) => {
      md.use(taskLists, {
        enabled: true,
        label: true,
        labelAfter: true
      })
    }
  },

  locales: {
    root: {
      label: 'English',
      lang: 'en',
      themeConfig: {
        nav: [
          { text: 'Home', link: '/' },
          { text: 'Overview', link: '/1_overview' },
          { text: 'Data', link: '/2_data' },
          { text: 'Guide', link: '/3_guide' },
          { text: 'Developers', link: '/4_dev' },
          { text: 'Cite', link: '/5_cite' },
          { text: 'Updates', link: '/6_update' }
        ],
        sidebar: [
          {
            text: 'Introduction',
            collapsed: false,
            items: [
              { text: 'Overview', link: '/1_overview' }
            ]
          },
          {
            text: 'Data & Sources',
            collapsed: false,
            items: [
              { text: 'Data Description', link: '/2_data' },
              { text: 'Data Sources', link: '/2.1_sources' },
              { text: 'Data Processing', link: '/2.2_processing' },
              { text: 'Data Access', link: '/2.3_access' },
              { text: 'Data Limitations', link: '/2.4_limitations' }
            ]
          },
          {
            text: 'User Guide',
            collapsed: false,
            items: [
              { text: 'Website Guide', link: '/3_guide' },
              { text: 'Navigation Overview', link: '/3.1_nav' },
              { text: 'Search Functionality', link: '/3.2_search' },
              { text: 'Browse & Analysis', link: '/3.3_browse' },
              { text: 'Data Submission', link: '/3.4_submit' }
            ]
          },
          {
            text: 'Developers',
            collapsed: false,
            items: [
              { text: 'Developer Guide', link: '/4_dev' }
            ]
          },
          {
            text: 'Support',
            collapsed: false,
            items: [
              { text: 'Citation & Support', link: '/5_cite' }
            ]
          },
          {
            text: 'Updates',
            collapsed: false,
            items: [
              { text: 'Update & TODO List', link: '/6_update' }
            ]
          }
        ]
      },
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      link: '/zh/',
      themeConfig: {
        nav: [
          { text: '首页', link: '/zh/' },
          { text: '概述', link: '/zh/1_overview' },
          { text: '数据', link: '/zh/2_data' },
          { text: '指南', link: '/zh/3_guide' },
          { text: '开发者', link: '/zh/4_dev' },
          { text: '引用', link: '/zh/5_cite' },
          { text: '更新', link: '/zh/6_update' }
        ],
        sidebar: [
          {
            text: '简介',
            items: [
              { text: '概述', link: '/zh/1_overview' }
            ]
          },
          {
            text: '数据与来源',
            collapsed: false,
            items: [
              { text: '数据描述', link: '/zh/2_data' },
              { text: '数据来源', link: '/zh/2.1_sources' },
              { text: '数据处理', link: '/zh/2.2_processing' },
              { text: '数据访问', link: '/zh/2.3_access' },
              { text: '数据限制', link: '/zh/2.4_limitations' }
            ]
          },
          {
            text: '用户指南',
            collapsed: false,
            items: [
              { text: '网站指南', link: '/zh/3_guide' },
              { text: '导航概述', link: '/zh/3.1_nav' },
              { text: '搜索功能', link: '/zh/3.2_search' },
              { text: '浏览与分析', link: '/zh/3.3_browse' },
              { text: '数据提交', link: '/zh/3.4_submit' }
            ]
          },
          {
            text: '开发者',
            collapsed: false,
            items: [
              { text: '开发者指南', link: '/zh/4_dev' }
            ]
          },
          {
            text: '支持',
            collapsed: false,
            items: [
              { text: '引用与支持', link: '/zh/5_cite' }
            ]
          },
          {
            text: '更新',
            collapsed: false,
            items: [
              { text: '更新与待办事项', link: '/zh/6_update' }
            ]
          }
        ]
      }
    }
  },

  themeConfig: {
    siteTitle: false,

    // nav: [
    //   { text: 'Home', link: '/' },
    //   { text: 'Overview', link: '/Overview' },
    //   { text: 'Architecture', link: '/Architecture' },
    //   { text: 'Modules', link: '/Modules' },
    //   { text: 'Development', link: '/Development' },
    //   { text: 'FAQ', link: '/FAQ' }
    // ],

    // sidebar: [
    //   {
    //     text: 'Getting Started',
    //     items: [
    //       { text: 'Introduction', link: '/Introduction' },
    //       { text: 'Overview', link: '/Overview' }
    //     ]
    //   },
    //   {
    //     text: 'Architecture',
    //     items: [
    //       { text: 'System Architecture', link: '/Architecture' },
    //       { text: 'UMAP Explorer', link: '/UMAPExplorer' }
    //     ]
    //   },
    //   {
    //     text: 'User Guide',
    //     items: [
    //       { text: 'Biomarkers', link: '/Biomarkers' },
    //       { text: 'Statistics', link: '/Statistics' },
    //       { text: 'Explore & Search', link: '/Explore' },
    //       { text: 'Modules', link: '/Modules' },
    //       { text: 'Download', link: '/Download' },
    //       { text: 'Submission', link: '/Submission' }
    //     ]
    //   },
    //   {
    //     text: 'Development',
    //     items: [
    //       { text: 'Development Guide', link: '/Development' },
    //       { text: 'How to Cite', link: '/Cite' },
    //       { text: 'Updatelog', link: '/Updatelog' }
    //     ]
    //   }
    // ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/WhyLIM/CBD-vue' }
    ],

    search: {
      provider: 'local'
    }
  }
})
