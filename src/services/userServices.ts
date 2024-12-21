import { userModel } from "../models/userModel";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { passwordResetModel } from "../models/passwordResetModel";
import axios from "axios";
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";
import { productModel } from "../models/productModel";

interface RegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
}
interface LoginDto {
  email: string;
  password: string;
}

dotenv.config();
const generateJWT = (data: any) => {
  return jwt.sign(data, `${process.env.SECRET_KEY}`);
};
export const register = async ({
  firstName,
  lastName,
  email,
  password,
  address,
}: RegisterDto) => {
  const findUser = await userModel.findOne({ email: email });
  if (findUser) {
    return {
      data: "User Already exists",
      statusCode: 400,
    };
  }
  const hasedPassword = await bcrypt.hash(password, 10);
  const newUser = new userModel({
    firstName,
    lastName,
    email,
    password: hasedPassword,
    address,
  });
  await newUser.save();

  return { data: generateJWT({ firstName, lastName, email }), statusCode: 200 };
};

const MAX_FAILED_ATTEMPTS = 4;
const PERMANETLY_CLOSED = 5;
const LOCK_DURATION = 30 * 60 * 1000; // 30 minutes

export const login = async ({ email, password }: LoginDto) => {
  const findUser = await userModel.findOne({ email });
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
    } else {
      findUser.failedLoginAttempts = 0;
      findUser.isLocked = false;
      findUser.lockUntil = undefined;
      await findUser.save();
    }
  }

  //    password == findUser.password;
  const passwordMatch = await bcrypt.compare(password, findUser.password);
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
    await findUser.save();
    return {
      data: "Password incorrect ",
      statusCode: 400,
    };
  }

  if (passwordMatch) {
    findUser.failedLoginAttempts = 0;
    await findUser.save();
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
};
export const profile = async ({ email }: { email: any }) => {
  const findUser = await userModel
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
  } else {
    return {
      data: findUser,
      statusCode: 200,
    };
  }
};
interface updateProfile {
  id: string;
  updates: any;
}
export const changeProfile = async ({ id, updates }: updateProfile) => {
  const user = await userModel
    .findById(id)
    .select("-password -failedLoginAttempts -isLocked -permanentlyClosed ");

  if (!user) {
    return {
      data: "User not found!",
      statusCode: 404,
    };
  }
  user.firstName = updates.firstName ?? user.firstName;
  user.lastName = updates.lastName ?? user.lastName;
  user.email = updates.email ?? user.email;
  user.address = updates.address ?? user.address;
  const { _id, ...userResponse } = user.toObject();
  await user.save();

  return {
    data: userResponse,
    statusCode: 200,
  };
};

interface ChangePassword {
  id: string;
  oldPassword: string;
  newPassword: string;
}
export const changePassword = async ({
  id,
  oldPassword,
  newPassword,
}: ChangePassword) => {
  const findUser = await userModel.findById(id);
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
  const isMatch = await bcrypt.compare(oldPassword, findUser.password);
  if (!isMatch) {
    return {
      data: "Old password is incorrect !",
      statusCode: 403,
    };
  }
  const hasedPassword = await bcrypt.hash(newPassword, 10);
  findUser.password = hasedPassword;
  await findUser.save();
  return {
    data: "Password changed successfully",
    statusCode: 200,
  };
};
export const resetPassword = async ({
  //TODO
  email,
  id,
}: {
  id: string;
  email: string;
}) => {
  const findUser = await userModel.findById(id);
  if (!findUser) {
    return {
      data: "User not found !",
      statusCode: 403,
    };
  }
  const token = uuidv4();

  const resetLink = `${process.env.FRONT_END_ORIGIN}/reset-password/${token}`;
  const expires = Date.now() + 3600000;
  await passwordResetModel.create({ userId: id, token, expires });
  const mailerSend = new MailerSend({
    apiKey: `${process.env.MAILERSEND_API_TOKEN}`,
  });
  const sentFrom = new Sender(`${process.env.EMAIL_FROM}`, "Jalal");
  const recipients = [new Recipient(email)];
  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setSubject("Password Reset Request")
    .setHtml(
      `<strong>Click the link to reset your password:</strong> <a href=${resetLink} > reset link </a>`
    )
    .setText(`Click the link to reset your password: ${resetLink}`);
  try {
    await mailerSend.email.send(emailParams);
    return {
      data: "Reset password email sent ,Check your email.",
      statusCode: 200,
    };
  } catch (error) {
    return {
      data: "Failed to send email",
      statusCode: 500,
    };
  }
};
interface ResetPasswordConfirm {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}
export const resetPasswordConfirm = async ({
  token,
  newPassword,
  confirmNewPassword,
}: ResetPasswordConfirm) => {
  const passwordReset = await passwordResetModel.findOne({ token });
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
  const user = await userModel.findOne({ _id: passwordReset.userId });
  if (!user) {
    return {
      data: "User not found!",
      statusCode: 404,
    };
  }
  const hasedPassword = await bcrypt.hash(newPassword, 10);
  user.password = hasedPassword;
  await user.save();
  await passwordResetModel.deleteOne({ _id: passwordReset.id });
  return {
    data: "password reset successfully",
    statusCode: 200,
  };
};
export const searchProduct = async ({ name }: { name: string }) => {
  const products = await productModel.find();
  if (!products) {
    return { data: "Products with this name not found!", statusCode: 404 };
  }
  const filteredProduct = Array.from(products).filter((product) =>
    product.name.includes(name)
  );
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
};
