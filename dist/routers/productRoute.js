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
const productServices_1 = require("../services/productServices");
const productRoute = express_1.default.Router();
productRoute.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sortBy = "latest", category, minPrice, maxPrice } = req.query;
        const products = yield (0, productServices_1.getAllProducts)();
        let filteredProducts = [...products.data];
        if (category) {
            filteredProducts = filteredProducts.filter((product) => product.category === category);
        }
        if (minPrice) {
            filteredProducts = filteredProducts.filter((product) => product.price >= Number(minPrice));
        }
        if (maxPrice) {
            filteredProducts = filteredProducts.filter((product) => product.price <= Number(maxPrice));
        }
        if (sortBy === "name") {
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
        }
        else if (sortBy === "price") {
            filteredProducts.sort((a, b) => a.price - b.price);
        }
        else if (sortBy === "latest") {
            filteredProducts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        }
        res.status(products.statusCode).send(filteredProducts);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
exports.default = productRoute;
