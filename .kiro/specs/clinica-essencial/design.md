# Documento de Design - Clínica Essencial

## Visão Geral

O Clínica Essencial será desenvolvido como uma aplicação web moderna usando React 19 com arquitetura modular e responsiva. O sistema seguirá padrões de design consistentes com shadcn/ui e Tailwind CSS 4, oferecendo uma experiência fluida tanto em desktop quanto mobile.

### Princípios de Design
- **Responsividade**: Interface adaptável para desktop e mobile
- **Acessibilidade**: Conformidade com padrões WCAG
- **Performance**: Carregamento rápido e interações fluidas
- **Usabilidade**: Interface intuitiva para usuários não técnicos
- **Escalabilidade**: Arquitetura preparada para crescimento

## Arquitetura

### Arquitetura Geral
```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 19)                      │
├─────────────────────────────────────────────────────────────┤
│                    API Layer (Fastify REST)                 │
├─────────────────────────────────────────────────────────────┤
│                    Business Logic Layer                     │
├─────────────────────────────────────────────────────────────┤
│                    Data Access Layer (Prisma)               │
├─────────────────────────────────────────────────────────────┤
│              Database (PostgreSQL - alav.cloud)             │
└─────────────────────────────────────────────────────────────┘
```

### Stack Tecnológico

#### Frontend
- **React 19**: Framework principal com Server Components
- **Vite**: Build tool e dev server
- **Tailwind CSS 4**: Styling framework
- **shadcn/ui**: Biblioteca de componentes
- **React Router**: Roteamento
- **Zustand**: Gerenciamento de estado
- **React Query**: Cache e sincronização de dados
- **React Hook Form**: Gerenciamento de formulários
- **Zod**: Validação de schemas

#### Backend
- **Node.js**: Runtime
- **Fastify**: Framework web (escolhido por performance)
- **Prisma**: ORM
- **PostgreSQL**: Banco de dados principal
  - Host: alav.cloud
  - Porta: 5432
  - Database: clinica_demo
  - Username: ivan
- **Redis**: Cache e sessões (opcional)
- **JWT**: Autenticação

### Configuração do Banco de Dados

#### PostgreSQL Configuration
```env
DATABASE_URL="postgresql://ivan:0Urantia1@alav.cloud:5432/clinica_demo"
```

#### Prisma Schema Base
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### Padrões Arquiteturais
- **Component-Based Architecture**: Componentes reutilizáveis
- **Feature-Based Structure**: Organização por funcionalidades
- **Repository Pattern**: Abstração de acesso a dados
- **Service Layer**: Lógica de negócio centralizada
- **Event-Driven**: Comunicação entre módulos
- **Fastify Plugins**: Modularização do backend

## Componentes e Interfaces

### Estrutura de Pastas Frontend
```
frontend/src/
├── components/           # Componentes reutilizáveis
│   ├── ui/              # Componentes base (shadcn/ui)
│   ├── forms/           # Componentes de formulário
│   ├── layout/          # Componentes de layout
│   └── common/          # Componentes comuns
├── features/            # Funcionalidades por módulo
│   ├── patients/        # Gestão de pacientes
│   ├── partners/        # Gestão de parceiros
│   ├── appointments/    # Agendamentos
│   ├── rooms/           # Gestão de salas
│   ├── products/        # Produtos e serviços
│   ├── financial/       # Módulo financeiro
│   └── dashboard/       # Dashboard e relatórios
├── hooks/               # Custom hooks
├── services/            # Serviços de API
├── stores/              # Stores Zustand
├── utils/               # Utilitários
├── types/               # Definições TypeScript
└── styles/              # Estilos globais
```

### Estrutura de Pastas Backend (Fastify)
```
backend/src/
├── plugins/             # Plugins Fastify
│   ├── auth.ts         # Plugin de autenticação
│   ├── cors.ts         # Plugin CORS
│   ├── database.ts     # Plugin Prisma
│   └── swagger.ts      # Plugin documentação
├── routes/              # Rotas por módulo
│   ├── patients/       # Rotas de pacientes
│   ├── partners/       # Rotas de parceiros
│   ├── appointments/   # Rotas de agendamentos
│   ├── rooms/          # Rotas de salas
│   ├── products/       # Rotas de produtos/serviços
│   ├── financial/      # Rotas financeiras
│   └── auth/           # Rotas de autenticação
├── services/            # Lógica de negócio
├── repositories/        # Acesso a dados
├── schemas/             # Schemas de validação
├── types/               # Definições TypeScript
├── utils/               # Utilitários
├── prisma/              # Configurações Prisma
│   ├── schema.prisma   # Schema do banco
│   └── migrations/     # Migrações
└── app.ts              # Aplicação principal
```

### Componentes Principais

#### 1. Layout Components
- **AppLayout**: Layout principal com sidebar e header
- **Sidebar**: Navegação lateral com menu colapsível
- **Header**: Barra superior com perfil e notificações
- **MobileNav**: Navegação mobile responsiva

#### 2. Form Components
- **PatientForm**: Formulário de cadastro/edição de pacientes
- **PartnerForm**: Formulário de cadastro/edição de parceiros
- **AppointmentForm**: Formulário de agendamento
- **ProductServiceForm**: Formulário de produtos/serviços
- **FinancialForm**: Formulários financeiros

#### 3. Calendar Components
- **AppointmentCalendar**: Calendário principal de agendamentos
- **RoomTimeline**: Timeline de ocupação das salas
- **PartnerSchedule**: Visualização de agenda do parceiro
- **DatePicker**: Seletor de datas customizado

#### 4. Data Display Components
- **PatientCard**: Card de informações do paciente
- **PartnerCard**: Card de informações do parceiro
- **AppointmentCard**: Card de agendamento
- **FinancialSummary**: Resumo financeiro
- **DataTable**: Tabela de dados reutilizável

### Interfaces de API

#### Endpoints Principais

```typescript
// Pacientes
GET    /api/patients
POST   /api/patients
GET    /api/patients/:id
PUT    /api/patients/:id
DELETE /api/patients/:id
GET    /api/patients/search?q=:query

// Parceiros
GET    /api/partners
POST   /api/partners
GET    /api/partners/:id
PUT    /api/partners/:id
GET    /api/partners/:id/availability
PUT    /api/partners/:id/availability

// Agendamentos
GET    /api/appointments
POST   /api/appointments
GET    /api/appointments/:id
PUT    /api/appointments/:id
DELETE /api/appointments/:id
GET    /api/appointments/calendar?date=:date&view=:view

// Produtos e Serviços
GET    /api/products-services
POST   /api/products-services
GET    /api/products-services/:id
PUT    /api/products-services/:id

// Financeiro
GET    /api/financial/accounts
POST   /api/financial/transactions
GET    /api/financial/reports
```

## Modelos de Dados

### Entidades Principais

#### Patient (Paciente)
```typescript
interface Patient {
  id: string
  fullName: string
  cpf: string
  birthDate: Date
  contacts: {
    whatsapp?: string
    phone?: string
    email?: string
  }
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  observations?: string
  createdAt: Date
  updatedAt: Date
}
```

#### Partner (Parceiro)
```typescript
interface Partner {
  id: string
  fullName: string
  document: string // CPF ou CNPJ
  contacts: {
    phone: string
    email: string
  }
  address?: Address
  bankingDetails: {
    bank?: string
    agency?: string
    account?: string
    pix?: string
  }
  partnershipType: 'sublease' | 'percentage' | 'percentage_with_products'
  partnershipConfig: {
    subleaseAmount?: number
    subleasePaymentDay?: number
    percentageAmount?: number
    percentageRate?: number
  }
  availability: PartnerAvailability[]
  services: string[] // IDs dos serviços
  status: 'active' | 'inactive'
  createdAt: Date
  updatedAt: Date
}
```

#### Appointment (Agendamento)
```typescript
interface Appointment {
  id: string
  patientId: string
  partnerId: string
  serviceId: string
  roomId?: string
  date: Date
  startTime: string
  endTime: string
  type: 'new' | 'return'
  status: 'scheduled' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled'
  observations?: string
  checkIn?: Date
  checkOut?: Date
  cancellationReason?: string
  createdAt: Date
  updatedAt: Date
}
```

#### ProductService (Produto/Serviço)
```typescript
interface ProductService {
  id: string
  name: string
  type: 'product' | 'service'
  categoryId: string
  internalCode?: string
  description?: string
  pricing: {
    salePrice: number
    costPrice?: number
    partnerPrice?: number
  }
  serviceConfig?: {
    durationMinutes: number
    availableRooms: string[]
    availableForBooking: boolean
    requiresSpecialPrep: boolean
    specialPrepDetails?: string
  }
  productConfig?: {
    stockLevel?: number
    minStockLevel?: number
  }
  status: 'active' | 'inactive'
  observations?: string
  createdAt: Date
  updatedAt: Date
}
```

### Relacionamentos
- Patient 1:N Appointment
- Partner 1:N Appointment
- ProductService 1:N Appointment
- Room 1:N Appointment
- Partner N:M ProductService
- Category 1:N ProductService

## Tratamento de Erros

### Estratégia de Error Handling
1. **Validação no Frontend**: Validação imediata com Zod
2. **Error Boundaries**: Captura de erros React
3. **API Error Handling**: Tratamento padronizado de erros HTTP
4. **User Feedback**: Notificações claras para o usuário
5. **Logging**: Registro de erros para debugging

### Tipos de Erro
```typescript
interface ApiError {
  code: string
  message: string
  details?: any
  timestamp: Date
}

interface ValidationError {
  field: string
  message: string
  code: string
}
```

### Componentes de Erro
- **ErrorBoundary**: Captura erros globais
- **ErrorAlert**: Exibição de erros inline
- **NotificationSystem**: Sistema de notificações toast

## Estratégia de Testes

### Tipos de Teste
1. **Unit Tests**: Componentes e funções isoladas
2. **Integration Tests**: Fluxos completos
3. **E2E Tests**: Cenários de usuário
4. **Visual Regression Tests**: Consistência visual

### Ferramentas
- **Vitest**: Framework de testes
- **React Testing Library**: Testes de componentes
- **MSW**: Mock Service Worker para APIs
- **Playwright**: Testes E2E
- **Storybook**: Documentação e testes visuais

### Cobertura de Testes
- Componentes críticos: 90%+
- Lógica de negócio: 95%+
- Utilitários: 100%

## Considerações de Performance

### Otimizações Frontend
1. **Code Splitting**: Divisão por rotas e features
2. **Lazy Loading**: Carregamento sob demanda
3. **Memoization**: React.memo e useMemo
4. **Virtual Scrolling**: Para listas grandes
5. **Image Optimization**: Compressão e lazy loading

### Otimizações de Dados
1. **React Query**: Cache inteligente
2. **Pagination**: Carregamento paginado
3. **Debouncing**: Para buscas e filtros
4. **Optimistic Updates**: Atualizações otimistas

### Métricas de Performance
- First Contentful Paint < 1.5s
- Largest Contentful Paint < 2.5s
- Cumulative Layout Shift < 0.1
- First Input Delay < 100ms

## Segurança

### Autenticação e Autorização
1. **JWT Tokens**: Autenticação stateless
2. **Role-Based Access**: Controle por perfis
3. **Session Management**: Gestão segura de sessões
4. **Password Policies**: Políticas de senha

### Proteção de Dados
1. **Data Encryption**: Criptografia de dados sensíveis
2. **Input Validation**: Validação rigorosa de entradas
3. **SQL Injection Prevention**: Uso de ORM/prepared statements
4. **XSS Protection**: Sanitização de dados
5. **CSRF Protection**: Tokens CSRF

### Conformidade LGPD
1. **Data Minimization**: Coleta mínima necessária
2. **Consent Management**: Gestão de consentimentos
3. **Data Portability**: Exportação de dados
4. **Right to Erasure**: Exclusão de dados
5. **Audit Logs**: Logs de auditoria

## Acessibilidade

### Padrões WCAG 2.1
1. **Keyboard Navigation**: Navegação por teclado
2. **Screen Reader Support**: Suporte a leitores de tela
3. **Color Contrast**: Contraste adequado
4. **Focus Management**: Gestão de foco
5. **Semantic HTML**: HTML semântico

### Implementação
- **ARIA Labels**: Rótulos acessíveis
- **Focus Indicators**: Indicadores visuais de foco
- **Alternative Text**: Textos alternativos
- **Form Labels**: Rótulos de formulário
- **Error Announcements**: Anúncio de erros

## Internacionalização

### Suporte a Idiomas
- Português Brasileiro (padrão)
- Estrutura preparada para outros idiomas

### Implementação
- **React i18next**: Biblioteca de internacionalização
- **Namespace Organization**: Organização por módulos
- **Date/Number Formatting**: Formatação localizada
- **RTL Support**: Suporte a idiomas RTL (futuro)