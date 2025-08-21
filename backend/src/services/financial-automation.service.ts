import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface BalanceRecalculationResult {
  accountId: string
  accountName: string
  oldBalance: number
  newBalance: number
  difference: number
  entriesProcessed: number
}

class FinancialAutomationService {

  /**
   * 💰 Recalcular saldos de todas as contas bancárias
   */
  async recalculateAllAccountBalances(): Promise<BalanceRecalculationResult[]> {
    try {
      console.log('💰 Iniciando recálculo de saldos de todas as contas...')

      // Buscar todas as contas ativas
      const accounts = await prisma.bankAccount.findMany({
        where: { active: true },
        include: {
          financialEntries: {
            where: {
              status: 'PAID'
            },
            orderBy: {
              paidDate: 'asc'
            }
          }
        }
      })

      const results: BalanceRecalculationResult[] = []

      for (const account of accounts) {
        const result = await this.recalculateAccountBalance(account.id)
        results.push(result)
      }

      console.log(`✅ Recálculo concluído para ${results.length} contas`)
      return results
    } catch (error) {
      console.error('❌ Erro no recálculo de saldos:', error)
      throw error
    }
  }

  /**
   * 💳 Recalcular saldo de uma conta específica
   */
  async recalculateAccountBalance(accountId: string): Promise<BalanceRecalculationResult> {
    try {
      console.log(`💳 Recalculando saldo da conta ${accountId}...`)

      // Buscar conta com lançamentos
      const account = await prisma.bankAccount.findUnique({
        where: { id: accountId },
        include: {
          financialEntries: {
            where: {
              status: 'PAID'
            },
            orderBy: {
              paidDate: 'asc'
            }
          }
        }
      })

      if (!account) {
        throw new Error('Conta bancária não encontrada')
      }

      const oldBalance = Number(account.currentBalance)
      let newBalance = Number(account.initialBalance)

      // Calcular saldo baseado nos lançamentos pagos
      for (const entry of account.financialEntries) {
        if (entry.type === 'INCOME') {
          newBalance += Number(entry.amount)
        } else if (entry.type === 'EXPENSE') {
          newBalance -= Number(entry.amount)
        }
      }

      // Atualizar saldo na conta
      await prisma.bankAccount.update({
        where: { id: accountId },
        data: { currentBalance: newBalance }
      })

      const result: BalanceRecalculationResult = {
        accountId: account.id,
        accountName: account.name,
        oldBalance,
        newBalance,
        difference: newBalance - oldBalance,
        entriesProcessed: account.financialEntries.length
      }

      console.log(`✅ Conta ${account.name}: R$ ${oldBalance.toFixed(2)} → R$ ${newBalance.toFixed(2)}`)
      return result
    } catch (error) {
      console.error(`❌ Erro ao recalcular conta ${accountId}:`, error)
      throw error
    }
  }

  /**
   * 🔄 Processar lançamentos pendentes automaticamente
   */
  async processOverdueEntries(): Promise<{
    processed: number
    totalAmount: number
    entries: any[]
  }> {
    try {
      console.log('🔄 Processando lançamentos vencidos...')

      const today = new Date()
      today.setHours(23, 59, 59, 999) // Final do dia

      // Buscar lançamentos vencidos
      const overdueEntries = await prisma.financialEntry.findMany({
        where: {
          status: 'PENDING',
          dueDate: {
            lte: today
          }
        },
        include: {
          bankAccount: true,
          patient: true,
          partner: true
        },
        orderBy: {
          dueDate: 'asc'
        }
      })

      let totalAmount = 0
      const processedEntries = []

      for (const entry of overdueEntries) {
        // Marcar como pago automaticamente (simulação)
        const updatedEntry = await prisma.financialEntry.update({
          where: { id: entry.id },
          data: {
            status: 'PAID',
            paidDate: new Date()
          }
        })

        totalAmount += Number(entry.amount)
        processedEntries.push(updatedEntry)

        console.log(`✅ Lançamento processado: ${entry.description} - R$ ${Number(entry.amount).toFixed(2)}`)
      }

      // Recalcular saldos das contas afetadas
      const affectedAccounts = [...new Set(overdueEntries.map(e => e.bankAccountId).filter(Boolean))]
      
      for (const accountId of affectedAccounts) {
        if (accountId) {
          await this.recalculateAccountBalance(accountId)
        }
      }

      console.log(`✅ ${processedEntries.length} lançamentos vencidos processados - Total: R$ ${totalAmount.toFixed(2)}`)

      return {
        processed: processedEntries.length,
        totalAmount,
        entries: processedEntries
      }
    } catch (error) {
      console.error('❌ Erro ao processar lançamentos vencidos:', error)
      throw error
    }
  }

  /**
   * 🤖 Executar todas as automações financeiras
   */
  async runAllAutomations(): Promise<{
    balanceRecalculation: BalanceRecalculationResult[]
    overdueProcessing: any
    executedAt: Date
  }> {
    try {
      console.log('🤖 Executando automações financeiras...')

      const executedAt = new Date()

      // 1. Processar lançamentos vencidos
      const overdueProcessing = await this.processOverdueEntries()

      // 2. Recalcular saldos
      const balanceRecalculation = await this.recalculateAllAccountBalances()

      console.log('✅ Todas as automações financeiras executadas com sucesso')

      return {
        balanceRecalculation,
        overdueProcessing,
        executedAt
      }
    } catch (error) {
      console.error('❌ Erro nas automações financeiras:', error)
      throw error
    }
  }

  /**
   * 📊 Obter relatório de inconsistências financeiras
   */
  async getFinancialInconsistencies(): Promise<{
    accountsWithInconsistencies: any[]
    totalInconsistencies: number
    suggestedActions: string[]
  }> {
    try {
      console.log('📊 Verificando inconsistências financeiras...')

      const accounts = await prisma.bankAccount.findMany({
        where: { active: true },
        include: {
          financialEntries: {
            where: {
              status: 'PAID'
            }
          }
        }
      })

      const accountsWithInconsistencies = []
      const suggestedActions = []

      for (const account of accounts) {
        // Calcular saldo real baseado nos lançamentos
        let calculatedBalance = Number(account.initialBalance)
        
        for (const entry of account.financialEntries) {
          if (entry.type === 'INCOME') {
            calculatedBalance += Number(entry.amount)
          } else if (entry.type === 'EXPENSE') {
            calculatedBalance -= Number(entry.amount)
          }
        }

        const currentBalance = Number(account.currentBalance)
        const difference = Math.abs(calculatedBalance - currentBalance)

        // Considerar inconsistência se diferença > R$ 0.01
        if (difference > 0.01) {
          accountsWithInconsistencies.push({
            accountId: account.id,
            accountName: account.name,
            currentBalance,
            calculatedBalance,
            difference,
            entriesCount: account.financialEntries.length
          })

          suggestedActions.push(`Recalcular saldo da conta "${account.name}"`)
        }
      }

      console.log(`📊 Encontradas ${accountsWithInconsistencies.length} inconsistências`)

      return {
        accountsWithInconsistencies,
        totalInconsistencies: accountsWithInconsistencies.length,
        suggestedActions
      }
    } catch (error) {
      console.error('❌ Erro ao verificar inconsistências:', error)
      throw error
    }
  }
}

export const financialAutomationService = new FinancialAutomationService()
export { FinancialAutomationService }
