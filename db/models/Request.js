import mongoose from "mongoose";

const RequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'product' },
    quantity: Number,
    status: String, // 'pending', 'approved', 'declined'
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Request || mongoose.model("Request", RequestSchema);
