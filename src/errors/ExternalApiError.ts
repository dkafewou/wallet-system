export default class ExternalApiError extends Error {
  name: string
  wrappedError: Error

  constructor(message: string, wrappedError: Error) {
    super(message)
    Error.captureStackTrace(this, ExternalApiError)
    this.name = "ExternalApiError"
    this.wrappedError = wrappedError
  }
}