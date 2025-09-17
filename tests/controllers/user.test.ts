import { Server } from 'http'
import request from 'supertest'

import db, { connectDB } from '@/db'
import AppointmentService from '@/models/AppointmentService'
import User from '@/models/User'
import koaServer from '@/server'
import bcrypt from 'bcryptjs'

describe('routes/login', () => {
  let app: Server

  beforeAll(async() => {
    await connectDB()
    await AppointmentService.truncate({ cascade: true })
    app = koaServer.listen(8899)
  })

  beforeEach(async() => {
    await User.truncate({ cascade: true })
  })

  afterAll(async() => { await db.close() })

  describe('POST /user/register', () => {
    it('should success', async() => {
      const body = {
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      }

      const res = await request(app).post('/user/register').send(body)
      const user = await User.findOne({ where: { email: body.email } })
      expect(user).not.toBeNull()
      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('token')
      expect(res.body).toHaveProperty('user', {
        id: user!.id,
        email: body.email,
        name: body.name,
      })
    })

    it('should error if email is duplicated', async() => {
      await User.create({
        email: 'test@example.com',
        password: 'password',
        name: 'Test User',
      })

      const body = {
        email: 'test@example.com',
        password: 'password2',
        name: 'Test User 2',
      }

      const res = await request(app).post('/user/register').send(body)
      expect(res.status).toBe(400)
    })

    it('should error with missing fields', async() => {
      const res = await request(app).post('/user/register').send({
        email: 'test@example.com',
        name: 'Test User',
      })
      expect(res.status).toBe(400)
    })

    it('should error with invalid email format', async() => {
      const body = {
        email: 'invalid-email',
        password: 'password',
        name: 'Test User',
      }

      const res = await request(app).post('/user/register').send(body)
      expect(res.status).toBe(400)
    })

    it('should error with empty request body', async() => {
      const res = await request(app).post('/user/register').send({})
      expect(res.status).toBe(400)
    })
  })

  describe('POST /user/login', () => {
    beforeEach(async() => {
      await User.create({
        email: 'test@example.com',
        password: await bcrypt.hash('password', 10),
        name: 'Test User',
      })
    })

    it('should login successfully', async() => {
      const body = {
        email: 'test@example.com',
        password: 'password',
      }

      const res = await request(app).post('/user/login').send(body)
      const user = await User.findOne({ where: { email: body.email } })

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('token')
      expect(res.body).toHaveProperty('message', 'Login successful')
      expect(res.body).toHaveProperty('user', {
        id: user!.id,
        email: body.email,
        name: 'Test User',
      })
    })

    it('should error with invalid email', async() => {
      const body = {
        email: 'nonexistent@example.com',
        password: 'password',
      }

      const res = await request(app).post('/user/login').send(body)
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Invalid credentials')
    })

    it('should error with invalid password', async() => {
      const body = {
        email: 'test@example.com',
        password: 'wrongpassword',
      }

      const res = await request(app).post('/user/login').send(body)
      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error', 'Invalid credentials')
    })

    it('should error with missing email', async() => {
      const body = {
        password: 'password',
      }

      const res = await request(app).post('/user/login').send(body)
      expect(res.status).toBe(400)
    })

    it('should error with missing password', async() => {
      const body = {
        email: 'test@example.com',
      }

      const res = await request(app).post('/user/login').send(body)
      expect(res.status).toBe(400)
    })

    it('should error with empty request body', async() => {
      const res = await request(app).post('/user/login').send({})
      expect(res.status).toBe(400)
    })
  })
})
