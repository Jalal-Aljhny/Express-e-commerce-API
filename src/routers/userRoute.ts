import express from "express";
import {
  changePassword,
  changeProfile,
  login,
  profile,
  register,
  resetPassword,
  resetPasswordConfirm,
  searchProduct,
} from "../services/userServices";
import { body, check, validationResult } from "express-validator";
import validateJWT from "../middlewares/validateJWT";
import { extendRequest } from "../types/extendRequest";

const userRoute = express.Router();

userRoute.post(
  "/register",

  body("firstName").custom((value) => {
    if (!value) {
      throw new Error("First name is required ");
    } else if (typeof value !== "string") {
      throw new Error("First name  must be a string");
    }
    return true;
  }),
  body("lastName").custom((value) => {
    if (!value) {
      throw new Error("Last name is required ");
    } else if (typeof value !== "string") {
      throw new Error("Last name  must be a string");
    }
    return true;
  }),
  body("email").custom((value) => {
    if (!value) {
      throw new Error("Email is required");
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(value)) {
      throw new Error("Email is not valid");
    }
    return true;
  }),
  body("password").custom((value) => {
    if (!value || value.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    const passwordRegex =
      /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9])(?=.{8,})/;

    if (!passwordRegex.test(value)) {
      throw new Error(
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      );
    }

    return true;
  }),
  body("address").custom((value) => {
    if (!value) {
      throw new Error("Address is required ");
    }

    return true;
  }),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsDetaile = errors.array().map((err) => err.msg);
        return res.status(400).send({
          error: {
            message: `${errorsDetaile}`,
          },
        });
      }
      const { firstName, lastName, email, password, address, rememberMe } =
        req.body;
      const result = await register({
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
      } else {
        res.cookie("SessionId", result.data, {
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
      }
      res.status(result.statusCode).send(result.data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

userRoute.post(
  "/login",
  body("email").custom((value) => {
    if (!value) {
      throw new Error("Email is required");
    }
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    if (!emailRegex.test(value)) {
      throw new Error("Email is not valid");
    }
    return true;
  }),
  body("password").custom((value) => {
    if (!value || value.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    return true;
  }),

  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorsDetaile = errors.array().map((err) => err.msg);
        return res.status(400).send({
          error: {
            message: `${errorsDetaile}`,
          },
        });
      }
      const { email, password, rememberMe } = req.body;

      const result = await login({ email, password });
      if (rememberMe) {
        res.cookie("SessionId", result.data, {
          httpOnly: true,
          secure: true,
          maxAge: 365 * 24 * 60 * 60 * 1000,
        });
      } else {
        res.cookie("SessionId", result.data, {
          httpOnly: true,
          secure: true,
          maxAge: 24 * 60 * 60 * 1000,
        });
      }
      res.status(result.statusCode).send(result.data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
userRoute.get("/check-session", validateJWT, (req, res) => {
  res.status(200).send("Token is valid!");
});

userRoute.get("/profile", validateJWT, async (req: extendRequest, res) => {
  try {
    const { firstName, lastName, email, address, role } = req.user;
    res.status(200).send({ firstName, lastName, email, address, role });
  } catch (error) {
    res.status(500).send(error);
  }
});

userRoute.post("/signout", validateJWT, (req, res) => {
  try {
    res.clearCookie("SessionId");
    res.status(200).send("Successfully signed out");
  } catch (error) {
    res.status(500).send(error);
  }
});

userRoute.put("/change", validateJWT, async (req: extendRequest, res) => {
  try {
    const id = req.user._id;
    const updates = req.body;
    const change = await changeProfile({ id, updates });
    res.status(change.statusCode).send(change.data);
  } catch (error) {
    console.log(error);
    res.status(500).send(error);
  }
});
userRoute.put(
  "/change-password",
  validateJWT,
  async (req: extendRequest, res) => {
    try {
      const id = req.user._id;
      const { oldPassword, newPassword } = req.body;
      const change = await changePassword({ id, oldPassword, newPassword });
      res.status(change.statusCode).send(change.data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
userRoute.post(
  "/reset-password",
  validateJWT,
  async (req: extendRequest, res) => {
    try {
      const id = req.user._id;
      const { email } = req.body;
      const change = await resetPassword({ id, email });
      res.status(change.statusCode).send(change.data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
userRoute.post(
  "/reset-password/:token",
  validateJWT,
  async (req: extendRequest, res) => {
    try {
      const token = req.params.token;
      const { newPassword, confirmNewPassword } = req.body;
      const change = await resetPasswordConfirm({
        token,
        newPassword,
        confirmNewPassword,
      });
      res.status(change.statusCode).send(change.data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

export default userRoute;
userRoute.get("/search", validateJWT, async (req, res) => {
  try {
    const name = req.query.name?.toString();
    if (!name) {
      res.status(400).send("You should enter word to search!");
      return;
    }
    const search = await searchProduct({ name });
    res.status(search.statusCode).send(search.data);
  } catch (error) {
    res.status(500).send(error);
  }
});
