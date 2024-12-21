import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { userModel } from "../models/userModel";
import { extendRequest } from "../types/extendRequest";

const validateJWT = (req: extendRequest, res: Response, next: NextFunction) => {
  // const authorizationHeader = req.get("authorization");

  const authHeader = req.headers["cookie"];
  if (!authHeader) {
    res.status(403).send("Autherization header was not provided");
    return;
  }
  // if (!authorizationHeader) {
  //   res.status(403).send("Autherization header was not provided");
  //   return;
  // }
  const token = authHeader.split("=")[1];
  // const token = authorizationHeader.split(" ")[1];
  // if (!token) {
  //   res.status(403).send("Bearer token not found");
  //   return;
  // }

  jwt.verify(token, `${process.env.SECRET_KEY}`, async (err, payload) => {
    if (err) {
      res.status(401).send("Invalid token");
      return;
    }
    if (!payload) {
      res.status(403).send("Invalid token payload");
      return;
    }
    const jwtPayload = payload as {
      email: string;
      firstName: string;
      lastName: string;
    };
    const user = await userModel.findOne({ email: jwtPayload.email });
    req.user = user;
    next();
  });
};
export default validateJWT;
