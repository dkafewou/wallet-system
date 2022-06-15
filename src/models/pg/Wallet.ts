import DB from "../DB"
import { DatabaseError } from "../../errors"
import moment, { Moment } from "moment"
import SQLBuilder from "../SQLBuilder"
import { IDatabase } from "pg-promise"
import { Money } from "ts-money"
import PaginationInfo from "../PaginationInfo"

export default class Wallet {
  id: string
  userID: string
  balance: Money
  createdAt: Moment

  constructor({ id, currency, balance, user_id, created_at }: IWallet) {
    this.id = id
    this.userID = user_id
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

  static async fetchByCurrencyForUser(
    currency: string,
    userID: string,
    runner: IDatabase<any> = DB.shared
  ): Promise<Wallet | null> {
    try {
      const statement = SQLBuilder.shared("wallets")
        .select()
        .where("user_id", userID)
        .andWhere("currency", currency)

      // Perform query and return data
      const row = await runner.oneOrNone(statement.toQuery())
      if (row == null) {
        return null
      }
      return new Wallet(row)
    } catch (err) {
      throw new DatabaseError("Failed to fetch Wallet by currency for user", err)
    }
  }

  static async fetchAll(
    page: number = 1,
    maxResults: number = 30,
    runner: IDatabase<any> = DB.shared
  ): Promise<Wallet[]> {
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

  static async fetchAllForUser(
    userID: string,
    page: number = 1,
    maxResults: number = 30,
    runner: IDatabase<any> = DB.shared
  ): Promise<Wallet[]> {
    try {
      const statement = SQLBuilder.shared("wallets")
        .select()
        .where("user_id", userID)
        .limit(maxResults)
        .offset(maxResults * (page - 1))

      // Perform query and return data
      const rows = await runner.any(statement.toQuery())
      return rows.map(row => new Wallet(row))
    } catch (err) {
      throw new DatabaseError("Failed to fetch all Wallets", err)
    }
  }

  static async fetchPaginationInfo(userID: string, page = 1, maxResults = 30, runner = DB.shared) {
    const query = SQLBuilder.shared("wallets")
      .where("user_id", userID)
      .countDistinct({ total: "id" })

    const row = await runner.one(query.toQuery())
    return new PaginationInfo(row.total, page, maxResults)
  }

  get [Symbol.toStringTag]() {
    return "Wallet"
  }
}

export interface IWallet {
  id: string
  currency: string
  balance: number
  user_id: string
  created_at: string
}
