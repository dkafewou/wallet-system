import { NextFunction, Request, Response } from "express"
import User, { UserRole } from "../models/pg/User"
import { ResourceNotFoundError, UnauthorizedError } from "../errors"
import Transfer, { TransferStatus } from "../models/pg/Transfer"
import Wallet from "../models/pg/Wallet"
import { processApprovalTransferByAdmin } from "../services/transfer"

const onPost = async (req: Request, res: Response, next: NextFunction) => {
  const { userID } = req.authClaims
  const { transferID } = req.params

  try {
    const user = await User.fetchByID(userID)
    // Verify user exist and is Admin
    if (user == null || user.role !== UserRole.ADMIN) {
      next(new UnauthorizedError("User not authorized to do this transaction"))
      return
    }

    // verify transfer exist and is PENDING_APPROVAL status
    const transfer = await Transfer.fetchByID(transferID)
    if (transfer == null || transfer.status !== TransferStatus.PENDING_APPROVAL) {
      next(new ResourceNotFoundError("Transfer not found"))
      return
    }

    // Fetch the two wallets on the transfer
    const [wallet, recipientWallet] = await Promise.all([
      Wallet.fetchByID(transfer.from),
      Wallet.fetchByID(transfer.to),
    ])

    // Verify wallets exist
    if (wallet == null || recipientWallet == null) {
      next(new ResourceNotFoundError("Wallets not found for transfer"))
      return
    }

    // Verify if enough balance to process the transfer
    // Check if enough balance available to process transfer
    if (transfer.amount.greaterThan(wallet.balance)) {
      next(new UnauthorizedError("Not enough balance to proceed with this transfer"))
      return
    }

    // Process transfer approval for admin
    const response = await processApprovalTransferByAdmin(user, transfer, wallet, recipientWallet)

    // Return response
    return res.json({
      ...response,
    })
  } catch (err) {
    next(err)
    return
  }
}

const onGet = async (req: Request, res: Response, next: NextFunction) => {
  const { page = 1, maxResults = 30 } = req.query
  const { userID } = req.authClaims

  try {
    const user = await User.fetchByID(userID)
    // Verify user exist and is Admin
    if (user == null || user.role !== UserRole.ADMIN) {
      next(new ResourceNotFoundError("User not found"))
      return
    }
    // Fetch user transfers
    const [transfers, paginationInfo] = await Promise.all([
      Transfer.fetchAll(parseInt(page as string), parseInt(maxResults as string)),
      Transfer.fetchPaginationInfo(parseInt(page as string), parseInt(maxResults as string)),
    ])
    return res.json({
      transfers,
      paginationInfo,
    })
  } catch (err) {
    next(err)
    return
  }
}

const AdminTransfersHandler = {
  onPost,
  onGet,
}
export default AdminTransfersHandler



