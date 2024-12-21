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
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedInitialProducts = exports.getAllProducts = void 0;
const productModel_1 = require("../models/productModel");
const getAllProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const products = yield productModel_1.productModel.find();
    if (!products.length) {
        return { data: "No Product", statusCode: 204 };
    }
    return { data: products, statusCode: 200 };
});
exports.getAllProducts = getAllProducts;
const seedInitialProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    const seedProducts = [
        { name: "test 0", image: "url", price: 10.0, stock: 10 },
        { name: "test 1", image: "url", price: 20.0, stock: 10 },
        { name: "test 2", image: "url", price: 30.0, stock: 10 },
        { name: "test 3", image: "url", price: 40.0, stock: 10 },
        { name: "test 4", image: "url", price: 50.0, stock: 10 },
        { name: "test 5", image: "url", price: 60.0, stock: 10 },
        { name: "test 6", image: "url", price: 70.0, stock: 10 },
        { name: "test 7", image: "url", price: 80.0, stock: 10 },
    ];
    const products = yield (0, exports.getAllProducts)();
    if (products.data.length === 0 || typeof products.data == "string") {
        yield productModel_1.productModel.insertMany(seedProducts);
    }
});
exports.seedInitialProducts = seedInitialProducts;
