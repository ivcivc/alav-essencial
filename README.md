# Clínica Essencial

Sistema abrangente de gestão para clínicas médicas, desenvolvido com React 19, Fastify, TypeScript e PostgreSQL.

## Funcionalidades

- 🏥 Gestão completa de pacientes
- 👨‍⚕️ Gestão de parceiros/profissionais
- 📅 Sistema de agendamentos
- 🏢 Gestão de salas e recursos
- 📦 Catálogo de produtos e serviços
- 💰 Módulo financeiro completo
- 📊 Dashboard e relatórios
- 🌙 Tema claro/escuro
- 📱 Interface responsiva

## Stack Tecnológico

### Frontend
- React 19
- Vite
- Tailwind CSS 4
- shadcn/ui
- TypeScript
- React Router
- Zustand
- React Query

### Backend
- Node.js
- Fastify
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd clinica-essencial
```

2. Instale as dependências:
```bash
npm run install:all
```

3. Configure as variáveis de ambiente:
```bash
# Backend (.env)
DATABASE_URL="postgresql://ivan:0Urantia1@alav.cloud:5432/clinica_demo"
JWT_SECRET=your-super-secret-jwt-key
PORT=3001
CORS_ORIGIN=http://localhost:3000
```

4. Configure o banco de dados:
```bash
npm run db:generate
npm run db:push
```

## Desenvolvimento

Para iniciar o ambiente de desenvolvimento:

```bash
npm run dev
```

Isso iniciará:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001
- API Docs: http://localhost:3001/docs

### Comandos Úteis

```bash
# Desenvolvimento
npm run dev:frontend    # Apenas frontend
npm run dev:backend     # Apenas backend

# Build
npm run build          # Build completo
npm run build:frontend # Build frontend
npm run build:backend  # Build backend

# Banco de dados
npm run db:generate    # Gerar cliente Prisma
npm run db:push        # Push schema para DB
npm run db:migrate     # Criar migração
npm run db:studio      # Abrir Prisma Studio
```

## Estrutura do Projeto

```
clinica-essencial/
├── frontend/          # Aplicação React
│   ├── src/
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── features/      # Funcionalidades por módulo
│   │   ├── hooks/         # Custom hooks
│   │   ├── services/      # Serviços de API
│   │   └── stores/        # Stores Zustand
├── backend/           # API Fastify
│   ├── src/
│   │   ├── plugins/       # Plugins Fastify
│   │   ├── routes/        # Rotas por módulo
│   │   ├── services/      # Lógica de negócio
│   │   └── types/         # Definições TypeScript
│   └── prisma/        # Schema e migrações
└── docs/              # Documentação
```

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.