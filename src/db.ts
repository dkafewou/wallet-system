import commandLineCommands from "command-line-commands"
import DB from "./models/DB"
import schema from "./schema/pg"

const validCommands = [null, "create", "migrate"]
const { command, argv } = commandLineCommands(validCommands)

switch (command) {
  case "create": {
    (async function () {
      await create()
      process.exit()
    })()
    break
  }

  case "migrate": {
    (async function () {
      await migrate(argv)
      process.exit()
    })()
    break
  }

  case null:
  default: {
    console.log(`"${command}" is not a valid command`)
    break
  }
}

async function create() {
  try {
    await DB.shared.tx(async tx => {
      await tx.none("DROP SCHEMA public CASCADE; CREATE SCHEMA public; CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")
      console.log("Dropped old tables.")
      console.log("Creating tables...")
      await schema.runSchemaVersionMigration("1.0.0", tx)
      console.log("Created tables.")
      console.log("Migrating to latest...")
      await schema.migrateFromCurrentVersion(tx)
      console.log("Migrated to latest.")
    })
  } catch (err) {
    console.log("Failed to create tables:", err)
  }
}

async function migrate([version]: string[]) {
  try {
    if (version == null) {
      // Migrate from current version to latest version
      await schema.migrateFromCurrentVersion()
    } else {
      // Run a single migration
      await schema.runSchemaVersionMigration(version)
    }
  } catch (err) {
    console.log("Failed to create tables:", err)
  }
}
