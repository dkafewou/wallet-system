import DB from "../models/DB"
import logger from "../helpers/logger"
import Wallet from "../models/pg/Wallet"
import { Money } from "ts-money"
import Config from "../helpers/Config"
import Transfer, { TransferStatus } from "../models/pg/Transfer"
import { IDatabase } from "pg-promise"
import ExchangeRateAPI from "../helpers/ExchangeRateAPI"
import User from "../models/pg/User"

const TRANSFER_LIMIT = parseInt(Config.shared.require("TRANSFER_LIMIT"))

export const processWalletTransfer = async (
  wallet: Wallet,
  recipientWallet: Wallet,
  amountMoney: Money,
): Promise<IResponse> => {
  return DB.shared.tx(async tx => {
    let transferStatus = TransferStatus.SUCCESSFUL
    if (amountMoney.amount > TRANSFER_LIMIT) {
      transferStatus = TransferStatus.PENDING_APPROVAL
    }

    const transfer = await Transfer.create(
      wallet.id, recipientWallet.id, amountMoney.amount, wallet.balance.currency, transferStatus, tx,
    )

    const { updatedWallet } = await processTransferTransaction(wallet, recipientWallet, amountMoney, tx)

    return {
      wallet: updatedWallet,
      transfer,
    }
  }).catch(err => {
    logger.error(`Failed to process wallet transfer: ${err}`)
    throw err
  })
}

export const processApprovalTransferByAdmin = async (
  admin: User,
  transfer: Transfer,
  wallet: Wallet,
  recipientWallet: Wallet,
): Promise<IResponse> => {
  return DB.shared.tx(async tx => {
    const { updatedWallet } = await processTransferTransaction(wallet, recipientWallet, transfer.amount, tx)

    // Update transfer status
    const updatedTransfer = await transfer.setApprovalAdmin(admin.id, tx)

    return {
      wallet:   updatedWallet,
      transfer: updatedTransfer,
    }
  }).catch(err => {
    logger.error(`Failed to process Admin approval transfer: ${err}`)
    throw err
  })
}

const processTransferTransaction = async (
  wallet: Wallet,
  recipientWallet: Wallet,
  amountMoney: Money,
  runner: IDatabase<any> = DB.shared,
) => {
  // New wallet balance
  const balance = wallet.balance.subtract(amountMoney)
  let recipientBalance = recipientWallet.balance.add(amountMoney)

  // If different currency wallet process recipient balance with conversion
  if (amountMoney.currency !== recipientWallet.balance.currency) {
    // Get conversation rate for different currency transfer
    const exchangeRate = await ExchangeRateAPI.getConversation(amountMoney.currency, recipientWallet.balance.currency)
    const exchangeMoney = amountMoney.multiply(exchangeRate)
    recipientBalance = recipientWallet.balance.add(exchangeMoney)
  }

  const [updatedWallet, updatedRecipientWallet] = await Promise.all([
    wallet.updateBalance(balance.amount, runner),
    recipientWallet.updateBalance(recipientBalance.amount, runner),
  ])

  return {
    updatedWallet,
    updatedRecipientWallet,
  }
}

interface IResponse {
  wallet: Wallet
  transfer: Transfer
}
