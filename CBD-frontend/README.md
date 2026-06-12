# CBD-frontend

CBD3（Colorectal Cancer Biomarker Database 3）前端应用，基于 Vue 3 + Vite 构建，提供结直肠癌生物标志物数据库的完整交互式界面。

## 技术栈

- **Vue 3** + **Vite 7** + **Vue Router** + **Pinia**
- **Element Plus** — UI 组件库
- **ECharts 6** — 图表（火山图、气泡图、热力图、KM 曲线、ROC 曲线等）
- **Cytoscape.js** — PPI 蛋白质互作网络可视化
- **Axios** — HTTP 客户端

## 环境配置

项目根目录 `.env`：

```env
VITE_API_BASE_URL=/api
```

使用相对路径 `/api`，开发时由 Vite proxy（`vite.config.js`）代理到后端，生产时由 Nginx 反向代理，无需区分环境。

## 安装与运行

```bash
pnpm install
pnpm dev          # 开发模式，默认 http://localhost:5173
pnpm build        # 生产构建
pnpm preview      # 预览构建产物
```

## 帮助文档

```bash
pnpm docs:dev     # 本地预览帮助文档
pnpm docs:build   # 构建帮助文档到 dist/
```

文档源码位于 `docs/`（英文）和 `docs/zh/`（中文），基于 VitePress。

## 主要目录

```
src/
├── components/
│   ├── analysis/     # 单细胞分析组件
│   │   ├── DegsVolcano.vue       # 差异基因火山图（3 个选项卡）
│   │   ├── KeggBubble.vue        # KEGG 通路气泡图
│   │   ├── RidgeRanking.vue      # Ridge 排名图
│   │   ├── TrajectoryGallery.vue # 细胞轨迹 + 基因表达散点
│   │   ├── CellChatNetwork.vue   # CellChat 细胞通讯网络
│   │   ├── NetworkSensitivity.vue # PRS 网络敏感性分析
│   │   └── PredictiveAbility.vue  # ROC 预测能力分析
│   ├── clinical/     # 临床分析组件
│   │   ├── SurvivalAnalysis.vue  # KM 生存曲线
│   │   └── ImmuneHeatmap.vue     # 免疫浸润热力图
│   ├── common/       # 通用组件
│   └── explore/      # 探索组件（UMAP、PPI 网络）
├── views/            # 页面视图
├── services/         # API 服务层
│   ├── analysis.js   # 单细胞分析 API
│   ├── clinical.js   # 临床分析 API
│   ├── scrna.js      # UMAP API
│   ├── biomarkers.js # 生物标志物 API
│   └── search.js     # 搜索 API
├── stores/           # Pinia 状态管理
├── utils/
│   └── api.js        # Axios 实例与分页拦截器
└── router/           # 路由配置
```

## 核心交互模式

- **图表全量 + 表格分页**：火山图、热力图、网络图等使用全量数据渲染，对应表格保持分页加载，通过 `Promise.all` 并行请求
- **基因自动补全**：所有基因输入框均使用 `el-autocomplete`，300ms 防抖调用后端搜索 API
- **默认选项**：分析组件默认选中第一个 celltype，避免无选择时加载全量数据
