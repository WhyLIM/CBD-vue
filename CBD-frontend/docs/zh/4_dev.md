# 开发者指南

CBD3 是一个基于 MIT 许可证发布的开源项目。

本节为想要为 CBD3 做贡献、扩展其功能或使用我们的项目构建应用程序的开发者提供技术信息。

## 技术栈

- **前端**：Vue 3 + Vite + Element Plus + ECharts + Cytoscape.js
- **后端**：Node.js + Express 5 + MySQL2
- **状态管理**：Pinia
- **数据库**：MySQL（12 张核心表，约 3640 万行数据）
- **包管理**：pnpm
- **文档**：支持 Mermaid 的 VitePress

## 项目结构

```
CBD3-vue/
├── CBD-frontend/           # 前端应用
│   ├── docs/               # 帮助文档（中英双语）
│   ├── src/
│   │   ├── components/     # Vue 组件
│   │   │   ├── analysis/   # 单细胞分析组件（7 个）
│   │   │   ├── clinical/   # 临床分析组件（2 个）
│   │   │   ├── common/     # 通用组件
│   │   │   └── explore/    # 探索组件（UMAP, Network）
│   │   ├── views/          # 页面视图
│   │   ├── services/       # API 服务层
│   │   ├── stores/         # Pinia 状态管理
│   │   ├── utils/          # 工具函数
│   │   └── assets/         # 静态资源
│   ├── public/
│   ├── package.json
│   └── vite.config.js
└── CBD-backend/            # 后端应用
    ├── routes/             # API 路由（analysis.js, clinical.js, scrna.js 等）
    ├── utils/              # 工具函数
    ├── .env                # 环境变量
    ├── server.js           # 入口文件
    └── package.json
```

## 数据库表

| 表名 | 说明 |
|------|------|
| biomarker_main | 生物标志物主表 |
| scrna_gene_expr_summary | 单细胞基因表达摘要 |
| scrna_pseudotime_trajectory | 伪时间轨迹数据 |
| scrna_pseudotime_gene_expr | 伪时间基因表达数据 |
| analysis_degs | 差异基因（Original） |
| analysis_gene_diff_celltype | 差异基因（By Celltype） |
| analysis_gene_diff_TvsN | 差异基因（Tumor vs Normal） |
| analysis_kegg | KEGG 通路富集 |
| analysis_ridge | Ridge 排名 |
| analysis_network_prs | 网络敏感性 PRS |
| analysis_roc_tn | ROC 预测能力（Tumor vs Normal） |
| analysis_roc_celltype | ROC 预测能力（By Celltype） |
| analysis_biomk_cellchat | CellChat 通讯（生物标志物） |
| analysis_cellchat | CellChat 通讯（全量） |
| clinical_immune | 免疫浸润 |
| clinical_survival | 生存数据 |

## 详细信息

更多详细信息，请参考[我们的 GitHub 仓库页面](https://github.com/WhyLIM/CBD-vue)。
