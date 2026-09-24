import mongoose, { Schema } from "mongoose";

const orderItemSchema = new mongoose.Schema({
  product_id: {
    type: Schema.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity must be at least 1"],
    default: 1,
  },
  unit_price: {
    type: Number,
    required: true,
    default: 0,
  },
});

const shippingAddressSchema = new mongoose.Schema(
  {
    firstname: { type: String, required: true, trim: true },
    lastname: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    houseNo: { type: String, required: true, trim: true },
    street: { type: String, trim: true },
    subdistrict: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
    zipCode: { type: String, required: true, trim: true },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    cart_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShoppingCart",
      required: true,
      unique: true,
    },
    order_number: {
      type: String,
      default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    },
    items: [orderItemSchema],
    total_price: {
      type: Number,
      required: true,
      default: 0,
    },
    total_quantity: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "shipped", "completed", "cancelled"],
      default: "pending",
    },
    shipping_address: {
      type: shippingAddressSchema,
      required: true,
    },
    payment_method: {
      type: String,
      enum: {
        values: ["bank_transfer", "promptpay", "cod", "credit_card", "debit_card"],
        message: "Unsupported payment method!",
      },
      required: true
    },
  },
  {
    timestamps: true,
  },
);

export const Order = mongoose.model("Order", orderSchema);
