const pg = require('pg')

require('dotenv').config()

module.exports = {
  url: process.env.NODE_ENV === 'test' ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL,
  dialect: 'postgres',
  dialectModule: pg,
  ssl: true,
}
