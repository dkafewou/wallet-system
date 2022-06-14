export default class DatabaseError extends Error {
  name: string
  wrappedError: Error

  constructor(message: string, wrappedError: Error) {
    super(message)
    Error.captureStackTrace(this, DatabaseError)
    this.name = "DatabaseError"
    this.wrappedError = wrappedError
  }
}