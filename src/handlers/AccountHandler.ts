import { NextFunction, Request, Response } from "express"
import Joi from "joi"
import User, { UserRole } from "../models/pg/User"
import { InvalidInputError } from "../errors"

// Define schema for validation
const validationSchema = Joi.object().keys({
  fullName:        Joi.string().required(),
  phoneNumber:     Joi.string().max(15).pattern(/^[0-9]+$/).required(),
  password:        Joi.string().pattern(new RegExp("^[a-zA-Z0-9]{3,30}$")).required(),
  confirmPassword: Joi.ref("password"),
})

const onPostRegisterUser = async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, phoneNumber, password, confirmPassword } = req.body

  try {
    // Validate data
    const validatedData = await validationSchema.validateAsync({
      fullName, phoneNumber, password, confirmPassword,
    })

    // Check phone number exist in db
    const existingUser = await User.fetchByPhoneNumber(validatedData.phoneNumber)
    if (existingUser != null) {
      next(new InvalidInputError("Already signed up with this phone number, continue with login"))
      return
    }

    // Create user
    const user = await User.create(phoneNumber, password, fullName, UserRole.CUSTOMER)

    // Response
    return res.json({
      user: user.redactedInfo,
    })
  } catch (err) {
    next(err)
    return
  }
}

const onPostRegisterAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const { fullName, phoneNumber, password, confirmPassword } = req.body

  try {
    // Validate data
    const validatedData = await validationSchema.validateAsync({
      fullName, phoneNumber, password, confirmPassword,
    })

    // Check phone number exist in db
    const user = await User.fetchByPhoneNumber(validatedData.phoneNumber)
    if (user != null) {
      next(new InvalidInputError("Already signed up with this phone number, continue with login"))
      return
    }

    // Create admin user
    const admin = await User.create(phoneNumber, password, fullName, UserRole.ADMIN)

    // Response
    return res.json({
      user: admin.redactedInfo,
    })
  } catch (err) {
    next(err)
    return
  }
}

const AccountHandler = {
  onPostRegisterUser,
  onPostRegisterAdmin,
}
export default AccountHandler
