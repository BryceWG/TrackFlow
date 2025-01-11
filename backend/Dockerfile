# 使用 Node.js 官方镜像作为基础镜像
FROM node:18-alpine

# 安装必要的工具
RUN apk add --no-cache curl

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码和配置文件
COPY . .

# 构建应用
RUN npm run build

# 健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:${PORT}/api/health || exit 1

# 暴露端口
EXPOSE ${PORT}

# 启动应用
CMD ["sh", "-c", "node dist/index.js"] 