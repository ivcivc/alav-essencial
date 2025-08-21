import { FinancialEntryRepository } from '../repositories'
import { FinancialEntryType } from '../types/shared'

export interface FinancialCategory {
  name: string
  type: FinancialEntryType
  subcategories: string[]
  description?: string
  color?: string
  icon?: string
}

export class FinancialCategoryService {
  constructor(private financialEntryRepository: FinancialEntryRepository) {}

  // Categorias predefinidas para receitas
  private readonly incomeCategories: FinancialCategory[] = [
    {
      name: 'Consultas',
      type: FinancialEntryType.INCOME,
      subcategories: [
        'Clínica Geral',
        'Cardiologia',
        'Ginecologia',
        'Pediatria',
        'Dermatologia',
        'Psicologia',
        'Fisioterapia',
        'Odontologia',
        'Retorno',
        'Emergência'
      ],
      description: 'Receitas provenientes de consultas médicas',
      color: '#10B981',
      icon: '🩺'
    },
    {
      name: 'Exames',
      type: FinancialEntryType.INCOME,
      subcategories: [
        'Ultrassom',
        'Eletrocardiograma',
        'Raio-X',
        'Ressonância',
        'Tomografia',
        'Endoscopia',
        'Laboratório',
        'Biópsia'
      ],
      description: 'Receitas de exames diagnósticos',
      color: '#3B82F6',
      icon: '📊'
    },
    {
      name: 'Procedimentos',
      type: FinancialEntryType.INCOME,
      subcategories: [
        'Cirurgia Pequeno Porte',
        'Cirurgia Médio Porte',
        'Cauterização',
        'Sutura',
        'Drenagem',
        'Infiltração',
        'Biopsia',
        'Laser'
      ],
      description: 'Receitas de procedimentos médicos',
      color: '#8B5CF6',
      icon: '⚕️'
    },
    {
      name: 'Vendas',
      type: FinancialEntryType.INCOME,
      subcategories: [
        'Medicamentos',
        'Materiais Médicos',
        'Suplementos',
        'Cosméticos',
        'Equipamentos',
        'Produtos de Higiene'
      ],
      description: 'Receitas de vendas de produtos',
      color: '#F59E0B',
      icon: '🛒'
    },
    {
      name: 'Convênios',
      type: FinancialEntryType.INCOME,
      subcategories: [
        'Unimed',
        'Bradesco Saúde',
        'Amil',
        'SulAmérica',
        'Golden Cross',
        'Prevent Senior',
        'Outros Convênios'
      ],
      description: 'Receitas de convênios médicos',
      color: '#06B6D4',
      icon: '🏥'
    },
    {
      name: 'Outras Receitas',
      type: FinancialEntryType.INCOME,
      subcategories: [
        'Aplicação de Injetáveis',
        'Certificados',
        'Laudos',
        'Relatórios',
        'Consultorias',
        'Cursos/Palestras',
        'Rendimentos Financeiros'
      ],
      description: 'Outras fontes de receita',
      color: '#84CC16',
      icon: '💰'
    }
  ]

  // Categorias predefinidas para despesas
  private readonly expenseCategories: FinancialCategory[] = [
    {
      name: 'Pessoal',
      type: FinancialEntryType.EXPENSE,
      subcategories: [
        'Salários',
        'Pró-labore',
        'Férias',
        '13º Salário',
        'FGTS',
        'INSS',
        'Vale Transporte',
        'Vale Alimentação',
        'Plano de Saúde',
        'Comissões'
      ],
      description: 'Gastos com pessoal e encargos',
      color: '#EF4444',
      icon: '👥'
    },
    {
      name: 'Infraestrutura',
      type: FinancialEntryType.EXPENSE,
      subcategories: [
        'Aluguel',
        'Condomínio',
        'IPTU',
        'Energia Elétrica',
        'Água',
        'Telefone/Internet',
        'Segurança',
        'Limpeza',
        'Manutenção Predial'
      ],
      description: 'Gastos com infraestrutura e instalações',
      color: '#F97316',
      icon: '🏢'
    },
    {
      name: 'Operacional',
      type: FinancialEntryType.EXPENSE,
      subcategories: [
        'Materiais Médicos',
        'Medicamentos',
        'Materiais de Escritório',
        'Equipamentos',
        'Software/Sistemas',
        'Licenças',
        'Descartáveis',
        'Uniformes'
      ],
      description: 'Gastos operacionais da clínica',
      color: '#8B5CF6',
      icon: '🔧'
    },
    {
      name: 'Serviços',
      type: FinancialEntryType.EXPENSE,
      subcategories: [
        'Contabilidade',
        'Advocacia',
        'Consultoria',
        'Marketing',
        'Publicidade',
        'Website',
        'Lavanderia',
        'Manutenção Equipamentos'
      ],
      description: 'Serviços contratados',
      color: '#06B6D4',
      icon: '🛠️'
    },
    {
      name: 'Financeiro',
      type: FinancialEntryType.EXPENSE,
      subcategories: [
        'Juros',
        'Multas',
        'Taxas Bancárias',
        'Cartão de Crédito',
        'Empréstimos',
        'Financiamentos',
        'IOF',
        'Seguros'
      ],
      description: 'Gastos financeiros e bancários',
      color: '#DC2626',
      icon: '💳'
    },
    {
      name: 'Impostos e Taxas',
      type: FinancialEntryType.EXPENSE,
      subcategories: [
        'Simples Nacional',
        'ISS',
        'PIS/COFINS',
        'IR',
        'CSLL',
        'Taxas Profissionais',
        'Anuidades CRM',
        'Alvará Sanitário'
      ],
      description: 'Impostos e taxas obrigatórias',
      color: '#7C2D12',
      icon: '📋'
    },
    {
      name: 'Outras Despesas',
      type: FinancialEntryType.EXPENSE,
      subcategories: [
        'Viagens',
        'Hospedagem',
        'Alimentação',
        'Combustível',
        'Estacionamento',
        'Correios',
        'Doações',
        'Diversos'
      ],
      description: 'Outras despesas diversas',
      color: '#6B7280',
      icon: '📦'
    }
  ]

  getAllCategories(): FinancialCategory[] {
    return [...this.incomeCategories, ...this.expenseCategories]
  }

  getCategoriesByType(type: FinancialEntryType): FinancialCategory[] {
    return type === FinancialEntryType.INCOME 
      ? this.incomeCategories 
      : this.expenseCategories
  }

  getCategoryByName(name: string): FinancialCategory | undefined {
    return this.getAllCategories().find(cat => cat.name === name)
  }

  getSubcategoriesByCategory(categoryName: string): string[] {
    const category = this.getCategoryByName(categoryName)
    return category ? category.subcategories : []
  }

  async getCategoriesWithUsage(): Promise<Array<FinancialCategory & { usageCount: number }>> {
    const categories = this.getAllCategories()
    const categoriesWithUsage = []

    for (const category of categories) {
      const usageCount = await this.financialEntryRepository.count({
        type: category.type,
        category: category.name
      })

      categoriesWithUsage.push({
        ...category,
        usageCount
      })
    }

    return categoriesWithUsage
  }

  async getSubcategoriesWithUsage(categoryName: string): Promise<Array<{ name: string; usageCount: number }>> {
    const category = this.getCategoryByName(categoryName)
    if (!category) return []

    const subcategoriesWithUsage = []

    for (const subcategory of category.subcategories) {
      const usageCount = await this.financialEntryRepository.count({
        type: category.type,
        category: categoryName
        // Note: Você pode adicionar filtro por subcategoria se necessário
      })

      subcategoriesWithUsage.push({
        name: subcategory,
        usageCount: 0 // Temporário - você pode implementar contagem por subcategoria
      })
    }

    return subcategoriesWithUsage
  }

  validateCategoryAndSubcategory(type: FinancialEntryType, category: string, subcategory?: string): boolean {
    const categories = this.getCategoriesByType(type)
    const foundCategory = categories.find(cat => cat.name === category)
    
    if (!foundCategory) {
      return false
    }

    if (subcategory && !foundCategory.subcategories.includes(subcategory)) {
      return false
    }

    return true
  }

  suggestCategory(description: string, type: FinancialEntryType): FinancialCategory | null {
    const categories = this.getCategoriesByType(type)
    const descriptionLower = description.toLowerCase()

    // Buscar por palavras-chave na descrição
    for (const category of categories) {
      const categoryKeywords = [
        category.name.toLowerCase(),
        ...category.subcategories.map(sub => sub.toLowerCase())
      ]

      for (const keyword of categoryKeywords) {
        if (descriptionLower.includes(keyword)) {
          return category
        }
      }
    }

    // Buscar por palavras-chave específicas
    const keywordMap: Record<string, string> = {
      'consulta': 'Consultas',
      'exame': 'Exames',
      'cirurgia': 'Procedimentos',
      'salario': 'Pessoal',
      'aluguel': 'Infraestrutura',
      'energia': 'Infraestrutura',
      'luz': 'Infraestrutura',
      'agua': 'Infraestrutura',
      'internet': 'Infraestrutura',
      'telefone': 'Infraestrutura',
      'imposto': 'Impostos e Taxas',
      'taxa': 'Impostos e Taxas'
    }

    for (const [keyword, categoryName] of Object.entries(keywordMap)) {
      if (descriptionLower.includes(keyword)) {
        return this.getCategoryByName(categoryName) || null
      }
    }

    return null
  }
}
