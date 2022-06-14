export default class MigrationStatement {
	statement: string;
	description: string;

	constructor(description: string, statement: string) {
		this.statement = statement;
		this.description = description;
	}
}
