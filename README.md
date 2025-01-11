# TrackFlow

一个简单而强大的时间跟踪应用。

## 环境要求

- Node.js 18+
- Docker 和 Docker Compose
- MongoDB（如果不使用 Docker）

## 快速开始

1. 初始化环境变量：

```bash
# Linux/macOS
chmod +x init-env.sh
./init-env.sh

# Windows
# 复制 .env.example 为 .env 并根据需要修改
```

2. 使用 Docker Compose 启动服务：

```bash
docker-compose up -d
```

3. 访问应用：
- 前端：http://localhost:2455
- 后端 API：http://localhost:3000
- MongoDB：localhost:27017

## 环境变量说明

所有配置都集中在根目录的 `.env` 文件中：

- `PORT`: 后端服务端口
- `NODE_ENV`: 运行环境（development/production）
- `MONGODB_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 密钥
- `JWT_EXPIRES_IN`: JWT 过期时间
- `VITE_PORT`: 前端开发服务器端口
- `VITE_API_URL`: 后端 API 地址
- `CORS_ORIGIN`: 允许的跨域来源
- `LOG_LEVEL`: 日志级别
- `DOCKER_*`: Docker 相关端口配置

## 开发说明

1. 本地开发模式：

```bash
# 后端开发
cd backend
npm install
npm run dev

# 前端开发
cd frontend
npm install
npm run dev
```

2. 生产环境部署：

```bash
# 使用 Docker Compose
docker-compose up -d

# 或手动构建
docker-compose build
docker-compose up -d
```

## 默认管理员账户

- 用户名：admin
- 密码：admin123

首次登录后请及时修改密码。

## 许可证

MIT 