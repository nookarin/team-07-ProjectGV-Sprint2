import { Router } from "express";
import mongoose from "mongoose";
import { Order } from "../../models/order.model.js";
import { protect } from "../../middlewares/protect.js";
import { paymentService } from "../../services/paymentService.js";

export const paymentRouter = Router();
paymentRouter.use(protect);
// ห้าม cache ข้อมูล QR และสถานะ เพื่อให้ผู้ใช้ได้รับผลล่าสุดเมื่อกลับมาดูออเดอร์
paymentRouter.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});
// ตรวจ ID และหาเฉพาะออเดอร์ของเจ้าของที่เข้าสู่ระบบ ก่อนเข้าทุกเส้นทางที่มี :orderId
paymentRouter.param("orderId", async (req, res, next, orderId) => {
  try {
    if (!mongoose.isValidObjectId(orderId)) {
      return res.status(400).json({ success: false, message: "Invalid order ID." });
    }
    req.order = await Order.findOne({ _id: orderId, user_id: req.user.user._id });
    if (!req.order) return res.status(404).json({ success: false, message: "Order not found." });
    next();
  } catch (error) { next(error); }
});
// POST ใช้สร้างหรือใช้รายการเดิมเพื่อรับ QR; service ไม่ส่ง HTTP response เอง
// validation ตอบด้วย return res.status() ส่วน exception ส่งต่อ error middleware
paymentRouter.post("/promptpay/:orderId", async (req, res, next) => {
  try {
    const result = await paymentService.start(req.order);
    if (result.success === false) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(200).json(result);
  }
  catch (error) { next(error); }
});
// GET ใช้ตอนเปิดหน้าและ polling เพื่อตรวจสถานะจริงจาก Stripe แล้วอัปเดตออเดอร์
paymentRouter.get("/promptpay/:orderId", async (req, res, next) => {
  try {
    const result = await paymentService.read(req.order);
    if (result.success === false) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(200).json(result);
  }
  catch (error) { next(error); }
});
// ปิดการสร้าง hosted Checkout แบบเก่า เพื่อไม่ให้เกิดช่องทางจ่ายซ้ำบนออเดอร์เดียวกัน
paymentRouter.post("/checkout/:orderId", (req, res) => {
  return res.status(410).json({ success: false, message: "Use the GearVerse PromptPay payment page." });
});
