const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// 中间件配置
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

// 请求日志
app.use(morgan('combined'));

// 请求体解析
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15分钟
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // 限制每个IP 100个请求
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use('/api/', limiter);

// 静态文件服务
app.use('/uploads', express.static('uploads'));

// 路由配置
app.use('/api/biomarkers', require('./routes/biomarkers'));
app.use('/api/search', require('./routes/search'));
app.use('/api/submission', require('./routes/submission'));
app.use('/api/download', require('./routes/download'));
app.use('/api/explore', require('./routes/explore'));
app.use('/api/stats', require('./routes/stats'));

// 健康检查端点
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  // 数据库错误
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      error: 'Duplicate entry',
      message: 'This record already exists'
    });
  }
  
  // 验证错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation failed',
      details: err.details
    });
  }
  
  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: 'Invalid token'
    });
  }
  
  // 默认错误
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 CBD Backend Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 CORS Origin: ${process.env.CORS_ORIGIN}`);
  console.log(`📝 API Documentation: http://localhost:${PORT}/api/health`);
});

module.exports = app;