import mongoose, { Schema, Document, ObjectId } from "mongoose";
interface PasswordReset extends Document {
  userId: ObjectId;
  token: string;
  expires: Date;
}
const passwordResetSchema = new Schema<PasswordReset>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User ",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  expires: {
    type: Date,
    default: Date.now(),
    required: true,
  },
});

export const passwordResetModel = mongoose.model<PasswordReset>(
  "PasswordReset",
  passwordResetSchema
);
