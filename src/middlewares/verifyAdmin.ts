import { NextFunction, Response } from "express";
import { extendRequest } from "../types/extendRequest";

export function verifyAdmin(
  req: extendRequest,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  const { role } = user;
  if (role == "ADMIN") {
    next();
    return;
  } else {
    res.status(403).send("Access denied !");
  }
}
