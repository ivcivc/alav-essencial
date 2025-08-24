#!/bin/bash

# Script de Deploy para Clínica Essencial
# Uso: ./scripts/deploy.sh [development|production]

set -euo pipefail

ENVIRONMENT=${1:-development}
PROJECT_NAME="clinica-essencial"

echo "🚀 Iniciando deploy do Clínica Essencial (${ENVIRONMENT})"

# Função para logs coloridos
log_info() {
    echo -e "\033[36m[INFO]\033[0m $1"
}

log_success() {
    echo -e "\033[32m[SUCCESS]\033[0m $1"
}

log_warning() {
    echo -e "\033[33m[WARNING]\033[0m $1"
}

log_error() {
    echo -e "\033[31m[ERROR]\033[0m $1"
}

# Verificar se Docker está rodando
if ! docker info >/dev/null 2>&1; then
    log_error "Docker não está rodando. Inicie o Docker e tente novamente."
    exit 1
fi

# Verificar se Docker Compose está instalado
if ! command -v docker-compose >/dev/null 2>&1; then
    log_error "Docker Compose não está instalado."
    exit 1
fi

# Função para aguardar serviço ficar healthy
wait_for_health() {
    local service=$1
    local max_attempts=30
    local attempt=1
    
    log_info "Aguardando $service ficar healthy..."
    
    while [ $attempt -le $max_attempts ]; do
        if docker-compose ps $service | grep -q "healthy\|Up"; then
            log_success "$service está rodando!"
            return 0
        fi
        
        echo -n "."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    log_error "$service não ficou healthy após $((max_attempts * 5)) segundos"
    return 1
}

# Deploy para desenvolvimento
deploy_development() {
    log_info "🔧 Deploy para DESENVOLVIMENTO"
    
    # Parar containers existentes
    log_info "Parando containers existentes..."
    docker-compose down || true
    
    # Construir e iniciar serviços
    log_info "Construindo e iniciando serviços..."
    docker-compose up -d --build
    
    # Aguardar serviços ficarem prontos
    wait_for_health postgres
    wait_for_health redis
    
    # Executar migrações
    log_info "Executando migrações do banco..."
    docker-compose exec -T backend npm run db:migrate || {
        log_warning "Migrações falharam, tentando novamente..."
        sleep 10
        docker-compose exec -T backend npm run db:migrate
    }
    
    # Executar seed (opcional)
    if [ "${SEED_DB:-false}" = "true" ]; then
        log_info "Executando seed do banco..."
        docker-compose exec -T backend npm run seed || log_warning "Seed falhou, continuando..."
    fi
    
    wait_for_health backend
    wait_for_health frontend
    
    log_success "✅ Deploy de desenvolvimento concluído!"
    log_info "🌐 Frontend: http://localhost:3000"
    log_info "🔧 Backend: http://localhost:3001"
    log_info "📚 API Docs: http://localhost:3001/docs"
}

# Deploy para produção
deploy_production() {
    log_info "🏭 Deploy para PRODUÇÃO"
    
    # Verificar arquivo .env.prod
    if [ ! -f ".env.prod" ]; then
        log_error "Arquivo .env.prod não encontrado!"
        log_info "Copie env.prod.example para .env.prod e configure as variáveis."
        exit 1
    fi
    
    # Carregar variáveis do .env.prod
    log_info "Carregando variáveis do .env.prod..."
    export $(grep -v '^#' .env.prod | xargs)
    
    # Fazer backup do banco (se existir)
    if docker-compose -f docker-compose.prod.yml ps postgres | grep -q "Up"; then
        log_info "Fazendo backup do banco de dados..."
        mkdir -p backups
        docker-compose -f docker-compose.prod.yml exec -T postgres pg_dump -U ${POSTGRES_USER:-clinica_user} ${POSTGRES_DB:-clinica_essencial} > "backups/pre-deploy-$(date +%Y%m%d_%H%M%S).sql"
        log_success "Backup criado em backups/"
    fi
    
    # Parar containers existentes
    log_info "Parando containers de produção..."
    docker-compose -f docker-compose.prod.yml down || true
    
    # Construir e iniciar serviços
    log_info "Construindo e iniciando serviços de produção..."
    docker-compose -f docker-compose.prod.yml up -d --build
    
    # Aguardar serviços ficarem prontos
    wait_for_health postgres
    wait_for_health redis
    
    # Executar migrações de produção
    log_info "Executando migrações de produção..."
    docker-compose -f docker-compose.prod.yml exec -T backend npm run db:migrate:prod
    
    wait_for_health backend
    wait_for_health frontend
    wait_for_health nginx
    
    log_success "✅ Deploy de produção concluído!"
    log_info "🌐 Aplicação: http://localhost:3080"
    log_info "📊 Health Check: http://localhost:3080/api/health"
    log_info "📈 Performance: http://localhost:3080/api/performance/stats"
}

# Função para mostrar logs
show_logs() {
    local compose_file="docker-compose.yml"
    if [ "$ENVIRONMENT" = "production" ]; then
        compose_file="docker-compose.prod.yml"
    fi
    
    log_info "📋 Mostrando logs dos serviços..."
    docker-compose -f $compose_file logs -f --tail=100
}

# Função para executar testes
run_tests() {
    log_info "🧪 Executando testes..."
    
    # Testes do backend
    docker-compose exec -T backend npm run test:all || {
        log_warning "Alguns testes do backend falharam"
    }
    
    # Testes E2E (se disponível)
    if docker-compose ps frontend | grep -q "Up"; then
        docker-compose exec -T frontend npm run test:e2e || {
            log_warning "Testes E2E não disponíveis ou falharam"
        }
    fi
}

# Menu principal
case "$ENVIRONMENT" in
    "development"|"dev")
        deploy_development
        ;;
    "production"|"prod")
        deploy_production
        ;;
    "logs")
        show_logs
        ;;
    "test")
        run_tests
        ;;
    *)
        log_error "Ambiente inválido: $ENVIRONMENT"
        echo "Uso: $0 [development|production|logs|test]"
        exit 1
        ;;
esac

log_success "🎉 Script concluído com sucesso!"
