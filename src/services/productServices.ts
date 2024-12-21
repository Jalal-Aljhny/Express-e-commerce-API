import { productModel } from "../models/productModel";

export const getAllProducts = async () => {
  const products = await productModel.find();
  if (!products.length) {
    return { data: "No Product", statusCode: 204 };
  }
  return { data: products, statusCode: 200 };
};

export const seedInitialProducts = async () => {
  const seedProducts = [
    { name: "test 0", image: "url", price: 10.0, stock: 10 },
    { name: "test 1", image: "url", price: 20.0, stock: 10 },
    { name: "test 2", image: "url", price: 30.0, stock: 10 },
    { name: "test 3", image: "url", price: 40.0, stock: 10 },
    { name: "test 4", image: "url", price: 50.0, stock: 10 },
    { name: "test 5", image: "url", price: 60.0, stock: 10 },
    { name: "test 6", image: "url", price: 70.0, stock: 10 },
    { name: "test 7", image: "url", price: 80.0, stock: 10 },
  ];
  const products = await getAllProducts();
  if (products.data.length === 0 || typeof products.data == "string") {
    await productModel.insertMany(seedProducts);
  }
};
