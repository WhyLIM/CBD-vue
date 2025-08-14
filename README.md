# CBD3 - 结直肠癌生物标记物数据库

## 🎯 项目概述

CBD3（Colorectal Cancer Biomarker Database 3）是一个现代化的生物标记物数据库，专门用于结直肠癌相关的生物标记物数据管理、搜索和分析。本项目将原PHP项目重构为Vue3 + Node.js的现代化全栈应用。

## ✨ 主要功能

- 🔍 **生物标记物搜索与浏览** - 支持多条件搜索和分类浏览
- 📊 **数据统计与可视化** - 基于 ECharts 提供丰富的统计图表和数据分析
- 📝 **数据提交系统** - 支持新生物标记物数据的在线提交与文件上传
- 💾 **数据下载导出** - 支持完整数据集和自定义数据导出
- 🔬 **数据探索分析** - 集成蛋白质相互作用网络（PPI）分析和基因富集分析功能
- 📖 **详细信息展示** - 提供每个生物标记物的完整详细信息

## 🛠️ 技术栈

### 前端
- **Vue 3** - 现代化的前端框架
- **Element Plus** - 企业级UI组件库
- **Vite** - 高性能构建工具
- **Pinia** - 状态管理
- **Vue Router** - 路由管理
- **Axios** - HTTP客户端
- **ECharts** - 数据可视化图表库
- **Font Awesome** - 图标库

### 后端
- **Node.js** - JavaScript运行时
- **Express.js** - Web应用框架
- **MySQL2** - 高性能MySQL驱动
- **Helmet** - HTTP头安全中间件
- **CORS** - 跨域资源共享
- **Morgan** - HTTP请求日志
- **express-validator** - API参数验证
- **express-rate-limit** - 接口速率限制

### 开发工具
- **PNPM** - 包管理器
- **ESLint** - 代码检查
- **Prettier** - 代码格式化
- **Nodemon** - 开发环境热重载

## 🚀 快速开始

### 环境要求
- Node.js >= 16.0.0
- PNPM >= 8.0.0

### 安装与运行

1. **克隆项目**
```bash
git clone git@github.com:WhyLIM/CBD-vue.git
cd CBD3-vue
```

2. **安装前端依赖**
```bash
cd CBD-frontend
pnpm install
```

3. **安装后端依赖**
```bash
cd ../CBD-backend
pnpm install
```

4. **配置MySQL数据库**

请参考 `CBD-backend/DATABASE_SETUP.md` 文件进行MySQL数据库配置：

```bash
# 创建数据库
mysql -u root -p
CREATE DATABASE cbd_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 配置环境变量
# 编辑 CBD-backend/.env 文件，填入您的MySQL连接信息
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cbd_database
```

5. **启动开发服务器**

**启动开发服务器**

```bash
# 启动后端服务器
cd CBD-backend
pnpm dev

# 启动前端服务器（新终端）
cd CBD-frontend
pnpm dev
```

6. **访问应用**
- 前端应用：http://localhost:5173
- 后端API：http://localhost:3000
- API健康检查：http://localhost:3000/api/health

## 📁 项目结构

```
CBD3/
├── CBD-frontend/            # 前端Vue3项目
│   ├── src/
│   │   ├── assets/          # 静态资源 (CSS, 字体)
│   │   ├── components/      # UI组件
│   │   │   ├── common/      # 通用原子组件 (Loading, EmptyState等)
│   │   │   ├── layout/      # 布局组件 (Header, Footer)
│   │   │   └── submission/  # 数据提交相关组件
│   │   ├── router/          # 路由配置 (Vue Router)
│   │   ├── stores/          # 状态管理 (Pinia)
│   │   ├── utils/           # 工具函数 (api.js)
│   │   ├── views/           # 页面级组件
│   │   ├── App.vue          # 根组件
│   │   └── main.js          # 应用入口
│   ├── public/              # 公共静态资源
│   └── package.json         # 项目依赖和脚本
├── CBD-backend/             # 后端Node.js项目
│   ├── config/              # 配置文件 (database.js)
│   ├── data/                # 数据文件 (可能用于初始化或测试)
│   ├── routes/              # API路由模块
│   ├── .env                 # 环境变量
│   ├── server.js            # Express服务器入口
│   └── package.json         # 项目依赖和脚本
└── README.md                # 项目说明文档
```

## 🔌 API接口

### API接口

#### 通用
- `GET /api/health` - 服务健康检查

#### 生物标记物 (Biomarkers)
- `GET /api/biomarkers` - 获取生物标记物列表（支持分页、排序、过滤）
- `GET /api/biomarkers/:id` - 获取单个生物标记物详情
- `GET /api/biomarkers/filters/options` - 获取用于筛选的选项（如分类、来源等）
- `GET /api/biomarkers/stats/overview` - 获取生物标记物概览统计数据

#### 功能
- `POST /api/search` - 高级搜索
- `POST /api/submission` - 提交新的生物标记物数据
- `GET /api/download` - 下载数据集
- `GET /api/stats` - 获取全站核心统计数据

#### 数据探索 (Explore)
- `POST /api/explore/network` - 执行蛋白质相互作用网络分析
- `POST /api/explore/enrichment` - 执行基因富集分析
- `GET /api/explore/history` - 获取分析历史记录
- `GET /api/explore/tools` - 获取可用的分析工具信息

### 响应格式 (示例)
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "biomarker": "BRAF V600E",
      "category": "Gene Mutation"
    }
  ],
  "pagination": {
    "current": 1,
    "total": 50,
    "limit": 20,
    "count": 998,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## 🎨 设计特色

- **学术风格** - 学术界面设计，使用深蓝色配色方案
- **响应式设计** - 支持各种屏幕尺寸的设备
- **现代化UI** - 采用Element Plus组件库，界面简洁现代

## 📊 功能模块

### 1. 首页 (Home)
- 系统介绍和统计数据展示
- 最新生物标记物展示
- 快速搜索入口

### 2. 生物标记物列表 (Biomarkers)
- 分页展示所有生物标记物
- 支持分类筛选和排序
- 实时搜索功能

### 3. 高级搜索 (Advanced Search)
- 多条件组合搜索
- 自定义筛选条件
- 搜索结果导出

### 4. 数据提交 (Submission)
- 在线数据提交表单
- 文件上传支持
- 提交状态跟踪

### 5. 数据下载 (Download)
- 完整数据集下载
- 自定义数据导出
- 下载历史记录

### 6. 数据探索 (Explore)
- **蛋白质相互作用网络 (PPI)**: 基于STRING数据库进行蛋白质相互作用网络分析。
- **基因富集分析**: 提供GO、KEGG和Reactome等多种通路的富集分析。
- **分析历史**: 保存和查看过去的分析记录。

## 🔧 开发指南

### 代码规范
- 使用ESLint进行代码检查
- 使用Prettier进行代码格式化
- 遵循Vue 3 Composition API最佳实践

### 组件开发
- 使用单文件组件(.vue)
- 采用组合式API
- 组件命名使用PascalCase

### API开发
- 遵循RESTful API设计原则
- 使用 `express-validator` 进行严格的参数验证
- 提供统一的响应格式和详细的错误处理

## 🚀 部署说明

### 生产环境构建
```bash
# 构建前端
cd CBD-frontend
pnpm run build

# 启动后端生产服务器
cd CBD-backend
pnpm run start
```

### 环境变量配置
在`CBD-backend/.env`文件中配置：
```env
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://your-domain.com
```

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情

## 🙏 致谢

本项目使用 CodeBuddy 编辑器，由 AI 辅助开发，包括：

- Claude-3.7-Sonnet、Claude-4.0-Sonnet 用于代码重构
- GPT-4o 用于头图生成
- Gemini-2.5-Pro 用于文档完善
- DeepSeek 用于细节修补
