# CBD3 - 结直肠癌生物标志物数据库

## 🎯 项目概述

CBD3 (Colorectal Cancer Biomarker Database 3) 是一个面向结直肠癌研究的综合数据分析平台，集成了生物标志物浏览、单细胞 RNA-seq 可视化分析、蛋白质互作网络、临床数据分析和高级搜索功能。

## ✨ 主要功能

| 模块 | 功能说明 |
|------|---------|
| **Biomarker Browser** | 生物标志物浏览、搜索、详情展示 |
| **Gene Expression Atlas** | UMAP 单细胞基因表达可视化，支持多数据集、多细胞类型；基因检索支持**单基因或多基因批量**（多选下拉 + 粘贴逗号/换行分隔列表），多基因按平均表达着色 |
| **Protein Interaction** | PPI 蛋白质互作网络（Cytoscape.js） |
| **DEGs** | 差异基因火山图（全量数据渲染），Original / By Celltype / Tumor vs Normal 三种模式；By Celltype / TvsN 支持多基因批量检索，选中基因在火山图上橙色高亮 |
| **KEGG Pathway** | KEGG 通路富集气泡图 |
| **Ridge Ranking** | 基因 Ridge 排名图 |
| **Trajectory** | 细胞轨迹分析 + 交互式伪时间分析；Gene Expression 模式支持多基因（平均表达着色） |
| **CellChat** | 细胞通讯网络：**Full Interactions**（全量互作，支持 Source / Target / Pathway / Annotation / 多基因筛选，Evidence 列含 KEGG / PMID / PMC 分类着色超链接）、**Dual-specific Biomarker Interactions**（多基因检索）、**Biomarker as Ligand / Receptor**（多基因检索） |
| **Network Sensitivity** | PRS 网络敏感性分析，Database 模式支持多基因批量检索 |
| **Predictive Ability** | ROC 预测能力分析（Tumor vs Normal / By Celltype），支持多基因批量检索 |
| **Clinical: Survival** | KM 生存曲线分析，支持基因与临床参数筛选 |
| **Clinical: Immune** | 免疫浸润热力图（全量数据渲染） |
| **Advanced Search** | 多条件高级搜索，支持保存/加载搜索条件；Symbol 字段支持逗号分隔多基因 |
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
│   │   │   ├── analysis/        # 单细胞分析组件（8 个，含 EvidenceLinks 证据链接公共组件）
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
    │   ├── import_to_mysql.py   # 分析结果数据导入（基因表达 / 差异表达 / ROC / CellChat 等，支持断点续传与导入后核数）
    │   ├── import_umap.js       # UMAP 坐标与细胞元数据导入
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
| GET | `/api/scrna/gene-expr` | 基因表达着色数据，`gene` 支持逗号分隔多基因（按细胞取平均，上限 50） |
| GET | `/api/scrna/gene-search` | 基因自动补全 |
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
| GET | `/api/analysis/cellchat-raw` | CellChat 全量互作分页数据（含 annotation / evidence，支持 source / target / pathway / annotation / 多基因模糊筛选） |
| GET | `/api/analysis/cellchat-raw/meta` | 全量互作筛选项元数据 |
| GET | `/api/analysis/cellchat-raw/network` | 全量互作网络图数据（按 source-target 聚合） |
| GET | `/api/analysis/biomk-cellchat` | Biomarker CellChat 数据 |
| GET | `/api/analysis/biomk-cellchat/gene-search` | CellChat 基因搜索 |
| GET | `/api/analysis/biomk-cellchat/network` | Biomarker CellChat 网络图数据 |
| GET | `/api/analysis/prs` | Network Sensitivity 数据 |
| GET | `/api/analysis/prs/gene-search` | PRS 基因搜索 |
| GET | `/api/analysis/roc/tn` | ROC Tumor vs Normal |
| GET | `/api/analysis/roc/celltype` | ROC By Celltype |
| GET | `/api/analysis/roc/chart` | ROC 全量图表数据 |
| GET | `/api/analysis/roc/gene-search` | ROC 基因搜索 |
| GET | `/api/analysis/metadata/filters` | 所有筛选选项 |

> **多基因检索约定**：单细胞分析相关接口的 `gene` 参数均支持逗号分隔多个基因（如 `gene=TP53,KRAS`），服务端转为 `gene IN (...)` 查询；表达着色类接口（UMAP / 伪时间）多基因时按细胞返回平均表达。前端各基因检索框均支持粘贴逗号 / 分号 / 空格 / 换行分隔的批量基因列表，自动拆分去重。

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

## 🌐 公共 API

网站数据提供只读 HTTP API：轻度使用无需账号；申请 API 密钥（请求头 `X-API-Key`）可获得独立限流额度（默认 6000 次 / 15 分钟，匿名 1000 次 / 15 分钟 / IP）。端点参考、认证方式与 curl / Python / JavaScript 调用示例见帮助文档 **Public API** 页面（`https://cbd.biomarkerdb.cn/docs/api`，含中文版）。

密钥管理（在能连数据库的机器上执行）：

```bash
# 签发（明文仅展示一次）
node CBD-backend/scripts/create_api_key.js --name "Zhang Lab" --contact lab@example.edu
# 列表 / 吊销
node CBD-backend/scripts/create_api_key.js --list
node CBD-backend/scripts/create_api_key.js --revoke cbd_ab12cd34
```

下载、提交、PRS 计算与 STRING 代理不接受密钥提权，始终按每 IP 限额计数。

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

> **数据表自动初始化**：后端启动时会自动执行 `initializeTables`——以 `CREATE TABLE IF NOT EXISTS` 创建缺失的表，并为已有旧表自动补齐新增列（如 `analysis_cellchat` / `analysis_biomk_cellchat` 的 `annotation`、`evidence`），无需手动执行迁移 SQL。新表（如 `analysis_cellchat_raw`）建好后用 `scripts/import_to_mysql.py` 或 Navicat 导入数据即可。

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
# STRING-DB 代理地址（可选）：部署在出网被 Cloudflare 拦截的服务器上时建议配置，
# 指向本站 nginx 反代（需在伪静态中配置 location /string-db-proxy/ -> https://string-db.org/）
# 前端已改为浏览器直连 STRING 优先（访客网络出网正常即可用），代理仅作回落通道；
# 若服务器 IP 被 string-db.org 整体拦截，代理回落也不可用，但站点功能不受影响
STRING_BASE=https://your-domain.com/string-db-proxy
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

### 性能配置（50 并发场景建议）

**Nginx 开启 gzip**（推荐写入宝塔站点的「伪静态」文件，与已有的 rewrite / 反代规则共存即可）：

伪静态内容是 server 级 include，gzip 指令在该层级合法，和 `location` 规则混写互不影响。当前站点完整的伪静态配置：

```nginx
# ---- 既有规则：CBD2 旧版站点 ----
location = /cbd2 {
    return 301 /cbd2/;
}

location ^~ /cbd2/ {
    root /www/wwwroot/CBD;
    index index.html index.php;

    location ~ \.php$ {
        try_files $uri =404;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /www/wwwroot/CBD$fastcgi_script_name;
        fastcgi_param HTTPS on;
        fastcgi_pass unix:/tmp/php-cgi-74.sock;
    }
}

# ---- 既有规则：STRING-DB 反向代理（解决服务器出网 403）----
location /string-db-proxy/ {
    proxy_pass https://string-db.org/;
    proxy_ssl_server_name on;
    proxy_ssl_name string-db.org;
    proxy_set_header Host string-db.org;
    proxy_ssl_protocols TLSv1.2 TLSv1.3;
    proxy_http_version 1.1;
    proxy_read_timeout 60s;
}

# ---- gzip 压缩（本站点全局生效，含 /api 的 JSON 响应）----
gzip on;
gzip_min_length 1k;
gzip_comp_level 5;
gzip_proxied any;
gzip_vary on;
gzip_types text/plain text/css application/javascript application/json application/xml image/svg+xml;
```

> API 的 JSON 响应（UMAP / 全量图表等 0.5-2MB）压缩率约 5-10 倍，是小带宽机器的首要优化。
> 注意：`gzip_types` 在 server 级会覆盖 http 级的继承值，需列全类型（JSON 是关键）；`gzip_proxied any` 确保前面有 CDN/代理时压缩仍然生效；切换伪静态模板会覆盖整份文件，保留以上内容。
> 验证：`nginx -t && nginx -s reload` 后执行 `curl -s -I -H "Accept-Encoding: gzip" https://域名/api/analysis/metadata/filters | grep -i content-encoding`，出现 `Content-Encoding: gzip` 即生效。

**MySQL buffer pool 调优**（my.cnf `[mysqld]` 段，重启 MySQL 生效）：

```ini
innodb_buffer_pool_size = 1536M
```

> `scrna_gene_expr`（~6000 万行）的二级索引约 2GB，默认 128MB 的 buffer pool 会让冷查询频繁走磁盘。

**后端已内置的负载保护**（无需配置）：
- 全量图表接口（`/degs/chart`、`/gene-diff/*/chart`、`/cellchat/chart`、`/roc/chart`）带内存响应缓存（LRU，10 分钟 TTL，上限 40MB），多用户共享同一份查询结果；
- PRS 即时计算带并发闸门（最多 2 个 Python 进程，排队上限 30，队列满返回 503；前端在计算等待超过 2 秒时显示排队提示）；
- API 限流 1000 次 / 15 分钟 / IP。

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到远程 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

MIT License. 详见 [LICENSE](./LICENSE)。
