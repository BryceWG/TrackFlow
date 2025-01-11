#!/bin/bash

# 确保脚本在出错时停止执行
set -e

echo "开始部署 TrackFlow 应用..."

# 更新系统包
echo "更新系统包..."
sudo apt-get update
sudo apt-get upgrade -y

# 安装必要的软件
echo "安装必要的软件..."
sudo apt-get install -y nginx mongodb nodejs npm

# 安装 PM2
echo "安装 PM2..."
sudo npm install -g pm2

# 创建应用目录
echo "创建应用目录..."
sudo mkdir -p /var/www/trackflow
sudo chown -R $USER:$USER /var/www/trackflow

# 构建前端
echo "构建前端..."
cd frontend
npm install
npm run build
sudo cp -r dist/* /var/www/trackflow/

# 构建后端
echo "构建后端..."
cd ../backend
npm install
npm run build

# 配置 PM2
echo "配置 PM2..."
pm2 delete trackflow-backend || true
pm2 start dist/index.js --name trackflow-backend

pm2 save
pm2 startup

echo "部署完成！"
echo "请确保："
echo "1. 已经将域名解析指向服务器IP"
echo "2. 已经配置了 SSL 证书（如果需要 HTTPS）"
echo "3. 已经正确设置了环境变量（backend/.env）"
echo "4. 已经正确配置了防火墙，开放了80和443端口" 