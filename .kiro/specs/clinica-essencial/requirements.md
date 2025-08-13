# Documento de Requisitos

## Introdução

O Clínica Essencial é um sistema abrangente de gestão para clínicas médicas, projetado para otimizar as operações de estabelecimentos de saúde. O sistema oferece funcionalidades completas para gestão de pacientes, gestão de parceiros/profissionais, agendamento de consultas, gestão de catálogo de produtos/serviços, gestão de salas, operações financeiras e relatórios. O sistema deve ser responsivo, suportando dispositivos desktop e móveis, com opções de tema claro e escuro.

## Requisitos

### Requisito 1 - Gestão de Pacientes

**História do Usuário:** Como recepcionista da clínica, eu quero gerenciar as informações dos pacientes de forma abrangente, para que eu possa manter registros precisos e fornecer um atendimento eficiente.

#### Critérios de Aceitação

1. QUANDO criar um novo paciente ENTÃO o sistema DEVE capturar nome completo, CPF, data de nascimento, contatos (WhatsApp, fixo, email), endereço e observações
2. QUANDO visualizar um paciente ENTÃO o sistema DEVE exibir histórico completo de agendamentos e atendimentos
3. QUANDO buscar pacientes ENTÃO o sistema DEVE fornecer capacidades avançadas de filtragem e pesquisa
4. QUANDO agendar uma consulta ENTÃO o sistema DEVE permitir cadastro rápido do paciente através de modal
5. QUANDO gerenciar dados do paciente ENTÃO o sistema DEVE validar formato do CPF e garantir preenchimento dos campos obrigatórios

### Requisito 2 - Gestão de Salas

**História do Usuário:** Como administrador da clínica, eu quero gerenciar consultórios e seus recursos, para que eu possa otimizar a utilização do espaço e garantir disponibilidade adequada de equipamentos.

#### Critérios de Aceitação

1. QUANDO criar uma sala ENTÃO o sistema DEVE capturar nome da sala, descrição e recursos disponíveis (maca, armário, luz focal, etc.)
2. QUANDO gerenciar salas ENTÃO o sistema DEVE permitir definir status ativo/inativo
3. QUANDO agendar consultas ENTÃO o sistema DEVE exibir disponibilidade da sala e recursos
4. QUANDO visualizar informações da sala ENTÃO o sistema DEVE mostrar status atual e inventário de recursos

### Requisito 3 - Categorias de Produtos e Serviços

**História do Usuário:** Como administrador da clínica, eu quero organizar produtos e serviços em categorias, para que eu possa manter um catálogo estruturado.

#### Critérios de Aceitação

1. QUANDO criar uma categoria ENTÃO o sistema DEVE capturar nome, tipo (produto/serviço), status (ativo/inativo) e descrição opcional
2. QUANDO gerenciar categorias ENTÃO o sistema DEVE permitir alterações de status entre ativo e inativo
3. QUANDO criar produtos/serviços ENTÃO o sistema DEVE permitir seleção de categorias existentes ou criação de novas
4. QUANDO visualizar categorias ENTÃO o sistema DEVE exibir contagem de produtos e serviços associados

### Requisito 4 - Gestão de Produtos e Serviços

**História do Usuário:** Como administrador da clínica, eu quero gerenciar o catálogo completo de produtos e serviços, para que eu possa controlar preços, disponibilidade e requisitos de agendamento.

#### Critérios de Aceitação

1. QUANDO criar um produto/serviço ENTÃO o sistema DEVE capturar nome, tipo, categoria, código interno, status, descrição e preços (venda, custo, parceiro)
2. QUANDO configurar serviços ENTÃO o sistema DEVE permitir definir duração em minutos, seleção de salas disponíveis, disponibilidade para agendamento, requisitos de preparo especial e observações
3. QUANDO gerenciar produtos ENTÃO o sistema DEVE fornecer controle simples de estoque com níveis de estoque
4. QUANDO agendar consultas ENTÃO o sistema DEVE exibir apenas produtos/serviços ativos disponíveis para agendamento
5. QUANDO configurar serviços ENTÃO o sistema DEVE permitir seleção múltipla de salas através de checkboxes

### Requisito 5 - Gestão de Parceiros

**História do Usuário:** Como administrador da clínica, eu quero gerenciar profissionais de saúde e parceiros, para que eu possa controlar sua disponibilidade, serviços e arranjos financeiros.

#### Critérios de Aceitação

1. QUANDO registrar um parceiro ENTÃO o sistema DEVE capturar nome completo, CPF/CNPJ, telefone de contato, email, endereço e dados bancários incluindo PIX
2. QUANDO configurar disponibilidade ENTÃO o sistema DEVE permitir definir dias de trabalho (segunda a domingo) com horários de início/fim e intervalos por dia
3. QUANDO gerenciar agenda do parceiro ENTÃO o sistema DEVE permitir bloquear datas/horários específicos para férias ou emergências
4. QUANDO agendar consultas ENTÃO o sistema DEVE exibir claramente a disponibilidade do parceiro para evitar conflitos de agendamento
5. QUANDO associar serviços ENTÃO o sistema DEVE permitir selecionar quais serviços da clínica o parceiro pode fornecer
6. QUANDO configurar parcerias ENTÃO o sistema DEVE suportar três tipos: sublocação, porcentagem e porcentagem com produtos do parceiro
7. QUANDO configurar sublocação ENTÃO o sistema DEVE registrar valor da sublocação e data de vencimento, gerando lançamentos no contas a receber
8. QUANDO configurar porcentagem ENTÃO o sistema DEVE registrar valor fixo por serviço, calculando automaticamente pagamentos do parceiro no contas a pagar após atendimentos
9. QUANDO configurar porcentagem com produtos do parceiro ENTÃO o sistema DEVE permitir registrar valor do serviço e lucro do parceiro, calculando porcentagem da clínica para contas a receber

### Requisito 6 - Configurações do Sistema

**História do Usuário:** Como administrador da clínica, eu quero configurar definições gerais do sistema, para que eu possa personalizar o comportamento do sistema de acordo com as políticas da clínica.

#### Critérios de Aceitação

1. QUANDO definir horários da clínica ENTÃO o sistema DEVE permitir configurar horários de funcionamento por dia da semana com múltiplos intervalos
2. QUANDO configurar regras de agendamento ENTÃO o sistema DEVE permitir habilitar/desabilitar movimentação de agendamentos concluídos e cancelados
3. QUANDO configurar notificações ENTÃO o sistema DEVE suportar configuração de notificações SMS e WhatsApp
4. QUANDO agendar consultas ENTÃO o sistema DEVE respeitar os horários de funcionamento configurados da clínica

### Requisito 7 - Gestão de Agendamentos e Atendimentos

**História do Usuário:** Como recepcionista da clínica, eu quero gerenciar agendamentos de forma eficiente, para que eu possa otimizar as operações da clínica e fornecer excelente atendimento ao paciente.

#### Critérios de Aceitação

1. QUANDO visualizar agendas ENTÃO o sistema DEVE fornecer visualizações de calendário (diária, semanal, mensal) com filtros por profissional, sala e tipo de serviço
2. QUANDO gerenciar agendas de salas ENTÃO o sistema DEVE fornecer visualização em timeline mostrando ocupação das salas
3. QUANDO agendar consultas ENTÃO o sistema DEVE exibir imediatamente a disponibilidade do profissional baseada em sua agenda configurada
4. QUANDO consultar disponibilidade de parceiros ENTÃO o sistema DEVE permitir acesso fácil e imediato às informações de disponibilidade, tipo de parceria, horários ocupados (agendados) e horários livres de qualquer parceiro
5. QUANDO visualizar informações do parceiro ENTÃO o sistema DEVE exibir claramente o tipo de parceria (sublocação, porcentagem, porcentagem com produtos do parceiro) e seus horários de trabalho configurados
6. QUANDO criar agendamentos ENTÃO o sistema DEVE capturar paciente, serviço, profissional, sala, data, hora e tipo de consulta (nova/retorno)
7. QUANDO gerenciar agendamentos ENTÃO o sistema DEVE permitir cancelamento com registro de motivo, reagendamento e gestão de lista de espera
8. QUANDO enviar lembretes ENTÃO o sistema DEVE automaticamente enviar notificações via WhatsApp, SMS e/ou email baseado na configuração
9. QUANDO processar atendimentos ENTÃO o sistema DEVE permitir check-in do paciente, registro de observações e checkout com processamento de pagamento
10. QUANDO concluir atendimentos ENTÃO o sistema DEVE automaticamente integrar com módulo financeiro para registro de receitas e comissões
11. QUANDO notificar pacientes ENTÃO o sistema DEVE enviar 3 notificações de lembrete conforme configuração

### Requisito 8 - Gestão Financeira

**História do Usuário:** Como gestor financeiro da clínica, eu quero gerenciar todas as operações financeiras, para que eu possa manter controle contábil preciso e fluxo de caixa.

#### Critérios de Aceitação

1. QUANDO gerenciar contas ENTÃO o sistema DEVE permitir registro de contas bancárias e caixa interno com nome, banco, agência, número da conta e saldo inicial
2. QUANDO definir saldo inicial ENTÃO o sistema DEVE ajustar dinamicamente baseado na data da primeira transação, movendo a data do saldo inicial quando transações anteriores são adicionadas
3. QUANDO registrar transações ENTÃO o sistema DEVE capturar data de vencimento, data de pagamento/recebimento, descrição, valor, conta associada, paciente/fornecedor/parceiro relacionado e status
4. QUANDO gerenciar transações ENTÃO o sistema DEVE permitir lançamentos retroativos e futuros com recálculo automático de saldos subsequentes
5. QUANDO categorizar transações ENTÃO o sistema DEVE suportar categorias de receita (consultas, sessões, vendas de produtos) e categorias de despesa (aluguel, marketing, materiais, repasses de parceiros)
6. QUANDO processar acertos de parceiros ENTÃO o sistema DEVE automaticamente gerar lançamentos no contas a pagar para parceiros de porcentagem e contas a receber para parceiros de sublocação
7. QUANDO registrar pagamentos ENTÃO o sistema DEVE suportar múltiplas formas de pagamento (dinheiro, cartão crédito/débito, PIX, boleto) e pagamentos parciais
8. QUANDO modificar transações ENTÃO o sistema DEVE automaticamente recalcular todos os saldos de contas afetadas e saldos futuros
9. QUANDO gerar relatórios ENTÃO o sistema DEVE fornecer relatórios de fluxo de caixa (diário, semanal, mensal), demonstrativos de resultado simplificados e contas a pagar/receber por período e conta

### Requisito 9 - Interface e Experiência do Usuário

**História do Usuário:** Como usuário da clínica, eu quero uma interface intuitiva e responsiva, para que eu possa usar o sistema eficientemente em qualquer dispositivo.

#### Critérios de Aceitação

1. QUANDO acessar o sistema ENTÃO a interface DEVE ser construída com shadcn/ui, React 19, Vite e Tailwind CSS 4
2. QUANDO usar o sistema ENTÃO ele DEVE fornecer opções de tema claro e escuro e paleta de cores para definir a cor padrão
3. QUANDO acessar de diferentes dispositivos ENTÃO o sistema DEVE ser totalmente responsivo para uso desktop e móvel
4. QUANDO navegar no sistema ENTÃO ele DEVE manter padrões de design consistentes e paleta de cores
5. QUANDO executar ações ENTÃO o sistema DEVE fornecer feedback claro e estados de carregamento

### Requisito 10 - Dashboard e Relatórios

**História do Usuário:** Como gestor da clínica, eu quero dashboards e relatórios abrangentes, para que eu possa monitorar o desempenho da clínica e tomar decisões informadas.

#### Critérios de Aceitação

1. QUANDO acessar o dashboard ENTÃO o sistema DEVE exibir indicadores-chave de desempenho e estatísticas da clínica
2. QUANDO gerar relatórios ENTÃO o sistema DEVE fornecer análises de agendamentos, resumos financeiros e dados de desempenho de parceiros
3. QUANDO visualizar métricas ENTÃO o sistema DEVE permitir filtragem por intervalos de data, profissionais, serviços e outros critérios relevantes
4. QUANDO analisar dados ENTÃO o sistema DEVE apresentar informações através de gráficos, tabelas e formatos tabulares
5. QUANDO exportar relatórios ENTÃO o sistema DEVE suportar formatos comuns para análise posterior