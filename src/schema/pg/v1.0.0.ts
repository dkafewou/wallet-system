import SchemaVersion from "./SchemaVersion"
import MigrationStatement from "./MigrationStatement"

// noinspection SqlNoDataSourceInspection
export default new SchemaVersion("1.0.0", "Complete schema in production V1.0.0",
  [
    new MigrationStatement(`Creating table "db_configs"`,
        `CREATE TABLE db_configs
         (
             config VARCHAR(150) NOT NULL
                 CONSTRAINT db_configs_pk
                     PRIMARY KEY,
             value  VARCHAR(150) NOT NULL
         );`),
    new MigrationStatement(`Creating table "users"`,
        `CREATE TABLE users
         (
             id            uuid           DEFAULT uuid_generate_v4()
                 CONSTRAINT users_pkey
                     PRIMARY KEY,
             phone_number        VARCHAR(15)  UNIQUE NOT NULL,
             password     VARCHAR(500)   NOT NULL,
             fullname     VARCHAR(100)  NOT NULL,
             role         VARCHAR(15)   NOT NULL,
             created_at   TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
         );`),
    new MigrationStatement(`Creating table "wallets"`,
        `CREATE TABLE wallets
         (
             id            uuid           DEFAULT uuid_generate_v4()
                 CONSTRAINT wallets_pkey
                     PRIMARY KEY,
             currency        VARCHAR(3)   NOT NULL,
             balance         INTEGER  NOT NULL,
             created_at      TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
             user_id         uuid       NOT NULL
                 CONSTRAINT wallets_user_id_fk
                     REFERENCES users
         );`),
    new MigrationStatement(`Creating table "transfers"`,
      `CREATE TABLE transfers
         (
             id            uuid           DEFAULT uuid_generate_v4()
                 CONSTRAINT transfers_pkey
                     PRIMARY KEY,
             status        VARCHAR(20)   NOT NULL,
             amount        INTEGER       NOT NULL,
             created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
             from_wallet_id   uuid          NOT NULL
                 CONSTRAINT transfers_from_wallet_id_fk
                     REFERENCES wallets,
             to_wallet_id   uuid          NOT NULL
                 CONSTRAINT transfers_to_wallet_id_fk
                     REFERENCES wallets,
             user_id         uuid
                 CONSTRAINT transfers_user_id_fk
                     REFERENCES users
         );`),
    new MigrationStatement(`Creating table "credits"`,
      `CREATE TABLE credits
         (
             id            uuid           DEFAULT uuid_generate_v4()
                 CONSTRAINT credits_pkey
                     PRIMARY KEY,
             status        VARCHAR(20)   NOT NULL,
             amount        INTEGER       NOT NULL,
             created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
             wallet_id     uuid      NOT NULL
                 CONSTRAINT credits_wallets_id_fk
                     REFERENCES wallets
         );`),
    new MigrationStatement(`Creating table "transactions"`,
      `CREATE TABLE transactions
         (
             id            uuid           DEFAULT uuid_generate_v4()
                 CONSTRAINT transactions_pkey
                     PRIMARY KEY,
             amount        INTEGER       NOT NULL,
             status        VARCHAR(20)   NOT NULL,
             gateway       VARCHAR(25)  NOT NULL,
             external_id   VARCHAR(150)  NOT NULL,
             created_at    TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
             credit_id         uuid      NOT NULL
                 CONSTRAINT transactions_credit_id_fk
                     REFERENCES credits
         );`),
  ],
)
