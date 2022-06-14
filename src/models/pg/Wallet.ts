import DB from "../DB"
import { DatabaseError } from "../../errors"
import moment, { Moment } from "moment"
import SQLBuilder from "../SQLBuilder"
import { IDatabase } from "pg-promise"
import { Money } from "ts-money"

export default class Wallet {
  id: string
  userID: string
  balance: Money
  createdAt: Moment

  constructor({ id, currency, balance, userID, created_at }: IWallet) {
    this.id = id
    this.userID = userID
    this.balance = new Money(balance, currency)
    this.createdAt = moment(created_at)
  }

  static async create(
    userID: string,
    currency: string,
    runner: IDatabase<any> = DB.shared
  ): Promise<Wallet> {
    try {
      const statement = SQLBuilder.shared("wallets")
        .insert({
          user_id:    userID,
          currency: currency,
          balance: 0,
        }).returning("*")

      const row = await runner.one(statement.toQuery())
      return new Wallet(row)
    } catch (err) {
      throw new DatabaseError("Failed to create Wallet:", err)
    }
  }

  async updateBalance(balance: number, runner: IDatabase<any> = DB.shared): Promise<Wallet> {
    try {
      const statement = SQLBuilder.shared("wallets")
        .where({ id: this.id })
        .update({
          balance,
        }, "*")

      const row = await runner.one(statement.toQuery())
      return new Wallet(row)
    } catch (err) {
      throw new DatabaseError("Failed to update Wallet balance:", err)
    }
  }

  static async fetchByID(id: string, runner: IDatabase<any> = DB.shared): Promise<Wallet | null> {
    try {
      const statement = SQLBuilder.shared("wallets")
        .select()
        .where("id", id)

      // Perform query and return data
      const row = await runner.oneOrNone(statement.toQuery())
      if (row == null) {
        return null
      }
      return new Wallet(row)
    } catch (err) {
      throw new DatabaseError("Failed to fetch Wallet by id", err)
    }
  }

  static async fetchAll(page: number, maxResults: number, runner: IDatabase<any> = DB.shared): Promise<Wallet[]> {
    try {
      const statement = SQLBuilder.shared("wallets")
        .select()
        .limit(maxResults)
        .offset(maxResults * (page - 1))

      // Perform query and return data
      const rows = await runner.any(statement.toQuery())
      return rows.map(row => new Wallet(row))
    } catch (err) {
      throw new DatabaseError("Failed to fetch all Wallets", err)
    }
  }

  get [Symbol.toStringTag]() {
    return "Wallet"
  }
}

export interface IWallet {
  id: string
  currency: string
  balance: number
  userID: string
  created_at: string
}
