const mysql = require('mysql2/promise');
const path = require('path');
// 优先加载 .env.local（本地开发），回退到 .env（服务器）
// override: true 确保 .env.local 的值覆盖 .env 中同名变量
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local'), override: true });
require('dotenv').config(); // .env.local 中未定义的变量从 .env 兜底

// MySQL连接配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'cbd_database',
  charset: 'utf8mb4',
  timezone: '+08:00',
  connectionLimit: 10,
  queueLimit: 0,
  connectTimeout: 30000,
  waitForConnections: true
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 数据库连接测试
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    return true;
  } catch (error) {
    return false;
  }
};

// 执行查询 - 返回多行结果
const query = async (sql, params = []) => {
  try {
    const [rows] = await pool.execute(sql, params);
    return rows;
  } catch (error) {
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
    throw error;
  }
};

// 初始化数据库表结构
const initializeTables = async () => {
  try {
    console.log('🔧 开始初始化数据库表结构...');

    // 创建生物标记物表
    await run(`
      CREATE TABLE IF NOT EXISTS biomarker (
        ID INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
        Title TEXT,
        Authors TEXT,
        First_Author TEXT,
        Year INT,
        Abstract TEXT,
        Keywords TEXT,
        PMID VARCHAR(15),
        DOI VARCHAR(100),
        PMC VARCHAR(50),
        Journal VARCHAR(255),
        Biomarker TEXT,
        Type VARCHAR(50),
        Category VARCHAR(50),
        Symbol VARCHAR(10),
        Description TEXT,
        Region TEXT,
        Race TEXT,
        Number TEXT,
        Male TEXT,
        Female TEXT,
        Gender_M_F TEXT,
        Age_Mean TEXT,
        Age TEXT,
        Location TEXT,
        Stage TEXT,
        Source TEXT,
        Experiment TEXT,
        Statistics TEXT,
        Application TEXT,
        Conclusion TEXT,
        Clinical_Use VARCHAR(5),
        Target VARCHAR(5),
        Drugs TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_biomarker (Biomarker(255)),
        INDEX idx_category (Category),
        INDEX idx_year (Year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
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

    // 单细胞分析相关表
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_degs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cell_type VARCHAR(100),
        gene VARCHAR(100),
        logFC DOUBLE,
        pval_adj DOUBLE,
        neg_log10_padj DOUBLE,
        INDEX idx_degs_cell_gene (cell_type, gene),
        INDEX idx_degs_padj (pval_adj),
        INDEX idx_degs_neglog (neg_log10_padj)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS analysis_kegg (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cell_type VARCHAR(100),
        source_type VARCHAR(100),
        description VARCHAR(255),
        p_adjust DOUBLE,
        fold_enrichment DOUBLE,
        gene_ids TEXT,
        INDEX idx_kegg_cell_source (cell_type, source_type),
        INDEX idx_kegg_padj (p_adjust),
        INDEX idx_kegg_fold (fold_enrichment)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS analysis_ridge (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cell_type VARCHAR(100),
        gene VARCHAR(100),
        auc DOUBLE,
        p_value DOUBLE,
        INDEX idx_ridge_cell_gene (cell_type, gene),
        INDEX idx_ridge_auc (auc),
        INDEX idx_ridge_p (p_value)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS analysis_trajectory_files (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cell_type VARCHAR(100),
        gene VARCHAR(100),
        file_path VARCHAR(255),
        plot_type VARCHAR(100),
        UNIQUE KEY uniq_file_path (file_path),
        INDEX idx_traj_cell_gene (cell_type, gene),
        INDEX idx_traj_plot (plot_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS analysis_cellchat (
        id INT AUTO_INCREMENT PRIMARY KEY,
        source VARCHAR(100),
        target VARCHAR(100),
        ligand VARCHAR(100),
        receptor VARCHAR(100),
        prob DOUBLE,
        pval DOUBLE,
        pathway_name VARCHAR(255),
        INDEX idx_cellchat_src_tgt (source, target),
        INDEX idx_cellchat_pathway (pathway_name),
        INDEX idx_cellchat_prob (prob)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // 临床相关表
    await run(`
      CREATE TABLE IF NOT EXISTS clinical_diagnosis (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gene VARCHAR(100),
        auc DOUBLE,
        label VARCHAR(100),
        INDEX idx_diag_gene_label (gene, label),
        INDEX idx_diag_auc (auc)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS clinical_survival (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gene VARCHAR(100),
        surv_type VARCHAR(50),
        surv_pvalue DOUBLE,
        INDEX idx_surv_gene_type (gene, surv_type),
        INDEX idx_surv_p (surv_pvalue)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    await run(`
      CREATE TABLE IF NOT EXISTS clinical_immune (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gene VARCHAR(100),
        immune_cell VARCHAR(100),
        r2 DOUBLE,
        p_value DOUBLE,
        INDEX idx_immune_gene_cell (gene, immune_cell),
        INDEX idx_immune_r2 (r2),
        INDEX idx_immune_p (p_value)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // ========== 新增：CBD3 扩展数据表 ==========

    // 差异表达 - 按细胞类型
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_gene_diff_celltype (
        id INT AUTO_INCREMENT PRIMARY KEY,
        p_val DOUBLE,
        avg_log2FC DOUBLE,
        pct_1 DOUBLE,
        pct_2 DOUBLE,
        p_val_adj DOUBLE,
        celltype VARCHAR(100),
        gene VARCHAR(100),
        INDEX idx_ct_gene (celltype, gene),
        INDEX idx_padj (p_val_adj),
        INDEX idx_logfc (avg_log2FC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // 差异表达 - Tumor vs Normal
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_gene_diff_TvsN (
        id INT AUTO_INCREMENT PRIMARY KEY,
        p_val DOUBLE,
        avg_log2FC DOUBLE,
        pct_1 DOUBLE,
        pct_2 DOUBLE,
        p_val_adj DOUBLE,
        gene VARCHAR(100),
        celltype VARCHAR(100),
        \`condition\` VARCHAR(50),
        INDEX idx_ct_gene (celltype, gene),
        INDEX idx_padj (p_val_adj),
        INDEX idx_logfc (avg_log2FC)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // ROC - T/N 预测
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_roc_tn (
        id INT AUTO_INCREMENT PRIMARY KEY,
        celltype VARCHAR(100),
        gene VARCHAR(100),
        auc DOUBLE,
        p_value DOUBLE,
        direction VARCHAR(50),
        roc_label VARCHAR(50),
        INDEX idx_ct_gene (celltype, gene),
        INDEX idx_auc (auc)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // ROC - 细胞类型预测
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_roc_celltype (
        id INT AUTO_INCREMENT PRIMARY KEY,
        celltype VARCHAR(100),
        gene VARCHAR(100),
        auc DOUBLE,
        p_value DOUBLE,
        direction VARCHAR(50),
        roc_label VARCHAR(50),
        INDEX idx_ct_gene (celltype, gene),
        INDEX idx_auc (auc)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // 基因表达汇总（Dotplot 数据）
    await run(`
      CREATE TABLE IF NOT EXISTS scrna_gene_expr_summary (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gene VARCHAR(100),
        cell_type VARCHAR(100),
        avg_exp DOUBLE,
        pct_exp DOUBLE,
        INDEX idx_gene_ct (gene, cell_type)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // 基因表达（稀疏存储，仅非零值）
    await run(`
      CREATE TABLE IF NOT EXISTS scrna_gene_expr (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gene VARCHAR(100) NOT NULL,
        cell VARCHAR(100) NOT NULL,
        expr DOUBLE NOT NULL,
        INDEX idx_gene (gene),
        INDEX idx_gene_cell (gene, cell)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // 拟时序轨迹
    await run(`
      CREATE TABLE IF NOT EXISTS scrna_pseudotime (
        id INT AUTO_INCREMENT PRIMARY KEY,
        cell_type VARCHAR(100),
        cell_id VARCHAR(200),
        pseudotime DOUBLE,
        state INT,
        INDEX idx_pt_ct (cell_type),
        INDEX idx_pt_cell (cell_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // 拟时序基因表达（仅 dual-specific 基因）
    await run(`
      CREATE TABLE IF NOT EXISTS scrna_pseudotime_gene_expr (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        cell_type VARCHAR(100),
        gene VARCHAR(100),
        cell_id VARCHAR(200),
        expr DOUBLE,
        INDEX idx_pge_ct_gene (cell_type, gene),
        INDEX idx_pge_gene (gene),
        INDEX idx_pge_cell (cell_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // Biomarker CellChat 通讯
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_biomk_cellchat (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gene VARCHAR(100),
        biomark_as VARCHAR(20),
        source VARCHAR(100),
        target VARCHAR(100),
        ligand VARCHAR(100),
        receptor VARCHAR(100),
        pathway_name VARCHAR(255),
        prob DOUBLE,
        pval DOUBLE,
        interaction_name VARCHAR(255),
        INDEX idx_gene (gene),
        INDEX idx_as (biomark_as),
        INDEX idx_src_tgt (source, target),
        INDEX idx_pathway (pathway_name(50))
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // PPI 网络拓扑
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_network_ppi (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gene VARCHAR(100),
        celltype VARCHAR(100),
        degree DOUBLE,
        betweenness DOUBLE,
        closeness DOUBLE,
        avg_shortest_path DOUBLE,
        INDEX idx_ct_gene (celltype, gene)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // PRS 敏感性
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_network_prs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        gene VARCHAR(100),
        celltype VARCHAR(100),
        deg DOUBLE,
        eff DOUBLE,
        sens DOUBLE,
        trans DOUBLE,
        eigenvec_centr DOUBLE,
        closeness_centr DOUBLE,
        INDEX idx_ct (celltype),
        INDEX idx_gene (gene),
        INDEX idx_sens (sens)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
    `);

    // PPI 边数据
    await run(`
      CREATE TABLE IF NOT EXISTS analysis_ppi_edge (
        id INT AUTO_INCREMENT PRIMARY KEY,
        node1 VARCHAR(100),
        node2 VARCHAR(100),
        combined_score DOUBLE,
        INDEX idx_node1 (node1),
        INDEX idx_node2 (node2)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=COMPRESSED KEY_BLOCK_SIZE=8
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
    const existingData = await get('SELECT COUNT(*) as count FROM biomarker');
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

    for (const b of sampleBiomarkers) {
      await run(`
        INSERT INTO biomarker (
          Biomarker, Category, Application, Location, Source, Description,
          First_Author, Journal, Year, PMID, Region, Stage
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        b.name, b.category, b.application,
        b.location, b.source, b.description,
        b.first_author, b.journal, b.publication_year,
        b.pmid, b.region, b.stage
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
