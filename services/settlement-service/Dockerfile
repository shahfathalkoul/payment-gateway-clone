FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY services/settlement-service ./services/settlement-service

# Install dependencies (workspaces)
RUN npm ci

# Build shared packages
RUN npx turbo run build --filter=@payment-gateway/shared-utils
RUN npx turbo run build --filter=@payment-gateway/database

# Build the settlement service
RUN npx turbo run build --filter=@payment-gateway/settlement-service

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/settlement-service/package.json ./services/settlement-service/
COPY --from=builder /app/services/settlement-service/dist ./services/settlement-service/dist

ENV NODE_ENV=production
ENV PORT=3004

EXPOSE 3004

CMD ["node", "services/settlement-service/dist/index.js"]
