import mongoose, { Document, ObjectId, Schema, Types } from "mongoose";

export interface IOrderItem {
  productTitle: string;
  productImage: string;
  unitPrice: number;
  quantity: number;
}
interface IOrder extends Document {
  orderItems: IOrderItem[];
  total: number;
  address: string;
  userId: ObjectId | string;
}

const orderItemSchema = new Schema<IOrderItem>({
  productTitle: { type: String, required: true },
  productImage: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const orderSchema = new Schema<IOrder>({
  orderItems: [orderItemSchema],
  total: { type: Number, required: true },
  address: { type: String, required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

export const orderModel = mongoose.model<IOrder>("Order", orderSchema);