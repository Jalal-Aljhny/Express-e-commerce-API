import mongoose, { Schema, Document, Date } from "mongoose";

interface IUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  address: string;
  role: string;
  failedLoginAttempts: number;
  isLocked: boolean;
  lockUntil: any;
  permanentlyClosed: boolean;
}

const userSchema = new Schema<IUser>({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  address: { type: String, required: true },
  role: { type: String, default: "USER" },
  failedLoginAttempts: { type: Number, default: 0 },
  isLocked: { type: Boolean, default: false },
  lockUntil: { type: Date },
  permanentlyClosed: { type: Boolean, default: false },
});

export const userModel = mongoose.model<IUser>("User", userSchema);
