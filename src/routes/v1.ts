import express from "express"
import bodyParser from "body-parser"
import DefaultHandler from "../handlers/DefaultHandler"
import AccountHandler from "../handlers/AccountHandler"
import AuthenticationHandler from "../handlers/AuthenticationHandler"
import jwtToken from "../helpers/jwtToken"
import WalletsHandler from "../handlers/WalletsHandler"
import WalletCreditsHandler from "../handlers/WalletCreditsHandler"
import WalletTransfersHandler from "../handlers/WalletTransfersHandler"
import AdminTransfersHandler from "../handlers/AdminTransfersHandler"

const router = express.Router()

// Middleware
router.use(bodyParser.json())


router.route("/default")
  .get(DefaultHandler.onGet)

/*
 * Routes
 */

router.route("/account/register")
  .post(AccountHandler.onPostRegisterUser)

router.route("/account/register-admin")
  .post(AccountHandler.onPostRegisterAdmin)

router.route("/account/login")
  .post(AuthenticationHandler.onPost)

router.route("/account/wallets")
  .post(jwtToken.authorize(), WalletsHandler.onPost)
  .get(jwtToken.authorize(), WalletsHandler.onGet)

router.route("/account/wallets/:walletID/credits")
  .post(jwtToken.authorize(), WalletCreditsHandler.onPost)

router.route("/account/wallets/:walletID/transfers")
  .post(jwtToken.authorize(), WalletTransfersHandler.onPost)

router.route("/admin/transfers")
  .get(jwtToken.authorize(), AdminTransfersHandler.onGet)

router.route("/admin/transfers/:transferID/approve")
  .get(jwtToken.authorize(), AdminTransfersHandler.onPost)

export default router
