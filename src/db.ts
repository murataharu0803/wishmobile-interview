import { Sequelize } from 'sequelize'

import { DATABASE_URL } from '@/env'
import logger from '@/utils/logger'

const db = new Sequelize(
  DATABASE_URL,
  {
    dialect: 'postgres',
    logging: logger.log.bind(logger),
  },
)

export default db
