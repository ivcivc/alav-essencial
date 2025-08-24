import { test, expect } from '@playwright/test'

test.describe('Fluxo de Autenticação', () => {
  test('deve realizar login com credenciais válidas', async ({ page }) => {
    // Navegar para a página de login
    await page.goto('/login')
    
    // Verificar se estamos na página de login
    await expect(page).toHaveTitle(/Clínica Essencial/)
    await expect(page.locator('h1')).toContainText('Login')
    
    // Preencher formulário de login
    await page.fill('[data-testid="email-input"]', 'admin@clinica.com')
    await page.fill('[data-testid="password-input"]', 'admin123')
    
    // Clicar no botão de login
    await page.click('[data-testid="login-button"]')
    
    // Verificar redirecionamento para dashboard
    await expect(page).toHaveURL('/dashboard')
    await expect(page.locator('h1')).toContainText('Dashboard')
    
    // Verificar se elementos do dashboard estão visíveis
    await expect(page.locator('[data-testid="kpi-cards"]')).toBeVisible()
    await expect(page.locator('[data-testid="sidebar"]')).toBeVisible()
  })

  test('deve mostrar erro com credenciais inválidas', async ({ page }) => {
    await page.goto('/login')
    
    // Tentar login com credenciais inválidas
    await page.fill('[data-testid="email-input"]', 'invalid@email.com')
    await page.fill('[data-testid="password-input"]', 'wrongpassword')
    await page.click('[data-testid="login-button"]')
    
    // Verificar mensagem de erro
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible()
    await expect(page.locator('[data-testid="error-message"]')).toContainText('Credenciais inválidas')
    
    // Verificar que ainda está na página de login
    await expect(page).toHaveURL('/login')
  })

  test('deve realizar logout corretamente', async ({ page }) => {
    // Fazer login primeiro
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'admin@clinica.com')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.click('[data-testid="login-button"]')
    
    // Verificar que está logado
    await expect(page).toHaveURL('/dashboard')
    
    // Fazer logout
    await page.click('[data-testid="user-menu"]')
    await page.click('[data-testid="logout-button"]')
    
    // Verificar redirecionamento para login
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h1')).toContainText('Login')
  })

  test('deve proteger rotas privadas', async ({ page }) => {
    // Tentar acessar página protegida sem login
    await page.goto('/patients')
    
    // Deve redirecionar para login
    await expect(page).toHaveURL('/login')
    
    // Tentar acessar dashboard sem login
    await page.goto('/dashboard')
    await expect(page).toHaveURL('/login')
  })

  test('deve alternar entre temas corretamente', async ({ page }) => {
    // Fazer login
    await page.goto('/login')
    await page.fill('[data-testid="email-input"]', 'admin@clinica.com')
    await page.fill('[data-testid="password-input"]', 'admin123')
    await page.click('[data-testid="login-button"]')
    
    await expect(page).toHaveURL('/dashboard')
    
    // Abrir menu de tema
    await page.click('[data-testid="theme-toggle"]')
    
    // Alternar para tema escuro
    await page.click('[data-testid="dark-theme-option"]')
    
    // Verificar se o tema escuro foi aplicado
    await expect(page.locator('html')).toHaveClass(/dark/)
    
    // Alternar de volta para tema claro
    await page.click('[data-testid="theme-toggle"]')
    await page.click('[data-testid="light-theme-option"]')
    
    // Verificar se o tema claro foi aplicado
    await expect(page.locator('html')).not.toHaveClass(/dark/)
  })
})
