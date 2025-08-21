import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Seed patients
  await seedPatients()
  
  // Seed rooms
  await seedRooms()
  
  // Seed categories
  await seedCategories()
  
  // Seed products and services
  await seedProductServices()
  
  // Seed partners
  await seedPartners()
  
  // Seed appointments
  await seedAppointments()
  
  // Seed notifications
  await seedNotifications()

  // Seed financial system
  await seedFinancialSystem()

  // Seed advanced financial data
  await seedAdvancedFinancialData()

  // Seed partner settlement test data
  await seedPartnerSettlementData()

  console.log('✅ Database seeding completed!')
}

async function seedPatients() {
  console.log('📋 Seeding patients...')

  const patients = [
    {
      fullName: 'Maria Silva Santos',
      cpf: '12345678901',
      birthDate: new Date('1985-03-15'),
      whatsapp: '11987654321',
      phone: '1134567890',
      email: 'maria.silva@email.com',
      street: 'Rua das Flores',
      number: '123',
      complement: 'Apto 45',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567',
      observations: 'Paciente com histórico de alergias a medicamentos'
    },
    {
      fullName: 'João Carlos Oliveira',
      cpf: '23456789012',
      birthDate: new Date('1978-07-22'),
      whatsapp: '11876543210',
      email: 'joao.oliveira@email.com',
      street: 'Avenida Paulista',
      number: '1000',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310100',
      observations: 'Paciente diabético, requer cuidados especiais'
    },
    {
      fullName: 'Ana Paula Costa',
      cpf: '34567890123',
      birthDate: new Date('1992-11-08'),
      whatsapp: '11765432109',
      phone: '1123456789',
      email: 'ana.costa@email.com',
      street: 'Rua Augusta',
      number: '500',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305000'
    },
    {
      fullName: 'Carlos Eduardo Ferreira',
      cpf: '45678901234',
      birthDate: new Date('1965-12-03'),
      whatsapp: '11654321098',
      email: 'carlos.ferreira@email.com',
      street: 'Rua Oscar Freire',
      number: '200',
      complement: 'Sala 10',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426000',
      observations: 'Paciente idoso, necessita acompanhante'
    },
    {
      fullName: 'Fernanda Rodrigues Lima',
      cpf: '56789012345',
      birthDate: new Date('1988-05-17'),
      whatsapp: '11543210987',
      email: 'fernanda.lima@email.com',
      street: 'Rua Haddock Lobo',
      number: '300',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01414000'
    },
    {
      fullName: 'Roberto Almeida Souza',
      cpf: '67890123456',
      birthDate: new Date('1975-09-25'),
      whatsapp: '11432109876',
      phone: '1145678901',
      email: 'roberto.souza@email.com',
      street: 'Rua Teodoro Sampaio',
      number: '800',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05405000',
      observations: 'Paciente com mobilidade reduzida'
    },
    {
      fullName: 'Juliana Martins Pereira',
      cpf: '78901234567',
      birthDate: new Date('1990-01-12'),
      whatsapp: '11321098765',
      email: 'juliana.pereira@email.com',
      street: 'Rua Consolação',
      number: '1500',
      complement: 'Bloco B',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01301000'
    },
    {
      fullName: 'Pedro Henrique Silva',
      cpf: '89012345678',
      birthDate: new Date('1982-04-30'),
      whatsapp: '11210987654',
      email: 'pedro.silva@email.com',
      street: 'Avenida Faria Lima',
      number: '2000',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01451000',
      observations: 'Paciente executivo, prefere horários após 18h'
    },
    {
      fullName: 'Luciana Santos Oliveira',
      cpf: '90123456789',
      birthDate: new Date('1987-08-14'),
      whatsapp: '11109876543',
      phone: '1156789012',
      email: 'luciana.oliveira@email.com',
      street: 'Rua Pamplona',
      number: '600',
      neighborhood: 'Jardim Paulista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01405000'
    },
    {
      fullName: 'Marcos Antonio Costa',
      cpf: '01234567890',
      birthDate: new Date('1970-06-18'),
      whatsapp: '11098765432',
      email: 'marcos.costa@email.com',
      street: 'Rua Estados Unidos',
      number: '400',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01427000',
      observations: 'Paciente com histórico de hipertensão'
    }
  ]

  for (const patientData of patients) {
    const existingPatient = await prisma.patient.findUnique({
      where: { cpf: patientData.cpf }
    })

    if (!existingPatient) {
      await prisma.patient.create({
        data: patientData
      })
      console.log(`✅ Created patient: ${patientData.fullName}`)
    } else {
      console.log(`⏭️  Patient already exists: ${patientData.fullName}`)
    }
  }

  console.log('📋 Patients seeding completed!')
}

async function seedRooms() {
  console.log('🏥 Seeding rooms...')

  const rooms = [
    {
      name: 'Consultório 1',
      description: 'Consultório principal com vista para o jardim',
      resources: ['maca', 'armário', 'luz focal', 'pia', 'ar condicionado', 'computador']
    },
    {
      name: 'Consultório 2',
      description: 'Consultório secundário ideal para consultas rápidas',
      resources: ['maca', 'armário', 'luz focal', 'ar condicionado']
    },
    {
      name: 'Sala de Procedimentos',
      description: 'Sala equipada para pequenos procedimentos e curativos',
      resources: ['maca cirúrgica', 'armário com medicamentos', 'luz focal cirúrgica', 'pia', 'autoclave', 'carrinho de procedimentos', 'ar condicionado']
    },
    {
      name: 'Consultório Pediátrico',
      description: 'Consultório especializado para atendimento infantil',
      resources: ['maca pediátrica', 'balança infantil', 'régua de crescimento', 'brinquedos', 'armário', 'ar condicionado', 'decoração infantil']
    },
    {
      name: 'Sala de Fisioterapia',
      description: 'Sala ampla para sessões de fisioterapia e reabilitação',
      resources: ['tatame', 'bolas de pilates', 'therabands', 'halteres', 'maca de fisioterapia', 'espelho', 'ar condicionado', 'som ambiente']
    },
    {
      name: 'Consultório Ginecológico',
      description: 'Consultório especializado para consultas ginecológicas',
      resources: ['maca ginecológica', 'foco ginecológico', 'armário com materiais', 'pia', 'biombo', 'ar condicionado', 'cadeira para acompanhante']
    },
    {
      name: 'Sala de Exames',
      description: 'Sala para realização de exames complementares',
      resources: ['maca de exames', 'equipamento de ultrassom', 'eletrocardiógrafo', 'armário', 'pia', 'ar condicionado', 'computador']
    },
    {
      name: 'Consultório Psicológico',
      description: 'Ambiente acolhedor para consultas psicológicas',
      resources: ['poltronas confortáveis', 'mesa de apoio', 'ar condicionado', 'isolamento acústico', 'decoração relaxante', 'caixa de lenços']
    },
    {
      name: 'Sala de Reuniões',
      description: 'Sala para reuniões da equipe e discussão de casos',
      resources: ['mesa de reunião', 'cadeiras', 'projetor', 'tela de projeção', 'ar condicionado', 'quadro branco', 'computador']
    },
    {
      name: 'Consultório Odontológico',
      description: 'Consultório equipado para atendimento odontológico',
      resources: ['cadeira odontológica', 'equipo odontológico', 'compressor', 'autoclave', 'pia', 'armário com instrumentos', 'ar condicionado', 'sugador']
    }
  ]

  for (const roomData of rooms) {
    const existingRoom = await prisma.room.findFirst({
      where: { 
        name: { 
          equals: roomData.name, 
          mode: 'insensitive' 
        } 
      }
    })

    if (!existingRoom) {
      await prisma.room.create({
        data: roomData
      })
      console.log(`✅ Created room: ${roomData.name}`)
    } else {
      console.log(`⏭️  Room already exists: ${roomData.name}`)
    }
  }

  console.log('🏥 Rooms seeding completed!')
}

async function seedCategories() {
  console.log('📂 Seeding categories...')

  const categories = [
    // Service categories
    {
      name: 'Consultas Médicas',
      type: 'SERVICE' as const,
      description: 'Consultas médicas gerais e especializadas'
    },
    {
      name: 'Exames Diagnósticos',
      type: 'SERVICE' as const,
      description: 'Exames para diagnóstico e acompanhamento'
    },
    {
      name: 'Procedimentos Cirúrgicos',
      type: 'SERVICE' as const,
      description: 'Pequenos procedimentos e cirurgias ambulatoriais'
    },
    {
      name: 'Fisioterapia',
      type: 'SERVICE' as const,
      description: 'Sessões de fisioterapia e reabilitação'
    },
    {
      name: 'Psicologia',
      type: 'SERVICE' as const,
      description: 'Consultas e terapias psicológicas'
    },
    {
      name: 'Odontologia',
      type: 'SERVICE' as const,
      description: 'Tratamentos odontológicos diversos'
    },
    {
      name: 'Ginecologia',
      type: 'SERVICE' as const,
      description: 'Consultas e exames ginecológicos'
    },
    {
      name: 'Pediatria',
      type: 'SERVICE' as const,
      description: 'Consultas e acompanhamento pediátrico'
    },
    {
      name: 'Cardiologia',
      type: 'SERVICE' as const,
      description: 'Consultas e exames cardiológicos'
    },
    {
      name: 'Dermatologia',
      type: 'SERVICE' as const,
      description: 'Consultas e tratamentos dermatológicos'
    },
    
    // Product categories
    {
      name: 'Medicamentos',
      type: 'PRODUCT' as const,
      description: 'Medicamentos diversos para venda'
    },
    {
      name: 'Materiais Médicos',
      type: 'PRODUCT' as const,
      description: 'Materiais e equipamentos médicos'
    },
    {
      name: 'Suplementos',
      type: 'PRODUCT' as const,
      description: 'Suplementos alimentares e vitaminas'
    },
    {
      name: 'Cosméticos',
      type: 'PRODUCT' as const,
      description: 'Produtos cosméticos e de beleza'
    },
    {
      name: 'Equipamentos',
      type: 'PRODUCT' as const,
      description: 'Equipamentos médicos e de saúde'
    },
    {
      name: 'Higiene',
      type: 'PRODUCT' as const,
      description: 'Produtos de higiene pessoal'
    },
    {
      name: 'Ortopédicos',
      type: 'PRODUCT' as const,
      description: 'Produtos ortopédicos e de reabilitação'
    },
    {
      name: 'Descartáveis',
      type: 'PRODUCT' as const,
      description: 'Materiais descartáveis médicos'
    }
  ]

  for (const categoryData of categories) {
    const existingCategory = await prisma.category.findFirst({
      where: { 
        name: { 
          equals: categoryData.name, 
          mode: 'insensitive' 
        } 
      }
    })

    if (!existingCategory) {
      await prisma.category.create({
        data: categoryData
      })
      console.log(`✅ Created category: ${categoryData.name} (${categoryData.type})`)
    } else {
      console.log(`⏭️  Category already exists: ${categoryData.name}`)
    }
  }

  console.log('📂 Categories seeding completed!')
}

async function seedProductServices() {
  console.log('🛍️ Seeding products and services...')

  // Get categories for reference
  const consultasCategory = await prisma.category.findFirst({ where: { name: 'Consultas Médicas' } })
  const examesCategory = await prisma.category.findFirst({ where: { name: 'Exames Diagnósticos' } })
  const procedimentosCategory = await prisma.category.findFirst({ where: { name: 'Procedimentos Cirúrgicos' } })
  const fisioterapiaCategory = await prisma.category.findFirst({ where: { name: 'Fisioterapia' } })
  const psicologiaCategory = await prisma.category.findFirst({ where: { name: 'Psicologia' } })
  const odontologiaCategory = await prisma.category.findFirst({ where: { name: 'Odontologia' } })
  const ginecologiaCategory = await prisma.category.findFirst({ where: { name: 'Ginecologia' } })
  const pediatriaCategory = await prisma.category.findFirst({ where: { name: 'Pediatria' } })
  const cardiologiaCategory = await prisma.category.findFirst({ where: { name: 'Cardiologia' } })
  const dermatologiaCategory = await prisma.category.findFirst({ where: { name: 'Dermatologia' } })
  
  const medicamentosCategory = await prisma.category.findFirst({ where: { name: 'Medicamentos' } })
  const materiaisCategory = await prisma.category.findFirst({ where: { name: 'Materiais Médicos' } })
  const suplementosCategory = await prisma.category.findFirst({ where: { name: 'Suplementos' } })
  const cosmeticosCategory = await prisma.category.findFirst({ where: { name: 'Cosméticos' } })
  const equipamentosCategory = await prisma.category.findFirst({ where: { name: 'Equipamentos' } })
  const higieneCategory = await prisma.category.findFirst({ where: { name: 'Higiene' } })
  const ortopedicosCategory = await prisma.category.findFirst({ where: { name: 'Ortopédicos' } })
  const descartaveisCategory = await prisma.category.findFirst({ where: { name: 'Descartáveis' } })

  const services = [
    // Consultas Médicas
    {
      name: 'Consulta Clínica Geral',
      type: 'SERVICE' as const,
      categoryId: consultasCategory?.id || '',
      internalCode: 'CONS001',
      description: 'Consulta médica geral para avaliação e diagnóstico',
      salePrice: 150.00,
      costPrice: 50.00,
      partnerPrice: 100.00,
      durationMinutes: 30,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    {
      name: 'Consulta Cardiológica',
      type: 'SERVICE' as const,
      categoryId: cardiologiaCategory?.id || '',
      internalCode: 'CARD001',
      description: 'Consulta especializada em cardiologia',
      salePrice: 250.00,
      costPrice: 80.00,
      partnerPrice: 170.00,
      durationMinutes: 45,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    {
      name: 'Consulta Ginecológica',
      type: 'SERVICE' as const,
      categoryId: ginecologiaCategory?.id || '',
      internalCode: 'GINE001',
      description: 'Consulta ginecológica de rotina',
      salePrice: 200.00,
      costPrice: 70.00,
      partnerPrice: 130.00,
      durationMinutes: 40,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    {
      name: 'Consulta Pediátrica',
      type: 'SERVICE' as const,
      categoryId: pediatriaCategory?.id || '',
      internalCode: 'PEDI001',
      description: 'Consulta pediátrica para crianças e adolescentes',
      salePrice: 180.00,
      costPrice: 60.00,
      partnerPrice: 120.00,
      durationMinutes: 35,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    {
      name: 'Consulta Dermatológica',
      type: 'SERVICE' as const,
      categoryId: dermatologiaCategory?.id || '',
      internalCode: 'DERM001',
      description: 'Consulta dermatológica especializada',
      salePrice: 220.00,
      costPrice: 75.00,
      partnerPrice: 145.00,
      durationMinutes: 30,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    
    // Exames
    {
      name: 'Eletrocardiograma (ECG)',
      type: 'SERVICE' as const,
      categoryId: examesCategory?.id || '',
      internalCode: 'ECG001',
      description: 'Exame de eletrocardiograma para avaliação cardíaca',
      salePrice: 80.00,
      costPrice: 20.00,
      partnerPrice: 60.00,
      durationMinutes: 15,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    {
      name: 'Ultrassom Abdominal',
      type: 'SERVICE' as const,
      categoryId: examesCategory?.id || '',
      internalCode: 'USG001',
      description: 'Ultrassonografia abdominal completa',
      salePrice: 120.00,
      costPrice: 30.00,
      partnerPrice: 90.00,
      durationMinutes: 25,
      availableForBooking: true,
      requiresSpecialPrep: true,
      specialPrepDetails: 'Jejum de 8 horas'
    },
    {
      name: 'Ultrassom Obstétrico',
      type: 'SERVICE' as const,
      categoryId: examesCategory?.id || '',
      internalCode: 'USG002',
      description: 'Ultrassonografia obstétrica para acompanhamento pré-natal',
      salePrice: 150.00,
      costPrice: 40.00,
      partnerPrice: 110.00,
      durationMinutes: 30,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    
    // Procedimentos
    {
      name: 'Pequena Cirurgia',
      type: 'SERVICE' as const,
      categoryId: procedimentosCategory?.id || '',
      internalCode: 'CIR001',
      description: 'Pequenos procedimentos cirúrgicos ambulatoriais',
      salePrice: 400.00,
      costPrice: 100.00,
      partnerPrice: 300.00,
      durationMinutes: 60,
      availableForBooking: true,
      requiresSpecialPrep: true,
      specialPrepDetails: 'Jejum de 6 horas, acompanhante obrigatório'
    },
    {
      name: 'Cauterização',
      type: 'SERVICE' as const,
      categoryId: procedimentosCategory?.id || '',
      internalCode: 'CAU001',
      description: 'Cauterização de lesões cutâneas',
      salePrice: 200.00,
      costPrice: 50.00,
      partnerPrice: 150.00,
      durationMinutes: 20,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    
    // Fisioterapia
    {
      name: 'Sessão de Fisioterapia',
      type: 'SERVICE' as const,
      categoryId: fisioterapiaCategory?.id || '',
      internalCode: 'FISIO001',
      description: 'Sessão individual de fisioterapia',
      salePrice: 100.00,
      costPrice: 30.00,
      partnerPrice: 70.00,
      durationMinutes: 50,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    {
      name: 'Fisioterapia RPG',
      type: 'SERVICE' as const,
      categoryId: fisioterapiaCategory?.id || '',
      internalCode: 'RPG001',
      description: 'Reeducação Postural Global',
      salePrice: 120.00,
      costPrice: 35.00,
      partnerPrice: 85.00,
      durationMinutes: 60,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    
    // Psicologia
    {
      name: 'Consulta Psicológica',
      type: 'SERVICE' as const,
      categoryId: psicologiaCategory?.id || '',
      internalCode: 'PSI001',
      description: 'Sessão de psicoterapia individual',
      salePrice: 150.00,
      costPrice: 50.00,
      partnerPrice: 100.00,
      durationMinutes: 50,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    {
      name: 'Terapia de Casal',
      type: 'SERVICE' as const,
      categoryId: psicologiaCategory?.id || '',
      internalCode: 'PSI002',
      description: 'Sessão de terapia para casais',
      salePrice: 200.00,
      costPrice: 70.00,
      partnerPrice: 130.00,
      durationMinutes: 60,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    
    // Odontologia
    {
      name: 'Consulta Odontológica',
      type: 'SERVICE' as const,
      categoryId: odontologiaCategory?.id || '',
      internalCode: 'ODONTO001',
      description: 'Consulta odontológica de rotina',
      salePrice: 120.00,
      costPrice: 40.00,
      partnerPrice: 80.00,
      durationMinutes: 30,
      availableForBooking: true,
      requiresSpecialPrep: false
    },
    {
      name: 'Limpeza Dental',
      type: 'SERVICE' as const,
      categoryId: odontologiaCategory?.id || '',
      internalCode: 'LIMP001',
      description: 'Profilaxia e limpeza dental',
      salePrice: 100.00,
      costPrice: 30.00,
      partnerPrice: 70.00,
      durationMinutes: 45,
      availableForBooking: true,
      requiresSpecialPrep: false
    }
  ]

  const products = [
    // Medicamentos
    {
      name: 'Dipirona 500mg',
      type: 'PRODUCT' as const,
      categoryId: medicamentosCategory?.id || '',
      internalCode: 'MED001',
      description: 'Analgésico e antitérmico - caixa com 20 comprimidos',
      salePrice: 15.50,
      costPrice: 8.00,
      partnerPrice: 12.00,
      stockLevel: 50,
      minStockLevel: 10,
      observations: 'Medicamento de venda livre'
    },
    {
      name: 'Paracetamol 750mg',
      type: 'PRODUCT' as const,
      categoryId: medicamentosCategory?.id || '',
      internalCode: 'MED002',
      description: 'Analgésico e antitérmico - caixa com 20 comprimidos',
      salePrice: 18.90,
      costPrice: 10.00,
      partnerPrice: 15.00,
      stockLevel: 30,
      minStockLevel: 8,
      observations: 'Medicamento de venda livre'
    },
    {
      name: 'Ibuprofeno 600mg',
      type: 'PRODUCT' as const,
      categoryId: medicamentosCategory?.id || '',
      internalCode: 'MED003',
      description: 'Anti-inflamatório - caixa com 20 comprimidos',
      salePrice: 25.80,
      costPrice: 15.00,
      partnerPrice: 20.00,
      stockLevel: 25,
      minStockLevel: 5,
      observations: 'Medicamento de venda livre'
    },
    
    // Materiais Médicos
    {
      name: 'Seringa Descartável 5ml',
      type: 'PRODUCT' as const,
      categoryId: materiaisCategory?.id || '',
      internalCode: 'MAT001',
      description: 'Seringa descartável estéril 5ml - pacote com 100 unidades',
      salePrice: 45.00,
      costPrice: 25.00,
      partnerPrice: 35.00,
      stockLevel: 20,
      minStockLevel: 5,
      observations: 'Material estéril descartável'
    },
    {
      name: 'Luvas Descartáveis M',
      type: 'PRODUCT' as const,
      categoryId: descartaveisCategory?.id || '',
      internalCode: 'DESC001',
      description: 'Luvas de procedimento não cirúrgico - caixa com 100 unidades',
      salePrice: 35.00,
      costPrice: 20.00,
      partnerPrice: 28.00,
      stockLevel: 15,
      minStockLevel: 3,
      observations: 'Tamanho M - látex'
    },
    {
      name: 'Máscara Cirúrgica',
      type: 'PRODUCT' as const,
      categoryId: descartaveisCategory?.id || '',
      internalCode: 'DESC002',
      description: 'Máscara cirúrgica tripla camada - caixa com 50 unidades',
      salePrice: 25.00,
      costPrice: 12.00,
      partnerPrice: 20.00,
      stockLevel: 40,
      minStockLevel: 10,
      observations: 'Proteção tripla camada'
    },
    
    // Suplementos
    {
      name: 'Vitamina D3 2000UI',
      type: 'PRODUCT' as const,
      categoryId: suplementosCategory?.id || '',
      internalCode: 'SUP001',
      description: 'Suplemento de vitamina D3 - frasco com 60 cápsulas',
      salePrice: 45.90,
      costPrice: 25.00,
      partnerPrice: 38.00,
      stockLevel: 35,
      minStockLevel: 8,
      observations: 'Suplemento alimentar'
    },
    {
      name: 'Ômega 3 1000mg',
      type: 'PRODUCT' as const,
      categoryId: suplementosCategory?.id || '',
      internalCode: 'SUP002',
      description: 'Suplemento de ômega 3 - frasco com 60 cápsulas',
      salePrice: 55.00,
      costPrice: 30.00,
      partnerPrice: 45.00,
      stockLevel: 28,
      minStockLevel: 6,
      observations: 'Rico em EPA e DHA'
    },
    
    // Cosméticos
    {
      name: 'Protetor Solar FPS 60',
      type: 'PRODUCT' as const,
      categoryId: cosmeticosCategory?.id || '',
      internalCode: 'COSM001',
      description: 'Protetor solar facial FPS 60 - tubo 50g',
      salePrice: 65.00,
      costPrice: 35.00,
      partnerPrice: 52.00,
      stockLevel: 22,
      minStockLevel: 5,
      observations: 'Proteção UVA/UVB'
    },
    {
      name: 'Hidratante Facial',
      type: 'PRODUCT' as const,
      categoryId: cosmeticosCategory?.id || '',
      internalCode: 'COSM002',
      description: 'Hidratante facial para pele seca - frasco 100ml',
      salePrice: 42.90,
      costPrice: 22.00,
      partnerPrice: 35.00,
      stockLevel: 18,
      minStockLevel: 4,
      observations: 'Para todos os tipos de pele'
    },
    
    // Equipamentos
    {
      name: 'Termômetro Digital',
      type: 'PRODUCT' as const,
      categoryId: equipamentosCategory?.id || '',
      internalCode: 'EQUIP001',
      description: 'Termômetro digital clínico',
      salePrice: 25.00,
      costPrice: 12.00,
      partnerPrice: 20.00,
      stockLevel: 12,
      minStockLevel: 3,
      observations: 'Medição rápida e precisa'
    },
    {
      name: 'Oxímetro de Pulso',
      type: 'PRODUCT' as const,
      categoryId: equipamentosCategory?.id || '',
      internalCode: 'EQUIP002',
      description: 'Oxímetro de pulso digital portátil',
      salePrice: 85.00,
      costPrice: 45.00,
      partnerPrice: 70.00,
      stockLevel: 8,
      minStockLevel: 2,
      observations: 'Medição de saturação e frequência cardíaca'
    },
    
    // Higiene
    {
      name: 'Álcool Gel 70%',
      type: 'PRODUCT' as const,
      categoryId: higieneCategory?.id || '',
      internalCode: 'HIG001',
      description: 'Álcool gel antisséptico 70% - frasco 500ml',
      salePrice: 12.90,
      costPrice: 6.00,
      partnerPrice: 10.00,
      stockLevel: 60,
      minStockLevel: 15,
      observations: 'Antisséptico para as mãos'
    },
    {
      name: 'Sabonete Antisséptico',
      type: 'PRODUCT' as const,
      categoryId: higieneCategory?.id || '',
      internalCode: 'HIG002',
      description: 'Sabonete líquido antisséptico - frasco 250ml',
      salePrice: 18.50,
      costPrice: 9.00,
      partnerPrice: 15.00,
      stockLevel: 25,
      minStockLevel: 6,
      observations: 'Para higienização das mãos'
    },
    
    // Ortopédicos
    {
      name: 'Colar Cervical',
      type: 'PRODUCT' as const,
      categoryId: ortopedicosCategory?.id || '',
      internalCode: 'ORTO001',
      description: 'Colar cervical ajustável - tamanho único',
      salePrice: 45.00,
      costPrice: 25.00,
      partnerPrice: 38.00,
      stockLevel: 10,
      minStockLevel: 2,
      observations: 'Suporte cervical ajustável'
    },
    {
      name: 'Joelheira Elástica',
      type: 'PRODUCT' as const,
      categoryId: ortopedicosCategory?.id || '',
      internalCode: 'ORTO002',
      description: 'Joelheira elástica com suporte - tamanho M',
      salePrice: 35.00,
      costPrice: 18.00,
      partnerPrice: 28.00,
      stockLevel: 15,
      minStockLevel: 3,
      observations: 'Tamanho M - suporte lateral'
    }
  ]

  // Create services
  for (const serviceData of services) {
    if (!serviceData.categoryId) continue // Skip if category not found
    
    const existingService = await prisma.productService.findFirst({
      where: { 
        name: { 
          equals: serviceData.name, 
          mode: 'insensitive' 
        } 
      }
    })

    if (!existingService) {
      await prisma.productService.create({
        data: serviceData
      })
      console.log(`✅ Created service: ${serviceData.name}`)
    } else {
      console.log(`⏭️  Service already exists: ${serviceData.name}`)
    }
  }

  // Create products
  for (const productData of products) {
    if (!productData.categoryId) continue // Skip if category not found
    
    const existingProduct = await prisma.productService.findFirst({
      where: { 
        name: { 
          equals: productData.name, 
          mode: 'insensitive' 
        } 
      }
    })

    if (!existingProduct) {
      await prisma.productService.create({
        data: productData
      })
      console.log(`✅ Created product: ${productData.name}`)
    } else {
      console.log(`⏭️  Product already exists: ${productData.name}`)
    }
  }

  console.log('🛍️ Products and services seeding completed!')
}

async function seedPartners() {
  console.log('👥 Seeding partners...')

  const partners = [
    {
      fullName: 'Dr. Ricardo Almeida Silva',
      document: '12345678901',
      phone: '11987654321',
      email: 'ricardo.silva@clinica.com',
      street: 'Rua dos Médicos',
      number: '100',
      neighborhood: 'Centro Médico',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01234567',
      bank: 'Banco do Brasil',
      agency: '1234',
      account: '56789-0',
      pix: 'ricardo.silva@clinica.com',
      partnershipType: 'PERCENTAGE' as const,
      percentageAmount: 120.00
    },
    {
      fullName: 'Dra. Mariana Costa Pereira',
      document: '23456789012',
      phone: '11876543210',
      email: 'mariana.pereira@clinica.com',
      street: 'Avenida Paulista',
      number: '1500',
      complement: 'Conjunto 801',
      neighborhood: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310100',
      bank: 'Itaú',
      agency: '2345',
      account: '67890-1',
      pix: '11876543210',
      partnershipType: 'SUBLEASE' as const,
      subleaseAmount: 2500.00,
      subleasePaymentDay: 10
    },
    {
      fullName: 'Dr. Fernando Santos Oliveira',
      document: '34567890123',
      phone: '11765432109',
      email: 'fernando.oliveira@clinica.com',
      street: 'Rua Oscar Freire',
      number: '800',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01426000',
      bank: 'Bradesco',
      agency: '3456',
      account: '78901-2',
      pix: 'fernando.oliveira@clinica.com',
      partnershipType: 'PERCENTAGE_WITH_PRODUCTS' as const,
      percentageRate: 70.0
    },
    {
      fullName: 'Dra. Carolina Ribeiro Lima',
      document: '45678901234',
      phone: '11654321098',
      email: 'carolina.lima@clinica.com',
      street: 'Rua Augusta',
      number: '2000',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01305000',
      bank: 'Santander',
      agency: '4567',
      account: '89012-3',
      pix: '11654321098',
      partnershipType: 'PERCENTAGE' as const,
      percentageAmount: 150.00
    },
    {
      fullName: 'Dr. André Luiz Fernandes',
      document: '56789012345',
      phone: '11543210987',
      email: 'andre.fernandes@clinica.com',
      street: 'Rua Haddock Lobo',
      number: '600',
      neighborhood: 'Cerqueira César',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01414000',
      bank: 'Caixa Econômica Federal',
      agency: '5678',
      account: '90123-4',
      pix: 'andre.fernandes@clinica.com',
      partnershipType: 'SUBLEASE' as const,
      subleaseAmount: 1800.00,
      subleasePaymentDay: 5
    },
    {
      fullName: 'Dra. Patrícia Moura Santos',
      document: '67890123456',
      phone: '11432109876',
      email: 'patricia.santos@clinica.com',
      street: 'Avenida Faria Lima',
      number: '1200',
      complement: 'Torre A - Sala 1205',
      neighborhood: 'Itaim Bibi',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01451000',
      bank: 'Nubank',
      pix: 'patricia.santos@clinica.com',
      partnershipType: 'PERCENTAGE_WITH_PRODUCTS' as const,
      percentageRate: 65.0
    },
    {
      fullName: 'Dr. Gabriel Henrique Costa',
      document: '78901234567',
      phone: '11321098765',
      email: 'gabriel.costa@clinica.com',
      street: 'Rua Pamplona',
      number: '1000',
      neighborhood: 'Jardim Paulista',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01405000',
      bank: 'Inter',
      pix: '11321098765',
      partnershipType: 'PERCENTAGE' as const,
      percentageAmount: 100.00
    },
    {
      fullName: 'Dra. Juliana Alves Rodrigues',
      document: '89012345678',
      phone: '11210987654',
      email: 'juliana.rodrigues@clinica.com',
      street: 'Rua Estados Unidos',
      number: '800',
      neighborhood: 'Jardins',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01427000',
      bank: 'BTG Pactual',
      agency: '6789',
      account: '01234-5',
      pix: 'juliana.rodrigues@clinica.com',
      partnershipType: 'SUBLEASE' as const,
      subleaseAmount: 3200.00,
      subleasePaymentDay: 15
    },
    {
      fullName: 'Dr. Thiago Barbosa Mendes',
      document: '90123456789',
      phone: '11109876543',
      email: 'thiago.mendes@clinica.com',
      street: 'Rua Teodoro Sampaio',
      number: '1500',
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '05405000',
      bank: 'Original',
      pix: 'thiago.mendes@clinica.com',
      partnershipType: 'PERCENTAGE_WITH_PRODUCTS' as const,
      percentageRate: 75.0
    },
    {
      fullName: 'Dra. Renata Silva Carvalho',
      document: '01234567891',
      phone: '11098765432',
      email: 'renata.carvalho@clinica.com',
      street: 'Rua Consolação',
      number: '2500',
      complement: 'Andar 12',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01301000',
      bank: 'C6 Bank',
      pix: '11098765432',
      partnershipType: 'PERCENTAGE' as const,
      percentageAmount: 140.00
    }
  ]

  for (const partnerData of partners) {
    const existingPartner = await prisma.partner.findUnique({
      where: { document: partnerData.document }
    })

    if (!existingPartner) {
      const partner = await prisma.partner.create({
        data: partnerData
      })
      console.log(`✅ Created partner: ${partnerData.fullName}`)

      // Add availability for each partner (Monday to Friday, 8:00-17:00 with lunch break)
      const availability = [
        { dayOfWeek: 1, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' }, // Monday
        { dayOfWeek: 2, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' }, // Tuesday
        { dayOfWeek: 3, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' }, // Wednesday
        { dayOfWeek: 4, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' }, // Thursday
        { dayOfWeek: 5, startTime: '08:00', endTime: '17:00', breakStart: '12:00', breakEnd: '13:00' }, // Friday
      ]

      for (const avail of availability) {
        await prisma.partnerAvailability.create({
          data: {
            partnerId: partner.id,
            ...avail
          }
        })
      }

      console.log(`✅ Created availability for partner: ${partnerData.fullName}`)

      // Add some sample blocked dates for testing
      await createSampleBlockedDates(partner.id, partnerData.fullName)
    } else {
      console.log(`⏭️  Partner already exists: ${partnerData.fullName}`)
    }
  }

  // Associate partners with services
  await associatePartnersWithServices()

  console.log('👥 Partners seeding completed!')
}

async function createSampleBlockedDates(partnerId: string, partnerName: string) {
  console.log(`🚫 Creating sample blocked dates for ${partnerName}...`)

  const today = new Date()
  const futureDate1 = new Date()
  const futureDate2 = new Date()
  const futureDate3 = new Date()

  // Create dates in the future for testing
  futureDate1.setDate(today.getDate() + 7) // Next week
  futureDate2.setDate(today.getDate() + 14) // In 2 weeks  
  futureDate3.setDate(today.getDate() + 21) // In 3 weeks

  const sampleBlockedDates = [
    {
      partnerId,
      blockedDate: futureDate1,
      startTime: '14:00',
      endTime: '15:30',
      reason: 'Reunião administrativa'
    },
    {
      partnerId,
      blockedDate: futureDate2,
      startTime: null,
      endTime: null,
      reason: 'Feriado - Dia completo bloqueado'
    },
    {
      partnerId,
      blockedDate: futureDate3,
      startTime: '09:00',
      endTime: '11:00',
      reason: 'Treinamento obrigatório'
    }
  ]

  for (const blockedDate of sampleBlockedDates) {
    const existing = await prisma.partnerBlockedDate.findFirst({
      where: {
        partnerId: blockedDate.partnerId,
        blockedDate: blockedDate.blockedDate
      }
    })

    if (!existing) {
      await prisma.partnerBlockedDate.create({
        data: blockedDate
      })
      const dateStr = blockedDate.blockedDate.toISOString().split('T')[0]
      const timeStr = blockedDate.startTime && blockedDate.endTime 
        ? `${blockedDate.startTime}-${blockedDate.endTime}` 
        : 'dia completo'
      console.log(`✅ Created blocked date for ${partnerName}: ${dateStr} (${timeStr})`)
    }
  }
}

async function associatePartnersWithServices() {
  console.log('🔗 Associating partners with services...')

  // Get some partners and services for association
  const partners = await prisma.partner.findMany({ take: 5 })
  const services = await prisma.productService.findMany({ 
    where: { type: 'SERVICE' },
    take: 10 
  })

  if (partners.length === 0 || services.length === 0) {
    console.log('⏭️  No partners or services found for association')
    return
  }

  // Associate each partner with 3-5 random services
  for (const partner of partners) {
    const numberOfServices = Math.floor(Math.random() * 3) + 3 // 3 to 5 services
    const shuffledServices = services.sort(() => 0.5 - Math.random()).slice(0, numberOfServices)

    for (const service of shuffledServices) {
      const existingAssociation = await prisma.partnerService.findFirst({
        where: {
          partnerId: partner.id,
          productServiceId: service.id
        }
      })

      if (!existingAssociation) {
        await prisma.partnerService.create({
          data: {
            partnerId: partner.id,
            productServiceId: service.id
          }
        })
        console.log(`✅ Associated ${partner.fullName} with ${service.name}`)
      }
    }
  }

  console.log('🔗 Partner-service associations completed!')
}

async function seedAppointments() {
  console.log('📅 Starting appointments seeding...')

  // Get existing data to create appointments
  const patients = await prisma.patient.findMany({ take: 10 })
  const partners = await prisma.partner.findMany({ take: 5 })
  const rooms = await prisma.room.findMany({ take: 3 })
  const services = await prisma.productService.findMany({ 
    where: { type: 'SERVICE' }, 
    take: 10 
  })

  if (patients.length === 0 || partners.length === 0 || services.length === 0) {
    console.log('⚠️ Missing required data for appointments. Skipping appointment seeding.')
    return
  }

  // Generate appointments for the next 30 days
  const today = new Date()
  const appointments = []

  for (let dayOffset = 1; dayOffset <= 30; dayOffset++) {
    const appointmentDate = new Date(today)
    appointmentDate.setDate(today.getDate() + dayOffset)
    
    // Skip weekends for most appointments
    const dayOfWeek = appointmentDate.getDay()
    if (dayOfWeek === 0 || dayOfWeek === 6) continue

    // Create 3-8 appointments per day
    const appointmentsPerDay = Math.floor(Math.random() * 6) + 3

    for (let i = 0; i < appointmentsPerDay; i++) {
      const patient = patients[Math.floor(Math.random() * patients.length)]
      const partner = partners[Math.floor(Math.random() * partners.length)]
      const service = services[Math.floor(Math.random() * services.length)]
      const room = Math.random() > 0.3 ? rooms[Math.floor(Math.random() * rooms.length)] : null

      // Generate appointment times (8:00 to 17:00)
      const startHour = Math.floor(Math.random() * 9) + 8 // 8-16
      const startMinute = Math.random() > 0.5 ? 0 : 30
      const startTime = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`
      
      // Calculate end time based on service duration or default 30 minutes
      const durationMinutes = service.durationMinutes || 30
      const endHour = startHour + Math.floor((startMinute + durationMinutes) / 60)
      const endMinute = (startMinute + durationMinutes) % 60
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`

      // Determine appointment type based on service
      let type: 'CONSULTATION' | 'EXAM' | 'PROCEDURE' | 'RETURN' = 'CONSULTATION'
      if (service.name.toLowerCase().includes('ultrassom') || service.name.toLowerCase().includes('exame')) {
        type = 'EXAM'
      } else if (service.name.toLowerCase().includes('procedimento') || service.name.toLowerCase().includes('cirurgia')) {
        type = 'PROCEDURE'
      } else if (Math.random() > 0.8) {
        type = 'RETURN'
      }

      // Determine status based on date
      let status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW' = 'SCHEDULED'
      if (dayOffset < 0) { // Past appointments
        const rand = Math.random()
        if (rand > 0.8) status = 'CANCELLED'
        else if (rand > 0.9) status = 'NO_SHOW'
        else status = 'COMPLETED'
      } else if (dayOffset === 0) { // Today's appointments
        const rand = Math.random()
        if (rand > 0.7) status = 'IN_PROGRESS'
        else if (rand > 0.85) status = 'COMPLETED'
      }

      // Generate some observations
      const observations = Math.random() > 0.7 ? [
        'Paciente chegou no horário',
        'Primeira consulta',
        'Retorno para avaliação',
        'Paciente relatou melhora',
        'Necessário acompanhamento',
        'Exame de rotina'
      ][Math.floor(Math.random() * 6)] : undefined

      appointments.push({
        patientId: patient.id,
        partnerId: partner.id,
        productServiceId: service.id,
        roomId: room?.id,
        date: appointmentDate,
        startTime,
        endTime,
        type,
        status,
        observations,
        checkIn: status === 'IN_PROGRESS' || status === 'COMPLETED' ? new Date() : null,
        checkOut: status === 'COMPLETED' ? new Date() : null,
        cancellationReason: status === 'CANCELLED' ? 'Paciente cancelou' : null
      })
    }
  }

  // Create appointments in batches to avoid conflicts
  console.log(`📅 Creating ${appointments.length} sample appointments...`)
  
  let createdCount = 0
  for (const appointmentData of appointments) {
    try {
      const existing = await prisma.appointment.findFirst({
        where: {
          partnerId: appointmentData.partnerId,
          date: appointmentData.date,
          startTime: appointmentData.startTime
        }
      })

      if (!existing) {
        await prisma.appointment.create({
          data: appointmentData
        })
        createdCount++
      }
    } catch (error) {
      // Skip appointments that cause conflicts
      console.log(`⚠️ Skipped appointment due to conflict: ${error}`)
    }
  }

  console.log(`✅ Created ${createdCount} appointments successfully!`)
}

async function seedNotifications() {
  console.log('🔔 Seeding notification system...')

  // 1. Create notification configuration
  const existingConfig = await prisma.notificationConfiguration.findFirst()
  
  if (!existingConfig) {
    await prisma.notificationConfiguration.create({
      data: {
        enabled: true,
        defaultChannel: 'whatsapp',
        firstReminderDays: 3,
        secondReminderDays: 1,
        thirdReminderHours: 2,
        whatsappEnabled: true,
        smsEnabled: true,
        emailEnabled: true,
        retryAttempts: 3,
        retryIntervalMinutes: 30
      }
    })
    console.log('✅ Created notification configuration')
  } else {
    console.log('⏭️  Notification configuration already exists')
  }

  // 2. Create notification templates
  const templates = [
    // WhatsApp Templates
    {
      name: 'Lembrete WhatsApp - 3 dias',
      type: 'FIRST_REMINDER' as const,
      channel: 'WHATSAPP' as const,
      content: `🏥 *{clinica}* 

Olá *{paciente}*! 

📅 Lembramos que você tem um agendamento marcado:

🔸 *Serviço:* {servico}
🔸 *Profissional:* {profissional}  
🔸 *Data:* {data}
🔸 *Horário:* {hora}
🔸 *Sala:* {sala}

ℹ️ Em caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.

📞 {telefone}

Obrigado pela confiança! 💙`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'sala', 'clinica', 'telefone'])
    },
    {
      name: 'Lembrete WhatsApp - 1 dia',
      type: 'SECOND_REMINDER' as const,
      channel: 'WHATSAPP' as const,
      content: `🏥 *{clinica}*

Oi *{paciente}*! 

⏰ Seu agendamento é *AMANHÃ*:

🔸 *Serviço:* {servico}
🔸 *Profissional:* {profissional}
🔸 *Data:* {data}
🔸 *Horário:* {hora}
🔸 *Sala:* {sala}

📋 *Lembre-se:*
• Chegue 15 minutos antes
• Traga seus documentos
• Use máscara de proteção

📞 Dúvidas? {telefone}

Até breve! 💙`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'sala', 'clinica', 'telefone'])
    },
    {
      name: 'Lembrete WhatsApp - 2 horas',
      type: 'THIRD_REMINDER' as const,
      channel: 'WHATSAPP' as const,
      content: `🏥 *{clinica}*

*{paciente}*, seu horário é HOJE! ⏰

🔸 *Serviço:* {servico}
🔸 *Profissional:* {profissional}
🔸 *Horário:* {hora}
🔸 *Sala:* {sala}

⚠️ *Lembre-se:* Chegue 15 minutos antes do horário.

📍 *Endereço:* {endereco}
📞 *Contato:* {telefone}

Aguardamos você! 💙`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'sala', 'clinica', 'endereco', 'telefone'])
    },
    {
      name: 'Notificação WhatsApp - Imediata',
      type: 'IMMEDIATE' as const,
      channel: 'WHATSAPP' as const,
      content: `🏥 *{clinica}*

Olá *{paciente}*,

Informamos sobre seu agendamento:

🔸 *Serviço:* {servico}
🔸 *Profissional:* {profissional}
🔸 *Data:* {data}
🔸 *Horário:* {hora}

📞 Para mais informações: {telefone}

Obrigado! 💙`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'clinica', 'telefone'])
    },

    // SMS Templates
    {
      name: 'Lembrete SMS - 3 dias',
      type: 'FIRST_REMINDER' as const,
      channel: 'SMS' as const,
      content: 'CLINICA ESSENCIAL: Ola {paciente}! Lembrete: voce tem {servico} com {profissional} em {data} as {hora}. Duvidas: {telefone}',
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'telefone'])
    },
    {
      name: 'Lembrete SMS - 1 dia',
      type: 'SECOND_REMINDER' as const,
      channel: 'SMS' as const,
      content: 'CLINICA ESSENCIAL: {paciente}, seu agendamento e AMANHA! {servico} com {profissional} as {hora}. Chegue 15min antes. Info: {telefone}',
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'hora', 'telefone'])
    },
    {
      name: 'Lembrete SMS - 2 horas',
      type: 'THIRD_REMINDER' as const,
      channel: 'SMS' as const,
      content: 'CLINICA ESSENCIAL: {paciente}, seu horario e HOJE as {hora}! {servico} com {profissional}. Chegue 15min antes. {endereco}',
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'hora', 'endereco'])
    },
    {
      name: 'Notificação SMS - Imediata',
      type: 'IMMEDIATE' as const,
      channel: 'SMS' as const,
      content: 'CLINICA ESSENCIAL: {paciente}, informacao sobre seu agendamento: {servico} com {profissional} em {data} as {hora}. Info: {telefone}',
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'telefone'])
    },

    // Email Templates
    {
      name: 'Lembrete Email - 3 dias',
      type: 'FIRST_REMINDER' as const,
      channel: 'EMAIL' as const,
      subject: 'Lembrete: Seu agendamento na {clinica}',
      content: `Olá {paciente},

Esperamos que esteja bem!

Este é um lembrete sobre seu agendamento:

• Serviço: {servico}
• Profissional: {profissional}
• Data: {data}
• Horário: {hora}
• Sala: {sala}

INFORMAÇÕES IMPORTANTES:
- Chegue 15 minutos antes do horário agendado
- Traga um documento de identificação
- Use máscara de proteção

Em caso de dúvidas ou necessidade de reagendamento, entre em contato conosco através do telefone {telefone}.

Atenciosamente,
Equipe {clinica}

📍 Endereço: {endereco}
📞 Telefone: {telefone}`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'sala', 'clinica', 'endereco', 'telefone'])
    },
    {
      name: 'Lembrete Email - 1 dia',
      type: 'SECOND_REMINDER' as const,
      channel: 'EMAIL' as const,
      subject: 'AMANHÃ: Seu agendamento na {clinica}',
      content: `Olá {paciente},

Seu agendamento é AMANHÃ!

• Serviço: {servico}
• Profissional: {profissional}
• Data: {data}
• Horário: {hora}
• Sala: {sala}

CHECKLIST PARA SUA CONSULTA:
✓ Chegue 15 minutos antes
✓ Traga documento de identificação  
✓ Use máscara de proteção
✓ Traga exames anteriores (se houver)

Aguardamos você!

Atenciosamente,
Equipe {clinica}

📍 {endereco}
📞 {telefone}`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'sala', 'clinica', 'endereco', 'telefone'])
    },
    {
      name: 'Lembrete Email - 2 horas',
      type: 'THIRD_REMINDER' as const,
      channel: 'EMAIL' as const,
      subject: 'HOJE: Seu agendamento em 2 horas - {clinica}',
      content: `{paciente},

Seu agendamento é HOJE em aproximadamente 2 horas!

• Serviço: {servico}
• Profissional: {profissional}
• Horário: {hora}
• Sala: {sala}

⏰ LEMBRE-SE: Chegue 15 minutos antes do horário.

📍 Endereço: {endereco}
📞 Telefone: {telefone}

Aguardamos você!

Equipe {clinica}`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'hora', 'sala', 'clinica', 'endereco', 'telefone'])
    },
    {
      name: 'Notificação Email - Imediata',
      type: 'IMMEDIATE' as const,
      channel: 'EMAIL' as const,
      subject: 'Informação sobre seu agendamento - {clinica}',
      content: `Olá {paciente},

Informamos sobre seu agendamento:

• Serviço: {servico}
• Profissional: {profissional}
• Data: {data}
• Horário: {hora}

Para mais informações, entre em contato conosco.

Atenciosamente,
Equipe {clinica}

📞 {telefone}`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'clinica', 'telefone'])
    }
  ]

  for (const templateData of templates) {
    const existingTemplate = await prisma.notificationTemplate.findFirst({
      where: { 
        name: templateData.name
      }
    })

    if (!existingTemplate) {
      await prisma.notificationTemplate.create({
        data: templateData
      })
      console.log(`✅ Created template: ${templateData.name}`)
    } else {
      console.log(`⏭️  Template already exists: ${templateData.name}`)
    }
  }

  console.log('🔔 Notification system seeding completed!')
}

async function seedFinancialSystem() {
  console.log('💰 Seeding financial system...')

  // 1. Criar contas bancárias
  const bankAccounts = [
    {
      name: 'Conta Corrente Principal - Banco do Brasil',
      bank: 'Banco do Brasil',
      accountType: 'CHECKING' as const,
      agency: '1234-5',
      accountNumber: '12345-6',
      pixKey: 'clinic@essencial.com.br',
      initialBalance: 50000.00,
      currentBalance: 50000.00,
      active: true,
      color: '#FCD34D',
      description: 'Conta principal da clínica para movimentação geral'
    },
    {
      name: 'Conta Poupança - Caixa Econômica',
      bank: 'Caixa Econômica Federal',
      accountType: 'SAVINGS' as const,
      agency: '5678',
      accountNumber: '987654-3',
      pixKey: '11987654321',
      initialBalance: 25000.00,
      currentBalance: 25000.00,
      active: true,
      color: '#10B981',
      description: 'Conta poupança para reserva de emergência'
    },
    {
      name: 'Cartão de Crédito Empresarial',
      bank: 'Itaú',
      accountType: 'CREDIT_CARD' as const,
      pixKey: undefined,
      initialBalance: 0.00,
      currentBalance: 0.00,
      active: true,
      color: '#F59E0B',
      description: 'Cartão de crédito para despesas operacionais'
    },
    {
      name: 'Dinheiro em Espécie',
      bank: 'Caixa da Clínica',
      accountType: 'CASH' as const,
      initialBalance: 2000.00,
      currentBalance: 2000.00,
      active: true,
      color: '#22C55E',
      description: 'Dinheiro em espécie para pequenos gastos'
    }
  ]

  const createdAccounts = []
  for (const accountData of bankAccounts) {
    try {
      const existingAccount = await prisma.bankAccount.findFirst({
        where: { name: accountData.name }
      })

      if (!existingAccount) {
        const account = await prisma.bankAccount.create({
          data: accountData
        })
        createdAccounts.push(account)
        console.log(`✅ Created bank account: ${account.name}`)
      } else {
        createdAccounts.push(existingAccount)
        console.log(`⏭️  Bank account already exists: ${accountData.name}`)
      }
    } catch (error) {
      console.error(`❌ Error creating account ${accountData.name}:`, error)
    }
  }

  // 2. Criar lançamentos financeiros de exemplo
  if (createdAccounts.length > 0) {
    const mainAccount = createdAccounts[0] // Conta corrente principal
    const currentDate = new Date()

    const financialEntries = [
      // Receitas
      {
        bankAccountId: mainAccount.id,
        type: 'INCOME' as const,
        category: 'Consultas',
        subcategory: 'Clínica Geral',
        description: 'Consulta - João Silva',
        amount: 150.00,
        dueDate: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 dias atrás
        paidDate: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000),
        status: 'PAID' as const,
        paymentMethod: 'PIX' as const,
        notes: 'Pagamento via PIX no ato da consulta'
      },
      {
        bankAccountId: mainAccount.id,
        type: 'INCOME' as const,
        category: 'Exames',
        subcategory: 'Ultrassom',
        description: 'Ultrassom Abdominal - Maria Santos',
        amount: 120.00,
        dueDate: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 dias atrás
        paidDate: new Date(currentDate.getTime() - 3 * 24 * 60 * 60 * 1000),
        status: 'PAID' as const,
        paymentMethod: 'DEBIT_CARD' as const
      },
      {
        bankAccountId: mainAccount.id,
        type: 'INCOME' as const,
        category: 'Procedimentos',
        subcategory: 'Cirurgia',
        description: 'Pequena Cirurgia - Carlos Oliveira',
        amount: 400.00,
        dueDate: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 dia atrás
        status: 'PENDING' as const,
        notes: 'Aguardando pagamento pelo convênio'
      },
      {
        bankAccountId: mainAccount.id,
        type: 'INCOME' as const,
        category: 'Consultas',
        subcategory: 'Retorno',
        description: 'Retorno - Ana Costa',
        amount: 100.00,
        dueDate: new Date(currentDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 dias à frente
        status: 'PENDING' as const,
        paymentMethod: 'CASH' as const
      },

      // Despesas
      {
        bankAccountId: mainAccount.id,
        type: 'EXPENSE' as const,
        category: 'Pessoal',
        subcategory: 'Salários',
        description: 'Salário - Recepcionista',
        amount: 2500.00,
        dueDate: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
        paidDate: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000),
        status: 'PAID' as const,
        paymentMethod: 'BANK_TRANSFER' as const
      },
      {
        bankAccountId: mainAccount.id,
        type: 'EXPENSE' as const,
        category: 'Infraestrutura',
        subcategory: 'Aluguel',
        description: 'Aluguel do consultório',
        amount: 3500.00,
        dueDate: new Date(currentDate.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 dias à frente
        status: 'PENDING' as const,
        notes: 'Vencimento todo dia 5 do mês'
      },
      {
        bankAccountId: mainAccount.id,
        type: 'EXPENSE' as const,
        category: 'Operacional',
        subcategory: 'Materiais Médicos',
        description: 'Compra de seringas e agulhas',
        amount: 450.00,
        dueDate: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 dias atrás
        paidDate: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000),
        status: 'PAID' as const,
        paymentMethod: 'CREDIT_CARD' as const
      },
      {
        bankAccountId: mainAccount.id,
        type: 'EXPENSE' as const,
        category: 'Serviços',
        subcategory: 'Limpeza',
        description: 'Serviço de limpeza semanal',
        amount: 300.00,
        dueDate: new Date(currentDate.getTime() + 1 * 24 * 60 * 60 * 1000), // 1 dia à frente
        status: 'PENDING' as const
      },
      {
        bankAccountId: mainAccount.id,
        type: 'EXPENSE' as const,
        category: 'Infraestrutura',
        subcategory: 'Energia Elétrica',
        description: 'Conta de luz - CPFL',
        amount: 650.00,
        dueDate: new Date(currentDate.getTime() - 15 * 24 * 60 * 60 * 1000), // 15 dias atrás (vencida)
        status: 'PENDING' as const,
        notes: 'CONTA VENCIDA - Pagar urgente!'
      }
    ]

    let createdEntriesCount = 0
    for (const entryData of financialEntries) {
      try {
        await prisma.financialEntry.create({
          data: entryData
        })
        createdEntriesCount++
      } catch (error) {
        console.error('❌ Error creating financial entry:', error)
      }
    }

    console.log(`✅ Created ${createdEntriesCount} financial entries`)

    // 3. Recalcular saldo da conta principal
    try {
      const paidEntries = await prisma.financialEntry.findMany({
        where: {
          bankAccountId: mainAccount.id,
          status: 'PAID'
        }
      })

      let newBalance = Number(mainAccount.initialBalance)
      for (const entry of paidEntries) {
        const amount = Number(entry.amount)
        if (entry.type === 'INCOME') {
          newBalance += amount
        } else if (entry.type === 'EXPENSE') {
          newBalance -= amount
        }
      }

      await prisma.bankAccount.update({
        where: { id: mainAccount.id },
        data: { currentBalance: newBalance }
      })

      console.log(`✅ Updated balance for ${mainAccount.name}: R$ ${newBalance.toFixed(2)}`)
    } catch (error) {
      console.error('❌ Error updating account balance:', error)
    }
  }

  console.log('💰 Financial system seeding completed!')
}

async function seedAdvancedFinancialData() {
  console.log('💳 Seeding advanced financial data...')

  // Buscar contas bancárias existentes
  const bankAccounts = await prisma.bankAccount.findMany()
  if (bankAccounts.length === 0) {
    console.log('⚠️  No bank accounts found. Skipping advanced financial seeding.')
    return
  }

  const mainAccount = bankAccounts[0] // Conta corrente principal
  const currentDate = new Date()

  // 1. Criar lançamentos recorrentes (despesas fixas)
  const recurringExpenses = [
    {
      bankAccountId: mainAccount.id,
      type: 'EXPENSE' as const,
      category: 'Infraestrutura',
      subcategory: 'Aluguel',
      description: 'Aluguel do consultório - Mensal',
      amount: 3500.00,
      recurring: true
    },
    {
      bankAccountId: mainAccount.id,
      type: 'EXPENSE' as const,
      category: 'Pessoal',
      subcategory: 'Salários',
      description: 'Salário Recepcionista - Mensal',
      amount: 2500.00,
      recurring: true
    },
    {
      bankAccountId: mainAccount.id,
      type: 'EXPENSE' as const,
      category: 'Infraestrutura',
      subcategory: 'Energia Elétrica',
      description: 'Conta de Energia - Mensal',
      amount: 450.00,
      recurring: true
    },
    {
      bankAccountId: mainAccount.id,
      type: 'EXPENSE' as const,
      category: 'Serviços',
      subcategory: 'Contabilidade',
      description: 'Honorários Contábeis - Mensal',
      amount: 800.00,
      recurring: true
    }
  ]

  console.log('📅 Creating recurring expenses for the next 6 months...')
  
  for (const expenseBase of recurringExpenses) {
    // Criar lançamento pai
    const parentEntry = await prisma.financialEntry.create({
      data: {
        ...expenseBase,
        dueDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 5), // Todo dia 5
        status: 'PENDING'
      }
    })

    // Criar 6 parcelas futuras
    for (let i = 1; i <= 6; i++) {
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i, 5)
      
      await prisma.financialEntry.create({
        data: {
          ...expenseBase,
          description: `${expenseBase.description} (${i + 1}/7)`,
          dueDate,
          status: 'PENDING',
          recurring: false,
          parentEntryId: parentEntry.id
        }
      })
    }

    console.log(`✅ Created recurring series: ${expenseBase.description}`)
  }

  // 2. Criar lançamentos retroativos (últimos 3 meses)
  console.log('📊 Creating retroactive entries for the last 3 months...')
  
  const retroactiveEntries = []
  
  // Receitas variadas dos últimos 3 meses
  for (let monthOffset = -3; monthOffset < 0; monthOffset++) {
    const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + monthOffset, 1)
    const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate()
    
    // Gerar 15-25 receitas aleatórias por mês
    const entriesCount = Math.floor(Math.random() * 11) + 15 // 15-25 entradas
    
    for (let i = 0; i < entriesCount; i++) {
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1
      const entryDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay)
      
      // Tipos de receita aleatórios
      const incomeTypes = [
        { category: 'Consultas', subcategory: 'Clínica Geral', amount: 150, desc: 'Consulta' },
        { category: 'Consultas', subcategory: 'Cardiologia', amount: 200, desc: 'Consulta Cardiológica' },
        { category: 'Exames', subcategory: 'Ultrassom', amount: 120, desc: 'Ultrassom' },
        { category: 'Procedimentos', subcategory: 'Pequena Cirurgia', amount: 400, desc: 'Procedimento' },
        { category: 'Vendas', subcategory: 'Medicamentos', amount: 80, desc: 'Venda de Medicamento' }
      ]
      
      const randomType = incomeTypes[Math.floor(Math.random() * incomeTypes.length)]
      const variation = (Math.random() * 0.4) + 0.8 // Variação de 80% a 120%
      
      retroactiveEntries.push({
        bankAccountId: mainAccount.id,
        type: 'INCOME' as const,
        category: randomType.category,
        subcategory: randomType.subcategory,
        description: `${randomType.desc} - Paciente ${i + 1}`,
        amount: Math.round(randomType.amount * variation * 100) / 100,
        dueDate: entryDate,
        paidDate: entryDate,
        status: 'PAID' as const,
        paymentMethod: Math.random() > 0.5 ? 'PIX' as const : 'DEBIT_CARD' as const
      })
    }

    // Gerar algumas despesas variáveis
    const expenseTypes = [
      { category: 'Operacional', subcategory: 'Materiais Médicos', amount: 300, desc: 'Compra de Materiais' },
      { category: 'Serviços', subcategory: 'Limpeza', amount: 200, desc: 'Serviço de Limpeza' },
      { category: 'Infraestrutura', subcategory: 'Manutenção Predial', amount: 150, desc: 'Manutenção' },
      { category: 'Outras Despesas', subcategory: 'Combustível', amount: 100, desc: 'Combustível' }
    ]

    for (let i = 0; i < 5; i++) { // 5 despesas por mês
      const randomDay = Math.floor(Math.random() * daysInMonth) + 1
      const entryDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), randomDay)
      const randomType = expenseTypes[Math.floor(Math.random() * expenseTypes.length)]
      
      retroactiveEntries.push({
        bankAccountId: mainAccount.id,
        type: 'EXPENSE' as const,
        category: randomType.category,
        subcategory: randomType.subcategory,
        description: `${randomType.desc} - ${monthDate.toLocaleDateString('pt-BR', { month: 'long' })}`,
        amount: randomType.amount,
        dueDate: entryDate,
        paidDate: entryDate,
        status: 'PAID' as const,
        paymentMethod: 'BANK_TRANSFER' as const
      })
    }
  }

  // Inserir lançamentos retroativos em lote
  let createdRetroactive = 0
  for (const entry of retroactiveEntries) {
    try {
      await prisma.financialEntry.create({ data: entry })
      createdRetroactive++
    } catch (error) {
      console.error('Error creating retroactive entry:', error)
    }
  }

  console.log(`✅ Created ${createdRetroactive} retroactive entries`)

  // 3. Criar contas a receber parceladas
  console.log('💰 Creating installment receivables...')
  
  const installmentReceivables = [
    {
      totalAmount: 2400,
      installments: 12,
      description: 'Tratamento Ortodôntico - João Silva',
      category: 'Consultas',
      subcategory: 'Odontologia'
    },
    {
      totalAmount: 1800,
      installments: 6,
      description: 'Fisioterapia - Maria Santos',
      category: 'Procedimentos',
      subcategory: 'Fisioterapia'
    },
    {
      totalAmount: 900,
      installments: 3,
      description: 'Procedimento Estético - Ana Costa',
      category: 'Procedimentos',
      subcategory: 'Estética'
    }
  ]

  for (const installment of installmentReceivables) {
    const monthlyAmount = installment.totalAmount / installment.installments
    
    for (let i = 0; i < installment.installments; i++) {
      const dueDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + i + 1, 10)
      const status = i < 2 ? 'PAID' as const : 'PENDING' as const // Primeiras 2 parcelas pagas
      
      await prisma.financialEntry.create({
        data: {
          bankAccountId: mainAccount.id,
          type: 'INCOME',
          category: installment.category,
          subcategory: installment.subcategory,
          description: `${installment.description} (${i + 1}/${installment.installments})`,
          amount: monthlyAmount,
          dueDate,
          paidDate: status === 'PAID' ? dueDate : undefined,
          status,
          paymentMethod: status === 'PAID' ? 'PIX' : undefined,
          recurring: true,
          referenceType: 'installment_plan'
        }
      })
    }

    console.log(`✅ Created installment plan: ${installment.description}`)
  }

  // 4. Criar algumas contas vencidas (para testar relatórios)
  console.log('⚠️  Creating overdue entries...')
  
  const overdueEntries = [
    {
      bankAccountId: mainAccount.id,
      type: 'EXPENSE' as const,
      category: 'Impostos e Taxas',
      subcategory: 'Simples Nacional',
      description: 'DAS - Simples Nacional (VENCIDO)',
      amount: 850.00,
      dueDate: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 dias atrás
      status: 'PENDING' as const,
      notes: 'ATENÇÃO: Conta vencida há 10 dias!'
    },
    {
      bankAccountId: mainAccount.id,
      type: 'INCOME' as const,
      category: 'Convênios',
      subcategory: 'Unimed',
      description: 'Repasse Unimed - Dezembro (VENCIDO)',
      amount: 1200.00,
      dueDate: new Date(currentDate.getTime() - 20 * 24 * 60 * 60 * 1000), // 20 dias atrás
      status: 'PENDING' as const,
      notes: 'Entrar em contato com o convênio'
    }
  ]

  for (const entry of overdueEntries) {
    await prisma.financialEntry.create({ data: entry })
  }

  console.log(`✅ Created ${overdueEntries.length} overdue entries`)

  // 5. Recalcular saldo da conta principal
  console.log('🔄 Recalculating main account balance...')
  
  const paidEntries = await prisma.financialEntry.findMany({
    where: {
      bankAccountId: mainAccount.id,
      status: 'PAID'
    }
  })

  let newBalance = Number(mainAccount.initialBalance)
  for (const entry of paidEntries) {
    const amount = Number(entry.amount)
    if (entry.type === 'INCOME') {
      newBalance += amount
    } else if (entry.type === 'EXPENSE') {
      newBalance -= amount
    }
  }

  await prisma.bankAccount.update({
    where: { id: mainAccount.id },
    data: { currentBalance: newBalance }
  })

  console.log(`✅ Updated main account balance: R$ ${newBalance.toFixed(2)}`)
  console.log('💳 Advanced financial data seeding completed!')
}

async function seedPartnerSettlementData() {
  console.log('🤝 Seeding partner settlement test data...')

  // Buscar alguns parceiros para criar dados de teste
  const partners = await prisma.partner.findMany({
    take: 3,
    where: {
      active: true
    }
  })

  if (partners.length === 0) {
    console.log('⚠️  No partners found. Skipping settlement seeding.')
    return
  }

  const currentDate = new Date()
  const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1)
  const endLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)

  // Garantir que temos parceiros com diferentes tipos de parceria
  const partnershipTypes = ['PERCENTAGE', 'SUBLEASE', 'PERCENTAGE_WITH_PRODUCTS'] as const
  
  for (let i = 0; i < Math.min(partners.length, 3); i++) {
    const partner = partners[i]
    const partnershipType = partnershipTypes[i]

    // Atualizar o tipo de parceria do parceiro
    await prisma.partner.update({
      where: { id: partner.id },
      data: {
        partnershipType: partnershipType as any,
        percentageRate: (partnershipType === 'PERCENTAGE' || partnershipType === 'PERCENTAGE_WITH_PRODUCTS') ? 60 : undefined, // 60% para o parceiro
        subleaseAmount: partnershipType === 'SUBLEASE' ? 2500 : undefined, // R$ 2.500/mês
        subleasePaymentDay: partnershipType === 'SUBLEASE' ? 5 : undefined
      }
    })

    console.log(`✅ Updated ${partner.fullName} to ${partnershipType}`)

    // Criar algumas consultas no mês passado para gerar dados de acerto
    const consultationsCount = Math.floor(Math.random() * 15) + 10 // 10-25 consultas

    for (let j = 0; j < consultationsCount; j++) {
      // Data aleatória no mês passado
      const randomDay = Math.floor(Math.random() * 28) + 1
      const consultationDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), randomDay)
      
      // Horário aleatório entre 8h e 18h
      const hour = Math.floor(Math.random() * 10) + 8
      const minute = Math.random() > 0.5 ? 0 : 30
      consultationDate.setHours(hour, minute, 0, 0)

      const endTime = new Date(consultationDate)
      endTime.setMinutes(endTime.getMinutes() + 60) // 1 hora de consulta

      // Buscar um serviço aleatório
      const services = await prisma.productService.findMany({
        where: { 
          type: 'SERVICE',
          active: true 
        },
        take: 5
      })

      if (services.length === 0) continue

      const randomService = services[Math.floor(Math.random() * services.length)]

      // Buscar um paciente aleatório
      const patients = await prisma.patient.findMany({
        where: { active: true },
        take: 10
      })

      if (patients.length === 0) continue

      const randomPatient = patients[Math.floor(Math.random() * patients.length)]

      // Buscar uma sala aleatória
      const rooms = await prisma.room.findMany({
        where: { active: true },
        take: 3
      })

      const randomRoom = rooms.length > 0 ? rooms[Math.floor(Math.random() * rooms.length)] : null

      try {
        await prisma.appointment.create({
          data: {
            patientId: randomPatient.id,
            partnerId: partner.id,
            productServiceId: randomService.id,
            roomId: randomRoom?.id,
            date: consultationDate,
            startTime: consultationDate.toISOString(),
            endTime: endTime.toISOString(),
            type: 'CONSULTATION',
            status: 'COMPLETED', // Marcar como completo para aparecer nos acertos
            observations: `Consulta de teste para acerto - ${partner.fullName}`,
            checkIn: consultationDate,
            checkOut: endTime
          }
        })
      } catch (error) {
        console.error(`Error creating test appointment for ${partner.fullName}:`, error)
      }
    }

    console.log(`✅ Created ${consultationsCount} test appointments for ${partner.fullName}`)
  }

  // Criar algumas sublocações pendentes para parceiros de sublocação
  const subleasePartners = await prisma.partner.findMany({
    where: {
      partnershipType: 'SUBLEASE',
      active: true
    }
  })

  const bankAccount = await prisma.bankAccount.findFirst()
  if (bankAccount && subleasePartners.length > 0) {
    for (const partner of subleasePartners) {
      // Criar sublocação do mês atual (pendente)
      const currentMonthDue = new Date(currentDate.getFullYear(), currentDate.getMonth(), 5)
      
      try {
        const existingEntry = await prisma.financialEntry.findFirst({
          where: {
            partnerId: partner.id,
            category: 'Outras Receitas',
            subcategory: 'Sublocação',
            dueDate: {
              gte: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
              lt: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1)
            }
          }
        })

        if (!existingEntry) {
          await prisma.financialEntry.create({
            data: {
              bankAccountId: bankAccount.id,
              type: 'INCOME',
              category: 'Outras Receitas',
              subcategory: 'Sublocação',
              description: `Sublocação ${partner.fullName} - ${currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
              amount: Number(partner.subleaseAmount) || 2500,
              dueDate: currentMonthDue,
              status: 'PENDING',
              partnerId: partner.id,
              referenceType: 'monthly_sublease',
              notes: 'Gerado automaticamente para teste de acerto'
            }
          })

          console.log(`✅ Created sublease entry for ${partner.fullName}`)
        }
      } catch (error) {
        console.error(`Error creating sublease for ${partner.fullName}:`, error)
      }
    }
  }

  console.log('🤝 Partner settlement test data seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })