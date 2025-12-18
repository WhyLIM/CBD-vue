# 开发者指南

CBD3是一个基于MIT许可证发布的开源项目。

本节为想要为CBD3做贡献、扩展其功能或使用我们的项目构建应用程序的开发者提供全面的技术信息。

## 技术栈

- **前端**：Vue 3, Pinia, Element Plus, ECharts
- **后端**：Node.js, Express.js, MySQL
- **文档**：支持Mermaid的VitePress
- **测试**：Vitest, Jest, Supertest
- **构建工具**：Vite, ESLint, Prettier

## 项目结构概述

```
CBD3/
├── CBD-frontend/           # 前端应用程序
│   ├── docs/              # VitePress文档
│   ├── src/               # Vue应用程序源代码
│   │   ├── components/    # 可重用的Vue组件
│   │   ├── views/         # 页面组件
│   │   ├── services/      # API服务层
│   │   ├── stores/        # Pinia状态存储
│   │   ├── utils/         # 工具函数
│   │   └── assets/        # 静态资源
│   ├── public/            # 公共资源
│   ├── package.json       # 依赖项和脚本
│   └── vite.config.js     # Vite配置
└── CBD-backend/           # 后端应用程序
    ├── src/
    │   ├── controllers/   # 路由控制器
    │   ├── models/        # 数据库模型
    │   ├── routes/        # API路由
    │   ├── middleware/    # Express中间件
    │   ├── services/      # 业务逻辑
    │   └── utils/         # 工具函数
    ├── config/            # 配置文件
    └── package.json       # 依赖项和脚本
```

## 获取帮助

- **文档**：检查相关文档部分
- **GitHub Issues**：在创建新问题前搜索现有问题

## 详细信息

更多详细信息，请参考[我们的Github仓库页面](https://github.com/WhyLIM/CBD-vue)。