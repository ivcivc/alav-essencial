# Dockerfile para Backend (Node.js + Fastify + Prisma)
FROM node:22-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    dumb-init \
    openssl \
    ca-certificates

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências em ambiente de build
FROM base AS dependencies
RUN npm install --production && npm cache clean --force

# Build stage
FROM base AS build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build 2>/dev/null || echo "No build script found"

# Gerar Prisma Client
RUN npx prisma generate

# Production stage
FROM base AS production

# Copiar dependências de produção
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar código da aplicação
COPY --chown=nodejs:nodejs . .
COPY --from=build --chown=nodejs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Gerar Prisma Client para produção
RUN npx prisma generate

# Configurar usuário
USER nodejs

# Expor porta
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { \
        if (res.statusCode === 200) { process.exit(0); } else { process.exit(1); } \
    }).on('error', () => { process.exit(1); });"

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
