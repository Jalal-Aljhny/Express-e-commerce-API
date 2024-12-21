import express from "express";
import { getAllProducts } from "../services/productServices";

const productRoute = express.Router();

productRoute.get("/", async (req, res) => {
  try {
    const { sortBy = "latest", category, minPrice, maxPrice } = req.query;

    const products = await getAllProducts();

    let filteredProducts: any[] = [...products.data];

    if (category) {
      filteredProducts = filteredProducts.filter(
        (product) => product.category === category
      );
    }
    if (minPrice) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price >= Number(minPrice)
      );
    }
    if (maxPrice) {
      filteredProducts = filteredProducts.filter(
        (product) => product.price <= Number(maxPrice)
      );
    }

    if (sortBy === "name") {
      filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "price") {
      filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortBy === "latest") {
      filteredProducts.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    }
    res.status(products.statusCode).send(filteredProducts);
  } catch (error) {
    res.status(500).send(error);
  }
});

export default productRoute;
