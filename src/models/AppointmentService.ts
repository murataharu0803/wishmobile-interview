import { BOOLEAN, DATE, INTEGER, STRING, TEXT, UUID, UUIDV4 } from 'sequelize'
import {
  AllowNull,
  Column,
  CreatedAt,
  Default,
  Index,
  IsUUID,
  Model,
  NotNull,
  PrimaryKey,
  Table,
  UpdatedAt,
} from 'sequelize-typescript'

@Table
class AppointmentService extends Model {
  @IsUUID(4)
  @Index
  @Default(UUIDV4)
  @PrimaryKey
  @Column(UUID)
  declare id: string

  /** 服務名稱 */
  @NotNull
  @AllowNull(false)
  @Column(STRING(255))
  declare name: string

  /** 服務描述 */
  @Column(TEXT)
  declare description: string

  /** 實際價格 */
  @NotNull
  @AllowNull(false)
  @Column(INTEGER)
  declare price: number

  /** 顯示時間 */
  @Column(INTEGER)
  declare showTime: number

  /** 排序 */
  @Default(0)
  @Column(INTEGER)
  declare order: number

  /** 是否已軟刪除 */
  @Default(false)
  @Column(BOOLEAN)
  declare isRemove: boolean

  /** 是否公開於 Client */
  @Default(true)
  @Column(BOOLEAN)
  declare isPublic: boolean

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

export default AppointmentService
