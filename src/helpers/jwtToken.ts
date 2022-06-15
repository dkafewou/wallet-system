import { Request, Response, NextFunction } from "express"
import jwt from "jsonwebtoken"
import { UnauthorizedError } from "../errors"
import User from "../models/pg/User"
import Config from "./Config"

const INSECURE_KEY = "insecure-key"
const DEFAULT_EXPIRATION = 60 * 60 * 24 * 365
const JWT_SECRET = Config.shared.requireProduction("JWT_SECRET", INSECURE_KEY)

export const signToken = (user: User, expiresIn = DEFAULT_EXPIRATION) => {
  return jwt.sign({
      userID:      user.id,
      createdAt:   user.createdAt,
      phoneNumber: user.phoneNumber,
    },
    JWT_SECRET, { expiresIn: expiresIn },
  )
}

export default class jwtToken {
  static authorize() {
    return async function (req: Request, _res: Response, next: NextFunction) {
      // Get auth header
      let authHeader = req.header("Authorization")
      if (authHeader == null) {
        // No auth header provided
        next(new UnauthorizedError("Token invalid"))
        return
      }

      // Parse header
      let parts = authHeader.split(" ")
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        // Auth header is malformed
        next(new UnauthorizedError("Token invalid"))
        return
      }

      // Decode token
      let token = parts[1]
      let decoded: IDecoded
      try {
        decoded = jwt.verify(token, JWT_SECRET) as IDecoded
      } catch (err) {
        // Token is invalid
        next(new UnauthorizedError("Token invalid"))
        return
      }

      // Fetch user according to role
      let user
      try {
        user = await User.fetchByID(decoded.userID)
      } catch (err) {
        next(new UnauthorizedError("Token invalid"))
        return
      }

      if (user == null) {
        next(new UnauthorizedError("Account suspended"))
        return
      }

      // Everything checks out
      req.authClaims = decoded
      next()
    }
  }
}

export interface IDecoded {
  userID: string
  createdAt?: string
  phoneNumber: string
}
