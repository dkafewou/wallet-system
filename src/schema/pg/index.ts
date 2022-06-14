import SchemaVersion from "./SchemaVersion"
import DB from "../../models/DB"
import DBConfig, { ConfigKey } from "../../models/pg/DBConfig"
import { IDatabase } from "pg-promise"

// Add new versions here
const SCHEMA_VERSIONS: any[] = [
]

// Sort imported versions
SCHEMA_VERSIONS.sort(SchemaVersion.sortAscending)

const migrateFromCurrentVersion = async (runner: IDatabase<any> = DB.shared) => {
  try {
    // Fetch current version. Default to 1.0.0 if no version exists such as transitioning from old migration scripts
    const version = await DBConfig.getConfigValue(ConfigKey.SCHEMA_SEMVER_KEY, runner) || "1.0.0"
    console.log(`Migrating from schema version v${version} to latest.`)

    // Filter to only scripts that require migration
    const versionsForMigration = SCHEMA_VERSIONS.filter(schemaVersion => schemaVersion.migrationRequiredForVersion(version))

    // If no results, we're up to date
    if (versionsForMigration.length === 0) {
      console.log(`You're already at the latest version. No action necessary.`)
      return
    }

    // Run each migration
    const currentVersion = await runner.tx(async tx => {
      for (let i = 0; i < versionsForMigration.length; i++) {
        const schemaVersion = versionsForMigration[i]
        await schemaVersion.runMigration(tx)
      }

      // Last migration version
      const currentVersion = versionsForMigration[versionsForMigration.length - 1]

      // Set current migration version
      await DBConfig.updateConfigValue(ConfigKey.SCHEMA_SEMVER_KEY, currentVersion.version, tx)
      return currentVersion
    })

    console.log(`Successfully migrated to schema v${currentVersion.version}.`)
  } catch (err) {
    console.log(`Failed to run migration.\n${err.stack}`)
    throw (err)
  }
}

const runSchemaVersionMigration = async (version: string, runner: IDatabase<any> = DB.shared) => {
  const schemaVersion = SCHEMA_VERSIONS.find(schemaVersion => version === schemaVersion.version)
  if (schemaVersion == null) {
    console.log(`Couldn't find schema version v${version}: Aborting.`)
    return
  }

  try {
    await runner.tx(async tx => {
      await schemaVersion.runMigration(tx)

      const previousVersion = await DBConfig.getConfigValue(ConfigKey.SCHEMA_SEMVER_KEY, tx)
      if (previousVersion == null) {
        // Set current migration version if no version exist
        await DBConfig.setConfigValue(ConfigKey.SCHEMA_SEMVER_KEY, version, tx)
      }
      return version
    })
    console.log(`Successfully ran migration for schema version v${version}.`)
  } catch (err) {
    console.log(`Failed to run migration for schema version v${version}.\n${err.stack}`)
    throw (err)
  }
}

export default { migrateFromCurrentVersion, runSchemaVersionMigration }
