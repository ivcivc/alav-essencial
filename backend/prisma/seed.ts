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
      type: 'FIRST_REMINDER',
      channel: 'WHATSAPP',
      content: `🏥 *{clinica}* 

Olá *{paciente}*! 

📅 Lembramos que você tem um agendamento marcado:

🔸 *Serviço:* {servico}
🔸 *Profissional:* {profissional}  
🔸 *Data:* {data}
🔸 *Horário:* {hora}
${'{sala}' ? '🔸 *Sala:* {sala}' : ''}

ℹ️ Em caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.

📞 {telefone}

Obrigado pela confiança! 💙`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'sala', 'clinica', 'telefone'])
    },
    {
      name: 'Lembrete WhatsApp - 1 dia',
      type: 'SECOND_REMINDER',
      channel: 'WHATSAPP',
      content: `🏥 *{clinica}*

Oi *{paciente}*! 

⏰ Seu agendamento é *AMANHÃ*:

🔸 *Serviço:* {servico}
🔸 *Profissional:* {profissional}
🔸 *Data:* {data}
🔸 *Horário:* {hora}
${'{sala}' ? '🔸 *Sala:* {sala}' : ''}

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
      type: 'THIRD_REMINDER',
      channel: 'WHATSAPP',
      content: `🏥 *{clinica}*

*{paciente}*, seu horário é HOJE! ⏰

🔸 *Serviço:* {servico}
🔸 *Profissional:* {profissional}
🔸 *Horário:* {hora}
${'{sala}' ? '🔸 *Sala:* {sala}' : ''}

⚠️ *Lembre-se:* Chegue 15 minutos antes do horário.

📍 *Endereço:* {endereco}
📞 *Contato:* {telefone}

Aguardamos você! 💙`,
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'sala', 'clinica', 'endereco', 'telefone'])
    },
    {
      name: 'Notificação WhatsApp - Imediata',
      type: 'IMMEDIATE',
      channel: 'WHATSAPP',
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
      type: 'FIRST_REMINDER',
      channel: 'SMS',
      content: 'CLINICA ESSENCIAL: Ola {paciente}! Lembrete: voce tem {servico} com {profissional} em {data} as {hora}. Duvidas: {telefone}',
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'telefone'])
    },
    {
      name: 'Lembrete SMS - 1 dia',
      type: 'SECOND_REMINDER',
      channel: 'SMS',
      content: 'CLINICA ESSENCIAL: {paciente}, seu agendamento e AMANHA! {servico} com {profissional} as {hora}. Chegue 15min antes. Info: {telefone}',
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'hora', 'telefone'])
    },
    {
      name: 'Lembrete SMS - 2 horas',
      type: 'THIRD_REMINDER',
      channel: 'SMS',
      content: 'CLINICA ESSENCIAL: {paciente}, seu horario e HOJE as {hora}! {servico} com {profissional}. Chegue 15min antes. {endereco}',
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'hora', 'endereco'])
    },
    {
      name: 'Notificação SMS - Imediata',
      type: 'IMMEDIATE',
      channel: 'SMS',
      content: 'CLINICA ESSENCIAL: {paciente}, informacao sobre seu agendamento: {servico} com {profissional} em {data} as {hora}. Info: {telefone}',
      variables: JSON.stringify(['paciente', 'profissional', 'servico', 'data', 'hora', 'telefone'])
    },

    // Email Templates
    {
      name: 'Lembrete Email - 3 dias',
      type: 'FIRST_REMINDER',
      channel: 'EMAIL',
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
      type: 'SECOND_REMINDER',
      channel: 'EMAIL',
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
      type: 'THIRD_REMINDER',
      channel: 'EMAIL',
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
      type: 'IMMEDIATE',
      channel: 'EMAIL',
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

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })