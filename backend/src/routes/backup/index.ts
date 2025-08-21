import { FastifyInstance } from 'fastify'
import { backupService, CreateBackupConfigSchema } from '../../services/backup.service'
import { successResponse, errorResponse } from '../../utils/response'

export default async function backupRoutes(fastify: FastifyInstance) {
  // ===============================
  // CONFIGURAÇÕES DE BACKUP
  // ===============================

  // Listar configurações de backup
  fastify.get('/configs', async (request, reply) => {
    try {
      const configs = await backupService.getConfigs()
      return successResponse(configs)
    } catch (error) {
      return errorResponse(reply, 'Erro ao buscar configurações de backup', error)
    }
  })

  // Buscar configuração por ID
  fastify.get('/configs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const config = await backupService.getConfigById(id)
      
      if (!config) {
        return reply.status(404).send({
          success: false,
          error: 'Configuração não encontrada'
        })
      }
      
      return successResponse(config)
    } catch (error) {
      return errorResponse(reply, 'Erro ao buscar configuração', error)
    }
  })

  // Criar nova configuração de backup
  fastify.post('/configs', async (request, reply) => {
    try {
      const data = request.body as any
      const config = await backupService.createConfig(data)
      return successResponse(config, 'Configuração de backup criada com sucesso')
    } catch (error) {
      return errorResponse(reply, 'Erro ao criar configuração de backup', error)
    }
  })

  // Atualizar configuração de backup
  fastify.put('/configs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      const data = request.body as any
      const config = await backupService.updateConfig(id, data)
      return successResponse(config, 'Configuração atualizada com sucesso')
    } catch (error) {
      return errorResponse(reply, 'Erro ao atualizar configuração', error)
    }
  })

  // Deletar configuração de backup
  fastify.delete('/configs/:id', async (request, reply) => {
    try {
      const { id } = request.params as { id: string }
      await backupService.deleteConfig(id)
      return successResponse(null, 'Configuração removida com sucesso')
    } catch (error) {
      return errorResponse(reply, 'Erro ao remover configuração', error)
    }
  })

  // ===============================
  // EXECUÇÃO DE BACKUPS
  // ===============================

  // Executar backup manualmente
  fastify.post('/execute/:configId', async (request, reply) => {
    try {
      const { configId } = request.params as { configId: string }
      const result = await backupService.executeBackup(configId)
      return successResponse(result, 'Backup executado com sucesso')
    } catch (error) {
      return errorResponse(reply, 'Erro ao executar backup', error)
    }
  })

  // Verificar backups agendados
  fastify.post('/check-scheduled', async (request, reply) => {
    try {
      await backupService.checkScheduledBackups()
      return successResponse(null, 'Verificação de backups agendados executada')
    } catch (error) {
      return errorResponse(reply, 'Erro ao verificar backups agendados', error)
    }
  })

  // ===============================
  // HISTÓRICO E ESTATÍSTICAS
  // ===============================

  // Listar histórico de backups
  fastify.get('/history', async (request, reply) => {
    try {
      const { configId } = request.query as { configId?: string }
      const history = await backupService.getHistory(configId)
      return successResponse(history)
    } catch (error) {
      return errorResponse(reply, 'Erro ao buscar histórico de backups', error)
    }
  })

  // Buscar estatísticas de backup
  fastify.get('/stats', async (request, reply) => {
    try {
      const stats = await backupService.getStats()
      return successResponse(stats)
    } catch (error) {
      return errorResponse(reply, 'Erro ao buscar estatísticas', error)
    }
  })

  // ===============================
  // RESTAURAÇÃO
  // ===============================

  // Restaurar backup
  fastify.post('/restore/:backupId', async (request, reply) => {
    try {
      const { backupId } = request.params as { backupId: string }
      await backupService.restoreBackup(backupId)
      return successResponse(null, 'Backup restaurado com sucesso')
    } catch (error) {
      return errorResponse(reply, 'Erro ao restaurar backup', error)
    }
  })

  // ===============================
  // DOWNLOAD DE BACKUP
  // ===============================

  // Download de arquivo de backup
  fastify.get('/download/:backupId', async (request, reply) => {
    try {
      const { backupId } = request.params as { backupId: string }
      const history = await backupService.getHistory()
      const backup = history.find(b => b.id === backupId)
      
      if (!backup) {
        return reply.status(404).send({
          success: false,
          error: 'Backup não encontrado'
        })
      }

      if (backup.status !== 'SUCCESS') {
        return reply.status(400).send({
          success: false,
          error: 'Backup não está disponível para download'
        })
      }

      // Verificar se arquivo existe
      try {
        await require('fs').promises.access(backup.filepath)
      } catch {
        return reply.status(404).send({
          success: false,
          error: 'Arquivo de backup não encontrado'
        })
      }

      return reply.sendFile(backup.filename, backup.filepath.replace(backup.filename, ''))
    } catch (error) {
      return errorResponse(reply, 'Erro ao fazer download do backup', error)
    }
  })
}
