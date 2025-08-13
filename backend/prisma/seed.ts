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

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })