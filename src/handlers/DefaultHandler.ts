import { Request, Response, NextFunction } from "express"

const onGet = async (_req: Request, res: Response, _next: NextFunction) => {
  // Response
  return res.json({
    message: "default handler",
  })
}

const AssetHandler = { onGet }
export default AssetHandler
