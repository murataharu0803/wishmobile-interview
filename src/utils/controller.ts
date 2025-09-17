import Joi from 'joi'
import { Context, Next } from 'koa'

import { DEV } from '@/env'
import { ApiError } from '@/utils/ApiError'
import console from '@/utils/logger'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setResponse = (ctx: Context, data: any, status = 200) => {
  ctx.status = status
  ctx.body = data
}

export const errorHandler = async(ctx: Context, next: Next) => {
  try {
    await next()
  } catch(err) {
    console.error(err)
    const status = err instanceof ApiError ? err.status : 500
    const htmlMsg = DEV
      ? err instanceof Error ? err.message : String(err)
      : err instanceof ApiError ? err.message : 'unknown error'
    ctx.status = status
    ctx.body = { error: htmlMsg }
  }
}

export const validateAndGetBody = <T>(ctx: Context, schema: Joi.ObjectSchema<T>) => {
  const { error, value } = schema.validate(ctx.request.body)
  if (error) throw new ApiError(400, error.details[0].message)
  return value as T
}
