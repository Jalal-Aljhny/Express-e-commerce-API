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
exports.updateProduct = exports.addProduct = exports.deleteProduct = exports.addTimeLockToUser = exports.unLockUser = exports.updateUserRole = exports.deleteUser = exports.getAllUsers = void 0;
const productModel_1 = require("../models/productModel");
const userModel_1 = require("../models/userModel");
const getAllUsers = () => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield userModel_1.userModel.find().select("-password");
    if (!users.length) {
        return { data: "No Users", statusCode: 204 };
    }
    const filteredUsers = users.filter((user) => user.role !== "ADMIN");
    return { data: filteredUsers, statusCode: 200 };
});
exports.getAllUsers = getAllUsers;
const deleteUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id }) {
    const user = yield userModel_1.userModel.findById(id);
    if (!user) {
        return {
            data: "User not found !",
            statusCode: 404,
        };
    }
    yield userModel_1.userModel.deleteOne({ _id: id });
    return {
        data: "User deleted successfully!",
        statusCode: 200,
    };
});
exports.deleteUser = deleteUser;
const updateUserRole = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, newRole }) {
    if (newRole != "User" && newRole != "Admin") {
        return {
            data: "You should select exist role !",
            statusCode: 400,
        };
    }
    const user = yield userModel_1.userModel.findById(id);
    if (!user) {
        return {
            data: "User not found !",
            statusCode: 404,
        };
    }
    if (user.role == newRole) {
        return {
            data: "You selected existing role !",
            statusCode: 402,
        };
    }
    user.role = newRole;
    yield user.save();
    return {
        data: `Role of user changed successfully to ${newRole}`,
        statusCode: 200,
    };
});
exports.updateUserRole = updateUserRole;
const unLockUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id }) {
    const user = yield userModel_1.userModel.findById(id);
    if (!user) {
        return {
            data: "User not found !",
            statusCode: 404,
        };
    }
    user.failedLoginAttempts = 0;
    user.permanentlyClosed = false;
    user.isLocked = false;
    user.lockUntil = Date.now();
    yield user.save();
    return {
        data: "User Unlocked successfully!",
        statusCode: 200,
    };
});
exports.unLockUser = unLockUser;
const addTimeLockToUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id }) {
    const user = yield userModel_1.userModel.findById(id);
    if (!user) {
        return {
            data: "User not found !",
            statusCode: 404,
        };
    }
    user.lockUntil = Date.now() + 3600000;
    yield user.save();
    return {
        data: "Add 30 minutes time lock to user successfully!",
        statusCode: 200,
    };
});
exports.addTimeLockToUser = addTimeLockToUser;
const deleteProduct = (_a) => __awaiter(void 0, [_a], void 0, function* ({ productId }) {
    const product = yield productModel_1.productModel.findById(productId);
    if (!product) {
        return {
            data: "Product not found !",
            statusCode: 404,
        };
    }
    yield productModel_1.productModel.deleteOne({ _id: productId });
    return {
        data: "Product deleted successfully !",
        statusCode: 200,
    };
});
exports.deleteProduct = deleteProduct;
const addProduct = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, image, price, stock, createdAt, }) {
    const newProduct = yield productModel_1.productModel.create({
        name,
        image,
        price,
        stock,
        createdAt,
    });
    yield newProduct.save();
    return {
        data: "Product added successfully !",
        statusCode: 200,
    };
});
exports.addProduct = addProduct;
const updateProduct = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name, image, price, stock, createdAt, id, }) {
    const newProduct = yield productModel_1.productModel.create({
        name,
        image,
        price,
        stock,
        createdAt,
    });
    const product = yield productModel_1.productModel.findByIdAndUpdate();
    //TODO SEARCH ABOUT FIND BY ID AND UPDATE
    yield newProduct.save();
    return {
        data: "Product added successfully !",
        statusCode: 200,
    };
});
exports.updateProduct = updateProduct;
