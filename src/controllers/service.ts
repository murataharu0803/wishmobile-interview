import Joi from 'joi'
import { Context } from 'koa'

import AppointmentService from '@/models/AppointmentService'
import { ApiError } from '@/utils/ApiError'
import { setResponse, validateAndGetBody } from '@/utils/controller'

// list public services
export const listPublicServices = async(ctx: Context) => {
  const services = await AppointmentService.findAll({
    where: {
      isPublic: true,
      isRemove: false,
    },
    order: [['order', 'ASC'], ['createdAt', 'DESC']],
    attributes: { exclude: ['isRemove'] },
  })

  setResponse(ctx, { services })
}

// show one public service
export const getPublicService = async(ctx: Context) => {
  const { id } = ctx.params

  const service = await AppointmentService.findOne({
    where: {
      id,
      isPublic: true,
      isRemove: false,
    },
    attributes: { exclude: ['isRemove'] },
  })

  if (!service) throw new ApiError(404, 'Service not found')

  setResponse(ctx, { service })
}

// create a service (needs auth)
export const createService = async(ctx: Context) => {
  const { name, description, price, showTime, order, isPublic } = validateAndGetBody<{
    name: string
    description?: string
    price: number
    showTime?: number
    order?: number
    isPublic?: boolean
  }>(ctx, Joi.object({
    name: Joi.string().max(255).required(),
    description: Joi.string().allow('').optional(),
    price: Joi.number().integer().min(0).required(),
    showTime: Joi.number().integer().min(0).optional(),
    order: Joi.number().integer().min(0).default(0),
    isPublic: Joi.boolean().default(true),
  }))

  const service = await AppointmentService.create({
    name,
    description,
    price,
    showTime,
    order: order ?? 0,
    isPublic: isPublic ?? true,
  })

  setResponse(ctx, {
    message: 'Service created successfully',
    service,
  }, 201)
}

// update a service (needs auth)
export const updateService = async(ctx: Context) => {
  const { id } = ctx.params
  const { name, description, price, showTime, order, isPublic } = validateAndGetBody<{
    name?: string
    description?: string
    price?: number
    showTime?: number
    order?: number
    isPublic?: boolean
  }>(ctx, Joi.object({
    name: Joi.string().max(255).optional(),
    description: Joi.string().allow('').optional(),
    price: Joi.number().integer().min(0).optional(),
    showTime: Joi.number().integer().min(0).optional(),
    order: Joi.number().integer().min(0).optional(),
    isPublic: Joi.boolean().optional(),
  }))

  const service = await AppointmentService.findOne({
    where: {
      id,
      isRemove: false,
    },
  })

  if (!service) throw new ApiError(404, 'Service not found')

  await service.update({
    ...(name !== undefined && { name }),
    ...(description !== undefined && { description }),
    ...(price !== undefined && { price }),
    ...(showTime !== undefined && { showTime }),
    ...(order !== undefined && { order }),
    ...(isPublic !== undefined && { isPublic }),
  })

  setResponse(ctx, {
    message: 'Service updated successfully',
    service,
  })
}

// delete a service (needs auth)
export const deleteService = async(ctx: Context) => {
  const { id } = ctx.params

  const service = await AppointmentService.findOne({
    where: {
      id,
      isRemove: false,
    },
  })

  if (!service) throw new ApiError(404, 'Service not found')

  await service.update({ isRemove: true })

  setResponse(ctx, {
    message: 'Service deleted successfully',
  })
}
