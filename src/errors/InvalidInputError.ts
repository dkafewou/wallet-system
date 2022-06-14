export default class InvalidInputError extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = "InvalidInputError"
    Error.captureStackTrace(this, InvalidInputError)
  }
}
