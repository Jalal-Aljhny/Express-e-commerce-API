import express from "express";
import validateJWT from "../middlewares/validateJWT";
import { verifyAdmin } from "../middlewares/verifyAdmin";
import {
  addProduct,
  deleteProduct,
  deleteUser,
  getAllUsers,
  updateUserRole,
} from "../services/adminServices";
import { body } from "express-validator";
import { upload } from "../services/upload";
import { imageModel } from "../models/imagesModel";

const adminRoute = express.Router();

adminRoute.get("/users", validateJWT, verifyAdmin, async (req, res) => {
  try {
    const users = await getAllUsers();
    res.status(users.statusCode).send(users.data);
  } catch (error) {
    res.status(500).send(error);
  }
});
adminRoute.delete("/user/:id", validateJWT, verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const delUser = await deleteUser({ id: userId });
    res.status(delUser.statusCode).send(delUser.data);
  } catch (error) {
    res.status(500).send(error);
  }
});
adminRoute.put("/user/:id", validateJWT, verifyAdmin, async (req, res) => {
  try {
    const userId = req.params.id;
    const { newRole } = req.body;
    if (!newRole) {
      res.status(400).send("New role is required!");
      return;
    }
    const updateRole = await updateUserRole({ id: userId, newRole });
    res.status(updateRole.statusCode).send(updateRole.data);
  } catch (error) {
    res.status(500).send(error);
  }
});
adminRoute.delete(
  "/product/:id",
  validateJWT,
  verifyAdmin,
  async (req, res) => {
    try {
      const productId = req.params.id;
      const delProduct = await deleteProduct({ productId });
      res.status(delProduct.statusCode).send(delProduct.data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);
adminRoute.post(
  "/product",
  // body("name").custom((v) => {
  //   if (!v) {
  //     throw new Error("Product name is required !");
  //   }
  //   return true;
  // }),
  body("name").notEmpty().withMessage("Product name is required!"),
  body("image").custom((v) => {
    if (!v) {
      throw new Error("Product image is required !");
    }
    return true;
  }),
  body("price").custom((v) => {
    if (!v) {
      throw new Error("Product price is required !");
    }
    return true;
  }),
  body("stock").custom((v) => {
    if (!v) {
      throw new Error("Product name is required !");
    }
    return true;
  }),
  body("createdAt").custom((v) => {
    if (!v) {
      v = new Date(Date.now());
    }
    return true;
  }),
  validateJWT,
  verifyAdmin,
  upload.single("image"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No image file uploaded");
      }

      const saveImage = await imageModel.create({
        fileName: req.file.filename,
        path: req.file.path,
      });
      await saveImage.save();
      const { name, price, stock, createdAt } = req.body;
      const path = req.file.path;
      const add = await addProduct({
        name,
        image: path,
        price,
        stock,
        createdAt,
      });

      res.status(add.statusCode).send(add.data);
    } catch (error) {
      console.error(error);

      res.status(500).send("Error saving product");
    }
  }
);
// TODO ADD UPDATE PRODUCT
export default adminRoute;
