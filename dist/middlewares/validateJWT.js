"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userModel_1 = require("../models/userModel");
const validateJWT = (req, res, next) => {
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
    jsonwebtoken_1.default.verify(token, `${process.env.SECRET_KEY}`, (err, payload) => __awaiter(void 0, void 0, void 0, function* () {
        if (err) {
            res.status(401).send("Invalid token");
            return;
        }
        if (!payload) {
            res.status(403).send("Invalid token payload");
            return;
        }
        const jwtPayload = payload;
        const user = yield userModel_1.userModel.findOne({ email: jwtPayload.email });
        req.user = user;
        next();
    }));
};
exports.default = validateJWT;
