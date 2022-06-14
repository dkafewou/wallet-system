import express from 'express';
import cors from 'cors';
import DB from "./models/DB"
import Config from './helpers/Config';
import { corsHosts } from "./helpers/utils"
import { onError } from "./handlers/JSONErrorHandler"
import v1 from "./routes/v1"
import notFoundHandler from "./handlers/NotFoundHandler"

const PORT = Config.shared.requireProduction("PORT", "8080")
const CORS_HOST = Config.shared.requireProduction("CORS_HOST", "http://localhost:3000")
const CORS_HOSTS = corsHosts(CORS_HOST)

// Verify config
Config.shared.verify()

// Check connection to postgres db
const db = DB.shared
db.func("version")
  .then(_data => console.log("Connection to DB successful"))
  .catch(err => {
    console.log(
      "Unable to connect to Postgres DB, check if postgres service started.",
      err,
    )
    process.exit(0)
  })

const app = express();

// Set up CORS
const corsOptions: cors.CorsOptions = {
  allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "X-Access-Token", "Authorization"],
  credentials: true,
  methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
  origin: CORS_HOSTS,
  preflightContinue: false,
};
app.use(cors(corsOptions));
// @ts-ignore
app.options("*", cors(corsOptions));

// Set up router
app.use("/v1/", v1)

// Handle not found route
app.use(notFoundHandler)
// Handle error
app.use(onError)

// Listen and serve
app.listen(PORT, () => console.log(`Client Server listening on port ${PORT}`));
