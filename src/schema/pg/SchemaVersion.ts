import * as semver from "semver"
import MigrationStatement from "./MigrationStatement"
import { IDatabase } from "pg-promise"
import DB from "../../models/DB"

export default class SchemaVersion {
	version: string
	reason: string
	migrationStatements: MigrationStatement[]

	constructor(version: string, reason: string, migrationStatements: Array<MigrationStatement>) {
		this.version = semver.clean(version) as string
		this.reason = reason
		this.migrationStatements = migrationStatements

		if (this.version == null) {
			throw new Error(`Invalid version string "${version}"`)
		}
	}

	async runMigration(tx: IDatabase<any> = DB.shared) {
		console.log(` - v${this.version}: ${this.reason}`)
		const { migrationStatements } = this

		// Iterate over each statement
		for (let i = 0; i < migrationStatements.length; i++) {
			const { description, statement } = migrationStatements[i]
			console.log(`   - Step ${i}: ${description}`)

			// Run the statement
			await tx.none(statement)
		}

		// Done
		console.log(`   - Done!`)
	}

	static sortAscending(a: SchemaVersion, b: SchemaVersion) {
		if (semver.lt(a.version, b.version)) {
			return -1
		} else if (semver.gt(a.version, b.version)) {
			return 1
		} else {
			throw new Error(`Duplicate versions exist: ${a.version} and ${b.version}`)
		}
	}

	migrationRequiredForVersion(version: string) {
		return semver.gt(this.version, version)
	}
}

export interface ISchemaVersion {
	version: string
	reason: string
	migrationStatements: string
}
