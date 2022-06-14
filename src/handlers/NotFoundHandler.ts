import { NextFunction, Request, Response } from "express";
import Logger from "../helpers/Logger"

const notFoundHandler = (req: Request, res: Response, _next: NextFunction) => {
  Logger.warn(`The requested endpoint: ${req.originalUrl} is invalid, responding with 404.`);

  res.status(404)
    .json({
      message: "Requested endpoint not found",
    });
}

export default notFoundHandler;