export default class InvalidFileTypeError extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = "InvalidFileTypeError"
    Error.captureStackTrace(this, InvalidFileTypeError)
  }
}
