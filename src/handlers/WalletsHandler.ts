import { Request, Response, NextFunction } from "express"
import User from "../models/pg/User"
import Joi from "joi"
import { InvalidInputError, ResourceNotFoundError } from "../errors"
import Wallet from "../models/pg/Wallet"

// Define schema for validation
const validationSchema = Joi.object().keys({
  currency: Joi.string().length(3).required(),
})

const onPost = async (req: Request, res: Response, next: NextFunction) => {
  const { userID } = req.authClaims

  try {
    // Validate data
    const { currency } = await validationSchema.validateAsync(req.body)

    const user = await User.fetchByID(userID)
    // Verify user is not empty
    if (user == null) {
      next(new ResourceNotFoundError("User not found"))
      return
    }

    // Verify user already has a wallet for the currency
    const existWallet = await Wallet.fetchByCurrencyForUser(currency, userID)
    if (existWallet) {
      next(new InvalidInputError(`User already has wallet for currency: ${currency}.`))
      return
    }

    // Create new wallet for currency
    const wallet = await Wallet.create(userID, currency)

    // Return response
    return res.json({
      wallet,
    })
  } catch (err) {
    next(err)
    return
  }
}

const onGet = async (req: Request, res: Response, next: NextFunction) => {
  const { page, maxResults } = req.query
  const { userID } = req.authClaims
  try {
    // Fetch user wallets
    const [wallets, paginationInfo] = await Promise.all([
      Wallet.fetchAllForUser(userID, parseInt(page as string), parseInt(maxResults as string)),
      Wallet.fetchPaginationInfo(userID, parseInt(page as string), parseInt(maxResults as string)),
    ])
    return res.json({
      wallets,
      paginationInfo,
    })
  } catch (err) {
    next(err)
    return
  }
}

const WalletsHandler = {
  onPost,
  onGet,
}
export default WalletsHandler



