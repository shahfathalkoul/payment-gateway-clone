FROM node:20-alpine AS builder

WORKDIR /app

# Copy root configurations
COPY package.json package-lock.json turbo.json tsconfig.base.json ./
COPY packages ./packages
COPY services/payment-gateway ./services/payment-gateway

# Install dependencies (workspaces)
RUN npm ci

# Generate Prisma Client & Build shared packages
RUN npm run db:generate
RUN npx turbo run build --filter=@payment-gateway/shared-utils --filter=@payment-gateway/database --filter=@payment-gateway/shared-types

# Build the payment gateway service
RUN npx turbo run build --filter=@payment-gateway/payment-gateway

FROM node:20-alpine AS runner

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages ./packages
COPY --from=builder /app/services/payment-gateway/package.json ./services/payment-gateway/
COPY --from=builder /app/services/payment-gateway/dist ./services/payment-gateway/dist

ENV NODE_ENV=production
ENV PORT=3002

EXPOSE 3002

CMD ["node", "services/payment-gateway/dist/index.js"]
