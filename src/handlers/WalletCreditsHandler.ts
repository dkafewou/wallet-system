import { NextFunction, Request, Response } from "express"
import Joi from "joi"
import { ResourceNotFoundError } from "../errors"
import Wallet from "../models/pg/Wallet"
import { processCreditForWallet } from "../services/credit"

// Define schema for validation
const validationSchema = Joi.object().keys({
  amount: Joi.number().required(),
})

const onPost = async (req: Request, res: Response, next: NextFunction) => {
  const { userID } = req.authClaims
  const { walletID } = req.params

  try {
    // Validate data
    const { amount } = await validationSchema.validateAsync(req.body)

    const wallet = await Wallet.fetchByID(walletID)
    // Verify wallet exist and is user's
    if (wallet == null || wallet.userID !== userID) {
      next(new ResourceNotFoundError("Wallet not found"))
      return
    }

    // Process wallet credit
    const response = await processCreditForWallet(wallet, amount)

    // Return response
    return res.json({
      ...response,
    })
  } catch (err) {
    next(err)
    return
  }
}

const WalletCreditsHandler = {
  onPost,
}
export default WalletCreditsHandler



