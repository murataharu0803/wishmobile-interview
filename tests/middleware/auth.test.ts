import Router from '@koa/router'
import { Server } from 'http'
import jwt from 'jsonwebtoken'
import request from 'supertest'

import db, { connectDB } from '@/db'
import { JWT_SECRET } from '@/env'
import auth from '@/middleware/auth'
import User from '@/models/User'
import koaServer from '@/server'

describe('Authentication Middleware', () => {
  let app: Server
  let user: User
  let authToken: string

  beforeAll(async() => {
    await connectDB()
    const router = new Router()
    router.get('/protected', auth, ctx => {
      ctx.status = 200
      ctx.body = { message: 'Access granted' }
    })
    koaServer.use(router.routes())
    koaServer.use(router.allowedMethods())
    app = koaServer.listen(8901)
    await User.truncate({ cascade: true })
    user = await User.create({
      email: 'test@example.com',
      password: 'password',
      name: 'Test User',
    })
    authToken = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' },
    )
  })

  afterAll(async() => {
    await db.close()
  })

  it('should authenticate with valid token', async() => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${authToken}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Access granted' })
  })

  it('should reject request without authorization header', async() => {
    const res = await request(app).get('/protected')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Access token required' })
  })

  it('should reject request with malformed authorization header', async() => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'InvalidFormat')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Access token required' })
  })

  it('should reject request with Bearer but no token', async() => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer ')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Access token required' })
  })

  it('should reject request with invalid token', async() => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token')

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Invalid or expired token' })
  })

  it('should reject request with expired token', async() => {
    const payload = { userId: 'user-123', email: 'test@example.com' }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '-1h' })

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Invalid or expired token' })
  })

  it('should reject request with token signed with wrong secret', async() => {
    const payload = { userId: 'user-123', email: 'test@example.com' }
    const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' })

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Invalid or expired token' })
  })

  it('should reject request with empty token after Bearer', async() => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer')

    expect(res.status).toBe(401)
    expect(res.body).toEqual({ error: 'Access token required' })
  })

  it('should handle JWT with different algorithm', async() => {
    const payload = { userId: user.id, email: user.email }
    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: '1h',
      algorithm: 'HS512',
    })

    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ message: 'Access granted' })
  })

  it('should reject malformed JWT token', async() => {
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer not.a.jwt')

    expect(res.status).toBe(403)
    expect(res.body).toEqual({ error: 'Invalid or expired token' })
  })
})
