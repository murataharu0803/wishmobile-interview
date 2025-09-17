import { Sequelize } from 'sequelize-typescript'

import { DATABASE_URL } from '@/env'
import logger from '@/utils/logger'

import AppointmentService from '@/models/AppointmentService'
import User from '@/models/User'

export const models = [
  AppointmentService,
  User,
]

export const db = new Sequelize(
  DATABASE_URL,
  {
    dialect: 'postgres',
    logging: logger.log.bind(logger),
    models,
  },
)

export default db

export const connectDB = async() => {
  try {
    await db.authenticate({ logging: false })
    console.log('Database connection has been established successfully')
    await db.sync({ logging: false })
    console.log('Database has synced successfully')
  } catch(error) {
    console.error('Unable to connect to the database:', error)
  }
  return db
}
