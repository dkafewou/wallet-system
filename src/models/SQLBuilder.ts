import knex, { Knex } from "knex"

let instance: Knex

export default class SQLBuilder {
  static get shared() {
    if (instance == null) {
      // Init knex
      // @ts-ignore
      instance = knex({ client: "pg" } as Knex.Config)
    }

    return instance
  }
}
