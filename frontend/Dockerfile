# Dockerfile para Frontend (React + Vite)
FROM node:22-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache \
    dumb-init \
    ca-certificates

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Build stage
FROM base AS build

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar código fonte
COPY . .

# Build da aplicação (sem verificação de tipos para deployment)
RUN npx vite build --mode production

# Production stage com Nginx
FROM nginx:alpine AS production

# Instalar dumb-init
RUN apk add --no-cache dumb-init

# Copiar arquivos build
COPY --from=build /app/dist /usr/share/nginx/html

# Copiar configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY proxy_params /etc/nginx/proxy_params

# Criar usuário nginx se não existir
RUN addgroup -g 1001 -S nginx || true
RUN adduser -S nginx -u 1001 -G nginx || true

# Configurar permissões
RUN chown -R nginx:nginx /usr/share/nginx/html
RUN chown -R nginx:nginx /var/cache/nginx
RUN chown -R nginx:nginx /var/log/nginx
RUN chown -R nginx:nginx /etc/nginx/conf.d
RUN touch /var/run/nginx.pid
RUN chown -R nginx:nginx /var/run/nginx.pid

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Mudar para usuário nginx
USER nginx

# Comando de inicialização
ENTRYPOINT ["dumb-init", "--"]
CMD ["nginx", "-g", "daemon off;"]
