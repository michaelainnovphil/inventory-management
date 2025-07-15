import mongoose, { models } from "mongoose";
import { Schema, model } from "mongoose";
import mongooseUniqueValidator from "mongoose-unique-validator";

const ProductsSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  code: {
    type: String,
    required: true,
    unique: true,
  },
  slug: {
    type: String,
    required: true,
  },
  serial: {
    type: String,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  issued: {
    type: [String],
    default: [],
  },
  status: {
    type: String,
    required: false,
  },
  purchaseDate: {
  type: Date,
  required: false,
}

});

ProductsSchema.plugin(mongooseUniqueValidator, {
  message: "product with `{PATH}` = `{VALUE}` already exists",
});

const Product = models.product || model("product", ProductsSchema);

export default Product;
