import pgp, { IDatabase }  from 'pg-promise';
import Config from '../helpers/Config';
import logger from "../helpers/logger"

// Get postgres env data from env variables
const POSTGRES_DB = Config.shared.require("POSTGRES_DB")
const POSTGRES_USER = Config.shared.require("POSTGRES_USER")
const POSTGRES_PASSWORD = Config.shared.require("POSTGRES_PASSWORD")
const POSTGRES_HOST = Config.shared.require("POSTGRES_HOST")
const POSTGRES_PORT = Config.shared.require("POSTGRES_PORT")
const POSTGRES_SSL = Config.shared.requireProduction("POSTGRES_SSL", "false")

// tslint:disable-next-line no-any
let instance: IDatabase<any>;

export default class DB {
	static get shared() {
		if (instance == null) {
			// Check database env
			if (POSTGRES_DB == null || POSTGRES_USER == null || POSTGRES_PASSWORD == null || POSTGRES_HOST == null ||
				POSTGRES_PORT == null || POSTGRES_SSL == null) {
				logger.error('$DATABASE_ENV is not set');
				process.exit();
			}

			// Build config
			const config = {
				host: POSTGRES_HOST,
				port: Number(POSTGRES_PORT),
				database: POSTGRES_DB,
				user: POSTGRES_USER,
				password: POSTGRES_PASSWORD,
				ssl: POSTGRES_SSL === "true",
			};

			// Init DB
			const pgpFactory = pgp();
			instance = pgpFactory(config);
		}

		return instance;
	}
}
