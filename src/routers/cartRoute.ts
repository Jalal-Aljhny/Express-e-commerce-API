import express from "express";
import {
  addItemToCart,
  checkout,
  clearCart,
  deleteItemInCart,
  getActiveCartForUser,
  updateItemInCart,
} from "../services/cartService";
import validateJWT from "../middlewares/validateJWT";
import { extendRequest } from "../types/extendRequest";

const cartRouter = express.Router();

cartRouter.get("/", validateJWT, async (req: extendRequest, res) => {
  try {
    const userId = req.user._id;
    const cart = await getActiveCartForUser({ userId });
    res.status(200).send(cart);
  } catch (error) {
    res.status(500).send(error);
  }
});

cartRouter.delete("/", validateJWT, async (req: extendRequest, res) => {
  try {
    const userId = req.user._id;
    const response = await clearCart({ userId });
    res.status(response.statusCode).send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

cartRouter.post("/items", validateJWT, async (req: extendRequest, res) => {
  try {
    const userId = req.user._id;
    const {
      _id: { productId },
      quantity,
    } = req.body;
    const response = await addItemToCart({ userId, productId, quantity });
    res.status(response.statusCode).send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});
cartRouter.put("/items", validateJWT, async (req: extendRequest, res) => {
  try {
    const userId = req.user._id;
    const {
      _id: { productId },
      quantity,
    } = req.body;
    const response = await updateItemInCart({ userId, productId, quantity });
    res.status(response.statusCode).send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});
cartRouter.delete(
  "/items/:productId",
  validateJWT,
  async (req: extendRequest, res) => {
    try {
      const userId = req.user._id;
      const { productId } = req.params;
      const response = await deleteItemInCart({ userId, productId });
      res.status(response.statusCode).send(response.data);
    } catch (error) {
      res.status(500).send(error);
    }
  }
);

cartRouter.post("/checkout", validateJWT, async (req: extendRequest, res) => {
  try {
    const userId = req.user._id;
    const response = await checkout({ userId });
    res.status(response.statusCode).send(response.data);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default cartRouter;
