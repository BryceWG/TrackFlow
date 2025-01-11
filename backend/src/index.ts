import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import userRoutes from './routes/user';
import { setupAdmin } from './init/setupAdmin';

// 加载环境变量
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}));
app.use(express.json());

// 路由
app.use('/api', userRoutes);

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    dbStatus: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// 错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: '服务器错误' });
});

// MongoDB 连接选项
const mongooseOptions = {
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
  maxPoolSize: 50,
  minPoolSize: 10,
};

// 连接数据库并启动服务器
const connectWithRetry = async () => {
  const maxRetries = 5;
  let retries = 0;
  let server: any;

  // 处理进程终止信号
  const gracefulShutdown = async () => {
    console.log('正在关闭应用...');
    if (server) {
      server.close(() => {
        console.log('HTTP 服务器已关闭');
      });
    }
    try {
      await mongoose.connection.close();
      console.log('数据库连接已关闭');
      process.exit(0);
    } catch (err) {
      console.error('关闭数据库连接时出错:', err);
      process.exit(1);
    }
  };

  process.on('SIGTERM', gracefulShutdown);
  process.on('SIGINT', gracefulShutdown);

  // MongoDB 连接事件处理
  mongoose.connection.on('connected', () => {
    console.log('Mongoose 已连接');
  });

  mongoose.connection.on('error', (err) => {
    console.error('Mongoose 连接错误:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose 连接断开');
  });

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/trackflow', mongooseOptions);
      console.log('成功连接到 MongoDB');
      
      // 初始化管理员用户
      await setupAdmin();
      
      // 启动服务器
      server = app.listen(port, () => {
        console.log(`服务器运行在端口 ${port}`);
      });
      
      break;
    } catch (error) {
      retries += 1;
      console.error(`MongoDB 连接失败 (${retries}/${maxRetries}):`, error);
      if (retries === maxRetries) {
        console.error('无法连接到 MongoDB，服务器启动失败');
        process.exit(1);
      }
      // 等待 5 秒后重试
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

connectWithRetry(); 