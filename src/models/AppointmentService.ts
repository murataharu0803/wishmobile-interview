import { BOOLEAN, DATE, INTEGER, STRING, TEXT, UUID } from 'sequelize'
import {
  Column,
  CreatedAt,
  Default,
  Index,
  IsUUID,
  Model,
  NotNull,
  PrimaryKey,
  UpdatedAt,
} from 'sequelize-typescript'

class AppointmentService extends Model {
  @IsUUID(4)
  @PrimaryKey
  @Index
  @Column(UUID)
  declare id: string

  /** 服務名稱 */
  @NotNull
  @Column(STRING(255))
  name: string

  /** 服務描述 */
  @Column(TEXT)
  description: string

  /** 實際價格 */
  @NotNull
  @Column(INTEGER)
  price: number

  /** 顯示時間 */
  @Column(INTEGER)
  showTime: number

  /** 排序 */
  @Default(0)
  @Column(INTEGER)
  order: number

  /** 是否已軟刪除 */
  @Default(false)
  @Column(BOOLEAN)
  isRemove: boolean

  /** 是否公開於 Client */
  @Default(true)
  @Column(BOOLEAN)
  isPublic: boolean

  @NotNull
  @CreatedAt
  @Column(DATE)
  declare createdAt: Date

  @NotNull
  @UpdatedAt
  @Column(DATE)
  declare updatedAt: Date
}

export default AppointmentService
