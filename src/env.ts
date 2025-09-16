import { config } from 'dotenv'

config()

export const NODE_ENV = process.env.NODE_ENV || 'development'
export const PROD = NODE_ENV === 'production'
export const TEST = NODE_ENV === 'test'
export const DEV = !PROD

export const PORT = process.env.PORT || 8888

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is not set in environment variables')
export const DATABASE_URL = process.env.DATABASE_URL

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is not set in environment variables')
export const JWT_SECRET = process.env.JWT_SECRET

if (!process.env.HASH_SALT) throw new Error('HASH_SALT is not set in environment variables')
export const HASH_SALT = process.env.HASH_SALT
