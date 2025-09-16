import jwt from 'jsonwebtoken'
import { Context, Next } from 'koa'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface JWTPayload {
  userId: string
  email: string
}

export const authenticateToken = async(ctx: Context, next: Next) => {
  const authHeader = ctx.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    ctx.status = 401
    ctx.body = { error: 'Access token required' }
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    ctx.state.user = decoded
    await next()
  } catch {
    ctx.status = 403
    ctx.body = { error: 'Invalid or expired token' }
  }
}
