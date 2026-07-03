FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install turbo
RUN npm install -g turbo

# Copy monorepo workspace files
COPY package*.json ./
COPY turbo.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/merchant-service ./services/merchant-service

# Install dependencies
RUN npm ci

# Generate Prisma Client
RUN npm run db:generate

# Build the app and its local dependencies via Turbo
RUN turbo run build --filter=@payment-gateway/merchant-service...

FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files from builder
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=builder /app/packages/database/dist ./packages/database/dist
COPY --from=builder /app/packages/shared-types/dist ./packages/shared-types/dist
COPY --from=builder /app/packages/shared-utils/dist ./packages/shared-utils/dist
COPY --from=builder /app/services/merchant-service/package.json ./services/merchant-service/
COPY --from=builder /app/services/merchant-service/dist ./services/merchant-service/dist

EXPOSE 3001

CMD ["node", "services/merchant-service/dist/index.js"]
