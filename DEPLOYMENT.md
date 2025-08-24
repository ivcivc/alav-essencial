# 🚀 **GUIA DE DEPLOYMENT - CLÍNICA ESSENCIAL**

## 📋 **PRÉ-REQUISITOS**

### **Sistema:**
- **Docker** 20.10+ 
- **Docker Compose** 2.0+
- **Git**
- **4GB RAM** mínimo (8GB recomendado)
- **10GB** espaço em disco

### **Portas necessárias:**
- **80** - Frontend/Nginx (produção)
- **3000** - Frontend (desenvolvimento)
- **3001** - Backend API
- **5432** - PostgreSQL
- **6379** - Redis (opcional)

---

## 🔧 **DEPLOYMENT DE DESENVOLVIMENTO**

### **1. Clone e Configure:**
```bash
git clone <seu-repositorio>
cd alav-essencial

# Copiar arquivo de exemplo
cp backend/.env.example backend/.env
```

### **2. Deploy Automático:**
```bash
# Executar script de deploy
./scripts/deploy.sh development

# Ou manualmente:
docker-compose up -d --build
```

### **3. Configurar Banco (primeira vez):**
```bash
# Migrações
docker-compose exec backend npm run db:migrate

# Seed inicial (usuário admin)
docker-compose exec backend npm run seed:admin
```

### **4. Acessar Aplicação:**
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **API Docs**: http://localhost:3001/docs
- **Health Check**: http://localhost:3001/health

---

## 🏭 **DEPLOYMENT DE PRODUÇÃO**

### **1. Configurar Variáveis de Ambiente:**
```bash
# Copiar template
cp env.prod.example .env.prod

# Editar com dados reais
nano .env.prod
```

### **2. Configurações Obrigatórias:**
```bash
# Gerar JWT Secret seguro
openssl rand -base64 32

# Configurar banco de dados
POSTGRES_USER=clinica_user
POSTGRES_PASSWORD=SuaSenhaSegura123!
POSTGRES_DB=clinica_essencial

# Configurar domínio
CORS_ORIGIN=https://sua-clinica.com.br
```

### **3. Deploy de Produção:**
```bash
# Deploy completo
./scripts/deploy.sh production

# Ou manualmente:
docker-compose -f docker-compose.prod.yml up -d --build
```

### **4. Configurar SSL (HTTPS):**
```bash
# Criar diretório para certificados
mkdir -p nginx/ssl

# Copiar certificados (Let's Encrypt, etc.)
cp fullchain.pem nginx/ssl/
cp privkey.pem nginx/ssl/

# Descomentar linhas SSL no nginx/conf.d/default.conf
```

### **5. Verificar Deploy:**
```bash
# Status dos serviços
docker-compose -f docker-compose.prod.yml ps

# Logs em tempo real
docker-compose -f docker-compose.prod.yml logs -f

# Health check
curl http://localhost/api/health
```

---

## 📊 **MONITORAMENTO E MANUTENÇÃO**

### **Health Checks:**
```bash
# Status geral
curl http://localhost/api/health

# Performance stats
curl http://localhost/api/performance/stats

# Status dos containers
docker-compose ps
```

### **Logs:**
```bash
# Logs de todos os serviços
./scripts/deploy.sh logs

# Logs específicos
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f nginx
```

### **Backup Automático:**
```bash
# Backup manual
docker-compose exec postgres pg_dump -U clinica_user clinica_essencial > backup.sql

# Backup automático está configurado no docker-compose.prod.yml
# Executa diariamente e mantém 7 dias de histórico
```

### **Atualizações:**
```bash
# Fazer backup antes
./scripts/deploy.sh production

# Pull do código mais recente
git pull origin main

# Rebuild e deploy
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 🔒 **CONFIGURAÇÕES DE SEGURANÇA**

### **1. Firewall (exemplo UFW):**
```bash
# Permitir apenas portas necessárias
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### **2. SSL/TLS (Let's Encrypt):**
```bash
# Instalar Certbot
apt install certbot python3-certbot-nginx

# Obter certificado
certbot --nginx -d sua-clinica.com.br

# Renovação automática
certbot renew --dry-run
```

### **3. Backup Seguro:**
```bash
# Configurar backup para AWS S3 (opcional)
# Editar variáveis no .env.prod:
BACKUP_S3_BUCKET=clinica-essencial-backups
BACKUP_S3_ACCESS_KEY=sua_access_key
BACKUP_S3_SECRET_KEY=sua_secret_key
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema: Containers não sobem**
```bash
# Verificar logs
docker-compose logs

# Verificar recursos
docker system df
docker system prune -f

# Rebuild completo
docker-compose down -v
docker-compose up -d --build
```

### **Problema: Banco de dados não conecta**
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do banco
docker-compose logs postgres

# Testar conexão manual
docker-compose exec postgres psql -U clinica_user -d clinica_essencial
```

### **Problema: Frontend não carrega**
```bash
# Verificar build do frontend
docker-compose logs frontend

# Verificar nginx
docker-compose logs nginx

# Rebuild apenas frontend
docker-compose up -d --build frontend
```

### **Problema: API não responde**
```bash
# Verificar logs do backend
docker-compose logs backend

# Testar health check
curl http://localhost:3001/health

# Verificar migrações
docker-compose exec backend npm run db:migrate
```

---

## 📈 **OTIMIZAÇÕES DE PERFORMANCE**

### **Monitoramento:**
- **Cache Redis**: Ativo automaticamente se disponível
- **Rate Limiting**: 100 req/min por usuário
- **Compressão**: Gzip/Brotli automático
- **Health Checks**: Endpoints `/health` e `/performance/stats`

### **Recursos Recomendados:**
- **Servidor**: 2 CPU, 4GB RAM mínimo
- **Banco**: SSD recomendado
- **Redis**: 256MB RAM alocado
- **Backup**: Espaço adicional para backups

### **Scaling Horizontal:**
```bash
# Aumentar réplicas do backend
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Load balancer no nginx.conf (configurar upstream)
```

---

## 🔧 **COMANDOS ÚTEIS**

### **Desenvolvimento:**
```bash
./scripts/deploy.sh development  # Deploy completo
./scripts/deploy.sh logs         # Ver logs
./scripts/deploy.sh test         # Executar testes
```

### **Produção:**
```bash
./scripts/deploy.sh production   # Deploy produção
docker-compose -f docker-compose.prod.yml down  # Parar
docker-compose -f docker-compose.prod.yml up -d # Iniciar
```

### **Banco de Dados:**
```bash
# Acessar banco
docker-compose exec postgres psql -U clinica_user -d clinica_essencial

# Backup
docker-compose exec postgres pg_dump -U clinica_user clinica_essencial > backup.sql

# Restore
docker-compose exec -T postgres psql -U clinica_user -d clinica_essencial < backup.sql
```

---

## 📞 **SUPORTE**

Para problemas durante o deployment:

1. **Verificar logs** com `./scripts/deploy.sh logs`
2. **Consultar troubleshooting** acima
3. **Verificar resources** do sistema
4. **Fazer backup** antes de mudanças grandes

**Status do Sistema sempre disponível em:** `/api/health`

---

## ✅ **CHECKLIST DE PRODUÇÃO**

- [ ] Variáveis de ambiente configuradas (`.env.prod`)
- [ ] JWT Secret gerado com segurança
- [ ] Domínio e DNS configurados
- [ ] SSL/HTTPS configurado (certificados)
- [ ] Firewall configurado
- [ ] Backup automático ativo
- [ ] Monitoramento configurado
- [ ] Health checks funcionando
- [ ] Testes E2E executados
- [ ] Load testing realizado
- [ ] Documentação da API atualizada

🎉 **Sistema pronto para produção!**