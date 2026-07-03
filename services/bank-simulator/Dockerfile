FROM node:20-slim AS builder

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY services/bank-simulator ./services/bank-simulator

# Install dependencies (workspaces)
RUN npm ci

# Build shared packages
RUN npx turbo run build --filter=@payment-gateway/shared-utils

# Build the bank simulator service
RUN npx turbo run build --filter=@payment-gateway/bank-simulator

FROM node:20-slim AS runner

RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/bank-simulator/package.json ./services/bank-simulator/
COPY --from=builder /app/services/bank-simulator/dist ./services/bank-simulator/dist

ENV NODE_ENV=production
ENV PORT=3003

EXPOSE 3003

CMD ["node", "services/bank-simulator/dist/index.js"]
