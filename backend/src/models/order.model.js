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

  // เก็บราคาสินค้า ณ ตอนที่สั่งซื้อ
  // เพื่อไม่ให้ได้รับผลกระทบหากราคา Product เปลี่ยนภายหลัง
  unit_price: {
    type: Number,
    required: true,
    min: [0, "Unit price cannot be negative"],
  },
});

const shippingAddressSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
      trim: true,
    },

    lastname: {
      type: String,
      required: true,
      trim: true,
    },

    phoneNumber: {
      type: String,
      required: true,
      trim: true,
    },

    houseNo: {
      type: String,
      required: true,
      trim: true,
    },

    street: {
      type: String,
      trim: true,
    },

    subdistrict: {
      type: String,
      required: true,
      trim: true,
    },

    district: {
      type: String,
      required: true,
      trim: true,
    },

    province: {
      type: String,
      required: true,
      trim: true,
    },

    zipCode: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    _id: false,
  },
);

const orderSchema = new mongoose.Schema(
  {
    user_id: {
      type: Schema.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    cart_id: {
      type: Schema.ObjectId,
      ref: "ShoppingCart",
      required: true,
    },

    order_number: {
      type: String,
      default: () => `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      unique: true,
    },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: {
        validator: (items) => items.length > 0,
        message: "Order must contain at least one item",
      },
    },

    total_price: {
      type: Number,
      required: true,
      min: [0, "Total price cannot be negative"],
    },

    total_quantity: {
      type: Number,
      required: true,
      min: [1, "Total quantity must be at least 1"],
    },

    // =========================
    // Order Status
    // =========================
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "completed", "cancelled"],
      default: "pending",
    },

    // =========================
    // Shipping Address
    // =========================
    shipping_address: {
      type: shippingAddressSchema,
      required: true,
    },

    // =========================
    // Payment Method
    // =========================
    payment_method: {
      type: String,
      enum: {
        values: [
          "bank_transfer",
          "promptpay",
          "cod",
          "credit_card",
          "debit_card",
        ],
        message: "Unsupported payment method!",
      },
      default: "promptpay",
      required: true,
    },

    // =========================
    // Payment Status
    // =========================
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled"],
      default: "pending",
    },

    // =========================
    // Stripe Data
    // =========================

    // ได้ตอนสร้าง Stripe Checkout Session
    stripe_session_id: {
      type: String,
      default: null,
    },

    // ได้หลัง Stripe สร้าง Payment Intent
    stripe_payment_intent_id: {
      type: String,
      default: null,
    },

    // เวลาที่ชำระเงินสำเร็จ
    paid_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export const Order = mongoose.model("Order", orderSchema);
