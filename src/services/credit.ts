import DB from "../models/DB"
import logger from "../helpers/logger"
import Credit, { CreditStatus } from "../models/pg/Credit"
import Transaction, { TransactionStatus } from "../models/pg/Transaction"
import { randomUUID } from "crypto"
import Wallet from "../models/pg/Wallet"
import { randomBoolean } from "../helpers/utils"

export const processCreditForWallet = async (
  wallet: Wallet,
  amount: number,
): Promise<IResponse> => {
  return DB.shared.tx(async tx => {
    // Create credit for wallet
    const credit = await Credit.create(wallet.id, amount, wallet.balance.currency, CreditStatus.PENDING, tx)

    // Process transaction with random boolean value
    // Payment gateway should be used here for production usage
    let transactionStatus = TransactionStatus.SUCCESSFUL
    if (!randomBoolean()) {
      transactionStatus = TransactionStatus.FAILED
    }
    // Create transaction payment processed
    const transaction = await Transaction.create(
      credit.id, credit.amount.amount, credit.amount.currency, transactionStatus, "Paystack", randomUUID(), tx,
    )

    let updateCredit: Credit
    let updatedWallet: Wallet
    if (transaction.status === TransactionStatus.SUCCESSFUL) {
      // Update credit status to successful and update wallet balance
      updateCredit = await credit.updateStatus(CreditStatus.SUCCESSFUL, tx)
      const newBalance = wallet.balance.add(credit.amount)
      updatedWallet = await wallet.updateBalance(newBalance.amount, tx)

    } else {
      // Update credit status to failed
      updateCredit = await credit.updateStatus(CreditStatus.FAILED, tx)
      updatedWallet = wallet
    }

    return {
      wallet: updatedWallet,
      credit: updateCredit,
    }
  }).catch(err => {
    logger.error(`Failed to process wallet credit: ${err}`)
    throw err
  })
}

interface IResponse {
  wallet: Wallet
  credit: Credit
}
