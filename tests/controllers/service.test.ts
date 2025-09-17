import { Server } from 'http'
import jwt from 'jsonwebtoken'
import request from 'supertest'

import db, { connectDB } from '@/db'
import { JWT_SECRET } from '@/env'
import AppointmentService from '@/models/AppointmentService'
import User from '@/models/User'
import koaServer from '@/server'

describe('Service Controller', () => {
  let app: Server
  let authToken: string

  beforeAll(async() => {
    await connectDB()
    app = koaServer.listen(8900)
  })

  beforeEach(async() => {
    await AppointmentService.truncate({ cascade: true })
    await User.truncate({ cascade: true })

    // Create a test user and auth token
    const user = await User.create({
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

  describe('GET /service', () => {
    beforeEach(async() => {
      await AppointmentService.bulkCreate([
        {
          name: 'Public Service 1',
          description: 'Description 1',
          price: 100,
          showTime: 30,
          order: 1,
          isPublic: true,
          isRemove: false,
        },
        {
          name: 'Private Service',
          description: 'Description 2',
          price: 200,
          showTime: 60,
          order: 2,
          isPublic: false,
          isRemove: false,
        },
        {
          name: 'Deleted Service',
          description: 'Description 3',
          price: 300,
          showTime: 90,
          order: 3,
          isPublic: true,
          isRemove: true,
        },
        {
          name: 'Public Service 2',
          description: 'Description 4',
          price: 150,
          showTime: 45,
          order: 0,
          isPublic: true,
          isRemove: false,
        },
      ])
    })

    it('should list only public, non-deleted services ordered correctly', async() => {
      const res = await request(app).get('/service/all')
      console.log(res.error)
      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('services')
      expect(res.body.services).toHaveLength(2)
      expect(res.body.services[0].name).toBe('Public Service 2') // order: 0
      expect(res.body.services[1].name).toBe('Public Service 1') // order: 1
      expect(res.body.services[0]).not.toHaveProperty('isRemove')
    })

    it('should return empty array when no public services exist', async() => {
      await AppointmentService.truncate({ cascade: true })

      const res = await request(app).get('/service/all')

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('services')
      expect(res.body.services).toHaveLength(0)
    })
  })

  describe('GET /service/:id', () => {
    let publicServiceId: string
    let privateServiceId: string
    let deletedServiceId: string

    beforeEach(async() => {
      const services = await AppointmentService.bulkCreate([
        {
          name: 'Public Service',
          description: 'Public Description',
          price: 100,
          showTime: 30,
          order: 1,
          isPublic: true,
          isRemove: false,
        },
        {
          name: 'Private Service',
          description: 'Private Description',
          price: 200,
          showTime: 60,
          order: 2,
          isPublic: false,
          isRemove: false,
        },
        {
          name: 'Deleted Service',
          description: 'Deleted Description',
          price: 300,
          showTime: 90,
          order: 3,
          isPublic: true,
          isRemove: true,
        },
      ])
      publicServiceId = services[0].id
      privateServiceId = services[1].id
      deletedServiceId = services[2].id
    })

    it('should return public service by id', async() => {
      const res = await request(app).get(`/service/${publicServiceId}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('service')
      expect(res.body.service.name).toBe('Public Service')
      expect(res.body.service.id).toBe(publicServiceId)
      expect(res.body.service).not.toHaveProperty('isRemove')
    })

    it('should return 404 for private service', async() => {
      const res = await request(app).get(`/service/${privateServiceId}`)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })

    it('should return 404 for deleted service', async() => {
      const res = await request(app).get(`/service/${deletedServiceId}`)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })

    it('should return 404 for non-existent service', async() => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000'
      const res = await request(app).get(`/service/${fakeId}`)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })

    it('should return error for invalid UUID format', async() => {
      const res = await request(app).get('/service/invalid-id')

      expect(res.status).toBe(500)
    })
  })

  describe('POST /service', () => {
    it('should create service successfully with auth', async() => {
      const body = {
        name: 'New Service',
        description: 'Service Description',
        price: 500,
        showTime: 120,
        order: 5,
        isPublic: true,
      }

      const res = await request(app)
        .post('/service')
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(201)
      expect(res.body).toHaveProperty('message', 'Service created successfully')
      expect(res.body).toHaveProperty('service')
      expect(res.body.service.name).toBe(body.name)
      expect(res.body.service.price).toBe(body.price)

      const service = await AppointmentService.findOne({
        where: { name: body.name },
      })
      expect(service).not.toBeNull()
    })

    it('should create service with minimal required fields', async() => {
      const body = {
        name: 'Minimal Service',
        price: 100,
      }

      const res = await request(app)
        .post('/service')
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(201)
      expect(res.body.service.name).toBe(body.name)
      expect(res.body.service.price).toBe(body.price)
      expect(res.body.service.order).toBe(0)
      expect(res.body.service.isPublic).toBe(true)
    })

    it('should return 401 without auth token', async() => {
      const body = {
        name: 'Unauthorized Service',
        price: 100,
      }

      const res = await request(app).post('/service').send(body)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
    })

    it('should return 403 with invalid auth token', async() => {
      const body = {
        name: 'Invalid Token Service',
        price: 100,
      }

      const res = await request(app)
        .post('/service')
        .set('Authorization', 'Bearer invalid-token')
        .send(body)

      expect(res.status).toBe(403)
      expect(res.body).toHaveProperty('error')
    })

    it('should return error with missing required fields', async() => {
      const body = {
        description: 'Missing name and price',
      }

      const res = await request(app)
        .post('/service')
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(400)
    })

    it('should return error with invalid price', async() => {
      const body = {
        name: 'Invalid Price Service',
        price: -100,
      }

      const res = await request(app)
        .post('/service')
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(400)
    })

    it('should return error with name too long', async() => {
      const body = {
        name: 'a'.repeat(256),
        price: 100,
      }

      const res = await request(app)
        .post('/service')
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(400)
    })
  })

  describe('PUT /service/:id', () => {
    let serviceId: string

    beforeEach(async() => {
      const service = await AppointmentService.create({
        name: 'Original Service',
        description: 'Original Description',
        price: 100,
        showTime: 30,
        order: 1,
        isPublic: true,
        isRemove: false,
      })
      serviceId = service.id
    })

    it('should update service successfully', async() => {
      const body = {
        name: 'Updated Service',
        description: 'Updated Description',
        price: 200,
        showTime: 60,
        order: 2,
        isPublic: false,
      }

      const res = await request(app)
        .put(`/service/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('message', 'Service updated successfully')
      expect(res.body.service.name).toBe(body.name)
      expect(res.body.service.price).toBe(body.price)

      const updatedService = await AppointmentService.findByPk(serviceId)
      expect(updatedService!.name).toBe(body.name)
    })

    it('should update service with partial fields', async() => {
      const body = {
        name: 'Partially Updated Service',
      }

      const res = await request(app)
        .put(`/service/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(200)
      expect(res.body.service.name).toBe(body.name)
      expect(res.body.service.price).toBe(100) // Original price unchanged
    })

    it('should return 401 without auth token', async() => {
      const body = { name: 'Unauthorized Update' }

      const res = await request(app).put(`/service/${serviceId}`).send(body)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
    })

    it('should return 404 for non-existent service', async() => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000'
      const body = { name: 'Non-existent Service' }

      const res = await request(app)
        .put(`/service/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })

    it('should return 404 for deleted service', async() => {
      await AppointmentService.update(
        { isRemove: true },
        { where: { id: serviceId } },
      )

      const body = { name: 'Update Deleted Service' }

      const res = await request(app)
        .put(`/service/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })

    it('should return error with invalid data', async() => {
      const body = {
        price: -100,
      }

      const res = await request(app)
        .put(`/service/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(body)

      expect(res.status).toBe(400)
    })
  })

  describe('DELETE /service/:id', () => {
    let serviceId: string

    beforeEach(async() => {
      const service = await AppointmentService.create({
        name: 'Service to Delete',
        description: 'Will be deleted',
        price: 100,
        showTime: 30,
        order: 1,
        isPublic: true,
        isRemove: false,
      })
      serviceId = service.id
    })

    it('should soft delete service successfully', async() => {
      const res = await request(app)
        .delete(`/service/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(200)
      expect(res.body).toHaveProperty('message', 'Service deleted successfully')

      const deletedService = await AppointmentService.findByPk(serviceId)
      expect(deletedService!.isRemove).toBe(true)
    })

    it('should return 401 without auth token', async() => {
      const res = await request(app).delete(`/service/${serviceId}`)

      expect(res.status).toBe(401)
      expect(res.body).toHaveProperty('error')
    })

    it('should return 404 for non-existent service', async() => {
      const fakeId = '123e4567-e89b-12d3-a456-426614174000'

      const res = await request(app)
        .delete(`/service/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })

    it('should return 404 for already deleted service', async() => {
      await AppointmentService.update(
        { isRemove: true },
        { where: { id: serviceId } },
      )

      const res = await request(app)
        .delete(`/service/${serviceId}`)
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(404)
      expect(res.body).toHaveProperty('error')
    })

    it('should return error for invalid UUID format', async() => {
      const res = await request(app)
        .delete('/service/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)

      expect(res.status).toBe(500)
    })
  })
})
