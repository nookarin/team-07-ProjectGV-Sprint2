import express, { Router } from "express";
import { stripe } from "../config/stripe.js";
import { paymentService } from "../services/paymentService.js";
import { Order } from "../models/order.model.js";
import { toSatang } from "../services/pricing.js";

export const stripeWebhookRouter = Router();
// Stripe เรียก endpoint นี้เอง ใช้ลายเซ็นยืนยันผู้ส่งแทน cookie login
// ต้องรับ raw body เพราะการแปลง JSON ก่อนจะทำให้ตรวจลายเซ็นกับข้อมูลต้นฉบับไม่ได้
stripeWebhookRouter.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        req.headers["stripe-signature"],
        process.env.STRIPE_WEBHOOK_SECRET,
      );
    } catch {
      return res
        .status(400)
        .json({ received: false, message: "Invalid webhook signature." });
    }
    try {
      if (event.livemode)
        return res
          .status(400)
          .json({ received: false, message: "Test events only." });
      const result = await paymentService.handleEvent(event);
      if (result?.success === false) {
        // ตอบ 500 เมื่อประมวลผลไม่สำเร็จ เพื่อให้ Stripe ส่งเหตุการณ์นี้มาลองใหม่
        return res.status(500).json({ received: false });
      }
      // รองรับ hosted Checkout ที่สร้างไว้ก่อนเปลี่ยนมาใช้ QR ภายใน GearVerse
      // ต้องดึง session จริงและตรวจออเดอร์ สกุลเงิน และยอด ก่อนเปลี่ยนเป็น paid เช่นกัน
      if (
        [
          "checkout.session.completed",
          "checkout.session.async_payment_succeeded",
        ].includes(event.type)
      ) {
        const session = await stripe.checkout.sessions.retrieve(
          event.data.object.id,
        );
        const order = await Order.findOne({ stripe_session_id: session.id });
        if (
          order &&
          !session.livemode &&
          session.payment_status === "paid" &&
          session.metadata?.order_id === String(order._id) &&
          session.currency === "thb" &&
          session.amount_total === toSatang(order.total_price)
        ) {
          await Order.findOneAndUpdate(
            {
              _id: order._id,
              status: "pending",
              payment_status: { $ne: "paid" },
            },
            {
              $set: {
                payment_status: "paid",
                status: "processing",
                paid_at: new Date(),
                stripe_payment_intent_id: session.payment_intent,
              },
            },
          );
        }
      }
      return res.status(200).json({ received: true });
    } catch (error) {
      console.error("Webhook processing failed:", error.message);
      return res.status(500).json({ received: false });
    }
  },
);
