# 1단계: Vite 빌드
FROM node:22-alpine AS build

WORKDIR /app

# 의존성 레이어를 먼저 캐시한다
COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

# 2단계: nginx가 빌드 산출물을 서빙하고 /api를 백엔드로 프록시한다.
# dev 서버의 server.proxy는 개발 전용이므로 운영에서는 nginx가 그 역할을 한다.
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
