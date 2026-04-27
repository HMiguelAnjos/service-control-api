# ─────────────────────────────────────────────
# Estágio 1: build
# ─────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npx prisma generate && npm run build

# ─────────────────────────────────────────────
# Estágio 2: produção (mínima)
# ─────────────────────────────────────────────
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Usuário não-root
RUN addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nodeuser

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist                 ./dist

RUN npx prisma generate

# Cria diretório de uploads com permissão para o usuário não-root
RUN mkdir -p /app/uploads/client-photos \
 && chown -R nodeuser:nodejs /app/uploads

USER nodeuser

EXPOSE 3000

# Aplica migrations pendentes e sobe o servidor
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main/index.js"]
