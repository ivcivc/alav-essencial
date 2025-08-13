import dotenv from 'dotenv'

dotenv.config()

export const config = {
  PORT: parseInt(process.env.PORT || '3001'),
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL!,
  JWT_SECRET: process.env.JWT_SECRET!,
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
}

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET']
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`)
  }
}