# Spine Advisory API. Build from the repository root:  docker build -f backend/Dockerfile .
FROM node:24-alpine
WORKDIR /app/backend
ENV NODE_ENV=production
COPY backend/package.json backend/package-lock.json ./
# Dev dependencies are kept for the one-off content seed (tsx); the server runs compiled JavaScript.
RUN npm ci --include=dev && npm cache clean --force
COPY backend/ ./
COPY database/ /app/database/
RUN npm run build && mkdir -p uploads/public uploads/private && chown -R node:node /app
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://127.0.0.1:4000/api/health || exit 1
CMD ["node", "dist/server.js"]
