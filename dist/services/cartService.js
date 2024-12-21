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
exports.checkout = exports.deleteItemInCart = exports.updateItemInCart = exports.addItemToCart = exports.clearCart = exports.getActiveCartForUser = void 0;
const cartModel_1 = require("../models/cartModel");
const orderModel_1 = require("../models/orderModel");
const productModel_1 = require("../models/productModel");
const userModel_1 = require("../models/userModel");
const createCartForUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    const cart = yield cartModel_1.cartModel.create({
        userId,
        totalAmount: 0,
        status: "active",
    });
    yield cart.save();
    return cart;
});
const getActiveCartForUser = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, }) {
    let cart = yield cartModel_1.cartModel.findOne({ userId, status: "active" });
    if (!cart) {
        cart = yield createCartForUser({ userId });
    }
    return cart;
});
exports.getActiveCartForUser = getActiveCartForUser;
const clearCart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    if (!cart) {
        return { data: "Cart not found!", statusCode: 400 };
    }
    cart.items = [];
    cart.totalAmount = 0;
    yield cart.save();
    return { data: cart, statusCode: 200 };
});
exports.clearCart = clearCart;
const addItemToCart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, quantity, productId, }) {
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    const existCart = cart.items.find((item) => item.product == productId);
    if (existCart) {
        return { data: "Item already exists in cart !", statusCode: 400 };
    }
    const product = yield productModel_1.productModel.findById(productId);
    if (!product) {
        return { data: "Product not found ! ", statusCode: 400 };
    }
    if (product.stock < quantity) {
        return { data: "Low stock for item", statusCode: 400 };
    }
    cart.items.push({ product: productId, unitPrice: product.price, quantity });
    //update total amount for the cart
    cart.totalAmount += product.price * quantity;
    const updatedCart = yield cart.save();
    return { data: updatedCart, statusCode: 200 };
});
exports.addItemToCart = addItemToCart;
const updateItemInCart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId, quantity, productId, }) {
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    const existCart = cart.items.find((item) => item.product == productId);
    if (!existCart) {
        return { data: "Item does not exist in cart !", statusCode: 400 };
    }
    const product = yield productModel_1.productModel.findById(productId);
    if (!product) {
        return { data: "Product not found ! ", statusCode: 400 };
    }
    if (product.stock < quantity) {
        return { data: "Low stock for item", statusCode: 400 };
    }
    existCart.quantity = quantity;
    const otherCartItems = cart.items.filter((p) => p.product != productId);
    let total = otherCartItems.reduce((previous, current) => {
        previous += current.quantity * current.unitPrice;
        return previous;
    }, 0);
    total += existCart.quantity * existCart.unitPrice;
    cart.totalAmount = total;
    yield cart.save();
    return { data: cart, statusCode: 200 };
});
exports.updateItemInCart = updateItemInCart;
const deleteItemInCart = (_a) => __awaiter(void 0, [_a], void 0, function* ({ productId, userId, }) {
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    const existCart = cart.items.find((item) => item.product == productId);
    if (!existCart) {
        return { data: "Item does not exist in cart !", statusCode: 400 };
    }
    const product = yield productModel_1.productModel.findById(productId);
    if (!product) {
        return { data: "Product not found ! ", statusCode: 400 };
    }
    const otherCartItems = cart.items.filter((p) => p.product != productId);
    const total = otherCartItems.reduce((previous, current) => {
        previous += current.quantity * current.unitPrice;
        return previous;
    }, 0);
    cart.totalAmount = total;
    cart.items = otherCartItems;
    yield cart.save();
    return { data: cart, statusCode: 200 };
});
exports.deleteItemInCart = deleteItemInCart;
const checkout = (_a) => __awaiter(void 0, [_a], void 0, function* ({ userId }) {
    const cart = yield (0, exports.getActiveCartForUser)({ userId });
    const user = yield userModel_1.userModel.findById(userId);
    if (!user) {
        return { data: "User not found!", statusCode: 400 };
    }
    const userAddress = user.address;
    const orderItems = [];
    for (const item of cart.items) {
        const product = yield productModel_1.productModel.findById(item.product);
        if (!product) {
            return { data: "Product not found!", statusCode: 400 };
        }
        const orderItem = {
            productTitle: product.name,
            productImage: product.image,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
        };
        orderItems.push(orderItem);
    }
    const order = yield orderModel_1.orderModel.create({
        orderItems,
        address: userAddress,
        total: cart.totalAmount,
        userId,
    });
    yield order.save();
    cart.status = "completed";
    yield cart.save();
    return { data: order, statusCode: 200 };
});
exports.checkout = checkout;
