require("dotenv").config()

const DEV_DEFAULT = "unset_in_development"
const UNSET_REQUIRED = "unset_and_required"

enum Env {
  Development = "development",
  Staging = "staging",
  Production = "production"
}

interface InterfaceVars {
  [key: string]: string
}

let sharedInstance: Config | null

export default class Config {
  mode: string
  _vars: InterfaceVars
  _requiredVars: InterfaceVars
  _defaultedVars: InterfaceVars

  constructor() {
    this.mode = process.env.NODE_ENV || Env.Development
    this._vars = {}
    this._requiredVars = {}
    this._defaultedVars = {}
  }

  static get shared() {
    if (sharedInstance == null) {
      sharedInstance = new Config()
    }
    return sharedInstance
  }

  requireProduction(varName: string, devDefault = DEV_DEFAULT): string {
    const setValue = process.env[varName]
    if (setValue == null && !this.modeIsProductionOrStaging) {
      this._defaultedVars[varName] = devDefault
      this._vars[varName] = devDefault
    } else if (setValue == null) {
      this._requiredVars[varName] = varName
      this._vars[varName] = devDefault
    } else {
      this._vars[varName] = setValue
    }
    return this._vars[varName]
  }

  require(varName: string) {
    const setValue = process.env[varName]
    if (setValue == null) {
      this._requiredVars[varName] = varName
      return UNSET_REQUIRED
    } else {
      this._vars[varName] = setValue
      return setValue
    }
  }

  verify() {
    let shouldExit = false

    // List required variables that are unset
    for (let varName in this._requiredVars) {
      shouldExit = true
      console.error(`ERROR: $${varName} must be set!`)
    }

    // List variables that are unset, but defaulted
    Object.keys(this._defaultedVars)
      .sort()
      .forEach(varName => {
        const value = this._defaultedVars[varName]
        console.warn(
          `WARNING: $${varName} is not set. Defaulting to "${value}"`,
        )
      })

    if (shouldExit) {
      console.error(
        `Please make sure all required environment variables are set.`,
      )
      process.exit()
    }
  }

  // Returns true if either staging or production
  get modeIsProductionOrStaging() {
    return this.mode === Env.Production || this.mode === Env.Staging
  }

  // Returns true only if in real production mode
  get modeIsProduction() {
    return this.mode === Env.Production
  }
}
