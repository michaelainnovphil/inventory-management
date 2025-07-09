// models/Request.js
import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  reason: {
    type: String,
    required: true,
  },
  requestedBy: {
    type: String,
    required: true,
  },
});

export default mongoose.models.Request || mongoose.model("Request", RequestSchema);
