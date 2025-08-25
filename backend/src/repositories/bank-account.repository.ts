import { PrismaClient, BankAccount, BankAccountType, Prisma } from '@prisma/client'
import { CreateBankAccountData, UpdateBankAccountData, BankAccountWithRelations } from '../types/entities'

export interface BankAccountRepository {
  findAll(options?: {
    active?: boolean
    accountType?: BankAccountType
    page?: number
    limit?: number
  }): Promise<BankAccountWithRelations[]>
  findById(id: string): Promise<BankAccountWithRelations | null>
  findByName(name: string): Promise<BankAccount | null>
  create(data: CreateBankAccountData): Promise<BankAccount>
  update(id: string, data: UpdateBankAccountData): Promise<BankAccount>
  delete(id: string): Promise<void>
  updateBalance(id: string, newBalance: number): Promise<BankAccount>
  recalculateBalance(id: string): Promise<BankAccount>
  count(options?: { active?: boolean; accountType?: BankAccountType }): Promise<number>
  getTotalBalance(options?: { active?: boolean }): Promise<number>
}

export class PrismaBankAccountRepository implements BankAccountRepository {
  constructor(private prisma: PrismaClient) {}

  async findAll(options: {
    active?: boolean
    accountType?: BankAccountType
    page?: number
    limit?: number
  } = {}): Promise<BankAccountWithRelations[]> {
    const { active, accountType, page = 1, limit = 50 } = options
    
    const where: Prisma.BankAccountWhereInput = {}
    
    if (active !== undefined) {
      where.active = active
    }
    
    if (accountType) {
      where.accountType = accountType
    }

    const skip = (page - 1) * limit

    return this.prisma.bankAccount.findMany({
      where,
      include: {
        financialEntries: {
          orderBy: { createdAt: 'desc' },
          take: 10 // Últimas 10 movimentações para preview
        }
      },
      orderBy: [
        { active: 'desc' },
        { name: 'asc' }
      ],
      skip,
      take: limit
    }) as any
  }

  async findById(id: string): Promise<BankAccountWithRelations | null> {
    return this.prisma.bankAccount.findUnique({
      where: { id },
      include: {
        financialEntries: {
          include: {
            partner: true,
            patient: true,
            appointment: {
              include: {
                productService: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    }) as any
  }

  async findByName(name: string): Promise<BankAccount | null> {
    return this.prisma.bankAccount.findFirst({
      where: { name }
    })
  }

  async create(data: CreateBankAccountData): Promise<BankAccount> {
    return this.prisma.bankAccount.create({
      data: {
        ...data,
        currentBalance: data.initialBalance || 0
      }
    })
  }

  async update(id: string, data: UpdateBankAccountData): Promise<BankAccount> {
    return this.prisma.bankAccount.update({
      where: { id },
      data
    })
  }

  async delete(id: string): Promise<void> {
    await this.prisma.bankAccount.delete({
      where: { id }
    })
  }

  async updateBalance(id: string, newBalance: number): Promise<BankAccount> {
    return this.prisma.bankAccount.update({
      where: { id },
      data: { currentBalance: newBalance }
    })
  }

  async recalculateBalance(id: string): Promise<BankAccount> {
    // Buscar conta bancária
    const account = await this.prisma.bankAccount.findUnique({
      where: { id },
      include: {
        financialEntries: {
          where: {
            status: 'PAID' // Apenas lançamentos pagos afetam o saldo
          }
        }
      }
    })

    if (!account) {
      throw new Error('Conta bancária não encontrada')
    }

    // Calcular saldo baseado no saldo inicial + entradas - saídas
    let calculatedBalance = Number(account.initialBalance)

    for (const entry of account.financialEntries) {
      const amount = Number(entry.amount)
      if (entry.type === 'INCOME') {
        calculatedBalance += amount
      } else if (entry.type === 'EXPENSE') {
        calculatedBalance -= amount
      }
    }

    // Atualizar saldo atual
    return this.updateBalance(id, calculatedBalance)
  }

  async count(options: { active?: boolean; accountType?: BankAccountType } = {}): Promise<number> {
    const { active, accountType } = options
    
    const where: Prisma.BankAccountWhereInput = {}
    
    if (active !== undefined) {
      where.active = active
    }
    
    if (accountType) {
      where.accountType = accountType
    }

    return this.prisma.bankAccount.count({ where })
  }

  async getTotalBalance(options: { active?: boolean } = {}): Promise<number> {
    const { active = true } = options
    
    const accounts = await this.prisma.bankAccount.findMany({
      where: { active },
      select: { currentBalance: true }
    })

    return accounts.reduce((total, account) => {
      return total + Number(account.currentBalance)
    }, 0)
  }
}
