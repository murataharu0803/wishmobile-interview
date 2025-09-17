import { config } from 'dotenv'

config()

export const NODE_ENV = process.env.NODE_ENV || 'development'
export const PROD = NODE_ENV === 'production'
export const TEST = NODE_ENV === 'test'
export const DEV = !PROD

export const PORT = process.env.PORT || 8888

if (!TEST && !process.env.DATABASE_URL)
  throw new Error('DATABASE_URL is not set in environment variables')
if (TEST && !process.env.TEST_DATABASE_URL)
  throw new Error('TEST_DATABASE_URL is not set in environment variables')
export const DATABASE_URL = TEST
  ? process.env.TEST_DATABASE_URL as string
  : process.env.DATABASE_URL as string

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in environment variables')
export const JWT_SECRET = process.env.JWT_SECRET
