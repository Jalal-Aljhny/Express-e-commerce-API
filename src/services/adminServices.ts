import { productModel } from "../models/productModel";
import { userModel } from "../models/userModel";

export const getAllUsers = async () => {
  const users = await userModel.find().select("-password");
  if (!users.length) {
    return { data: "No Users", statusCode: 204 };
  }
  const filteredUsers = users.filter((user) => user.role !== "ADMIN");
  return { data: filteredUsers, statusCode: 200 };
};
export const deleteUser = async ({ id }: { id: string }) => {
  const user = await userModel.findById(id);
  if (!user) {
    return {
      data: "User not found !",
      statusCode: 404,
    };
  }
  await userModel.deleteOne({ _id: id });
  return {
    data: "User deleted successfully!",
    statusCode: 200,
  };
};
interface UpdateUserRole {
  id: string;
  newRole: string;
}
export const updateUserRole = async ({ id, newRole }: UpdateUserRole) => {
  if (newRole != "User" && newRole != "Admin") {
    return {
      data: "You should select exist role !",
      statusCode: 400,
    };
  }
  const user = await userModel.findById(id);
  if (!user) {
    return {
      data: "User not found !",
      statusCode: 404,
    };
  }
  if (user.role == newRole) {
    return {
      data: "You selected existing role !",
      statusCode: 402,
    };
  }
  user.role = newRole;
  await user.save();
  return {
    data: `Role of user changed successfully to ${newRole}`,
    statusCode: 200,
  };
};

export const unLockUser = async ({ id }: { id: string }) => {
  const user = await userModel.findById(id);
  if (!user) {
    return {
      data: "User not found !",
      statusCode: 404,
    };
  }
  user.failedLoginAttempts = 0;
  user.permanentlyClosed = false;
  user.isLocked = false;
  user.lockUntil = Date.now();
  await user.save();
  return {
    data: "User Unlocked successfully!",
    statusCode: 200,
  };
};
export const addTimeLockToUser = async ({ id }: { id: string }) => {
  const user = await userModel.findById(id);
  if (!user) {
    return {
      data: "User not found !",
      statusCode: 404,
    };
  }
  user.lockUntil = Date.now() + 3600000;
  await user.save();
  return {
    data: "Add 30 minutes time lock to user successfully!",
    statusCode: 200,
  };
};
export const deleteProduct = async ({ productId }: { productId: string }) => {
  const product = await productModel.findById(productId);
  if (!product) {
    return {
      data: "Product not found !",
      statusCode: 404,
    };
  }
  await productModel.deleteOne({ _id: productId });
  return {
    data: "Product deleted successfully !",
    statusCode: 200,
  };
};

interface AddProduct {
  name: string;
  image: string;
  price: number;
  stock: number;
  createdAt: Date;
}
export const addProduct = async ({
  name,
  image,
  price,
  stock,
  createdAt,
}: AddProduct) => {
  const newProduct = await productModel.create({
    name,
    image,
    price,
    stock,
    createdAt,
  });
  await newProduct.save();
  return {
    data: "Product added successfully !",
    statusCode: 200,
  };
};
interface UpdateProduct {
  name: string;
  image: string;
  price: number;
  stock: number;
  createdAt: Date;
  id: string;
}
export const updateProduct = async ({
  name,
  image,
  price,
  stock,
  createdAt,
  id,
}: UpdateProduct) => {
  const newProduct = await productModel.create({
    name,
    image,
    price,
    stock,
    createdAt,
  });
  const product = await productModel.findByIdAndUpdate();
  //TODO SEARCH ABOUT FIND BY ID AND UPDATE
  await newProduct.save();
  return {
    data: "Product added successfully !",
    statusCode: 200,
  };
};
