import{_ as s,c as n,o as t,a3 as e}from"./chunks/framework.BurWKwwG.js";const _=JSON.parse('{"title":"开发者指南","description":"","frontmatter":{},"headers":[],"relativePath":"zh/4_dev.md","filePath":"zh/4_dev.md"}'),l={name:"zh/4_dev.md"};function r(i,a,p,d,c,o){return t(),n("div",null,a[0]||(a[0]=[e(`<h1 id="开发者指南" tabindex="-1">开发者指南 <a class="header-anchor" href="#开发者指南" aria-label="Permalink to “开发者指南”">​</a></h1><p>CBD3 是一个基于 MIT 许可证发布的开源项目。</p><p>本节为想要为 CBD3 做贡献、扩展其功能或使用我们的项目构建应用程序的开发者提供技术信息。</p><h2 id="技术栈" tabindex="-1">技术栈 <a class="header-anchor" href="#技术栈" aria-label="Permalink to “技术栈”">​</a></h2><ul><li><strong>前端</strong>：Vue 3 + Vite + Element Plus + ECharts + Cytoscape.js</li><li><strong>后端</strong>：Node.js + Express 5 + MySQL2</li><li><strong>状态管理</strong>：Pinia</li><li><strong>数据库</strong>：MySQL（12 张核心表，约 3640 万行数据）</li><li><strong>包管理</strong>：pnpm</li><li><strong>文档</strong>：支持 Mermaid 的 VitePress</li></ul><h2 id="项目结构" tabindex="-1">项目结构 <a class="header-anchor" href="#项目结构" aria-label="Permalink to “项目结构”">​</a></h2><div class="language-"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark" style="--shiki-light:#24292e;--shiki-dark:#e1e4e8;--shiki-light-bg:#fff;--shiki-dark-bg:#24292e;" tabindex="0" dir="ltr"><code><span class="line"><span>CBD3-vue/</span></span>
<span class="line"><span>├── CBD-frontend/           # 前端应用</span></span>
<span class="line"><span>│   ├── docs/               # 帮助文档（中英双语）</span></span>
<span class="line"><span>│   ├── src/</span></span>
<span class="line"><span>│   │   ├── components/     # Vue 组件</span></span>
<span class="line"><span>│   │   │   ├── analysis/   # 单细胞分析组件（7 个）</span></span>
<span class="line"><span>│   │   │   ├── clinical/   # 临床分析组件（2 个）</span></span>
<span class="line"><span>│   │   │   ├── common/     # 通用组件</span></span>
<span class="line"><span>│   │   │   └── explore/    # 探索组件（UMAP, Network）</span></span>
<span class="line"><span>│   │   ├── views/          # 页面视图</span></span>
<span class="line"><span>│   │   ├── services/       # API 服务层</span></span>
<span class="line"><span>│   │   ├── stores/         # Pinia 状态管理</span></span>
<span class="line"><span>│   │   ├── utils/          # 工具函数</span></span>
<span class="line"><span>│   │   └── assets/         # 静态资源</span></span>
<span class="line"><span>│   ├── public/</span></span>
<span class="line"><span>│   ├── package.json</span></span>
<span class="line"><span>│   └── vite.config.js</span></span>
<span class="line"><span>└── CBD-backend/            # 后端应用</span></span>
<span class="line"><span>    ├── routes/             # API 路由（analysis.js, clinical.js, scrna.js 等）</span></span>
<span class="line"><span>    ├── utils/              # 工具函数</span></span>
<span class="line"><span>    ├── .env                # 环境变量</span></span>
<span class="line"><span>    ├── server.js           # 入口文件</span></span>
<span class="line"><span>    └── package.json</span></span></code></pre></div><h2 id="数据库表" tabindex="-1">数据库表 <a class="header-anchor" href="#数据库表" aria-label="Permalink to “数据库表”">​</a></h2><table tabindex="0"><thead><tr><th>表名</th><th>说明</th></tr></thead><tbody><tr><td>biomarker_main</td><td>生物标志物主表</td></tr><tr><td>scrna_gene_expr_summary</td><td>单细胞基因表达摘要</td></tr><tr><td>scrna_pseudotime_trajectory</td><td>伪时间轨迹数据</td></tr><tr><td>scrna_pseudotime_gene_expr</td><td>伪时间基因表达数据</td></tr><tr><td>analysis_degs</td><td>差异基因（Original）</td></tr><tr><td>analysis_gene_diff_celltype</td><td>差异基因（By Celltype）</td></tr><tr><td>analysis_gene_diff_TvsN</td><td>差异基因（Tumor vs Normal）</td></tr><tr><td>analysis_kegg</td><td>KEGG 通路富集</td></tr><tr><td>analysis_ridge</td><td>Ridge 排名</td></tr><tr><td>analysis_network_prs</td><td>网络敏感性 PRS</td></tr><tr><td>analysis_roc_tn</td><td>ROC 预测能力（Tumor vs Normal）</td></tr><tr><td>analysis_roc_celltype</td><td>ROC 预测能力（By Celltype）</td></tr><tr><td>analysis_biomk_cellchat</td><td>CellChat 通讯（生物标志物）</td></tr><tr><td>analysis_cellchat</td><td>CellChat 通讯（全量）</td></tr><tr><td>clinical_immune</td><td>免疫浸润</td></tr><tr><td>clinical_survival</td><td>生存数据</td></tr></tbody></table><h2 id="详细信息" tabindex="-1">详细信息 <a class="header-anchor" href="#详细信息" aria-label="Permalink to “详细信息”">​</a></h2><p>更多详细信息，请参考<a href="https://github.com/WhyLIM/CBD-vue" target="_blank" rel="noreferrer">我们的 GitHub 仓库页面</a>。</p>`,11)]))}const g=s(l,[["render",r]]);export{_ as __pageData,g as default};
