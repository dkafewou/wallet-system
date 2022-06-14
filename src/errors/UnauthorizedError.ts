export default class UnauthorizedError extends Error {
  name: string

  constructor(message: string) {
    super(message)
    Error.captureStackTrace(this, UnauthorizedError)
    this.name = "UnauthorizedError"
  }
}