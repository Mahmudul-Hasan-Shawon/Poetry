FROM node:20-slim AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ \
  && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/package*.json server/
RUN cd server && npm ci --omit=dev
COPY server/ server/
COPY --from=client-build /app/client/dist ./client/dist
ENV NODE_ENV=production
ENV PORT=3001
VOLUME ["/app/server/db"]
EXPOSE 3001
WORKDIR /app/server
CMD ["node", "index.js"]