import bcrypt from 'bcryptjs'
import Joi from 'joi'
import jwt from 'jsonwebtoken'
import { Context } from 'koa'

import { JWT_SECRET } from '@/env'
import User from '@/models/User'
import { ApiError } from '@/utils/ApiError'
import { setResponse, validateAndGetBody } from '@/utils/controller'

const JWT_EXPIRES_IN = '24h'

export const register = async(ctx: Context) => {
  const { email, password, name } = validateAndGetBody<{
    email: string
    password: string
    name: string
  }>(ctx, Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(100).required(),
  }))

  // Check if user already exists
  const existingUser = await User.findOne({ where: { email } })
  if (existingUser) throw new ApiError(400, 'User with this email already exists')

  // Create user
  const user = await User.create({
    email,
    password: await bcrypt.hash(password, 10),
    name,
  })

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )

  setResponse(ctx, {
    message: 'User registered successfully',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  }, 201)
}

export const login = async(ctx: Context) => {
  const { email, password } = validateAndGetBody<{
    email: string
    password: string
  }>(ctx, Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }))

  // Find user by email
  const user = await User.findOne({ where: { email } })
  if (!user) {
    ctx.status = 401
    ctx.body = { error: 'Invalid credentials' }
    return
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password)
  if (!isPasswordValid) {
    ctx.status = 401
    ctx.body = { error: 'Invalid credentials' }
    return
  }

  // Generate JWT token
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN },
  )

  setResponse(ctx, {
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
    },
  })
}
