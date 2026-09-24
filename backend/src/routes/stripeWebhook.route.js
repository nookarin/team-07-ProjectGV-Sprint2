import express, { Router } from "express";

import { stripe } from "../config/stripe.js";
import { Order } from "../models/order.model.js";


export const stripeWebhookRouter = Router();


stripeWebhookRouter.post(
  "/webhook",

  // ต้องใช้ raw body
  express.raw({
    type: "application/json",
  }),

  async (req, res) => {
    const signature =
      req.headers["stripe-signature"];

    let event;

    try {
      event =
        stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
      console.error(
        "Webhook signature verification failed:",
        error.message
      );

      return res
        .status(400)
        .send(
          `Webhook Error: ${error.message}`
        );
    }


    try {
      switch (event.type) {

        case "checkout.session.completed": {
          const session =
            event.data.object;

          console.log(
            "Checkout completed:",
            session.id
          );


          if (
            session.payment_status ===
            "paid"
          ) {
            const orderId =
              session.metadata?.order_id;

            if (!orderId) {
              console.log(
                "Order ID not found in metadata"
              );

              break;
            }


            const order =
              await Order.findOne({
                _id: orderId,

                // ป้องกัน webhook เดิม update ซ้ำ
                payment_status: {
                  $ne: "paid",
                },
              });


            if (!order) {
              console.log(
                "Order already paid or order not found"
              );

              break;
            }


            order.payment_status =
              "paid";

            order.stripe_session_id =
              session.id;

            order.paid_at =
              new Date();


            await order.save();


            console.log(
              `Order ${orderId} is now paid ✅`
            );
          }

          break;
        }


        default:
          console.log(
            `Unhandled Stripe event: ${event.type}`
          );
      }


      return res.status(200).json({
        received: true,
      });

    } catch (error) {
      console.error(
        "Webhook processing error:",
        error
      );

      return res.status(500).json({
        received: false,
      });
    }
  }
);