# 使用轻量 Node.js slim 镜像（推荐 Node 22）
FROM node:22-slim

# 设置生产环境
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

WORKDIR /app

# 拷贝 standalone 构建产物
COPY .next/standalone ./
# 拷贝静态资源（必须放在 .next/static）
COPY .next/static ./.next/static
# 拷贝 public 文件夹（如果存在）
COPY public ./public

# 设置权限
RUN chown -R node:node /app

USER node

EXPOSE 3000

CMD ["node", "server.js"]