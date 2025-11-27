# CBD3 - 结直肠癌生物标记物数据库

## 🎯 项目概述

CBD3 (Colorectal Cancer Biomarker Database 3) 是一个专为结直肠癌生物标记物数据设计的现代化全栈应用。它提供了数据管理、搜索、统计和下载功能，由原有的 PHP 项目重构为基于 Vue3 和 Node.js 的技术栈。

## ⚡ 简明关键点（TL;DR）

- 前端：Vue 3 + Vite + Vue Router + Pinia + Element Plus + ECharts；入口 `CBD-frontend/src/main.js`，路由 `CBD-frontend/src/router/index.js`，状态 `CBD-frontend/src/stores/biomarker.js`，HTTP 封装 `CBD-frontend/src/utils/api.js`（统一返回 `{success,data,pagination}`）。
- 后端：Express + MySQL2；入口 `CBD-backend/server.js`，数据库封装 `CBD-backend/config/database.js`，业务路由位于 `CBD-backend/routes/*`（biomarkers/search/download/submission/stats）。
- 端口与跨域：后端默认 `3000`；前端开发端口 `5173`。请在前端 `.env` 配置 `VITE_API_BASE_URL=http://localhost:3000/api`，后端 `.env` 配置 `CORS_ORIGIN=http://localhost:5173`（你当前已设置）。
- 文档站：位于 `CBD-frontend/docs`，使用 VitePress；构建顺序必须“先文档后主应用”（`pnpm docs:build` → `pnpm build`），产物输出到 `CBD-frontend/public/docs` 并随前端打包。
- 目录速览：
  - 前端：`src/views` 页面、`src/components` 组件、`src/stores` 状态、`src/router` 路由、`src/utils` 工具；`services/stringApi.js` 集成 STRING-DB。
  - 后端：`server.js` 中间件与路由挂载、`routes/*` 接口实现、`config/database.js` 连接池与通用查询。
- 建议优化：前端路由懒加载与按需资源、后端鉴权闭环（JWT）、统一数据表命名（`biomarker`/`biomarkers`）、增加前后端测试覆盖。

## ✨ 主要功能

- 🔍 **生物标记物搜索与浏览**: 支持关键词快速搜索、多条件高级搜索以及分页浏览。
- 💾 **数据下载**: 支持下载完整的生物标记物数据集，或根据筛选条件自定义导出数据 (支持 CSV 和 JSON 格式)。
- 📝 **数据提交**: 提供在线表单，允许研究人员提交新的生物标记物数据。
- 📊 **数据统计**: 展示数据库的宏观统计信息，如生物标记物总数、文献总数，以及按分类、年份等维度的分布图表。
- 📖 **详细信息展示**: 为每个生物标记物提供一个包含详细研究信息的专属页面。

## 🛠️ 技术栈

### 前端
- **Vue 3**: 核心前端框架
- **Vite**: 高性能构建工具
- **Vue Router**: 路由管理
- **Pinia**: 状态管理
- **Element Plus**: UI 组件库
- **ECharts**: 数据可视化图表库
- **Axios**: HTTP 客户端

### 后端
- **Node.js**: JavaScript 运行时环境
- **Express.js**: Web 应用框架
- **MySQL2**: MySQL 数据库驱动
- **Helmet**: 增强 HTTP 头安全性
- **CORS**: 处理跨域资源共享
- **express-validator**: API 参数验证
- **express-rate-limit**: API 速率限制

### 开发工具
- **PNPM**: 高性能包管理器
- **ESLint**: 代码规范检查
- **Prettier**: 代码格式化
- **Nodemon**: 后端开发环境热重载
- **VitePress**: 用于生成静态文档网站

## 📖 文档系统

项目包含一个基于 **VitePress** 的静态文档网站，位于 `CBD-frontend/docs` 目录下。该文档系统用于提供详细的用户指南、开发文档和项目介绍。

- **内容源**: 所有文档页面均为 Markdown 文件。
- **配置**: 导航栏、侧边栏和站点信息在 `CBD-frontend/docs/.vitepress/config.js` 文件中配置。
- **构建输出**: 文档会被构建为静态 HTML 文件，并输出到 `CBD-frontend/public/docs` 目录，以便与主应用一同部署。

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- PNPM >= 8.0.0
- MySQL

### 安装与运行

1.  **克隆项目**
    ```bash
    git clone https://github.com/WhyLIM/CBD-vue.git
    cd CBD-vue
    ```

2.  **安装依赖**
    ```bash
    # 安装后端依赖
    cd CBD-backend
    pnpm install

    # 安装前端依赖
    cd ../CBD-frontend
    pnpm install
    ```

3.  **配置数据库**
    - 请参考 `CBD-backend/DATABASE_SETUP.md` 文件中的指引来设置 MySQL 数据库。
    - 在 `CBD-backend` 目录下创建 `.env` 文件，并填入数据库连接信息：
      ```env
      DB_HOST=localhost
      DB_PORT=3306
      DB_USER=your_db_user
      DB_PASSWORD=your_db_password
      DB_NAME=cbd_database

    前端 `.env`（开发）请设置：
    ```env
    VITE_API_BASE_URL=http://localhost:3000/api
    ```
      ```

4.  **启动开发服务器**
    ```bash
    # 在项目根目录启动后端服务器
    cd CBD-backend
    pnpm dev

    # 在新终端中启动前端服务器
    cd ../CBD-frontend
    pnpm dev
    ```

5.  **启动文档开发服务器 (可选)**
    ```bash
    # 在新终端中，进入前端目录
    cd CBD-frontend
    pnpm docs:dev
    ```

6.  **访问应用与文档**
    - 前端应用: `http://localhost:5173`
    - 后端 API: `http://localhost:3000`
    - 文档网站: `http://localhost:5174`

### 环境变量速查

- 后端 `.env`（开发）：
  - `PORT=3000`
  - `CORS_ORIGIN=http://localhost:5173`
  - `DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_NAME`
- 前端 `.env`：
  - `VITE_API_BASE_URL=http://localhost:3000/api`

## 🔌 API 核心接口

以下是项目实现的核心 API 接口：

#### 生物标记物 (Biomarkers)
- `GET /api/biomarkers`: 获取生物标记物列表（支持分页、排序、过滤）。
- `GET /api/biomarkers/:id`: 获取单个生物标记物的详细信息。
- `GET /api/biomarkers/filters/options`: 获取用于列表页筛选的选项。

#### 搜索 (Search)
- `POST /api/search/advanced`: 根据多个字段进行高级搜索。
- `GET /api/search/quick`: 根据关键词进行快速搜索。
- `GET /api/search/suggestions`: 获取搜索建议。

#### 数据提交 (Submission)
- `POST /api/submission`: 提交新的生物标记物数据。

#### 数据下载 (Download)
- `GET /api/download/complete`: 下载完整的 CSV 数据集。
- `POST /api/download/custom`: 根据筛选条件下载自定义数据集（CSV 或 JSON）。

#### 统计 (Stats)
- `GET /api/stats`: 获取数据库的概览统计数据。
- `GET /api/stats/recent`: 获取最新添加的生物标记物。

## 🚀 部署说明

本项目采用前后端分离的部署策略。

### 1. 构建前端应用与文档

构建过程分为两步，**顺序非常重要**。必须先构建文档，再构建主应用，这样文档才能被正确地打包到最终的发布产物中。

```bash
# 进入前端项目目录
cd CBD-frontend

# 第一步：构建文档网站
# 该命令会将文档静态文件生成到 public/docs 目录下。
pnpm docs:build

# 第二步：构建主应用
# 该命令会打包整个应用，并自动将 public/docs 目录包含进去。
pnpm build
```
构建完成后，会在 `CBD-frontend/dist` 目录下生成所有静态文件，其中 `dist/docs` 路径下就包含了完整的文档网站。

### 2. 部署前端

将 `CBD-frontend/dist` 目录下的所有文件上传到您的 Web 服务器（如 Nginx, Apache, 或静态网站托管服务如 Vercel, Netlify）。

**Nginx 配置示例:**

您需要配置 Nginx 来托管前端文件，并将所有 API 请求反向代理到后端服务。

```nginx
server {
    listen 80;
    server_name your-domain.com; # 替换为您的域名
    root /path/to/your/CBD-frontend/dist; # 替换为前端构建产物的路径
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000; # 假设后端服务在本机的 3000 端口
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 3. 部署后端服务

在您的服务器上，运行后端 Node.js 应用。建议使用进程管理工具（如 PM2）来确保服务的稳定运行。

**a. 配置生产环境变量**

在 `CBD-backend` 目录下创建一个 `.env` 文件，并配置生产环境所需变量：

```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com # 替换为您的前端域名
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_NAME=cbd_database
```

> 生产环境请确保前端 `VITE_API_BASE_URL` 指向后端实际域名与 `/api` 路径，并在反向代理（如 Nginx）将 `/api` 转发到后端服务。

**b. 使用 PM2 启动服务**

```bash
# 全局安装 PM2 (如果尚未安装)
pnpm add -g pm2

# 进入后端项目目录
cd CBD-backend

# 使用 PM2 启动服务
pm2 start server.js --name "cbd-backend"
```

### 附：宝塔面板部署示例

对于使用宝塔面板（BT Panel）的用户，可以参考以下步骤进行快速部署：

**前提条件:**
- 服务器已安装宝塔面板。
- 在宝塔面板的“软件商店”中安装 **PM2管理器** 和 **Nginx**。
- 确保服务器已安装 pnpm。

**1. 上传并准备项目**
   - 将整个项目代码上传到服务器，例如上传至 `/www/wwwroot/cbd-project` 目录。
   - 通过宝塔面板的“文件”功能或SSH终端，进入 `CBD-backend` 和 `CBD-frontend` 目录，分别执行 `pnpm install` 安装依赖。
   - 根据上面的指引，在 `CBD-backend` 目录下创建并配置好 `.env` 文件。
   - 进入 `CBD-frontend` 目录，**依次执行** `pnpm docs:build` 和 `pnpm build` 来构建前端文件。

**2. 部署后端服务**
   - 打开宝塔面板的 **PM2管理器**。
   - 点击“添加项目”，并按如下配置：
     - **项目根目录**: 选择后端项目路径，如 `/www/wwwroot/cbd-project/CBD-backend`。
     - **启动文件**: `server.js`。
     - **项目名称**: `cbd-backend`。
   - 点击“确定”，PM2管理器会自动启动并守护后端进程。服务默认运行在 `3000` 端口。

**3. 创建网站并配置反向代理**
   - 进入宝塔面板的“网站” -> “添加站点”。
   - **域名**: 填入您的域名。
   - **根目录**: 选择前端构建产物的目录，即 `/www/wwwroot/cbd-project/CBD-frontend/dist`。
   - **数据库**: 无需创建。
   - 提交后，点击新创建站点的“设置”。
   - 在设置页面中，找到“反向代理” -> “添加反向代理”。
   - **代理名称**: 自定义，如 `API`。
   - **目标URL**: `http://127.0.0.1:3000`。
   - **发送域名**: `$host`。
   - **代理目录**: `/api`。
   - 提交保存。

完成以上步骤后，您的网站即可通过域名访问，所有对 `/api` 的请求都会被 Nginx 自动转发到后端 Node.js 服务处理。

## 🤝 贡献指南

欢迎任何形式的贡献。

1.  Fork 本项目。
2.  创建您的功能分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4.  将您的分支推送到远程仓库 (`git push origin feature/AmazingFeature`)。
5.  创建一个 Pull Request。

## 📄 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](./LICENSE) 文件。
