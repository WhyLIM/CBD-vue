const mysql = require('mysql2/promise');
require('dotenv').config();

// MySQL连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cbd_database',
  charset: 'utf8mb4',
  timezone: '+08:00',
  reconnect: true,
  connectionLimit: 10,
  queueLimit: 0
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 数据库连接测试
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL数据库连接成功');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL数据库连接失败:', error.message);
    return false;
  }
};

// 执行查询 - 返回多行结果
const query = async (sql, params = []) => {
  try {
    console.log('执行SQL查询:', sql);
    console.log('查询参数:', params);
    const [rows] = await pool.execute(sql, params);
    console.log('查询结果行数:', rows?.length || 0);
    return rows;
  } catch (error) {
    console.error('数据库查询错误:', error);
    console.error('SQL语句:', sql);
    console.error('参数:', params);
    throw error;
  }
};

// 执行查询 - 返回单行结果
const get = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows[0] || null;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
};

// 执行插入/更新/删除操作
const run = async (sql, params = []) => {
  try {
    const [result] = await pool.execute(sql, params);
    return result;
  } catch (error) {
    console.error('数据库执行错误:', error);
    throw error;
  }
};

// 初始化数据库表结构
const initializeTables = async () => {
  try {
    console.log('🔧 开始初始化数据库表结构...');

    // 创建生物标记物表
    await run(`
      CREATE TABLE IF NOT EXISTS biomarkers (
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_name (name),
        INDEX idx_category (category),
        INDEX idx_year (publication_year),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='生物标记物表'
    `);

    // 创建数据提交表
    await run(`
      CREATE TABLE IF NOT EXISTS submissions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        biomarker_name VARCHAR(255) NOT NULL COMMENT '生物标记物名称',
        category VARCHAR(100) NOT NULL COMMENT '分类',
        application TEXT COMMENT '应用',
        location VARCHAR(255) COMMENT '位置',
        source VARCHAR(100) COMMENT '来源',
        description TEXT COMMENT '描述',
        first_author VARCHAR(255) COMMENT '第一作者',
        journal VARCHAR(255) COMMENT '期刊',
        publication_year INT COMMENT '发表年份',
        pmid VARCHAR(50) COMMENT 'PubMed ID',
        submitter_name VARCHAR(255) COMMENT '提交者姓名',
        submitter_email VARCHAR(255) COMMENT '提交者邮箱',
        submitter_institution VARCHAR(255) COMMENT '提交者机构',
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending' COMMENT '状态',
        admin_notes TEXT COMMENT '管理员备注',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_status (status),
        INDEX idx_created (created_at),
        INDEX idx_submitter_email (submitter_email)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='数据提交表'
    `);

    // 创建下载记录表
    await run(`
      CREATE TABLE IF NOT EXISTS download_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        download_type ENUM('full', 'custom') NOT NULL COMMENT '下载类型',
        file_name VARCHAR(255) NOT NULL COMMENT '文件名',
        file_size BIGINT COMMENT '文件大小(字节)',
        download_count INT DEFAULT 1 COMMENT '下载次数',
        ip_address VARCHAR(45) COMMENT 'IP地址',
        user_agent TEXT COMMENT '用户代理',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_type (download_type),
        INDEX idx_created (created_at),
        INDEX idx_ip (ip_address)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='下载记录表'
    `);

    // 创建搜索历史表
    await run(`
      CREATE TABLE IF NOT EXISTS search_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        search_query TEXT NOT NULL COMMENT '搜索查询',
        search_type ENUM('basic', 'advanced') DEFAULT 'basic' COMMENT '搜索类型',
        filters JSON COMMENT '筛选条件',
        result_count INT DEFAULT 0 COMMENT '结果数量',
        ip_address VARCHAR(45) COMMENT 'IP地址',
        user_agent TEXT COMMENT '用户代理',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        INDEX idx_type (search_type),
        INDEX idx_created (created_at),
        INDEX idx_ip (ip_address)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='搜索历史表'
    `);

    // 创建系统配置表
    await run(`
      CREATE TABLE IF NOT EXISTS system_config (
        id INT AUTO_INCREMENT PRIMARY KEY,
        config_key VARCHAR(100) NOT NULL UNIQUE COMMENT '配置键',
        config_value TEXT COMMENT '配置值',
        description TEXT COMMENT '描述',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
        INDEX idx_key (config_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表'
    `);

    console.log('✅ 数据库表结构初始化成功');
    return true;
  } catch (error) {
    console.error('❌ 数据库表初始化失败:', error);
    throw error;
  }
};

// 插入示例数据
const insertSampleData = async () => {
  try {
    console.log('📊 开始插入示例数据...');

    // 检查是否已有数据
    const existingData = await get('SELECT COUNT(*) as count FROM biomarkers');
    if (existingData && existingData.count > 0) {
      console.log('📋 数据库中已存在数据，跳过示例数据插入');
      return true;
    }

    // 插入示例生物标记物数据
    const sampleBiomarkers = [
      {
        name: 'TP53',
        category: 'Protein',
        application: 'Diagnosis, Prognosis',
        location: 'Colon, Rectum',
        source: 'Tissue',
        description: 'Tumor suppressor protein p53 is a key regulator of cell cycle and apoptosis in colorectal cancer.',
        first_author: 'Smith',
        journal: 'Nature Genetics',
        publication_year: 2020,
        pmid: '12345678',
        region: 'Asia',
        stage: 'Stage II-III'
      },
      {
        name: 'KRAS',
        category: 'Protein',
        application: 'Diagnosis, Treatment Response',
        location: 'Colon',
        source: 'Blood',
        description: 'KRAS is a proto-oncogene that encodes a small GTPase involved in cellular signaling pathways.',
        first_author: 'Johnson',
        journal: 'Cell',
        publication_year: 2021,
        pmid: '23456789',
        region: 'Europe',
        stage: 'Stage I-IV'
      },
      {
        name: 'miR-21',
        category: 'MicroRNA',
        application: 'Prognosis, Treatment Response',
        location: 'Colon, Rectum',
        source: 'Serum',
        description: 'MicroRNA-21 is frequently overexpressed in colorectal cancer and associated with poor prognosis.',
        first_author: 'Brown',
        journal: 'Cancer Research',
        publication_year: 2022,
        pmid: '34567890',
        region: 'North America',
        stage: 'Stage II-IV'
      },
      {
        name: 'CEA',
        category: 'Protein',
        application: 'Diagnosis, Monitoring',
        location: 'Colon, Rectum',
        source: 'Serum',
        description: 'Carcinoembryonic antigen is a glycoprotein involved in cell adhesion and is elevated in colorectal cancer.',
        first_author: 'Davis',
        journal: 'Clinical Chemistry',
        publication_year: 2019,
        pmid: '45678901',
        region: 'Global',
        stage: 'Stage I-IV'
      },
      {
        name: 'APC',
        category: 'Gene',
        application: 'Diagnosis, Risk Assessment',
        location: 'Colon, Rectum',
        source: 'Tissue',
        description: 'Adenomatous polyposis coli gene mutations are found in most colorectal cancers.',
        first_author: 'Wilson',
        journal: 'Nature Medicine',
        publication_year: 2023,
        pmid: '56789012',
        region: 'Global',
        stage: 'Stage I-III'
      }
    ];

    for (const biomarker of sampleBiomarkers) {
      await run(`
        INSERT INTO biomarkers (
          name, category, application, location, source, description,
          first_author, journal, publication_year, pmid, region, stage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        biomarker.name, biomarker.category, biomarker.application,
        biomarker.location, biomarker.source, biomarker.description,
        biomarker.first_author, biomarker.journal, biomarker.publication_year,
        biomarker.pmid, biomarker.region, biomarker.stage
      ]);
    }

    // 插入系统配置数据
    const systemConfigs = [
      { key: 'site_title', value: 'CBD2 - Colorectal Cancer Biomarker Database', description: '网站标题' },
      { key: 'site_description', value: 'A comprehensive database for colorectal cancer biomarkers', description: '网站描述' },
      { key: 'contact_email', value: 'admin@cbd2.com', description: '联系邮箱' },
      { key: 'last_update', value: new Date().toISOString().split('T')[0], description: '最后更新日期' }
    ];

    for (const config of systemConfigs) {
      await run(`
        INSERT INTO system_config (config_key, config_value, description)
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE
        config_value = VALUES(config_value),
        updated_at = CURRENT_TIMESTAMP
      `, [config.key, config.value, config.description]);
    }

    console.log('✅ 示例数据插入成功');
    return true;
  } catch (error) {
    console.error('❌ 示例数据插入失败:', error);
    throw error;
  }
};

// 关闭数据库连接池
const closePool = async () => {
  try {
    await pool.end();
    console.log('✅ MySQL连接池已关闭');
  } catch (error) {
    console.error('❌ 关闭MySQL连接池失败:', error);
  }
};

// 导出函数
module.exports = {
  pool,
  testConnection,
  query,
  get,
  run,
  initializeTables,
  insertSampleData,
  closePool
};