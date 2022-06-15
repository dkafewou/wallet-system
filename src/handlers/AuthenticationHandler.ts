import { Request, Response, NextFunction } from "express"
import User from "../models/pg/User"
import { signToken } from "../helpers/jwtToken"
import Joi from "joi"
import { UnauthorizedError } from "../errors"

// Define schema for validation
const validationSchema = Joi.object().keys({
  phoneNumber: Joi.string().length(15).pattern(/^[0-9]+$/).required(),
  password:    Joi.string().required(),
})

const onPost = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Validate data
    const { phoneNumber, password } = await validationSchema.validateAsync(req.body)

    const user = await User.fetchByPhoneNumber(phoneNumber)
    // Verify user is not empty
    if (user == null) {
      next(new UnauthorizedError("Wrong email or password"))
      return
    }

    // Verify password
    const isVerified = user.verifyPassword(password)
    if (!isVerified) {
      next(new UnauthorizedError("Wrong email or password"))
      return
    }

    // Return response
    return res.json({
      token: signToken(user),
    })
  } catch (err) {
    next(err)
    return
  }
}

const AuthenticationHandler = {
  onPost,
}
export default AuthenticationHandler



