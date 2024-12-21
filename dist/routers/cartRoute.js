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
const express_1 = __importDefault(require("express"));
const cartService_1 = require("../services/cartService");
const validateJWT_1 = __importDefault(require("../middlewares/validateJWT"));
const cartRouter = express_1.default.Router();
cartRouter.get("/", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const cart = yield (0, cartService_1.getActiveCartForUser)({ userId });
        res.status(200).send(cart);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
cartRouter.delete("/", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const response = yield (0, cartService_1.clearCart)({ userId });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
cartRouter.post("/items", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { _id: { productId }, quantity, } = req.body;
        const response = yield (0, cartService_1.addItemToCart)({ userId, productId, quantity });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
cartRouter.put("/items", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { _id: { productId }, quantity, } = req.body;
        const response = yield (0, cartService_1.updateItemInCart)({ userId, productId, quantity });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
cartRouter.delete("/items/:productId", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const { productId } = req.params;
        const response = yield (0, cartService_1.deleteItemInCart)({ userId, productId });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
cartRouter.post("/checkout", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.user._id;
        const response = yield (0, cartService_1.checkout)({ userId });
        res.status(response.statusCode).send(response.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
exports.default = cartRouter;
