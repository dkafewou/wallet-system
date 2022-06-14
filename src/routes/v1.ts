import express from "express"
import bodyParser from "body-parser"
import DefaultHandler from "../handlers/DefaultHandler"

const router = express.Router()

// Middleware
router.use(bodyParser.json())


router.route("/default")
  .get(DefaultHandler.onGet)


export default router
