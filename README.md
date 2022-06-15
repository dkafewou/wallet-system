# Wallet System
REST API to mock a basic wallet system

The API should following requirements

- A user can create an account and authenticate with a unique phone number and password
- A user can create many wallets, each with a unique currency
- A user can credit their wallets
- A user can transfer from one wallet to another
- Wallet transfers over N1,000,000 must be approved by an ADMIN user
- An admin gets monthly payment summaries - capturing all payments made in the system

## How to set up (MacOS)
requirement: node14, Postgres

- Clone the repo `git clone https://github.com/dkafewou/wallet-system.git` and `cd wallet-system`

- Copy and paste `.env.example` and rename it `.env`

- Create database on your Postgres server and provide 
  `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_HOST` and `POSTGRES_PORT` in the `.env` file

- Install dependencies: `npm install`

- Build the project: `npm run build`

- Run migration to create database schema `npm run db-create`

## Start server
- `npm start` Server is listen on port 8080.

API documentation available with Swagger ui  at http://localhost:8080/api-docs/

Endpoints available at http://localhost:8080/v1
