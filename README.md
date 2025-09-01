# CBD3 - 结直肠癌生物标记物数据库

## 🎯 项目概述

CBD3 (Colorectal Cancer Biomarker Database 3) 是一个专为结直肠癌生物标记物数据设计的现代化全栈应用。它提供了数据管理、搜索、统计和下载功能，由原有的 PHP 项目重构为基于 Vue3 和 Node.js 的技术栈。

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
    - 请参考 `CBD-backend/DATABASE_SETUP.md` 文件中的指引来设置您的 MySQL 数据库。
    - 创建 `.env` 文件在 `CBD-backend` 目录下，并填入您的数据库连接信息：
      ```env
      DB_HOST=localhost
      DB_PORT=3306
      DB_USER=your_db_user
      DB_PASSWORD=your_db_password
      DB_NAME=cbd_database
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

5.  **访问应用**
    - 前端应用: `http://localhost:5173`
    - 后端 API: `http://localhost:3000`

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

## 🤝 贡献指南

我们欢迎任何形式的贡献！

1.  Fork 本项目。
2.  创建您的功能分支 (`git checkout -b feature/AmazingFeature`)。
3.  提交您的更改 (`git commit -m 'Add some AmazingFeature'`)。
4.  将您的分支推送到远程仓库 (`git push origin feature/AmazingFeature`)。
5.  创建一个 Pull Request。

## 📄 许可证

本项目采用 MIT 许可证。详情请见 [LICENSE](./LICENSE) 文件。