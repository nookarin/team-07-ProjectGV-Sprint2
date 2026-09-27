import { stripe } from "../config/stripe.js";
import { Order } from "../models/order.model.js";
import { User } from "../models/user.model.js";
import { createPromptPayService } from "./promptpay.js";

// ประกอบ service ด้วย Stripe และโมเดล MongoDB ที่ใช้จริง
// แยกไว้เพื่อให้ชุดทดสอบส่งตัวจำลองเข้า createPromptPayService แทนได้
export const paymentService = createPromptPayService({
  stripe, Order, User, secretKey: process.env.STRIPE_SECRET_KEY,
});
