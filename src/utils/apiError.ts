export class ApiError extends Error {
  constructor(status: number, description = '') {
    super(description)
    Object.setPrototypeOf(this, ApiError.prototype)
    this.status = status
    this.message = description
  }

  status: number
}
