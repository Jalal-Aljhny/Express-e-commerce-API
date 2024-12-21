import express from "express";
import mongoose from "mongoose";
import userRoute from "./routers/userRoute";
import dotenv from "dotenv";
import productRoute from "./routers/productRoute";
import { seedInitialProducts } from "./services/productServices";
import cartRouter from "./routers/cartRoute";
dotenv.config();
import cors from "cors";
import adminRoute from "./routers/adminRoute";

const app = express();
const port = 5000;

app.use(express.json());
app.use(
  cors({
    origin: [`${process.env.FRONT_END_ORIGIN}`],
    credentials: true,
  })
);

mongoose
  .connect(`${process.env.DB_URL}/ecommerce`)
  .then(() => console.log("Mongoose Connected!"))
  .catch((err) => console.log("Failed mongoose Connected!", err));

seedInitialProducts();

app.use("/user", userRoute);
app.use("/products", productRoute);
app.use("/cart", cartRouter);
app.use("/admin", adminRoute);

app.listen(port, () => {
  console.log(`server running at : http://localhost:${port}`);
});
