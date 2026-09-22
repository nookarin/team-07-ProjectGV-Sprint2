import mongoose, { Schema } from "mongoose";

const cartItemSchema = new mongoose.Schema({
  product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
}, { timestamps: true });

const shoppingCartSchema = new mongoose.Schema({
   user_id: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["active", "checked_out"],
      default: "active",
    },

    items: {
      type: [cartItemSchema],
      default: [],
    },
}, {
  timestamps: true,
});

export const ShoppingCart = mongoose.model("ShoppingCart", shoppingCartSchema);
