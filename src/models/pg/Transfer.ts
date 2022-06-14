import DB from "../DB"
import { DatabaseError } from "../../errors"
import moment, { Moment } from "moment"
import SQLBuilder from "../SQLBuilder"
import { IDatabase } from "pg-promise"
import { Money } from "ts-money"

export const enum TransferStatus {
  PENDING_APPROVAL = "PENDING_APPROVAL",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED"
}

export default class Transfer {
  id: string
  from: string
  to: string
  approvedBy: string | null
  amount: Money
  status: TransferStatus
  createdAt: Moment

  constructor({ id, from_wallet_id, to_wallet_id, user_id, amount, currency, status, created_at }: ITransfer) {
    this.id = id
    this.from = from_wallet_id
    this.to = to_wallet_id
    this.approvedBy = user_id
    this.status = status
    this.amount = new Money(amount, currency)
    this.createdAt = moment(created_at)
  }

  static async create(
    from: string,
    to: string,
    amount: number,
    currency: string,
    status: TransferStatus,
    runner: IDatabase<any> = DB.shared,
  ): Promise<Transfer> {
    try {
      const statement = SQLBuilder.shared("transfers")
        .insert({
          from_wallet_id: from,
          to_wallet_id:   to,
          amount,
          currency,
          status,
        }).returning("*")

      const row = await runner.one(statement.toQuery())
      return new Transfer(row)
    } catch (err) {
      throw new DatabaseError("Failed to create Transfer:", err)
    }
  }

  async setApprovalAdmin(adminID: string, runner: IDatabase<any> = DB.shared): Promise<Transfer> {
    try {
      const statement = SQLBuilder.shared("transfers")
        .where({ id: this.id })
        .update({
          user_id: adminID,
          status:  TransferStatus.SUCCESSFUL,
        }, "*")

      const row = await runner.one(statement.toQuery())
      return new Transfer(row)
    } catch (err) {
      throw new DatabaseError("Failed to set approval Admin for Transfer:", err)
    }
  }

  get [Symbol.toStringTag]() {
    return "Transfer"
  }
}

export interface ITransfer {
  id: string
  amount: number
  currency: string
  status: TransferStatus
  from_wallet_id: string
  to_wallet_id: string
  user_id: string
  created_at: string
}
