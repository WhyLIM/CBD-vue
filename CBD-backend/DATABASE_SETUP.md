# MySQL数据库配置指南

## 📋 配置步骤

### 1. 安装MySQL服务器
确保您的系统已安装MySQL服务器（推荐版本8.0+）

### 2. 创建数据库
登录MySQL并创建项目数据库：

```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE cbd_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建专用用户（可选，推荐）
CREATE USER 'cbd_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON cbd_database.* TO 'cbd_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出MySQL
EXIT;
```

### 3. 配置环境变量
编辑 `CBD-backend/.env` 文件，填入您的MySQL连接信息：

```env
# MySQL数据库配置
DB_HOST=localhost          # 数据库主机地址
DB_PORT=3306              # 数据库端口
DB_USER=cbd_user          # 数据库用户名
DB_PASSWORD=your_secure_password  # 数据库密码
DB_NAME=cbd_database      # 数据库名称
```

### 4. 测试数据库连接
启动后端服务器测试连接：

```bash
cd CBD-backend
pnpm run dev
```

如果看到 `✅ MySQL数据库连接成功`，说明配置正确。

### 5. 初始化数据库表
数据库表会在首次启动时自动创建，包括：

- `biomarkers` - 生物标记物主表
- `submissions` - 数据提交表
- `download_logs` - 下载记录表
- `search_history` - 搜索历史表
- `system_config` - 系统配置表

## 🗄️ 数据库表结构

### biomarkers 表
```sql
CREATE TABLE biomarkers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL COMMENT '生物标记物名称',
  category VARCHAR(100) NOT NULL COMMENT '分类',
  application TEXT COMMENT '应用',
  location VARCHAR(255) COMMENT '位置',
  source VARCHAR(100) COMMENT '来源',
  description TEXT COMMENT '描述',
  first_author VARCHAR(255) COMMENT '第一作者',
  journal VARCHAR(255) COMMENT '期刊',
  publication_year INT COMMENT '发表年份',
  pmid VARCHAR(50) COMMENT 'PubMed ID',
  region VARCHAR(100) COMMENT '区域',
  stage VARCHAR(100) COMMENT '阶段',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### submissions 表
```sql
CREATE TABLE submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  biomarker_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  application TEXT,
  location VARCHAR(255),
  source VARCHAR(100),
  description TEXT,
  first_author VARCHAR(255),
  journal VARCHAR(255),
  publication_year INT,
  pmid VARCHAR(50),
  submitter_name VARCHAR(255),
  submitter_email VARCHAR(255),
  submitter_institution VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

### scRNA UMAP 表

用于单细胞转录组 UMAP 可视化的两张核心数据表：

```sql
-- UMAP 坐标表：每个细胞的二维坐标
CREATE TABLE scRNA_umap_coordinates (
  Cell VARCHAR(64) PRIMARY KEY,
  UMAP_1 DOUBLE NOT NULL,
  UMAP_2 DOUBLE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 元数据表：每个细胞的注释与分组信息
CREATE TABLE scRNA_metadata (
  Cell VARCHAR(64) PRIMARY KEY,
  Color VARCHAR(16),
  Sample VARCHAR(128),
  Dataset VARCHAR(128),
  Patient VARCHAR(128),
  Class VARCHAR(128),
  SubCluster VARCHAR(256),
  MMRstatus VARCHAR(64),
  Position VARCHAR(128),
  Site VARCHAR(128),
  Grade VARCHAR(64),
  GrandparentalCluster VARCHAR(256),
  ParentalCluster VARCHAR(256),
  nCount_RNA INT,
  nFeature_RNA INT,
  INDEX idx_subcluster (SubCluster),
  INDEX idx_sample (Sample),
  INDEX idx_patient (Patient),
  INDEX idx_parental (ParentalCluster),
  INDEX idx_grandparental (GrandparentalCluster)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 关系与联结建议：两表使用 Cell 字段进行 JOIN
-- 示例：SELECT ... FROM scRNA_umap_coordinates c JOIN scRNA_metadata m ON m.Cell=c.Cell
```

建议为 `UMAP_1` 与 `UMAP_2` 建立联合索引以加速视窗（bbox）查询：

```sql
ALTER TABLE scRNA_umap_coordinates ADD INDEX idx_umap (UMAP_1, UMAP_2);
```

> 上述结构与后端接口 `/api/scrna/umap`、`/api/scrna/metadata/filters`、`/api/scrna/export` 一一对应。
```

## 🔧 常见问题解决

### 连接失败问题
1. **检查MySQL服务状态**
   ```bash
   # Windows
   net start mysql
   
   # Linux/Mac
   sudo systemctl start mysql
   ```

2. **检查端口是否正确**
   - 默认端口：3306
   - 确认MySQL配置文件中的端口设置

3. **检查用户权限**
   ```sql
   SHOW GRANTS FOR 'cbd_user'@'localhost';
   ```

4. **检查防火墙设置**
   确保3306端口未被防火墙阻止

### 字符编码问题
确保数据库和表都使用 `utf8mb4` 编码：
```sql
ALTER DATABASE cbd_database CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 性能优化建议
1. **添加索引**（已在表结构中包含）
2. **调整MySQL配置**
   ```ini
   # my.cnf 或 my.ini
   [mysqld]
   innodb_buffer_pool_size = 256M
   max_connections = 200
   query_cache_size = 64M
   ```

## 📊 示例数据
系统会自动插入5条示例生物标记物数据，包括：
- TP53 (Protein)
- KRAS (Protein) 
- miR-21 (MicroRNA)
- CEA (Protein)
- APC (Gene)

## 🔒 安全建议
1. 使用强密码
2. 创建专用数据库用户
3. 限制用户权限
4. 定期备份数据库
5. 启用SSL连接（生产环境）

## 📝 备份与恢复
```bash
# 备份数据库
mysqldump -u cbd_user -p cbd_database > cbd_backup.sql

# 恢复数据库
mysql -u cbd_user -p cbd_database < cbd_backup.sql
```

## 🚀 生产环境配置
生产环境建议：
```env
NODE_ENV=production
DB_HOST=your_production_host
DB_USER=cbd_production_user
DB_PASSWORD=very_secure_production_password
```

---
配置完成后，重启后端服务器即可开始使用MySQL数据库！
