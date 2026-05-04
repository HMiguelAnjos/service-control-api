FROM node:20-slim AS builder

WORKDIR /app

# Debian slim já tem o necessário; sharp baixa prebuild de libvips automaticamente.
# openssl é exigido pelo Prisma engine.
RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --include=optional

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update -y \
 && apt-get install -y --no-install-recommends openssl ca-certificates dumb-init \
 && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
 && useradd --system --uid 1001 --gid nodejs nodeuser

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci --omit=dev --include=optional

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

RUN mkdir -p /app/uploads/client-photos \
 && chown -R nodeuser:nodejs /app/uploads

USER nodeuser

EXPOSE 3000

CMD ["dumb-init", "sh", "-c", "npx prisma db push --accept-data-loss && node dist/seed.js && node dist/main/index.js"]
