import { FastifyPluginAsync } from 'fastify'
import { PrismaPatientRepository } from '../../repositories/patient.repository'
import { PatientService } from '../../services/patient.service'
import { 
  createPatientSchema, 
  updatePatientSchema, 
  paginationSchema, 
  searchSchema 
} from '../../schemas/validation'
import { successResponse, errorResponse } from '../../utils/response'

const patientsRoutes: FastifyPluginAsync = async (fastify) => {
  const patientRepository = new PrismaPatientRepository(fastify.prisma)
  const patientService = new PatientService(patientRepository)

  // GET /api/patients - List all patients with pagination and search
  fastify.get('/', async (request, reply) => {
    try {
      const queryParams = paginationSchema.merge(searchSchema).parse(request.query)
      const { page, limit, q: search, active } = queryParams
      
      const result = await patientService.getAllPatients({
        page,
        limit,
        search,
        active
      })

      return successResponse(result, 'Pacientes listados com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao listar pacientes', 500)
    }
  })

  // GET /api/patients/search - Search patients (alternative endpoint)
  fastify.get('/search', async (request, reply) => {
    try {
      const queryParams = searchSchema.merge(paginationSchema).parse(request.query)
      const { q: query, page, limit, active } = queryParams
      
      if (!query) {
        return errorResponse(reply, 'Parâmetro de busca é obrigatório', 400)
      }

      const result = await patientService.searchPatients(query, {
        page,
        limit,
        active
      })

      return successResponse(result, 'Busca realizada com sucesso')
    } catch (error) {
      fastify.log.error(error)
      return errorResponse(reply, 'Erro ao buscar pacientes', 500)
    }
  })

  // GET /api/patients/:id - Get patient by ID
  fastify.get('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      const patient = await patientService.getPatientById(id)
      
      return successResponse(patient, 'Paciente encontrado com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Paciente não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao buscar paciente', 500)
    }
  })

  // POST /api/patients - Create new patient
  fastify.post('/', async (request, reply) => {
    try {
      const patientData = createPatientSchema.parse(request.body)
      
      const patient = await patientService.createPatient(patientData)
      
      return successResponse(patient, 'Paciente criado com sucesso', 201)
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error) {
        if (error.message.includes('CPF')) {
          return errorResponse(reply, error.message, 400)
        }
      }
      
      return errorResponse(reply, 'Erro ao criar paciente', 500)
    }
  })

  // PUT /api/patients/:id - Update patient
  fastify.put('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const updateData = updatePatientSchema.parse(request.body)
      
      const patient = await patientService.updatePatient(id, updateData)
      
      return successResponse(patient, 'Paciente atualizado com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error) {
        if (error.message === 'Paciente não encontrado') {
          return errorResponse(reply, error.message, 404)
        }
        if (error.message.includes('CPF')) {
          return errorResponse(reply, error.message, 400)
        }
      }
      
      return errorResponse(reply, 'Erro ao atualizar paciente', 500)
    }
  })

  // DELETE /api/patients/:id - Delete patient
  fastify.delete('/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      
      await patientService.deletePatient(id)
      
      return successResponse(null, 'Paciente removido com sucesso')
    } catch (error) {
      fastify.log.error(error)
      
      if (error instanceof Error && error.message === 'Paciente não encontrado') {
        return errorResponse(reply, error.message, 404)
      }
      
      return errorResponse(reply, 'Erro ao remover paciente', 500)
    }
  })
}

export default patientsRoutes