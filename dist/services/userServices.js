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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchProduct = exports.resetPasswordConfirm = exports.resetPassword = exports.changePassword = exports.changeProfile = exports.profile = exports.login = exports.register = void 0;
const userModel_1 = require("../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const uuid_1 = require("uuid");
const passwordResetModel_1 = require("../models/passwordResetModel");
const mailersend_1 = require("mailersend");
const productModel_1 = require("../models/productModel");
dotenv_1.default.config();
const generateJWT = (data) => {
    return jsonwebtoken_1.default.sign(data, `${process.env.SECRET_KEY}`);
};
const register = (_a) => __awaiter(void 0, [_a], void 0, function* ({ firstName, lastName, email, password, address, }) {
    const findUser = yield userModel_1.userModel.findOne({ email: email });
    if (findUser) {
        return {
            data: "User Already exists",
            statusCode: 400,
        };
    }
    const hasedPassword = yield bcrypt_1.default.hash(password, 10);
    const newUser = new userModel_1.userModel({
        firstName,
        lastName,
        email,
        password: hasedPassword,
        address,
    });
    yield newUser.save();
    return { data: generateJWT({ firstName, lastName, email }), statusCode: 200 };
});
exports.register = register;
const MAX_FAILED_ATTEMPTS = 4;
const PERMANETLY_CLOSED = 5;
const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes
const login = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, password }) {
    const findUser = yield userModel_1.userModel.findOne({ email });
    if (!findUser) {
        return { data: "email Not Found", statusCode: 404 };
    }
    if (findUser.permanentlyClosed) {
        return {
            data: "Your account is permanently locked due to too many failed login attempts. ",
            statusCode: 403,
        };
    }
    if (findUser.isLocked) {
        const isLocked = findUser.lockUntil && findUser.lockUntil > Date.now();
        if (isLocked) {
            return {
                data: `Account is temporarily locked ,you entered uncorrect paswword for 4 times. Please try again after 30 minutes.
         Note that : after 5th uncorrrect enterd password your account will permanetly locked !`,
                statusCode: 403,
            };
        }
        else {
            findUser.failedLoginAttempts = 0;
            findUser.isLocked = false;
            findUser.lockUntil = undefined;
            yield findUser.save();
        }
    }
    //    password == findUser.password;
    const passwordMatch = yield bcrypt_1.default.compare(password, findUser.password);
    if (!passwordMatch) {
        findUser.failedLoginAttempts += 1;
        //permanetly closed
        if (findUser.failedLoginAttempts >= PERMANETLY_CLOSED) {
            findUser.permanentlyClosed = true;
        }
        //time lock
        if (findUser.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
            findUser.isLocked = true;
            findUser.lockUntil = Date.now() + LOCK_DURATION; // Lock for 30 minutes
        }
        yield findUser.save();
        return {
            data: "Password incorrect ",
            statusCode: 400,
        };
    }
    if (passwordMatch) {
        findUser.failedLoginAttempts = 0;
        yield findUser.save();
        return {
            data: generateJWT({
                firstName: findUser.firstName,
                lastName: findUser.lastName,
                email,
            }),
            statusCode: 200,
        };
    }
    return {
        data: "Incorrect email or password",
        statusCode: 400,
    };
});
exports.login = login;
const profile = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email }) {
    const findUser = yield userModel_1.userModel
        .findOne({ email })
        .select("-password")
        .select("-failedLoginAttempts")
        .select("-isLocked")
        .select("-permanentlyClosed")
        .select("-_id");
    if (!findUser) {
        return {
            data: "user Not found !",
            statusCode: 400,
        };
    }
    else {
        return {
            data: findUser,
            statusCode: 200,
        };
    }
});
exports.profile = profile;
const changeProfile = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, updates }) {
    var _b, _c, _d, _e;
    const user = yield userModel_1.userModel
        .findById(id)
        .select("-password -failedLoginAttempts -isLocked -permanentlyClosed ");
    if (!user) {
        return {
            data: "User not found!",
            statusCode: 404,
        };
    }
    user.firstName = (_b = updates.firstName) !== null && _b !== void 0 ? _b : user.firstName;
    user.lastName = (_c = updates.lastName) !== null && _c !== void 0 ? _c : user.lastName;
    user.email = (_d = updates.email) !== null && _d !== void 0 ? _d : user.email;
    user.address = (_e = updates.address) !== null && _e !== void 0 ? _e : user.address;
    const _f = user.toObject(), { _id } = _f, userResponse = __rest(_f, ["_id"]);
    yield user.save();
    return {
        data: userResponse,
        statusCode: 200,
    };
});
exports.changeProfile = changeProfile;
const changePassword = (_a) => __awaiter(void 0, [_a], void 0, function* ({ id, oldPassword, newPassword, }) {
    const findUser = yield userModel_1.userModel.findById(id);
    if (!findUser) {
        return {
            data: "User not found !",
            statusCode: 403,
        };
    }
    const samePassword = oldPassword == newPassword;
    if (samePassword) {
        return {
            data: "You entered same exist password !",
            statusCode: 405,
        };
    }
    const isMatch = yield bcrypt_1.default.compare(oldPassword, findUser.password);
    if (!isMatch) {
        return {
            data: "Old password is incorrect !",
            statusCode: 403,
        };
    }
    const hasedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    findUser.password = hasedPassword;
    yield findUser.save();
    return {
        data: "Password changed successfully",
        statusCode: 200,
    };
});
exports.changePassword = changePassword;
const resetPassword = (_a) => __awaiter(void 0, [_a], void 0, function* ({ 
//TODO
email, id, }) {
    const findUser = yield userModel_1.userModel.findById(id);
    if (!findUser) {
        return {
            data: "User not found !",
            statusCode: 403,
        };
    }
    const token = (0, uuid_1.v4)();
    const resetLink = `${process.env.FRONT_END_ORIGIN}/reset-password/${token}`;
    const expires = Date.now() + 3600000;
    yield passwordResetModel_1.passwordResetModel.create({ userId: id, token, expires });
    const mailerSend = new mailersend_1.MailerSend({
        apiKey: `${process.env.MAILERSEND_API_TOKEN}`,
    });
    const sentFrom = new mailersend_1.Sender(`${process.env.EMAIL_FROM}`, "Jalal");
    const recipients = [new mailersend_1.Recipient(email)];
    const emailParams = new mailersend_1.EmailParams()
        .setFrom(sentFrom)
        .setTo(recipients)
        .setSubject("Password Reset Request")
        .setHtml(`<strong>Click the link to reset your password:</strong> <a href=${resetLink} > reset link </a>`)
        .setText(`Click the link to reset your password: ${resetLink}`);
    try {
        yield mailerSend.email.send(emailParams);
        return {
            data: "Reset password email sent ,Check your email.",
            statusCode: 200,
        };
    }
    catch (error) {
        return {
            data: "Failed to send email",
            statusCode: 500,
        };
    }
});
exports.resetPassword = resetPassword;
const resetPasswordConfirm = (_a) => __awaiter(void 0, [_a], void 0, function* ({ token, newPassword, confirmNewPassword, }) {
    const passwordReset = yield passwordResetModel_1.passwordResetModel.findOne({ token });
    if (newPassword !== confirmNewPassword) {
        return {
            data: "You should confirm your new password!",
            statusCode: 400,
        };
    }
    if (!passwordReset || passwordReset.expires < new Date(Date.now())) {
        return {
            data: "Token is invalid or expired!",
            statusCode: 403,
        };
    }
    const user = yield userModel_1.userModel.findOne({ _id: passwordReset.userId });
    if (!user) {
        return {
            data: "User not found!",
            statusCode: 404,
        };
    }
    const hasedPassword = yield bcrypt_1.default.hash(newPassword, 10);
    user.password = hasedPassword;
    yield user.save();
    yield passwordResetModel_1.passwordResetModel.deleteOne({ _id: passwordReset.id });
    return {
        data: "password reset successfully",
        statusCode: 200,
    };
});
exports.resetPasswordConfirm = resetPasswordConfirm;
const searchProduct = (_a) => __awaiter(void 0, [_a], void 0, function* ({ name }) {
    const products = yield productModel_1.productModel.find();
    if (!products) {
        return { data: "Products with this name not found!", statusCode: 404 };
    }
    const filteredProduct = Array.from(products).filter((product) => product.name.includes(name));
    if (filteredProduct.length == 0) {
        return {
            data: "Product includes this name not found!",
            statusCode: 404,
        };
    }
    return {
        data: filteredProduct,
        statusCode: 200,
    };
});
exports.searchProduct = searchProduct;
