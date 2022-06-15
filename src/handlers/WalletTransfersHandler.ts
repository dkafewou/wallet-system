import { NextFunction, Request, Response } from "express"
import Joi from "joi"
import { ResourceNotFoundError, UnauthorizedError } from "../errors"
import Wallet from "../models/pg/Wallet"
import { Money } from "ts-money"
import { processWalletTransfer } from "../services/transfer"

// Define schema for validation
const validationSchema = Joi.object().keys({
  amount:            Joi.number().required(),
  recipientWalletID: Joi.string().required(),
})

const onPost = async (req: Request, res: Response, next: NextFunction) => {
  const { userID } = req.authClaims
  const { walletID } = req.params

  try {
    // Validate data
    const { amount, recipientWalletID } = await validationSchema.validateAsync(req.body)

    const [wallet, recipientWallet] = await Promise.all([
      Wallet.fetchByID(walletID),
      Wallet.fetchByID(recipientWalletID)
    ])
    // Verify wallet exist and is user's
    if (wallet == null || wallet.userID !== userID || recipientWallet == null) {
      next(new ResourceNotFoundError("Wallet not found"))
      return
    }

    const amountMoney = new Money(amount, wallet.balance.currency)
    // Check if enough balance available to process transfer
    if (amountMoney.greaterThan(wallet.balance)) {
      next(new UnauthorizedError("Not enough balance to proceed with this transfer"))
      return
    }

    // Process wallet credit
    const response = await processWalletTransfer(wallet, recipientWallet, amountMoney)

    // Return response
    return res.json({
      ...response,
    })
  } catch (err) {
    next(err)
    return
  }
}

const WalletTransfersHandler = {
  onPost,
}
export default WalletTransfersHandler



