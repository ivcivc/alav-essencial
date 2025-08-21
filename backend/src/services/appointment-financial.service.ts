import { PrismaClient } from '@prisma/client'
import { convertPrismaProductService } from '../utils/typeConverters'

const prisma = new PrismaClient()

export interface CheckoutFinancialData {
  paymentMethod: 'CASH' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'PIX' | 'BANK_TRANSFER'
  bankAccountId: string
  totalAmount: number
  discountAmount?: number
  additionalCharges?: number
  notes?: string
}

/**
 * Processa checkout financeiro automático
 */
export async function processCheckoutFinancials(
  appointmentId: string,
  financialData: CheckoutFinancialData
): Promise<{
  revenueEntry: any
  commissionCalculation: {
    commissionAmount: number
    commissionEntry?: any
  }
  totalProcessed: number
}> {
  try {
    console.log(`💰 Iniciando processamento financeiro para agendamento ${appointmentId}`)

    // Buscar o agendamento com relações
    const appointment = await prisma.appointment.findUnique({
      where: { id: appointmentId },
      include: {
        patient: true,
        partner: true,
        productService: {
          include: {
            category: true
          }
        },
        room: true
      }
    })

    if (!appointment) {
      throw new Error('Agendamento não encontrado')
    }

    if (!appointment.productService) {
      throw new Error('Serviço não encontrado no agendamento')
    }

    // Converter dados do produto/serviço
    const productService = convertPrismaProductService(appointment.productService)

    // Calcular valores
    const servicePrice = Number(productService.salePrice)
    const discountAmount = financialData.discountAmount || 0
    const additionalCharges = financialData.additionalCharges || 0
    const finalAmount = financialData.totalAmount || (servicePrice - discountAmount + additionalCharges)

    console.log(`📊 Valores calculados: Serviço R$ ${servicePrice}, Final R$ ${finalAmount}`)

    // 1. Criar lançamento de receita para a clínica
    const revenueEntry = await prisma.financialEntry.create({
      data: {
        type: 'INCOME',
        category: getCategoryByServiceType(productService.type),
        subcategory: productService.name,
        description: `${productService.name} - ${appointment.patient.fullName}`,
        amount: finalAmount,
        dueDate: new Date(),
        paidDate: new Date(),
        status: 'PAID',
        paymentMethod: financialData.paymentMethod,
        bankAccountId: financialData.bankAccountId,
        notes: financialData.notes,
        referenceType: 'APPOINTMENT',
        referenceId: appointmentId,
        patientId: appointment.patientId,
        partnerId: appointment.partnerId,
      }
    })

    console.log(`✅ Receita lançada: R$ ${finalAmount}`)

    // 2. Calcular e processar comissão do parceiro
    const commissionCalculation = await calculatePartnerCommission(appointment, finalAmount)

    console.log(`🤝 Comissão calculada: R$ ${commissionCalculation.commissionAmount}`)

    return {
      revenueEntry,
      commissionCalculation,
      totalProcessed: finalAmount
    }

  } catch (error) {
    console.error(`❌ Erro no processamento financeiro:`, error)
    throw error
  }
}

/**
 * Calcula comissão do parceiro baseado no tipo de parceria
 */
async function calculatePartnerCommission(
  appointment: any,
  serviceAmount: number
): Promise<{
  commissionAmount: number
  commissionEntry?: any
}> {
  const partner = appointment.partner

  if (!partner) {
    return { commissionAmount: 0 }
  }

  console.log(`🔍 Calculando comissão para parceiro ${partner.fullName} (${partner.partnershipType})`)

  switch (partner.partnershipType) {
    case 'SUBLEASE':
      // Parceiro de sublocação: não recebe comissão (já paga valor fixo)
      console.log(`🏢 Sublocação: Sem comissão (parceiro paga sublocação)`)
      return { commissionAmount: 0 }

    case 'PERCENTAGE':
      // Parceiro de porcentagem: recebe % do valor ou valor fixo
      let commissionAmount = 0
      
      if (partner.percentageRate && Number(partner.percentageRate) > 0) {
        commissionAmount = (serviceAmount * Number(partner.percentageRate)) / 100
        console.log(`💰 Comissão por %: ${partner.percentageRate}% de R$ ${serviceAmount} = R$ ${commissionAmount}`)
      } else if (partner.percentageAmount && Number(partner.percentageAmount) > 0) {
        commissionAmount = Number(partner.percentageAmount)
        console.log(`💰 Comissão fixa: R$ ${commissionAmount}`)
      }

      if (commissionAmount > 0) {
        // Buscar uma conta bancária padrão para o lançamento de comissão
        const defaultBankAccount = await prisma.bankAccount.findFirst({
          where: { active: true },
          orderBy: { createdAt: 'asc' }
        })

        if (!defaultBankAccount) {
          console.warn('⚠️ Nenhuma conta bancária ativa encontrada para lançamento de comissão')
          return { commissionAmount: 0 }
        }

        // Criar lançamento no contas a pagar
        const commissionEntry = await prisma.financialEntry.create({
          data: {
            type: 'EXPENSE',
            category: 'PARTNER_COMMISSION',
            subcategory: partner.fullName,
            description: `Comissão - ${appointment.productService.name} - ${appointment.patient.fullName}`,
            amount: commissionAmount,
            dueDate: new Date(),
            status: 'PENDING',
            referenceType: 'APPOINTMENT',
            referenceId: appointment.id,
            partnerId: partner.id,
            bankAccountId: defaultBankAccount.id,
            notes: `Comissão automática - ${partner.partnershipType}`
          }
        })

        return { commissionAmount, commissionEntry }
      }

      return { commissionAmount: 0 }

    case 'PERCENTAGE_WITH_PRODUCTS':
      // Parceiro com produtos próprios: clínica recebe % sobre produtos do parceiro
      const clinicPercentage = Number(partner.percentageRate) || 30 // Default 30%
      const clinicAmount = (serviceAmount * clinicPercentage) / 100
      const partnerAmount = serviceAmount - clinicAmount

      console.log(`🤝 Parceria com produtos: Clínica R$ ${clinicAmount}, Parceiro R$ ${partnerAmount}`)

      // A "comissão" aqui é o que sobra para o parceiro
      return { commissionAmount: partnerAmount }

    default:
      console.log(`❓ Tipo de parceria desconhecido: ${partner.partnershipType}`)
      return { commissionAmount: 0 }
  }
}

/**
 * Busca dados financeiros de um agendamento
 */
export async function getAppointmentFinancials(appointmentId: string): Promise<{
  revenue: any[]
  commissions: any[]
  total: {
    revenue: number
    commissions: number
  }
}> {
  try {
    // Buscar lançamentos financeiros relacionados ao agendamento
    const entries = await prisma.financialEntry.findMany({
      where: {
        referenceType: 'APPOINTMENT',
        referenceId: appointmentId
      },
      include: {
        bankAccount: true
      }
    })

    const revenue = entries.filter(entry => entry.type === 'INCOME')
    const commissions = entries.filter(entry => entry.type === 'EXPENSE')

    const totalRevenue = revenue.reduce((sum, entry) => sum + Number(entry.amount), 0)
    const totalCommissions = commissions.reduce((sum, entry) => sum + Number(entry.amount), 0)

    return {
      revenue,
      commissions,
      total: {
        revenue: totalRevenue,
        commissions: totalCommissions
      }
    }
  } catch (error) {
    console.error('Erro ao buscar dados financeiros do agendamento:', error)
    throw error
  }
}

/**
 * Gera relatório de comissões por parceiro
 */
export async function getPartnerCommissionsReport(
  startDate: Date,
  endDate: Date,
  partnerId?: string
): Promise<any[]> {
  try {
    const whereClause: any = {
      type: 'EXPENSE',
      category: 'PARTNER_COMMISSION',
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    }

    if (partnerId) {
      whereClause.partnerId = partnerId
    }

    const entries = await prisma.financialEntry.findMany({
      where: whereClause,
      include: {
        partner: true,
        bankAccount: true
      },
      orderBy: {
        dueDate: 'desc'
      }
    })

    // Agrupar por parceiro
    const byPartner: { [key: string]: any } = {}

    entries.forEach(entry => {
      const partnerId = entry.partnerId || 'unknown'
      const partnerName = entry.partner?.fullName || 'Parceiro Desconhecido'

      if (!byPartner[partnerId]) {
        byPartner[partnerId] = {
          partnerId,
          partnerName,
          totalCommissions: 0,
          entries: []
        }
      }

      byPartner[partnerId].totalCommissions += Number(entry.amount)
      byPartner[partnerId].entries.push(entry)
    })

    return Object.values(byPartner)
  } catch (error) {
    console.error('Erro ao gerar relatório de comissões:', error)
    throw error
  }
}

/**
 * Determina categoria financeira baseada no tipo de serviço
 */
function getCategoryByServiceType(serviceType: string): string {
  switch (serviceType) {
    case 'SERVICE':
      return 'CONSULTATION'
    case 'PRODUCT':
      return 'PRODUCT_SALES'
    default:
      return 'OTHER_INCOME'
  }
}

// Exportar como objeto para compatibilidade
/**
 * Cancela lançamentos financeiros relacionados a um agendamento
 */
export async function cancelFinancialEntries(
  appointmentId: string,
  cancellationReason: string
): Promise<{
  cancelledEntries: number
  totalAmount: number
}> {
  try {
    console.log(`💰 Iniciando cancelamento de lançamentos financeiros para agendamento ${appointmentId}`)

    // Buscar todos os lançamentos financeiros relacionados ao agendamento
    const relatedEntries = await prisma.financialEntry.findMany({
      where: {
        OR: [
          { referenceId: appointmentId, referenceType: 'APPOINTMENT' },
          { appointmentId: appointmentId }
        ],
        status: {
          not: 'CANCELLED' // Não cancelar os já cancelados
        }
      }
    })

    if (relatedEntries.length === 0) {
      console.log(`ℹ️ Nenhum lançamento financeiro encontrado para o agendamento ${appointmentId}`)
      return { cancelledEntries: 0, totalAmount: 0 }
    }

    let totalAmount = 0
    let cancelledCount = 0

    // Cancelar cada lançamento encontrado
    for (const entry of relatedEntries) {
      try {
        // Atualizar status para CANCELLED e adicionar observação
        await prisma.financialEntry.update({
          where: { id: entry.id },
          data: {
            status: 'CANCELLED',
            notes: entry.notes 
              ? `${entry.notes}\n\nCANCELADO: Agendamento cancelado - ${cancellationReason}`
              : `CANCELADO: Agendamento cancelado - ${cancellationReason}`
          }
        })

        totalAmount += Number(entry.amount)
        cancelledCount++

        console.log(`✅ Lançamento ${entry.id} cancelado: ${entry.description} - R$ ${entry.amount}`)

        // Se o lançamento estava pago, recalcular saldo da conta bancária
        if (entry.status === 'PAID') {
          const adjustment = entry.type === 'INCOME' ? Number(-entry.amount) : Number(entry.amount)
          await prisma.bankAccount.update({
            where: { id: entry.bankAccountId },
            data: {
              currentBalance: {
                increment: adjustment
              }
            }
          })
          console.log(`💳 Saldo da conta ${entry.bankAccountId} ajustado em R$ ${adjustment}`)
        }

      } catch (error) {
        console.error(`❌ Erro ao cancelar lançamento ${entry.id}:`, error)
      }
    }

    console.log(`✅ Cancelamento concluído: ${cancelledCount} lançamentos, R$ ${totalAmount} total`)

    return {
      cancelledEntries: cancelledCount,
      totalAmount
    }

  } catch (error) {
    console.error(`❌ Erro no cancelamento de lançamentos financeiros:`, error)
    throw error
  }
}

/**
 * Cancela apenas o checkout financeiro do agendamento (sem cancelar o agendamento)
 */
export async function cancelCheckoutFinancials(
  appointmentId: string,
  cancellationReason: string
): Promise<{
  cancelledEntries: number
  totalAmount: number
}> {
  try {
    console.log(`💰 Cancelando checkout financeiro para agendamento ${appointmentId}`)

    // Buscar lançamentos financeiros relacionados ao agendamento
    const relatedEntries = await prisma.financialEntry.findMany({
      where: {
        OR: [
          { referenceId: appointmentId, referenceType: 'APPOINTMENT' },
          { appointmentId: appointmentId }
        ],
        status: {
          not: 'CANCELLED'
        }
      }
    })

    if (relatedEntries.length === 0) {
      console.log(`ℹ️ Nenhum lançamento financeiro ativo encontrado para o agendamento ${appointmentId}`)
      return { cancelledEntries: 0, totalAmount: 0 }
    }

    let totalAmount = 0
    let cancelledCount = 0

    // Cancelar cada lançamento encontrado
    for (const entry of relatedEntries) {
      try {
        // Atualizar status para CANCELLED e adicionar observação
        await prisma.financialEntry.update({
          where: { id: entry.id },
          data: {
            status: 'CANCELLED',
            notes: entry.notes 
              ? `${entry.notes}\n\nCANCELADO: Checkout cancelado - ${cancellationReason}`
              : `CANCELADO: Checkout cancelado - ${cancellationReason}`
          }
        })

        totalAmount += Number(entry.amount)
        cancelledCount++

        console.log(`✅ Lançamento ${entry.id} cancelado: ${entry.description} - R$ ${entry.amount}`)

        // Se o lançamento estava pago, recalcular saldo da conta bancária
        if (entry.status === 'PAID') {
          const adjustment = entry.type === 'INCOME' ? Number(-entry.amount) : Number(entry.amount)
          await prisma.bankAccount.update({
            where: { id: entry.bankAccountId },
            data: {
              currentBalance: {
                increment: adjustment
              }
            }
          })
          console.log(`💳 Saldo da conta ${entry.bankAccountId} ajustado em R$ ${adjustment}`)
        }

      } catch (error) {
        console.error(`❌ Erro ao cancelar lançamento ${entry.id}:`, error)
      }
    }

    console.log(`✅ Cancelamento de checkout concluído: ${cancelledCount} lançamentos, R$ ${totalAmount} total`)

    return {
      cancelledEntries: cancelledCount,
      totalAmount
    }

  } catch (error) {
    console.error(`❌ Erro no cancelamento de checkout:`, error)
    throw error
  }
}

export const appointmentFinancialService = {
  processCheckoutFinancials,
  getAppointmentFinancials,
  calculatePartnerCommission: (appointment: any, serviceAmount: number) => 
    calculatePartnerCommission(appointment, serviceAmount),
  getPartnerCommissionsReport,
  cancelFinancialEntries,
  cancelCheckoutFinancials
}