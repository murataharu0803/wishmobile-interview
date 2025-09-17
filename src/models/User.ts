import Joi from 'joi'
import { DATE, STRING, UUID, UUIDV4 } from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  Default,
  IsUUID,
  Model,
  NotNull,
  PrimaryKey,
  Table,
  Unique,
  UpdatedAt,
} from 'sequelize-typescript'

import JoiValidate from '@/utils/JoiValidate'

@Table
class User extends Model {
  @IsUUID(4)
  @Default(UUIDV4)
  @PrimaryKey
  @Column(UUID)
  declare id: string

  @JoiValidate(Joi.string().email())
  @NotNull
  @AllowNull(false)
  @Unique
  @Column(STRING(255))
  declare email: string

  @NotNull
  @AllowNull(false)
  @Column(STRING(255))
  declare password: string

  @NotNull
  @AllowNull(false)
  @Column(STRING(255))
  declare name: string

  @NotNull
  @AllowNull(false)
  @CreatedAt
  @Column(DATE)
  declare createdAt: Date

  @NotNull
  @AllowNull(false)
  @UpdatedAt
  @Column(DATE)
  declare updatedAt: Date
}

export default User
