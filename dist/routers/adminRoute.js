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
const validateJWT_1 = __importDefault(require("../middlewares/validateJWT"));
const verifyAdmin_1 = require("../middlewares/verifyAdmin");
const adminServices_1 = require("../services/adminServices");
const express_validator_1 = require("express-validator");
const upload_1 = require("../services/upload");
const imagesModel_1 = require("../models/imagesModel");
const adminRoute = express_1.default.Router();
adminRoute.get("/users", validateJWT_1.default, verifyAdmin_1.verifyAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const users = yield (0, adminServices_1.getAllUsers)();
        res.status(users.statusCode).send(users.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
adminRoute.delete("/user/:id", validateJWT_1.default, verifyAdmin_1.verifyAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const delUser = yield (0, adminServices_1.deleteUser)({ id: userId });
        res.status(delUser.statusCode).send(delUser.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
adminRoute.put("/user/:id", validateJWT_1.default, verifyAdmin_1.verifyAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const { newRole } = req.body;
        if (!newRole) {
            res.status(400).send("New role is required!");
            return;
        }
        const updateRole = yield (0, adminServices_1.updateUserRole)({ id: userId, newRole });
        res.status(updateRole.statusCode).send(updateRole.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
adminRoute.delete("/product/:id", validateJWT_1.default, verifyAdmin_1.verifyAdmin, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const productId = req.params.id;
        const delProduct = yield (0, adminServices_1.deleteProduct)({ productId });
        res.status(delProduct.statusCode).send(delProduct.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
adminRoute.post("/product", 
// body("name").custom((v) => {
//   if (!v) {
//     throw new Error("Product name is required !");
//   }
//   return true;
// }),
(0, express_validator_1.body)("name").notEmpty().withMessage("Product name is required!"), (0, express_validator_1.body)("image").custom((v) => {
    if (!v) {
        throw new Error("Product image is required !");
    }
    return true;
}), (0, express_validator_1.body)("price").custom((v) => {
    if (!v) {
        throw new Error("Product price is required !");
    }
    return true;
}), (0, express_validator_1.body)("stock").custom((v) => {
    if (!v) {
        throw new Error("Product name is required !");
    }
    return true;
}), (0, express_validator_1.body)("createdAt").custom((v) => {
    if (!v) {
        v = new Date(Date.now());
    }
    return true;
}), validateJWT_1.default, verifyAdmin_1.verifyAdmin, upload_1.upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).send("No image file uploaded");
        }
        const saveImage = yield imagesModel_1.imageModel.create({
            fileName: req.file.filename,
            path: req.file.path,
        });
        yield saveImage.save();
        const { name, price, stock, createdAt } = req.body;
        const path = req.file.path;
        const add = yield (0, adminServices_1.addProduct)({
            name,
            image: path,
            price,
            stock,
            createdAt,
        });
        res.status(add.statusCode).send(add.data);
    }
    catch (error) {
        console.error(error);
        res.status(500).send("Error saving product");
    }
}));
// TODO ADD UPDATE PRODUCT
exports.default = adminRoute;
