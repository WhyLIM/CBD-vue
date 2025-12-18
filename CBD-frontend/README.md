# CBD-frontend

基于 Vue 3 + Vite 的前端应用，提供结直肠癌生物标记物数据库的交互式界面，包括搜索、下载、详情页以及单细胞转录组 UMAP 可视化。

## 技术栈

- Vue 3、Vite、Vue Router、Pinia、Element Plus、ECharts、Axios

## 环境配置

- 在项目根目录创建 `.env`，设置后端地址：

```env
VITE_API_BASE_URL=http://localhost:3001/api
```

## 安装依赖

```sh
pnpm install
```

## 开发运行

```sh
pnpm dev
```

按终端输出访问开发地址，例如 `http://localhost:5173`。

## 构建与预览

```sh
pnpm build
pnpm preview
```

## 主要目录

- `src/views` 页面组件（含 `UMAPExplorer.vue`）
- `src/components` 通用组件
- `src/router/index.js` 路由配置
- `src/utils/api.js` Axios 封装
- `src/services/scrna.js` UMAP 与筛选 API 封装

## UMAP Explorer 功能

- 按元数据着色（`SubCluster/Sample/Patient/...`），支持连续变量（`nCount_RNA/nFeature_RNA`）渐变图例
- 控制点大小与透明度、显示图例、筛选数据
- 导出当前视图：PNG、SVG、CSV
