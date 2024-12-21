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
const userServices_1 = require("../services/userServices");
const express_validator_1 = require("express-validator");
const validateJWT_1 = __importDefault(require("../middlewares/validateJWT"));
const userRoute = express_1.default.Router();
userRoute.post("/register", (0, express_validator_1.body)("firstName").custom((value) => {
    if (!value) {
        throw new Error("First name is required ");
    }
    else if (typeof value !== "string") {
        throw new Error("First name  must be a string");
    }
    return true;
}), (0, express_validator_1.body)("lastName").custom((value) => {
    if (!value) {
        throw new Error("Last name is required ");
    }
    else if (typeof value !== "string") {
        throw new Error("Last name  must be a string");
    }
    return true;
}), (0, express_validator_1.body)("email").custom((value) => {
    if (!value) {
        throw new Error("Email is required");
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(value)) {
        throw new Error("Email is not valid");
    }
    return true;
}), (0, express_validator_1.body)("password").custom((value) => {
    if (!value || value.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }
    const passwordRegex = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;
    if (!passwordRegex.test(value)) {
        throw new Error("Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character");
    }
    return true;
}), (0, express_validator_1.body)("address").custom((value) => {
    if (!value) {
        throw new Error("Address is required ");
    }
    return true;
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorsDetaile = errors.array().map((err) => err.msg);
            return res.status(400).send({
                error: {
                    message: `${errorsDetaile}`,
                },
            });
        }
        const { firstName, lastName, email, password, address, rememberMe } = req.body;
        const result = yield (0, userServices_1.register)({
            firstName,
            lastName,
            email,
            password,
            address,
        });
        if (rememberMe) {
            res.cookie("SessionId", result.data, {
                httpOnly: true,
                secure: true,
                maxAge: 365 * 60 * 60 * 1000,
            });
        }
        else {
            res.cookie("SessionId", result.data, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
        }
        res.status(result.statusCode).send(result.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
userRoute.post("/login", (0, express_validator_1.body)("email").custom((value) => {
    if (!value) {
        throw new Error("Email is required");
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(value)) {
        throw new Error("Email is not valid");
    }
    return true;
}), (0, express_validator_1.body)("password").custom((value) => {
    if (!value || value.length < 8) {
        throw new Error("Password must be at least 8 characters long");
    }
    return true;
}), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            const errorsDetaile = errors.array().map((err) => err.msg);
            return res.status(400).send({
                error: {
                    message: `${errorsDetaile}`,
                },
            });
        }
        const { email, password, rememberMe } = req.body;
        const result = yield (0, userServices_1.login)({ email, password });
        if (rememberMe) {
            res.cookie("SessionId", result.data, {
                httpOnly: true,
                secure: true,
                maxAge: 365 * 24 * 60 * 60 * 1000,
            });
        }
        else {
            res.cookie("SessionId", result.data, {
                httpOnly: true,
                secure: true,
                maxAge: 24 * 60 * 60 * 1000,
            });
        }
        res.status(result.statusCode).send(result.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
userRoute.get("/check-session", validateJWT_1.default, (req, res) => {
    res.status(200).send("Token is valid!");
});
userRoute.get("/profile", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { firstName, lastName, email, address, role } = req.user;
        res.status(200).send({ firstName, lastName, email, address, role });
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
userRoute.post("/signout", validateJWT_1.default, (req, res) => {
    try {
        res.clearCookie("SessionId");
        res.status(200).send("Successfully signed out");
    }
    catch (error) {
        res.status(500).send(error);
    }
});
userRoute.put("/change", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user._id;
        const updates = req.body;
        const change = yield (0, userServices_1.changeProfile)({ id, updates });
        res.status(change.statusCode).send(change.data);
    }
    catch (error) {
        console.log(error);
        res.status(500).send(error);
    }
}));
userRoute.put("/change-password", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user._id;
        const { oldPassword, newPassword } = req.body;
        const change = yield (0, userServices_1.changePassword)({ id, oldPassword, newPassword });
        res.status(change.statusCode).send(change.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
userRoute.post("/reset-password", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.user._id;
        const { email } = req.body;
        const change = yield (0, userServices_1.resetPassword)({ id, email });
        res.status(change.statusCode).send(change.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
userRoute.post("/reset-password/:token", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.params.token;
        const { newPassword, confirmNewPassword } = req.body;
        const change = yield (0, userServices_1.resetPasswordConfirm)({
            token,
            newPassword,
            confirmNewPassword,
        });
        res.status(change.statusCode).send(change.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
exports.default = userRoute;
userRoute.get("/search", validateJWT_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const name = (_a = req.query.name) === null || _a === void 0 ? void 0 : _a.toString();
        if (!name) {
            res.status(400).send("You should enter word to search!");
            return;
        }
        const search = yield (0, userServices_1.searchProduct)({ name });
        res.status(search.statusCode).send(search.data);
    }
    catch (error) {
        res.status(500).send(error);
    }
}));
