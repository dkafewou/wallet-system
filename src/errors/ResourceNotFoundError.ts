export default class ResourceNotFoundError extends Error {
  name: string

  constructor(message: string) {
    super(message)
    this.name = "ResourceNotFoundError"
    Error.captureStackTrace(this, ResourceNotFoundError)
  }
}