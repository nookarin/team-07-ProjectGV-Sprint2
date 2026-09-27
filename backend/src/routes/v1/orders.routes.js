import { Router } from "express";
import mongoose from "mongoose";
import { Order } from "../../models/order.model.js";
import { User } from "../../models/user.model.js";
import { Promo } from "../../models/promocode.model.js";
import { protect } from "../../middlewares/protect.js";
import { authorize } from "../../middlewares/authorize.js";
import { quoteCart } from "../../services/checkout.js";
import { toSatang } from "../../services/pricing.js";
import { paymentService } from "../../services/paymentService.js";

export const orderRouter = Router();
orderRouter.use(protect);

// ทุกเส้นทางต้องเข้าสู่ระบบ; เฉพาะ admin ดูรายการของผู้ใช้ทั้งหมดได้
orderRouter.get("/", authorize(["admin"]), async (req, res, next) => {
  try {
    const orders = await Order.find().populate("user_id", "username email firstname lastname")
      .populate("items.product_id", "product_name price images image_url").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) { next(error); }
});
// ลูกค้าดูประวัติของตัวเองได้ ส่วน admin ดูของผู้ใช้ที่ระบุได้
orderRouter.get("/user/:user_id", async (req, res, next) => {
  try {
    if (req.user.user.role !== "admin" && String(req.user.user._id) !== req.params.user_id) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    const orders = await Order.find({ user_id: req.params.user_id })
      .populate("items.product_id", "product_name price images image_url").sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) { next(error); }
});
// คำนวณยอดให้หน้า Cart แสดงก่อนจ่าย โดยยังไม่สร้างออเดอร์หรือใช้โควตาโปรโมชัน
orderRouter.post("/quote", async (req, res, next) => {
  try {
    const { cart_id, promo_code } = req.body ?? {};
    if (!mongoose.isValidObjectId(cart_id)) return res.status(400).json({ success: false, message: "Invalid cart ID." });
    const result = await quoteCart(req.user.user._id, cart_id, promo_code);
    if (result.success === false) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, quote: result.totals });
  } catch (error) { next(error); }
});
// ยืนยันออเดอร์ด้วยราคา ค่าส่ง และส่วนลดจาก backend แล้วเก็บยอดนั้นสำหรับ Stripe
orderRouter.post("/", async (req, res, next) => {
  try {
    const { cart_id, payment_method = "promptpay", promo_code, expected_total } = req.body ?? {};
    if (!mongoose.isValidObjectId(cart_id)) return res.status(400).json({ success: false, message: "Invalid cart ID." });
    if (!Order.schema.path("payment_method").enumValues.includes(payment_method)) {
      return res.status(400).json({ success: false, message: "Unsupported payment method." });
    }
    if (expected_total !== undefined && toSatang(expected_total) === null) {
      return res.status(400).json({ success: false, message: "Invalid price." });
    }
    const user_id = req.user.user._id;
    // transaction ทำให้ออเดอร์ การปิดตะกร้า และโควตาโปรโมชันบันทึกสำเร็จหรือย้อนกลับร่วมกัน
    const order = await mongoose.connection.transaction(async session => {
      // ถ้ากด checkout ซ้ำหลังสร้างสำเร็จ ให้คืนออเดอร์เดิมของตะกร้านี้
      const existing = await Order.findOne({ cart_id, user_id }).session(session);
      if (existing) return existing;
      const result = await quoteCart(user_id, cart_id, promo_code, session);
      if (result.success === false) return result;
      const { cart, items, promo, totals } = result;
      // expected_total ใช้ตรวจว่ายอดเปลี่ยนจากที่ลูกค้าเห็นหรือไม่ ไม่ได้นำมาเป็นยอดเรียกเก็บ
      if (expected_total !== undefined && toSatang(expected_total) !== toSatang(totals.total_price)) {
        return { success: false, status: 409, message: "Order total changed. Please refresh the cart before paying." };
      }
      const user = await User.findById(user_id).session(session);
      const addresses = user?.address.filter(address => address.isDefault) ?? [];
      if (addresses.length !== 1) return { success: false, status: 400, message: "Please select exactly one default shipping address!" };
      const address = addresses[0];
      // คัดลอกที่อยู่ ณ ตอนสั่งซื้อ เพื่อให้ประวัติออเดอร์ไม่เปลี่ยนตามการแก้โปรไฟล์ภายหลัง
      const shipping_address = Object.fromEntries(
        ["firstname", "lastname", "phoneNumber", "houseNo", "street", "subdistrict", "district", "province", "zipCode"]
          .map(key => [key, address[key]]),
      );
      // นับการใช้โปรโมชันตอนสร้างออเดอร์ รวมออเดอร์ pending และที่ยกเลิกภายหลังด้วย
      // ตรวจโควตาอีกครั้งตอนเพิ่ม used_count เพื่อรับมือหลายคนใช้โค้ดพร้อมกัน
      if (promo) {
        const reserved = await Promo.updateOne({ _id: promo._id,
          $expr: { $lt: [{ $ifNull: ["$used_count", 0] }, "$max_use"] } },
          { $inc: { used_count: 1 } }, { session });
        if (!reserved.modifiedCount) return { success: false, status: 409, message: "This promotion is fully used." };
      }
      const newOrder = new Order({ cart_id, user_id, items, ...totals, shipping_address,
        payment_method, payment_email: user.email, status: "pending" });
      await newOrder.save({ session });
      cart.status = "checked_out";
      await cart.save({ session });
      return newOrder;
    });
    // validation ที่ไม่ผ่านจะคืนข้อมูลก่อนมีการเขียน ส่วน database error จะ throw เพื่อ rollback
    // ส่ง HTTP response นอก callback เพียงจุดเดียว หลัง transaction จบแล้ว
    if (order.success === false) {
      return res.status(order.status).json({ success: false, message: order.message });
    }
    return res.status(201).json({ success: true, order });
  } catch (error) { next(error); }
});

// โหลดออเดอร์และตรวจสิทธิ์ร่วมกันก่อนเข้า GET/PUT/DELETE ที่ใช้ :id
orderRouter.param("id", async (req, res, next, id) => {
  try {
    if (!mongoose.isValidObjectId(id)) return res.status(400).json({ success: false, message: "Invalid order ID." });
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found!" });
    if (req.user.user.role !== "admin" && String(order.user_id) !== String(req.user.user._id)) {
      return res.status(403).json({ success: false, message: "Forbidden." });
    }
    req.order = order;
    next();
  } catch (error) { next(error); }
});
orderRouter.get("/:id", async (req, res, next) => {
  try {
    await req.order.populate("items.product_id", "product_name images image_url");
    return res.status(200).json({ success: true, order: req.order });
  } catch (error) { next(error); }
});
// ลูกค้าทำได้เฉพาะยกเลิก ส่วน admin เปลี่ยนขั้นตอนจัดส่งตามลำดับที่กำหนด
orderRouter.put("/:id", async (req, res, next) => {
  try {
    const { status } = req.body ?? {};
    const order = req.order;
    if (status === "cancelled") {
      const result = await paymentService.cancel(order);
      if (result.success === false) {
        return res.status(result.status).json({ success: false, message: result.message });
      }
      return res.status(200).json({ success: true, updatedOrder: result });
    }
    if (req.user.user.role !== "admin") return res.status(403).json({ success: false, message: "You can only cancel your order." });
    // PromptPay ต้อง paid ก่อนจัดส่ง ส่วน COD รับเงินเมื่อส่งมอบเสร็จ
    const allowed = order.payment_method === "cod"
      ? { pending: ["shipped"], processing: ["shipped"], shipped: ["completed"] }
      : { processing: ["shipped"], shipped: ["completed"] };
    if (!allowed[order.status]?.includes(status) ||
        (order.payment_method !== "cod" && order.payment_status !== "paid")) {
      return res.status(409).json({ success: false, message: "Order is unpaid or the status transition is invalid." });
    }
    const changes = { status };
    if (order.payment_method === "cod" && status === "completed") {
      changes.payment_status = "paid";
      changes.paid_at = new Date();
    }
    // ใส่สถานะเดิมในเงื่อนไข เพื่อไม่เขียนทับการเปลี่ยนสถานะจากคำขออื่น
    const updatedOrder = await Order.findOneAndUpdate({ _id: order._id, status: order.status },
      { $set: changes }, { new: true, runValidators: true });
    if (!updatedOrder) return res.status(409).json({ success: false, message: "Order status changed. Please refresh." });
    return res.status(200).json({ success: true, updatedOrder });
  } catch (error) { next(error); }
});
// DELETE ใน flow นี้หมายถึงยกเลิกออเดอร์ผ่าน service ไม่ได้ลบประวัติออกจากฐานข้อมูล
orderRouter.delete("/:id", async (req, res, next) => {
  try {
    const result = await paymentService.cancel(req.order);
    if (result.success === false) {
      return res.status(result.status).json({ success: false, message: result.message });
    }
    return res.status(200).json({ success: true, cancelledOrder: result });
  } catch (error) { next(error); }
});
