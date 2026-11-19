# Spine Advisory website (Angular SSR). Build from the repository root:  docker build -f frontend/Dockerfile .
FROM node:24-alpine AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=4200
COPY --from=build /app/package.json /app/package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=build /app/dist ./dist
USER node
EXPOSE 4200
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:4200/healthz || exit 1
CMD ["node", "dist/frontend/server/server.mjs"]
