FROM node:22-bookworm-slim AS deps
WORKDIR /app
COPY package*.json ./
RUN npm install

FROM deps AS build
COPY . .
RUN npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=build /app/dist ./dist
COPY --from=build /app/dist-server ./dist-server
EXPOSE 8787
CMD ["node", "dist-server/server/index.js"]
