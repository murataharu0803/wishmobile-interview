import Joi from 'joi'
import { Is } from 'sequelize-typescript'

// Class generator
export default (schema: Joi.Schema) =>
  Is('custom', (value: string) => {
    const { error } = schema.validate(value)
    if (error) throw new Error(error.message)
  })
