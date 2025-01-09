FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN apk add --no-cache python3 && \
  npm install && \
  apk del python3

COPY . .

ENV NODE_ENV=production

CMD ["node", "main.js"]