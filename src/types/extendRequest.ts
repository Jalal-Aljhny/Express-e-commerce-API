import { Request } from "express";

export interface extendRequest extends Request {
  user?: any;
}
