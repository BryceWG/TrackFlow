#!/bin/bash

# 检查是否已存在 .env 文件
if [ -f .env ]; then
    read -p ".env 文件已存在，是否要覆盖？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "操作已取消"
        exit 1
    fi
fi

# 生成随机 JWT 密钥
JWT_SECRET=$(openssl rand -base64 32)

# 创建 .env 文件
cat > .env << EOL
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
MONGODB_URI=mongodb://mongodb:27017/trackflow

# JWT 配置
JWT_SECRET=$JWT_SECRET
JWT_EXPIRES_IN=7d

# 前端配置
VITE_PORT=2455
VITE_API_URL=http://localhost:3000/api

# CORS 配置
CORS_ORIGIN=http://localhost:2455

# 日志配置
LOG_LEVEL=info

# Docker 配置
DOCKER_FRONTEND_PORT=2455
DOCKER_BACKEND_PORT=3000
DOCKER_MONGODB_PORT=27017
EOL

echo ".env 文件已创建成功！"
echo "请根据需要修改配置值。" 