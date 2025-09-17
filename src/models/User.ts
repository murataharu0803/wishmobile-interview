import Joi from 'joi'
import { DATE, STRING, UUID } from 'sequelize'
import {
  Column,
  CreatedAt,
  IsUUID,
  Model,
  NotNull,
  PrimaryKey,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript'

import JoiValidate from '@/utils/JoiValidate'

class User extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column(UUID)
  declare id: string

  @JoiValidate(Joi.string().email())
  @NotNull
  @Unique
  @Column(STRING(255))
  email: string

  @NotNull
  @Column(STRING(255))
  password: string

  @NotNull
  @Column(STRING(255))
  name: string

  @NotNull
  @CreatedAt
  @Column(DATE)
  declare createdAt: Date

  @NotNull
  @UpdatedAt
  @Column(DATE)
  declare updatedAt: Date
}

export default User
