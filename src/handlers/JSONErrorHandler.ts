import { Request, Response, NextFunction } from "express"

export const onError = async (err: Error, _req: Request, res: Response, _next: NextFunction) => {
  // Respond and log
  const respondAndLog = (statusCode: number, responseObject: object) => {
    if (statusCode >= 500) {
      // @ts-ignore
      console.error(err.stack)
      // @ts-ignore
      console.error(err.wrappedError)
    }

    // Always return JSON
    return res.status(statusCode).json(responseObject)
  }

  // Check error types
  switch (err.name) {
    case "UnauthorizedError": {
      respondAndLog(401, {
        type:    "unauthorized_access",
        message: err.message,
      })
      break
    }

    case "ResourceNotFoundError": {
      respondAndLog(404, {
        type:    "resource_not_found",
        message: err.message,
      })
      break
    }

    case "InvalidFileTypeError": {
      respondAndLog(422, {
        type:    "invalid_file_type_error",
        message: err.message,
      })
      break
    }

    case "InvalidInputError": {
      respondAndLog(422, {
        type:    "invalid_input_error",
        message: err.message,
      })
      break
    }

    case "ValidationError": {
      respondAndLog(422, {
        type:            "invalid_input_error",
        message:         "Some or more input(s) are invalid",
        validationError: err,
      })
      break
    }

    case "ExternalApiError": {
      respondAndLog(500, {
        type:    "external_api_error",
        message: err.message,
      })
      break
    }

    case "DatabaseError": {
      respondAndLog(500, {
        type:    "database_error",
        message: err.message,
      })
      break
    }

    default: {
      console.warn(`Did not recognize ${err.constructor.name}.`)
      respondAndLog(500, {
        type:    "unknown_error",
        message: err.message,
      })
      break
    }
  }
}
