import DB from "../DB"
import { DatabaseError } from "../../errors"
import SQLBuilder from "../SQLBuilder"
import { IDatabase } from "pg-promise"

export const ConfigKey = {
  SCHEMA_SEMVER_KEY: "schema_semver",
}

export default class DBConfig {
  static async getConfigValue(config: string, runner: IDatabase<any> = DB.shared) {
    try {
      const query = SQLBuilder.shared("db_configs")
        .select()
        .where("config", config)

      const row = await runner.oneOrNone(query.toQuery())

      if (row == null) {
        return null
      }
      return row.value
    } catch (err) {
      throw new DatabaseError(`Failed to get config value with key: ${config}`, err)
    }
  }

  static async setConfigValue(config: string, value: string, runner: IDatabase<any> = DB.shared): Promise<void> {
    try {
      const query = SQLBuilder.shared("db_configs")
        .insert({
          config: config,
          value: value
        })
        .returning("*")

      await runner.one(query.toQuery())
    } catch (err) {
      throw new DatabaseError(`Failed to set value: ${value} for config: ${config}`, err)
    }
  }


  static async updateConfigValue(config: string, value: string, runner: IDatabase<any> = DB.shared): Promise<void> {
    try {
      const query = SQLBuilder.shared("db_configs")
        .where('config', '=', config)
        .update({
          value,
        })

      await runner.none(query.toQuery())
    } catch (err) {
      throw new DatabaseError(`Failed to set value: ${value} for config: ${config}`, err)
    }
  }

  get [Symbol.toStringTag]() {
    return "DBConfig"
  }
}
