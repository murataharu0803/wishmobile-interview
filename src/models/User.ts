import Joi from 'joi'
import { STRING } from 'sequelize'
import {
  Column,
  CreatedAt,
  IsUUID,
  Model,
  NotNull,
  PrimaryKey,
  UpdatedAt,
} from 'sequelize-typescript'

import JoiValidate from '@/utils/JoiValidate'

class User extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Column
  declare id: string

  @JoiValidate(Joi.string().email())
  @NotNull
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
  creationDate: Date

  @NotNull
  @UpdatedAt
  updatedOn: Date
}

export default User
