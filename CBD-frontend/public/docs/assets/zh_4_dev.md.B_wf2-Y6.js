import{_ as a,c as n,o as e,a3 as p}from"./chunks/framework.BurWKwwG.js";const g=JSON.parse('{"title":"开发者指南","description":"","frontmatter":{},"headers":[],"relativePath":"zh/4_dev.md","filePath":"zh/4_dev.md"}'),l={name:"zh/4_dev.md"};function i(t,s,r,c,o,d){return e(),n("div",null,s[0]||(s[0]=[p(`<h1 id="开发者指南" tabindex="-1">开发者指南 <a class="header-anchor" href="#开发者指南" aria-label="Permalink to “开发者指南”">​</a></h1><p>CBD3是一个基于MIT许可证发布的开源项目。</p><p>本节为想要为CBD3做贡献、扩展其功能或使用我们的项目构建应用程序的开发者提供全面的技术信息。</p><h2 id="技术栈" tabindex="-1">技术栈 <a class="header-anchor" href="#技术栈" aria-label="Permalink to “技术栈”">​</a></h2><ul><li><strong>前端</strong>：Vue 3, Pinia, Element Plus, ECharts</li><li><strong>后端</strong>：Node.js, Express.js, MySQL</li><li><strong>文档</strong>：支持Mermaid的VitePress</li><li><strong>测试</strong>：Vitest, Jest, Supertest</li><li><strong>构建工具</strong>：Vite, ESLint, Prettier</li></ul><h2 id="项目结构概述" tabindex="-1">项目结构概述 <a class="header-anchor" href="#项目结构概述" aria-label="Permalink to “项目结构概述”">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span>CBD3/</span></span>
<span class="line"><span>├── CBD-frontend/           # 前端应用程序</span></span>
<span class="line"><span>│   ├── docs/              # VitePress文档</span></span>
<span class="line"><span>│   ├── src/               # Vue应用程序源代码</span></span>
<span class="line"><span>│   │   ├── components/    # 可重用的Vue组件</span></span>
<span class="line"><span>│   │   ├── views/         # 页面组件</span></span>
<span class="line"><span>│   │   ├── services/      # API服务层</span></span>
<span class="line"><span>│   │   ├── stores/        # Pinia状态存储</span></span>
<span class="line"><span>│   │   ├── utils/         # 工具函数</span></span>
<span class="line"><span>│   │   └── assets/        # 静态资源</span></span>
<span class="line"><span>│   ├── public/            # 公共资源</span></span>
<span class="line"><span>│   ├── package.json       # 依赖项和脚本</span></span>
<span class="line"><span>│   └── vite.config.js     # Vite配置</span></span>
<span class="line"><span>└── CBD-backend/           # 后端应用程序</span></span>
<span class="line"><span>    ├── src/</span></span>
<span class="line"><span>    │   ├── controllers/   # 路由控制器</span></span>
<span class="line"><span>    │   ├── models/        # 数据库模型</span></span>
<span class="line"><span>    │   ├── routes/        # API路由</span></span>
<span class="line"><span>    │   ├── middleware/    # Express中间件</span></span>
<span class="line"><span>    │   ├── services/      # 业务逻辑</span></span>
<span class="line"><span>    │   └── utils/         # 工具函数</span></span>
<span class="line"><span>    ├── config/            # 配置文件</span></span>
<span class="line"><span>    └── package.json       # 依赖项和脚本</span></span></code></pre></div><h2 id="获取帮助" tabindex="-1">获取帮助 <a class="header-anchor" href="#获取帮助" aria-label="Permalink to “获取帮助”">​</a></h2><ul><li><strong>文档</strong>：检查相关文档部分</li><li><strong>GitHub Issues</strong>：在创建新问题前搜索现有问题</li></ul><h2 id="详细信息" tabindex="-1">详细信息 <a class="header-anchor" href="#详细信息" aria-label="Permalink to “详细信息”">​</a></h2><p>更多详细信息，请参考<a href="https://github.com/WhyLIM/CBD-vue" target="_blank" rel="noreferrer">我们的Github仓库页面</a>。</p>`,11)]))}const u=a(l,[["render",i]]);export{g as __pageData,u as default};
