import mongoose, { Document, ObjectId, Schema } from "mongoose";

interface Image extends Document {
  fileName: string;
  path: string;
}
const imageSchema = new Schema<Image>({
  fileName: { required: true, type: String },
  path: { required: true, type: String },
});
export const imageModel = mongoose.model<Image>("Images", imageSchema);
