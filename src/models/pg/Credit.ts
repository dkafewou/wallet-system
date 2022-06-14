import DB from "../DB"
import { DatabaseError } from "../../errors"
import moment, { Moment } from "moment"
import SQLBuilder from "../SQLBuilder"
import { IDatabase } from "pg-promise"
import { Money } from "ts-money"

export const enum CreditStatus {
  PENDING = "PENDING",
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED"
}

export default class Credit {
  id: string
  walletID: string
  amount: Money
  status: CreditStatus
  createdAt: Moment

  constructor({ id, walletID, amount, currency, status, created_at }: ICredit) {
    this.id = id
    this.walletID = walletID
    this.status = status
    this.amount = new Money(amount, currency)
    this.createdAt = moment(created_at)
  }

  static async create(
    walletID: string,
    amount: number,
    currency: string,
    status = CreditStatus.PENDING,
    runner: IDatabase<any> = DB.shared
  ): Promise<Credit> {
    try {
      const statement = SQLBuilder.shared("credits")
        .insert({
          wallet_id:    walletID,
          amount,
          currency,
          status,
        }).returning("*")

      const row = await runner.one(statement.toQuery())
      return new Credit(row)
    } catch (err) {
      throw new DatabaseError("Failed to create Credit:", err)
    }
  }

  async updateStatus(status: CreditStatus, runner: IDatabase<any> = DB.shared): Promise<Credit> {
    try {
      const statement = SQLBuilder.shared("credits")
        .where({ id: this.id })
        .update({
          status,
        }, "*")

      const row = await runner.one(statement.toQuery())
      return new Credit(row)
    } catch (err) {
      throw new DatabaseError("Failed to update Credit status:", err)
    }
  }

  get [Symbol.toStringTag]() {
    return "Credit"
  }
}

export interface ICredit {
  id: string
  amount: number
  currency: string
  status: CreditStatus
  walletID: string
  created_at: string
}
