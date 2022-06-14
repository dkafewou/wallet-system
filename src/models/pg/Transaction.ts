import DB from "../DB"
import { DatabaseError } from "../../errors"
import moment, { Moment } from "moment"
import SQLBuilder from "../SQLBuilder"
import { IDatabase } from "pg-promise"
import { Money } from "ts-money"

export const enum TransactionStatus {
  SUCCESSFUL = "SUCCESSFUL",
  FAILED = "FAILED"
}

export default class Transaction {
  id: string
  creditID: string
  amount: Money
  status: TransactionStatus
  gateway: string
  externalID: string
  createdAt: Moment

  constructor({ id, creditID, amount, currency, status, gateway, externalID, created_at }: ITransaction) {
    this.id = id
    this.creditID = creditID
    this.status = status
    this.amount = new Money(amount, currency)
    this.gateway = gateway
    this.externalID = externalID
    this.createdAt = moment(created_at)
  }

  static async create(
    creditID: string,
    amount: number,
    currency: string,
    status: TransactionStatus,
    gateway: string,
    externalID: string,
    runner: IDatabase<any> = DB.shared
  ): Promise<Transaction> {
    try {
      const statement = SQLBuilder.shared("transactions")
        .insert({
          credit_id:    creditID,
          amount,
          currency,
          status,
          gateway,
          external_id: externalID
        }).returning("*")

      const row = await runner.one(statement.toQuery())
      return new Transaction(row)
    } catch (err) {
      throw new DatabaseError("Failed to create Transaction:", err)
    }
  }

  get [Symbol.toStringTag]() {
    return "Transaction"
  }
}

export interface ITransaction {
  id: string
  amount: number
  currency: string
  status: TransactionStatus
  creditID: string
  gateway: string
  externalID: string
  created_at: string
}
