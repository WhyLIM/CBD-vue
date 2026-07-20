# CBD3 - 结直肠癌生物标志物数据库

## 🎯 项目概述

CBD3 (Colorectal Cancer Biomarker Database 3) 是一个面向结直肠癌研究的综合数据分析平台，集成了生物标志物浏览、单细胞 RNA-seq 可视化分析、蛋白质互作网络、临床数据分析和高级搜索功能。

## ✨ 主要功能

| 模块 | 功能说明 |
|------|---------|
| **Biomarker Browser** | 生物标志物浏览、搜索、详情展示 |
| **Gene Expression Atlas** | UMAP 单细胞基因表达可视化，支持多数据集、多细胞类型、基因叠加着色 |
| **Protein Interaction** | PPI 蛋白质互作网络（Cytoscape.js） |
| **DEGs** | 差异基因火山图（全量数据渲染），支持 Original / By Celltype / Tumor vs Normal 三种模式 |
| **KEGG Pathway** | KEGG 通路富集气泡图 |
| **Ridge Ranking** | 基因 Ridge 排名图 |
| **Trajectory** | 细胞轨迹分析 + 交互式伪时间分析 |
| **CellChat** | 细胞通讯网络（全量数据），支持 All Interactions / Biomarker as Ligand / Receptor |
| **Network Sensitivity** | PRS 网络敏感性分析 |
| **Predictive Ability** | ROC 预测能力分析（Tumor vs Normal / By Celltype） |
| **Clinical: Survival** | KM 生存曲线分析，支持基因与临床参数筛选 |
| **Clinical: Immune** | 免疫浸润热力图（全量数据渲染） |
| **Advanced Search** | 多条件高级搜索，支持保存/加载搜索条件 |
| **Download / Submit** | 数据下载（CSV/JSON）与在线数据提交 |

## 🛠️ 技术栈

### 前端
- **Vue 3** + **Vite 7** + **Vue Router** + **Pinia**
- **Element Plus** - UI 组件库
- **ECharts 6** - 图表（火山图、气泡图、热力图、KM 曲线等）
- **Cytoscape.js** - PPI 网络可视化
- **Axios** - HTTP 客户端

### 后端
- **Node.js** + **Express 5**
- **MySQL2** - 数据库驱动（连接池）
- **Helmet / CORS / express-rate-limit** - 安全中间件
- **xlsx / multer** - 数据导入导出
- **Python 3.10+**（通过 `child_process.spawn` 调用）- PRS 网络敏感性即时计算
  - 依赖：`prody` / `pandas` / `networkx` / `tqdm`（详见 `CBD-backend/vendor/enm_package/requirements.txt`）

### 开发工具
- **pnpm** - 包管理器
- **ESLint + Prettier** - 代码规范
- **VitePress** - 帮助文档
- **Nodemon** - 后端热重载

## 📁 项目结构

```
CBD3-vue/
├── CBD-frontend/                # 前端应用
│   ├── docs/                    # VitePress 帮助文档（中英双语）
│   ├── src/
│   │   ├── components/
│   │   │   ├── analysis/        # 单细胞分析组件（7 个）
│   │   │   ├── clinical/        # 临床分析组件（2 个）
│   │   │   ├── common/          # 通用组件
│   │   │   └── explore/         # 探索组件（UMAP, Network）
│   │   ├── views/               # 页面视图
│   │   ├── services/            # API 服务层
│   │   ├── stores/              # Pinia 状态管理
│   │   ├── utils/               # 工具函数
│   │   └── router/              # 路由配置
│   ├── public/
│   ├── .env                     # 环境变量
│   └── vite.config.js
└── CBD-backend/                 # 后端应用
    ├── routes/                  # API 路由
    │   ├── analysis.js          # 单细胞分析 API
    │   ├── clinical.js          # 临床分析 API
    │   ├── scrna.js             # 单细胞 UMAP API
    │   ├── biomarkers.js        # 生物标志物 API
    │   ├── search.js            # 搜索 API
    │   ├── explore.js           # PPI 网络 API
    │   ├── network.js           # Network Sensitivity API（PRS 计算 + STRING 子网络）
    │   ├── string.js            # STRING-DB 代理
    │   ├── download.js          # 下载 API
    │   ├── submission.js        # 提交 API
    │   └── stats.js             # 统计 API
    ├── scripts/                 # 数据/计算脚本
    │   ├── prs_compute.py       # PRS 即时计算入口（由 Node spawn 调用）
    │   ├── build_string_index.js# 生成 STRING 邻接索引
    │   ├── rebuild_db_prs.js    # 重建预计算 PRS 数据库
    │   └── import_db_prs.js     # 数据导入
    ├── src/
    │   └── stringIndex.js       # STRING 邻接索引懒加载模块
    ├── data/                    # 运行时数据文件（生产部署必须上传）
    │   ├── string_index.json    # STRING 邻接表（~13MB，可由 build_string_index.js 重建）
    │   └── db_prs_rebuild.csv   # 预计算 PRS 数据库
    ├── vendor/
    │   └── enm_package/         # 第三方 Python 包（PRS 计算核心）
    ├── config/
    │   └── database.js          # MySQL 连接池
    ├── utils/                   # 工具函数
    ├── server.js                # 入口文件
    └── .env                     # 环境变量
```

## 🚀 快速开始

### 环境要求

- Node.js >= 20.19
- pnpm >= 10.4
- MySQL 8.0+
- Python >= 3.10（仅 Network Sensitivity Custom 模式需要）

### 安装与运行

1. **克隆项目**

   ```bash
   git clone https://github.com/WhyLIM/CBD-vue.git
   cd CBD-vue
   ```

2. **安装依赖**

   ```bash
   # 后端
   cd CBD-backend && pnpm install

   # 前端
   cd ../CBD-frontend && pnpm install
   ```

3. **配置环境变量**

   后端 `CBD-backend/.env`：
   ```env
   NODE_ENV=development
   PORT=3000
   CORS_ORIGIN=http://localhost:5173
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_NAME=cbd
   ```

   前端 `CBD-frontend/.env`：
   ```env
   VITE_API_BASE_URL=/api
   ```
   > 使用相对路径 `/api`，开发时由 Vite proxy 代理，生产时由 Nginx 反向代理，无需区分环境。

4. **启动开发服务器**

   ```bash
   # 后端
   cd CBD-backend && pnpm dev

   # 前端（新终端）
   cd CBD-frontend && pnpm dev
   ```

5. **访问应用**
   - 前端：`http://localhost:5173`
   - 后端 API：`http://localhost:3000/api/health`

## 🔌 API 概览

### 生物标志物
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/biomarkers` | 列表（分页、排序、筛选） |
| GET | `/api/biomarkers/:id` | 详情 |
| GET | `/api/biomarkers/filters/options` | 筛选选项 |

### 搜索
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/search/advanced` | 高级搜索 |
| GET | `/api/search/quick` | 快速搜索 |
| GET | `/api/search/suggestions` | 搜索建议 |

### 单细胞 UMAP
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/scrna/umap` | UMAP 散点数据 |
| GET | `/api/scrna/metadata/filters` | 筛选选项 |

### 单细胞分析
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/analysis/degs` | DEGs 分页数据 |
| GET | `/api/analysis/degs/chart` | DEGs 火山图全量数据 |
| GET | `/api/analysis/degs/gene-search` | DEGs 基因搜索 |
| GET | `/api/analysis/gene-diff/celltype` | By Celltype 分页数据 |
| GET | `/api/analysis/gene-diff/celltype/chart` | By Celltype 全量数据 |
| GET | `/api/analysis/gene-diff/tvsn` | Tumor vs Normal 分页数据 |
| GET | `/api/analysis/gene-diff/tvsn/chart` | Tumor vs Normal 全量数据 |
| GET | `/api/analysis/gene-diff/gene-search` | Gene Diff 基因搜索 |
| GET | `/api/analysis/kegg` | KEGG 通路数据 |
| GET | `/api/analysis/ridge` | Ridge 排名数据 |
| GET | `/api/analysis/trajectory/files` | 轨迹文件列表 |
| GET | `/api/analysis/cellchat` | CellChat 分页数据 |
| GET | `/api/analysis/cellchat/chart` | CellChat 全量数据 |
| GET | `/api/analysis/biomk-cellchat` | Biomarker CellChat 数据 |
| GET | `/api/analysis/biomk-cellchat/gene-search` | CellChat 基因搜索 |
| GET | `/api/analysis/prs` | Network Sensitivity 数据 |
| GET | `/api/analysis/prs/gene-search` | PRS 基因搜索 |
| GET | `/api/analysis/roc/tn` | ROC Tumor vs Normal |
| GET | `/api/analysis/roc/celltype` | ROC By Celltype |
| GET | `/api/analysis/roc/chart` | ROC 全量图表数据 |
| GET | `/api/analysis/roc/gene-search` | ROC 基因搜索 |
| GET | `/api/analysis/metadata/filters` | 所有筛选选项 |

### 临床分析
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/clinical/survival` | 生存数据 |
| GET | `/api/clinical/immune` | 免疫浸润分页数据 |
| GET | `/api/clinical/immune/chart` | 免疫浸润全量数据 |

### Network Sensitivity（PRS）
| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/api/analysis/prs` | 预计算 PRS 分页数据 |
| GET | `/api/analysis/prs/gene-search` | PRS 基因搜索 |
| POST | `/api/network/prs/genes` | Custom 基因列表即时计算 PRS（spawn Python） |
| POST | `/api/network/prs/subnetwork` | STRING 子网络查询（Cytoscape 渲染用） |

### 其他
| 方法 | 路径 | 说明 |
|------|------|------|
| POST | `/api/submission` | 数据提交 |
| GET | `/api/download/complete` | 完整数据集下载 |
| POST | `/api/download/custom` | 自定义导出 |
| GET | `/api/stats` | 数据库统计 |

## 🚀 部署

### 1. 构建前端

```bash
cd CBD-frontend
pnpm docs:build    # 先构建文档
pnpm build          # 再构建主应用
```

构建产物在 `CBD-frontend/dist/`。

### 2. 启动后端

```bash
cd CBD-backend
pnpm install --prod
```

**安装 Python 运行时依赖**（Network Sensitivity Custom 模式必需）：

```bash
# 系统已有 Python 3.10+ 后执行
pip install prody pandas networkx tqdm
# 或：pip install -r CBD-backend/vendor/enm_package/requirements.txt
```

生产环境 `.env`：
```env
NODE_ENV=production
PORT=3001
CORS_ORIGIN=https://your-domain.com
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=cbd
# Python 解释器路径（服务器上若 python 命令不可用，需显式指定，如 /usr/bin/python3）
PYTHON_BIN=python3
```

### 宝塔部署流程示例

#### 前端部署

1. 在 `/www/wwwroot/` 下创建 `CBD` 文件夹

2. 本地构建前端 dist 后上传到 `/www/wwwroot/CBD`  文件夹

3. 网站 -> PHP 项目 -> 添加站点

4. 添加域名，网站根目录指定为 `/www/wwwroot/CBD/dist`
5. 设置 ->反向代理 -> 添加反向代理 -> 打开高级功能 -> 代理目录设置为 `/api/` -> 目标 URL 设置为 `http://localhost:3001/api` -> 发送域名设置为 `localhost`

#### 后端部署

1. 上传后端文件夹到 `/www/wwwroot/CBD`  文件夹
2. 网站 -> Node 项目 -> 添加站点，使用默认项目即可
3. 项目目录设置为 `/www/wwwroot/CBD/CBD-backend`，一般会自动识别到启动选项，如识别不到请手动设置为 `start:node server.js`
4. node 版本设置为 `v24.12.0`，18 以上应该都是可以的
5. 包管理器设置为 `pnpm`
6. 项目端口设置为 `3001`

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到远程 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

MIT License. 详见 [LICENSE](./LICENSE)。
