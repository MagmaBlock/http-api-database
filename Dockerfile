FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN sed -i 's#https\?://dl-cdn.alpinelinux.org/alpine#https://mirrors.tuna.tsinghua.edu.cn/alpine#g' /etc/apk/repositories && \
  apk update && \  
  apk add --no-cache python3 && \
  npm config set registry https://registry.npmmirror.com && \
  npm install && \
  apk del python3 && \
  apk cache clean

COPY . .

ENV NODE_ENV=production

CMD ["node", "main.js"]