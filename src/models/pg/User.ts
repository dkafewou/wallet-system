import bcrypt from "bcrypt"
import DB from "../DB"
import { DatabaseError } from "../../errors"
import { hashPassword } from "../../helpers/utils"
import moment, { Moment } from "moment"
import SQLBuilder from "../SQLBuilder"
import { IDatabase } from "pg-promise"

export const enum UserRole {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export default class User {
  id: string
  phoneNumber: string
  passwordHash: string
  fullName: string
  role: UserRole
  createdAt: Moment

  constructor({ id, phone_number, password, fullname, role, created_at }: IUser) {
    this.id = id
    this.phoneNumber = phone_number
    this.passwordHash = password
    this.fullName = fullname
    this.role = role
    this.createdAt = moment(created_at)
  }

  verifyPassword(password: string): boolean {
    return bcrypt.compareSync(password, this.passwordHash)
  }

  static async create(
    phoneNumber: string,
    password: string,
    fullName: string,
    role = UserRole.CUSTOMER,
    runner: IDatabase<any> = DB.shared,
  ): Promise<User> {
    try {
      const statement = SQLBuilder.shared("users")
        .insert({
          phone_number: phoneNumber,
          password:     hashPassword(password),
          fullname:    fullName,
          role,
        }).returning("*")

      const row = await runner.one(statement.toQuery())
      return new User(row)
    } catch (err) {
      throw new DatabaseError("Failed to create User:", err)
    }
  }

  async updatePassword(password: string, runner: IDatabase<any> = DB.shared): Promise<User> {
    try {
      const statement = SQLBuilder.shared("users")
        .where({ id: this.id })
        .update({
          password: hashPassword(password),
        }, "*")

      const row = await runner.one(statement.toQuery())
      return new User(row)
    } catch (err) {
      throw new DatabaseError("Failed to update User password:", err)
    }
  }

  static async fetchByID(id: string, runner: IDatabase<any> = DB.shared): Promise<User | null> {
    try {
      const statement = SQLBuilder.shared("users")
        .select()
        .where("id", id)

      // Perform query and return data
      const row = await runner.oneOrNone(statement.toQuery())
      if (row == null) {
        return null
      }
      return new User(row)
    } catch (err) {
      throw new DatabaseError("Failed to fetch User by id", err)
    }
  }

  static async fetchByPhoneNumber(phoneNumber: string, runner: IDatabase<any> = DB.shared): Promise<User | null> {
    try {
      const statement = SQLBuilder.shared("users")
        .select()
        .where("phone_number", phoneNumber)

      // Perform query and return data
      const row = await runner.oneOrNone(statement.toQuery())
      if (row == null) {
        return null
      }
      return new User(row)
    } catch (err) {
      throw new DatabaseError("Failed to fetch User by phone number", err)
    }
  }

  get redactedInfo(): IRedactedInfo {
    return {
      id:          this.id,
      fullName:    this.fullName,
      phoneNumber: this.phoneNumber,
      role:        this.role,
    }
  }

  get [Symbol.toStringTag]() {
    return "User"
  }
}

interface IRedactedInfo {
  id: string
  fullName: string
  phoneNumber: string
  role: string
}

export interface IUser {
  id: string
  phone_number: string
  password: string
  fullname: string
  role: UserRole
  created_at: string
}
