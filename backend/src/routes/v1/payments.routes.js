import { Router } from "express";
import mongoose from "mongoose";

import { stripe } from "../../config/stripe.js";
import { Order } from "../../models/order.model.js";
import { protect } from "../../middlewares/protect.js";

export const paymentRouter = Router();


// POST /api/v1/payments/checkout/:orderId
paymentRouter.post(
  "/checkout/:orderId",
  protect,
  async (req, res, next) => {
    try {
      const { orderId } = req.params;

      // -----------------------------
      // 1. ตรวจสอบ ObjectId
      // -----------------------------

      if (!mongoose.Types.ObjectId.isValid(orderId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid order ID!",
        });
      }


      // -----------------------------
      // 2. หา Order
      // -----------------------------

      const userId = req.user.user._id ?? req.user.id;

      const order = await Order.findOne({
        _id: orderId,
        user_id: userId,
      }).populate(
        "items.product_id",
        "product_name",
      );


      if (!order) {
        return res.status(404).json({
          success: false,
          message: "Order not found!",
        });
      }


      // -----------------------------
      // 3. ถ้าจ่ายแล้วห้ามจ่ายซ้ำ
      // -----------------------------

      if (order.payment_status === "paid") {
        return res.status(400).json({
          success: false,
          message: "This order has already been paid.",
        });
      }


      // -----------------------------
      // 4. เตรียมสินค้าให้ Stripe
      // -----------------------------

      const lineItems = order.items.map((item) => ({
        price_data: {
          currency: "thb",

          product_data: {
            name:
              item.product_id?.product_name ||
              "Product",
          },

          // Stripe รับจำนวนเงินเป็นสตางค์
          unit_amount: Math.round(
            item.unit_price * 100,
          ),
        },

        quantity: item.quantity,
      }));


      // -----------------------------
      // 5. สร้าง Stripe Checkout
      // -----------------------------

      const session =
        await stripe.checkout.sessions.create({
          mode: "payment",

          payment_method_types: [
            "promptpay",
          ],

          line_items: lineItems,

          metadata: {
            order_id:
              order._id.toString(),

            user_id:
              order.user_id.toString(),
          },

          success_url:
            `${process.env.CLIENT_URL}/payment/success` +
            `?session_id={CHECKOUT_SESSION_ID}`,

          cancel_url:
            `${process.env.CLIENT_URL}/payment/cancel`,
        });


      // -----------------------------
      // 6. เก็บ Stripe Session ID
      // -----------------------------

      order.stripe_session_id =
        session.id;

      await order.save();


      // -----------------------------
      // 7. ส่ง Stripe URL ให้ React
      // -----------------------------

      return res.status(200).json({
        success: true,

        checkout_url: session.url,

        session_id: session.id,
      });

    } catch (error) {
      next(error);
    }
  },
);