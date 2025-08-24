Failed to load resource: the server responded with a status of 404 (Not Found)
auth.ts:42 Auth API request failed: 
Object
error
: 
"Not Found"
message
: 
"Route POST:/api/api/auth/login not found"
[[Prototype]]
: 
Object
request	@	auth.ts:42
AuthContext.tsx:59 Login failed: 
Object
error
: 
"Not Found"
message
: 
"Route POST:/api/api/auth/login not found"
[[Prototype]]
: 
Object# Plano de Implementação - Clínica Essencial

- [x] 1. Configuração inicial do projeto e estrutura base





  - Criar estrutura de pastas para frontend (React 19 + Vite + Tailwind CSS 4)
  - Configurar backend com Fastify e TypeScript
  - Configurar Prisma com conexão PostgreSQL (alav.cloud)
  - Configurar shadcn/ui e componentes base
  - _Requisitos: 9.1, 9.4_

- [x] 2. Configuração do banco de dados e modelos base





  - [x] 2.1 Criar schema Prisma com entidades principais


    - Definir modelos Patient, Partner, Appointment, ProductService, Room, Category
    - Configurar relacionamentos entre entidades
    - Criar migrações iniciais do banco de dados
    - _Requisitos: 1.1, 2.1, 3.1, 4.1, 5.1_



  - [x] 2.2 Implementar validações e tipos TypeScript





    - Criar interfaces TypeScript para todas as entidades
    - Implementar schemas de validação com Zod
    - Configurar tipos compartilhados entre frontend e backend
    - _Requisitos: 1.5, 4.4, 5.4_

- [x] 3. Implementação do sistema de autenticação e autorização





  - [x] 3.1 Configurar autenticação JWT no backend


    - Implementar plugin de autenticação Fastify
    - Criar middleware de autorização por roles
    - Implementar rotas de login/logout
    - _Requisitos: Sistema de segurança_

  - [x] 3.2 Implementar autenticação no frontend


    - Criar contexto de autenticação React
    - Implementar proteção de rotas
    - Criar componentes de login/logout
    - _Requisitos: Sistema de segurança_

- [ ] 4. Desenvolvimento do módulo de gestão de pacientes
  - [x] 4.1 Implementar CRUD de pacientes no backend com dados de teste








    - Criar rotas Fastify para pacientes (GET, POST, PUT, DELETE)
    - Implementar serviços de negócio para pacientes
    - Criar repository pattern para acesso aos dados
    - Implementar busca avançada com filtros
    - Criar seed de dados de teste no banco para desenvolvimento
    - _Requisitos: 1.1, 1.2, 1.3_

  - [x] 4.2 Conectar interface de gestão de pacientes com API real








    - Implementar formulário de cadastro/edição conectado à API
    - Criar lista de pacientes consumindo dados reais do backend
    - Implementar modal de cadastro rápido integrado com API
    - Criar componente de visualização de histórico consumindo dados reais
    - Configurar React Query para cache e sincronização de dados
    - _Requisitos: 1.1, 1.3, 1.4_

- [ ] 5. Desenvolvimento do módulo de gestão de salas
  - [x] 5.1 Implementar CRUD de salas no backend com dados de teste




    - Criar rotas Fastify para salas
    - Implementar serviços para gestão de salas e recursos
    - Criar validações de status ativo/inativo
    - Criar seed de dados de teste para salas no banco
    - _Requisitos: 2.1, 2.2_

  - [x] 5.2 Conectar interface de gestão de salas com API real





    - Implementar formulário de cadastro/edição conectado à API
    - Criar lista de salas consumindo dados reais do backend
    - Implementar visualização de disponibilidade conectada à API
    - _Requisitos: 2.3, 2.4_

- [ ] 6. Desenvolvimento do módulo de categorias e produtos/serviços
  - [x] 6.1 Implementar CRUD de categorias no backend com dados de teste





    - Criar rotas Fastify para categorias
    - Implementar serviços para gestão de categorias
    - Criar validações de tipo (produto/serviço) e status
    - Criar seed de dados de teste para categorias no banco
    - _Requisitos: 3.1, 3.2_

  - [x] 6.2 Implementar CRUD de produtos/serviços no backend com dados de teste




    - Criar rotas Fastify para produtos/serviços
    - Implementar lógica de controle de estoque para produtos
    - Criar serviços para gestão de preços e configurações
    - Implementar filtros por categoria e status
    - Criar seed de dados de teste para produtos/serviços no banco
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_

  - [x] 6.3 Conectar interface de gestão de produtos/serviços com API real






    - Implementar formulário de cadastro/edição conectado à API com seleção de categoria
    - Criar interface para configurações específicas de serviços consumindo dados reais
    - Implementar controle de estoque conectado à API
    - Criar lista com filtros consumindo dados reais do backend
    - _Requisitos: 3.3, 4.5_

- [ ] 7. Desenvolvimento do módulo de gestão de parceiros
  - [x ] 7.1 Implementar CRUD de parceiros no backend com dados de teste
    - Criar rotas Fastify para parceiros
    - Implementar lógica dos três tipos de parceria (sublocação, porcentagem, porcentagem com produtos)
    - Criar serviços para gestão de disponibilidade de parceiros
    - Implementar associação de parceiros com serviços
    - Criar seed de dados de teste para parceiros no banco
    - _Requisitos: 5.1, 5.5, 5.6, 5.7, 5.8, 5.9_

  - [x ] 7.2 Implementar sistema de disponibilidade de parceiros no backend
    - Criar estrutura para horários de trabalho por dia da semana
    - Implementar bloqueio de datas/horários específicos
    - Criar API para consulta rápida de disponibilidade
    - Criar dados de teste para disponibilidade de parceiros
    - _Requisitos: 5.2, 5.3_

  - [x] 7.3 Conectar interface de gestão de parceiros com API real
    - Implementar formulário de cadastro conectado à API com dados bancários
    - Criar interface para configuração de disponibilidade visual consumindo dados reais
    - Implementar seleção de serviços associados conectada à API
    - Criar visualização clara do tipo de parceria e disponibilidade com dados reais
    - _Requisitos: 5.4, 7.4, 7.5_

- [ ] 8. Desenvolvimento do sistema de agendamentos
  - [x] 8.1 Implementar lógica de agendamentos no backend com dados de teste
    - Criar rotas Fastify para agendamentos (CRUD completo)
    - Implementar validação de conflitos de horários
    - Criar serviços para verificação de disponibilidade em tempo real
    - Implementar lógica de cancelamento e reagendamento
    - Criar seed de dados de teste para agendamentos no banco
    - _Requisitos: 7.3, 7.6, 7.7_

  - [x] 8.2 Conectar sistema de calendário com API real
    - Implementar componente de calendário consumindo dados reais (diária, semanal, mensal)
    - Criar timeline de ocupação das salas conectada à API
    - Implementar filtros por profissional, sala e tipo de serviço com dados reais
    - Criar visualização de disponibilidade de parceiros consumindo API em tempo real
    - _Requisitos: 7.1, 7.2, 7.4, 7.5_

  - [x] 8.3 Conectar funcionalidades de agendamento com API real
    - Criar formulário de agendamento conectado à API com seleção de paciente, serviço, parceiro e sala
    - Implementar sistema de lista de espera integrado com backend
    - Criar funcionalidades de check-in e check-out conectadas à API
    - Implementar registro de observações do atendimento com dados reais
    - _Requisitos: 7.6, 7.9_

- [ ] 9. Desenvolvimento do sistema de notificações
  - [x] 9.1 Implementar sistema de lembretes automáticos
    - Criar serviços para envio de notificações WhatsApp e SMS
    - Implementar agendamento de lembretes (3 notificações conforme configuração)
    - Criar templates de mensagens personalizáveis
    - _Requisitos: 7.8, 7.11_

  - [x] 9.2 Criar interface de configuração de notificações
    - Implementar configurações de horários e tipos de lembrete
    - Criar interface para personalização de mensagens
    - Implementar histórico de notificações enviadas
    - _Requisitos: 6.3_

- [ ] 10. Desenvolvimento do módulo financeiro
  - [x] 10.1 Implementar gestão de contas bancárias no backend com dados de teste
    - [x] Criar rotas Fastify para contas bancárias
    - [x] Implementar lógica de saldo inicial dinâmico
    - [x] Criar serviços para recálculo automático de saldos
    - [x] Criar seed de dados de teste para contas bancárias
    - _Requisitos: 8.1, 8.2_

  - [x] 10.2 Implementar sistema de lançamentos financeiros no backend com dados de teste
    - [x] Criar rotas para contas a pagar e receber
    - [x] Implementar categorização de receitas e despesas
    - [x] Criar lógica para lançamentos retroativos e futuros
    - [x] Implementar múltiplas formas de pagamento
    - [x] Criar seed de dados de teste para lançamentos financeiros
    - _Requisitos: 8.3, 8.4, 8.5, 8.7_

  - [x] 10.3 Implementar acerto automático com parceiros no backend
    - [x] Criar serviços para geração automática de lançamentos baseados no tipo de parceria
    - [x] Implementar cálculo de repasses para parceiros de porcentagem
    - [x] Criar lançamentos automáticos para sublocação
    - [x] Implementar relatórios de repasses por parceiro
    - _Requisitos: 8.6, 5.7, 5.8, 5.9_

  - [x] 10.4 Conectar interface financeira com API real
    - [x] Implementar formulários de lançamentos financeiros conectados à API
    - [x] Criar visualização de fluxo de caixa consumindo dados reais
    - [x] Implementar relatórios financeiros básicos (DRE simplificado) com dados reais
    - [x] Criar dashboard de contas a pagar/receber conectado à API
    - _Requisitos: 8.8, 8.9_

- [x ] 11. Integração entre módulos e automações
  - [x] 11.1 Implementar integração agendamento-financeiro
    - Criar automação para lançamento de receitas após checkout
    - Implementar cálculo automático de comissões de parceiros
    - Criar integração com diferentes tipos de parceria
    - _Requisitos: 7.10_

  - [x] 11.2 Implementar regras de negócio avançadas
    - Criar validações de horário de funcionamento da clínica
    - Implementar regras de movimentação de agendamentos
    - Criar automações para recálculo de saldos financeiros
    - _Requisitos: 6.1, 6.2, 8.8_

- [x] 12. Desenvolvimento do dashboard e relatórios
  - [x] 12.1 Implementar APIs de dashboard no backend
    - Criar rotas para KPIs principais da clínica
    - Implementar serviços para cálculo de métricas de agendamentos e receitas
    - Criar APIs para métricas de desempenho de parceiros
    - _Requisitos: 10.1, 10.2_

  - [x] 12.2 Conectar dashboard principal com API real
    - Implementar dashboard consumindo KPIs reais da API
    - Criar gráficos de agendamentos e receitas com dados reais
    - Implementar métricas de desempenho de parceiros conectadas à API
    - _Requisitos: 10.1, 10.2_

  - [x] 12.3 Implementar APIs de relatórios no backend
    - Criar rotas para relatórios de agendamentos com filtros
    - Implementar APIs para relatórios financeiros detalhados
    - Criar APIs para relatórios de desempenho por parceiro
    - Implementar funcionalidade de exportação no backend
    - _Requisitos: 10.3, 10.4, 10.5_

  - [x] 12.4 Conectar sistema de relatórios com API real
    - Criar interface de relatórios de agendamentos consumindo dados reais
    - Implementar relatórios financeiros detalhados conectados à API
    - Criar relatórios de desempenho por parceiro com dados reais
    - Implementar exportação de relatórios integrada com backend
    - _Requisitos: 10.3, 10.4, 10.5_

- [x] 13. Configurações do sistema
  - [x] 13.1 Implementar configurações gerais
    - Criar interface para horários de funcionamento da clínica
    - Implementar configurações de regras de agendamento
    - Criar configurações de notificações
    - _Requisitos: 6.1, 6.2, 6.3_

  - [x] 13.2 Criar sistema de temas e responsividade
    - Implementar alternância entre tema claro e escuro
    - Garantir responsividade completa para mobile
    - Criar componentes adaptativos para diferentes tamanhos de tela
    - _Requisitos: 9.2, 9.3_

- [ ] 14. Testes e validação
  - [x] 14.1 Implementar testes unitários
    - Criar testes para componentes React críticos
    - Implementar testes para serviços de negócio do backend
    - Criar testes para validações e utilitários
    - _Requisitos: Qualidade do código_

  - [x] 14.2 Implementar testes de integração
    - Criar testes E2E para fluxos principais
    - Implementar testes de API com cenários reais
    - Criar testes de integração entre módulos
    - _Requisitos: Qualidade do código_

- [ ] 15. Otimização e deploy
  - [x] 15.1 Otimizar performance
    - Implementar code splitting e lazy loading
    - Otimizar queries do banco de dados
    - Implementar cache onde necessário
    - _Requisitos: 9.5_

  - [x] 15.2 Preparar para produção
    - Configurar variáveis de ambiente
    - Implementar logging e monitoramento
    - Criar documentação de API
    - Preparar scripts de deploy
    - _Requisitos: Sistema de produção_