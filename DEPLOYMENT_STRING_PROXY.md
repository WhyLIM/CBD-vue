# STRING API 代理部署指南

## 概述
为了解决前端调用 STRING 数据库 API 的跨域问题，我们在后端添加了代理路由。所有对 STRING API 的请求将通过后端转发，避免浏览器的同源策略限制。

## 部署步骤

### 1. 更新后端代码
确保服务器端已包含以下文件：
- `routes/string.js` - STRING API 代理路由
- `package.json` - 包含 axios 依赖

### 2. 安装依赖
在服务器后端目录执行：
```bash
cd CBD-backend
pnpm install
# 或
npm install
```

### 3. 重启服务器
```bash
# 如果使用 PM2
pm2 restart cbd-backend

# 或直接重启
npm restart
```

## 验证部署

### 1. 测试代理接口
```bash
# 测试版本接口
curl -X GET https://cbd.biomarkerdb.cn/api/string/version

# 测试富集分析接口
curl -X POST https://cbd.biomarkerdb.cn/api/string/enrichment \
  -H "Content-Type: application/json" \
  -d '{"identifiers": ["TP53", "BRCA1"], "species": "9606"}'

# 测试网络分析接口
curl -X POST https://cbd.biomarkerdb.cn/api/string/network \
  -H "Content-Type: application/json" \
  -d '{"identifiers": ["TP53", "BRCA1"], "species": "9606", "required_score": 400}'
```

### 2. 检查前端功能
1. 重新构建前端：
   ```bash
   cd CBD-frontend
   npm run build
   ```
2. 部署构建文件到服务器
3. 打开 Biomarker 详情页，检查网络分析功能是否正常

## 代理接口说明

### `/api/string/version`
- **方法**: GET
- **功能**: 获取 STRING 数据库版本信息
- **响应**: STRING API 版本数据

### `/api/string/network`
- **方法**: POST
- **功能**: 获取蛋白质相互作用网络数据
- **参数**:
  ```json
  {
    "identifiers": ["TP53", "BRCA1"],
    "species": "9606",
    "required_score": 400,
    "network_type": "functional"
  }
  ```

### `/api/string/enrichment`
- **方法**: POST
- **功能**: 获取功能富集分析数据
- **参数**:
  ```json
  {
    "identifiers": ["TP53", "BRCA1"],
    "species": "9606"
  }
  ```

### `/api/string/stats`
- **方法**: POST
- **功能**: 获取网络统计信息
- **参数**:
  ```json
  {
    "identifiers": ["TP53", "BRCA1"],
    "species": "9606"
  }
  ```

## 错误处理

### 常见错误及解决方案

1. **404 错误**
   - 检查路由是否正确注册：`app.use('/api/string', require('./routes/string'))`
   - 确认服务器已重启

2. **依赖错误**
   - 确认 axios 已安装：检查 `package.json` 中是否有 `"axios": "^1.7.9"`
   - 重新安装依赖：`pnpm install`

3. **超时错误**
   - 代理设置的超时时间为 30 秒
   - 如果频繁超时，可能需要检查网络连接

4. **STRING API 错误**
   - 检查 STRING 数据库是否可访问
   - 验证请求参数格式是否正确

## 监控和日志

### 1. 服务器日志
代理请求的错误会记录在服务器日志中：
```javascript
console.error('STRING network API proxy error:', error);
```

### 2. 性能监控
可以添加请求时间和监控：
```javascript
const startTime = Date.now();
// ... 请求处理 ...
const duration = Date.now() - startTime;
console.log(`STRING API request took ${duration}ms`);
```

## 安全考虑

1. **速率限制**: 继承现有的全局速率限制配置
2. **请求验证**: 验证输入参数格式和长度
3. **错误处理**: 不暴露内部错误信息给客户端

## 回滚方案

如果代理出现问题，可以快速回滚到模拟数据：
1. 修改前端 `stringApi.js` 中的 `baseUrl` 为 `'/explore'`
2. 重新构建和部署前端
3. 使用现有的模拟接口

## 联系支持

如果在部署过程中遇到问题，请：
1. 检查服务器日志
2. 验证网络连接
3. 联系开发团队获取支持