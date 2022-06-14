export default class ValidationError extends Error {
  name: string

  constructor(message: string) {
    super(message)
    Error.captureStackTrace(this, ValidationError)
    this.name = "ValidationError"
  }
}