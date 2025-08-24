import { test, expect } from '@playwright/test'

test.describe('Gestão de Pacientes', () => {
  test.beforeEach(async ({ page }) => {
    // Login antes de cada teste
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'admin@clinica.com')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.click('[data-testid="login-button"]')
    await expect(page).toHaveURL('/dashboard')
  })

  test('deve navegar para lista de pacientes', async ({ page }) => {
    // Navegar para pacientes
    await page.click('[data-testid="sidebar-patients"]')
    await expect(page).toHaveURL('/patients')
    
    // Verificar elementos da página
    await expect(page.locator('h1')).toContainText('Pacientes')
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible()
    await expect(page.locator('[data-testid="add-patient-button"]')).toBeVisible()
  })

  test('deve abrir modal de novo paciente', async ({ page }) => {
    await page.goto('/patients')
    
    // Clicar no botão de adicionar paciente
    await page.click('[data-testid="add-patient-button"]')
    
    // Verificar se modal abriu
    await expect(page.locator('[data-testid="patient-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="patient-modal-title"]')).toContainText('Novo Paciente')
    
    // Verificar campos obrigatórios
    await expect(page.locator('[data-testid="fullName-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="cpf-input"]')).toBeVisible()
    await expect(page.locator('[data-testid="birthDate-input"]')).toBeVisible()
  })

  test('deve criar novo paciente com sucesso', async ({ page }) => {
    await page.goto('/patients')
    await page.click('[data-testid="add-patient-button"]')
    
    // Preencher formulário
    await page.fill('[data-testid="fullName-input"]', 'João Silva Teste E2E')
    await page.fill('[data-testid="cpf-input"]', '12345678901')
    await page.fill('[data-testid="birthDate-input"]', '1990-01-01')
    await page.fill('[data-testid="email-input"]', 'joao.e2e@example.com')
    await page.fill('[data-testid="phone-input"]', '11999999999')
    
    // Salvar paciente
    await page.click('[data-testid="save-patient-button"]')
    
    // Verificar sucesso
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Paciente criado com sucesso')
    
    // Modal deve fechar
    await expect(page.locator('[data-testid="patient-modal"]')).not.toBeVisible()
    
    // Paciente deve aparecer na lista
    await expect(page.locator('[data-testid="patients-table"]')).toContainText('João Silva Teste E2E')
  })

  test('deve validar campos obrigatórios', async ({ page }) => {
    await page.goto('/patients')
    await page.click('[data-testid="add-patient-button"]')
    
    // Tentar salvar sem preencher campos obrigatórios
    await page.click('[data-testid="save-patient-button"]')
    
    // Verificar mensagens de erro
    await expect(page.locator('[data-testid="fullName-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="cpf-error"]')).toBeVisible()
    await expect(page.locator('[data-testid="birthDate-error"]')).toBeVisible()
  })

  test('deve filtrar pacientes por nome', async ({ page }) => {
    await page.goto('/patients')
    
    // Aguardar carregamento da tabela
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible()
    
    // Digitar no campo de busca
    await page.fill('[data-testid="search-input"]', 'João')
    
    // Aguardar filtro aplicar
    await page.waitForTimeout(500)
    
    // Verificar que apenas pacientes com "João" aparecem
    const rows = page.locator('[data-testid="patient-row"]')
    await expect(rows.first()).toContainText('João')
  })

  test('deve editar paciente existente', async ({ page }) => {
    await page.goto('/patients')
    
    // Clicar no primeiro paciente para editar
    await page.click('[data-testid="patient-row"]:first-child [data-testid="edit-patient-button"]')
    
    // Verificar se modal de edição abriu
    await expect(page.locator('[data-testid="patient-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="patient-modal-title"]')).toContainText('Editar Paciente')
    
    // Alterar nome
    await page.fill('[data-testid="fullName-input"]', 'Nome Editado E2E')
    
    // Salvar alterações
    await page.click('[data-testid="save-patient-button"]')
    
    // Verificar sucesso
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible()
    await expect(page.locator('[data-testid="success-toast"]')).toContainText('Paciente atualizado com sucesso')
  })

  test('deve visualizar detalhes do paciente', async ({ page }) => {
    await page.goto('/patients')
    
    // Clicar no primeiro paciente para visualizar
    await page.click('[data-testid="patient-row"]:first-child [data-testid="view-patient-button"]')
    
    // Verificar se modal de detalhes abriu
    await expect(page.locator('[data-testid="patient-details-modal"]')).toBeVisible()
    await expect(page.locator('[data-testid="patient-details-title"]')).toContainText('Detalhes do Paciente')
    
    // Verificar se informações estão visíveis
    await expect(page.locator('[data-testid="patient-name"]')).toBeVisible()
    await expect(page.locator('[data-testid="patient-cpf"]')).toBeVisible()
    await expect(page.locator('[data-testid="patient-birthdate"]')).toBeVisible()
  })

  test('deve ter navegação responsiva', async ({ page }) => {
    // Redimensionar para mobile
    await page.setViewportSize({ width: 375, height: 667 })
    
    await page.goto('/patients')
    
    // Verificar se menu mobile está visível
    await expect(page.locator('[data-testid="mobile-menu-button"]')).toBeVisible()
    
    // Verificar se tabela é responsiva
    await expect(page.locator('[data-testid="patients-table"]')).toBeVisible()
    
    // Abrir menu mobile
    await page.click('[data-testid="mobile-menu-button"]')
    await expect(page.locator('[data-testid="mobile-sidebar"]')).toBeVisible()
  })
})
