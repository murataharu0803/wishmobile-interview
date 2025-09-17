const pg = require('pg')

require('dotenv').config()

module.exports = {
  url: process.env.DATABASE_URL,
  dialect: 'postgres',
  dialectModule: pg,
  ssl: true,
}
