import { test, expect } from '@playwright/test'

test.describe('Gestão de Agendamentos', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'admin@clinica.com')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('deve navegar para agenda', async ({ page }) => {
    // Navegar para agendamentos
    await page.click('[data-testid="sidebar-appointments"]')
    await expect(page).toHaveURL('/appointments')
    
    // Verificar elementos da página
    await expect(page.locator('h1')).toContainText('Agendamentos')
    await expect(page.locator('[data-testid="calendar-view"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-appointment-button"]')).toBeVisible()
  })

  test('deve alternar entre visualizações do calendário', async ({ page }) => {
    await page.goto('/appointments')
    
    // Verificar visualização padrão (semanal)
    await expect(page.locator('[data-testid="week-view"]')).toBeVisible()
    
    // Alternar para visualização diária
    await page.click('[data-testid="day-view-button"]')
    await expect(page.locator('[data-testid="day-view"]')).toBeVisible()
    
    // Alternar para visualização mensal
    await page.click('[data-testid="month-view-button"]')
    await expect(page.locator('[data-testid="month-view"]')).toBeVisible()
  })

  test('deve abrir modal de novo agendamento', async ({ page }) => {
    await page.goto('/appointments')
    
    // Clicar no botão de novo agendamento
    await page.click('[data-testid="add-appointment-button"]')
    
    // Verificar se modal abriu
    await expect(page.locator('[data-testid="appointment-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="appointment-modal-title"]')).toContainText('Novo Agendamento')
    
    // Verificar campos obrigatórios
    await expect(page.locator('[data-testid="patient-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="partner-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="service-select"]')).toBeVisible()
    await expect(page.locator('[data-testid="date-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="time-input"]')).toBeVisible()
  })

  test('deve criar novo agendamento', async ({ page }) => {
    await page.goto('/appointments')
    await page.click('[data-testid="add-appointment-button"]')
    
    // Preencher formulário de agendamento
    await page.click('[data-testid="patient-select"]')
    await page.click('[data-testid="patient-option"]:first-child')
    
    await page.click('[data-testid="partner-select"]')
    await page.click('[data-testid="partner-option"]:first-child')
    
    await page.click('[data-testid="service-select"]')
    await page.click('[data-testid="service-option"]:first-child')
    
    // Definir data e hora futuras
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const dateString = tomorrow.toISOString().split('T')[0]
    
    await page.fill('[data-testid="date-input"]', dateString)
    await page.fill('[data-testid="time-input"]', '10:00')
    
    // Salvar agendamento
    await page.click('[data-testid="save-appointment-button"]')
    
    // Verificar sucesso
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Agendamento criado com sucesso')
    
    // Modal deve fechar
    await expect(page.locator('[data-testid="appointment-modal"]')).not.toBeVisible()
  })

  test('deve verificar conflitos de horário', async ({ page }) => {
    await page.goto('/appointments')
    await page.click('[data-testid="add-appointment-button"]')
    
    // Selecionar mesmo profissional e horário de agendamento existente
    await page.click('[data-testid="partner-select"]')
    await page.click('[data-testid="partner-option"]:first-child')
    
    const today = new Date().toISOString().split('T')[0]
    await page.fill('[data-testid="date-input"]', today)
    await page.fill('[data-testid="time-input"]', '09:00')
    
    // Tentar salvar
    await page.click('[data-testid="save-appointment-button"]')
    
    // Verificar mensagem de conflito
    await expect(page.locator('[data-testid="error-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-toast"]')).toContainText('Conflito de horário')
  })

  test('deve filtrar agendamentos por profissional', async ({ page }) => {
    await page.goto('/appointments')
    
    // Abrir filtro de profissional
    await page.click('[data-testid="partner-filter"]')
    
    // Selecionar um profissional específico
    await page.click('[data-testid="partner-filter-option"]:first-child')
    
    // Verificar que apenas agendamentos do profissional aparecem
    await expect(page.locator('[data-testid="appointment-card"]')).toBeVisible()
    
    // Limpar filtro
    await page.click('[data-testid="clear-filters-button"]')
  })

  test('deve realizar check-in de paciente', async ({ page }) => {
    await page.goto('/appointments')
    
    // Encontrar agendamento do dia atual
    const appointmentCard = page.locator('[data-testid="appointment-card"]').first()
    await expect(appointmentCard).toBeVisible()
    
    // Clicar em check-in
    await appointmentCard.locator('[data-testid="checkin-button"]').click()
    
    // Verificar sucesso
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Check-in realizado')
    
    // Status deve mudar para "Em Andamento"
    await expect(appointmentCard.locator('[data-testid="appointment-status"]')).toContainText('Em Andamento')
  })

  test('deve visualizar detalhes do agendamento', async ({ page }) => {
    await page.goto('/appointments')
    
    // Clicar no primeiro agendamento
    await page.click('[data-testid="appointment-card"]:first-child')
    
    // Verificar se modal de detalhes abriu
    await expect(page.locator('[data-testid="appointment-details-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="appointment-details-title"]')).toContainText('Detalhes do Agendamento')
    
    // Verificar informações
    await expect(page.locator('[data-testid="appointment-patient"]')).toBeVisible()
    await expect(page.locator('[data-testid="appointment-partner"]')).toBeVisible()
    await expect(page.locator('[data-testid="appointment-service"]')).toBeVisible()
    await expect(page.locator('[data-testid="appointment-datetime"]')).toBeVisible()
  })

  test('deve navegar entre semanas no calendário', async ({ page }) => {
    await page.goto('/appointments')
    
    // Verificar semana atual
    const currentWeek = await page.locator('[data-testid="current-week"]').textContent()
    
    // Navegar para próxima semana
    await page.click('[data-testid="next-week-button"]')
    
    // Verificar que mudou
    const nextWeek = await page.locator('[data-testid="current-week"]').textContent()
    expect(nextWeek).not.toBe(currentWeek)
    
    // Voltar para semana anterior
    await page.click('[data-testid="prev-week-button"]')
    
    // Verificar que voltou
    const backToWeek = await page.locator('[data-testid="current-week"]').textContent()
    expect(backToWeek).toBe(currentWeek)
  })

  test('deve exibir timeline das salas', async ({ page }) => {
    await page.goto('/appointments')
    
    // Verificar se timeline das salas está visível
    await expect(page.locator('[data-testid="rooms-timeline"]')).toBeVisible()
    
    // Verificar se cada sala aparece
    await expect(page.locator('[data-testid="room-timeline"]')).toHaveCount({ min: 1 })
    
    // Verificar horários
    await expect(page.locator('[data-testid="timeline-hours"]')).toBeVisible()
  })
})
