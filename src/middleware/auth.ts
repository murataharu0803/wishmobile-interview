import jwt from 'jsonwebtoken'
import { Context, Next } from 'koa'

import { JWT_SECRET } from '@/env'
import { ApiError } from '@/utils/ApiError'

export interface JWTPayload {
  userId: string
  email: string
}

export default async(ctx: Context, next: Next) => {
  const token = ctx.headers.authorization?.split(' ')[1]
  if (!token) throw new ApiError(401, 'Access token required')

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload
    ctx.state.user = decoded
  } catch(error) {
    console.error(error)
    throw new ApiError(403, 'Invalid or expired token')
  }

  await next()
}
