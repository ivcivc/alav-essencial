import { FastifyPluginAsync } from 'fastify'
import { PrismaClient } from '@prisma/client'
import fp from 'fastify-plugin'

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient
  }
}

const prismaPlugin: FastifyPluginAsync = async (fastify) => {
  const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  })

  await prisma.$connect()

  // Make Prisma Client available through the fastify server instance: server.prisma
  fastify.decorate('prisma', prisma)

  fastify.addHook('onClose', async (server) => {
    await server.prisma.$disconnect()
  })
}

export default fp(prismaPlugin)
export { prismaPlugin }