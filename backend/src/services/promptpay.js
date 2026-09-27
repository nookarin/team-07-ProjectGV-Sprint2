import { toSatang } from "./pricing.js";

// รวมวงจร PromptPay: สร้างรายการ -> confirm เพื่อรับ QR -> ตรวจผล -> อัปเดตออเดอร์
// คืนข้อมูล validation ให้ route ใช้ res.status(); ข้อผิดพลาดจากระบบภายนอกยังโยนต่อได้
export function createPromptPayService({ stripe, Order, User, secretKey }) {
  // งานนี้เป็นการจำลอง จึงยอมรับเฉพาะ secret key ของ Stripe test mode
  function validateTestMode() {
    if (!secretKey?.startsWith("sk_test_")) {
      return {
        success: false,
        status: 503,
        message: "PromptPay demo requires a Stripe test secret key.",
      };
    }
  }

  // PaymentIntent คือรายการชำระเงินของ Stripe ต้องตรงกับออเดอร์ เจ้าของ ยอด และสกุลเงิน
  // ห้ามเชื่อเพียงสถานะ succeeded โดยไม่ตรวจรายละเอียดเหล่านี้
  function verifyIntent(order, intent) {
    if (
      intent.livemode ||
      intent.id !== order.stripe_payment_intent_id ||
      intent.metadata?.order_id !== String(order._id) ||
      intent.metadata?.user_id !== String(order.user_id) ||
      intent.currency !== "thb" ||
      intent.amount !== toSatang(order.total_price) ||
      !intent.payment_method_types?.includes("promptpay")
    ) {
      return {
        success: false,
        status: 409,
        message: "Payment does not match this order.",
      };
    }
    if (
      intent.status === "succeeded" &&
      intent.amount_received !== intent.amount
    ) {
      return {
        success: false,
        status: 409,
        message: "Received amount does not match this order.",
      };
    }
  }

  // แปลงสถานะ Stripe เป็นสถานะ GearVerse ทั้ง webhook และการเปิดหน้าเว็บใช้ฟังก์ชันนี้ร่วมกัน
  async function sync(order, intent) {
    const invalid = verifyIntent(order, intent);
    if (invalid) return invalid;
    // เปลี่ยนเฉพาะ pending ที่ยังไม่ paid เพื่อไม่ให้เหตุการณ์ซ้ำย้อนสถานะที่สำเร็จแล้ว
    const filter = {
      _id: order._id,
      stripe_payment_intent_id: intent.id,
      payment_status: { $ne: "paid" },
      status: "pending",
    };
    if (intent.status === "succeeded") {
      await Order.findOneAndUpdate(
        filter,
        {
          $set: {
            payment_status: "paid",
            status: "processing",
            paid_at: new Date(),
          },
        },
        { runValidators: true },
      );
    } else if (intent.status === "canceled") {
      await Order.findOneAndUpdate(
        filter,
        {
          $set: {
            payment_status: "cancelled",
            status: "cancelled",
          },
        },
        { runValidators: true },
      );
    } else if (
      intent.status === "requires_payment_method" &&
      intent.last_payment_error
    ) {
      await Order.findOneAndUpdate(filter, {
        $set: { payment_status: "failed" },
      });
    }
    return Order.findById(order._id);
  }

  // จัดผลลัพธ์ให้ frontend แสดง QR/สถานะ และซ่อนภาพ QR เมื่อจ่ายสำเร็จแล้ว
  function response(order, intent = null) {
    if (order.success === false) return order;
    const qr = intent?.next_action?.promptpay_display_qr_code;
    return {
      success: true,
      order,
      payment: {
        test_mode: true,
        status: intent?.status ?? "not_started",
        qr_image_url:
          order.payment_status !== "paid" ? (qr?.image_url_png ?? null) : null,
        // QR ทดสอบอาจเก็บ URL จำลองการจ่าย ยอมส่งเฉพาะลิงก์ HTTPS ของโดเมน Stripe
        test_payment_url:
          qr?.data && /^https:\/\/([a-z0-9-]+\.)*stripe\.com\//i.test(qr.data)
            ? qr.data
            : null,
        instructions_url: qr?.hosted_instructions_url ?? null,
        error: intent?.last_payment_error?.message ?? null,
      },
    };
  }

  // เปิดหรือรีเฟรชหน้าแล้วอ่านรายการเดิมจาก Stripe โดยไม่สร้าง PaymentIntent ใหม่
  async function read(order) {
    const invalidConfig = validateTestMode();
    if (invalidConfig) return invalidConfig;
    if (!order.stripe_payment_intent_id) return response(order);
    const intent = await stripe.paymentIntents.retrieve(
      order.stripe_payment_intent_id,
    );
    return response(await sync(order, intent), intent);
  }

  // ออก QR เฉพาะออเดอร์ PromptPay ที่ยังรอชำระ และไม่ได้ใช้ hosted Checkout เดิม
  async function start(order) {
    const invalidConfig = validateTestMode();
    if (invalidConfig) return invalidConfig;
    if (
      order.payment_method !== "promptpay" ||
      order.status !== "pending" ||
      ["paid", "cancelled"].includes(order.payment_status)
    ) {
      return {
        success: false,
        status: 409,
        message: "This order cannot accept a PromptPay payment.",
      };
    }
    if (order.stripe_session_id) {
      return {
        success: false,
        status: 409,
        message:
          "This order already has a hosted Checkout. Please use a new order for the QR demo.",
      };
    }
    let intent;
    const amount = toSatang(order.total_price);
    if (amount === null)
      return { success: false, status: 400, message: "Invalid price." };
    if (order.stripe_payment_intent_id) {
      intent = await stripe.paymentIntents.retrieve(
        order.stripe_payment_intent_id,
      );
    } else {
      // สร้างรายการที่ยังไม่ confirm แล้วผูกกับออเดอร์ก่อน เพื่อไม่ออก QR หากออเดอร์ถูกยกเลิกแทรก
      // idempotencyKey เดิมทำให้ Stripe ใช้ผลคำขอสร้างเดิมเมื่อส่งซ้ำ
      intent = await stripe.paymentIntents.create(
        {
          amount,
          currency: "thb",
          payment_method_types: ["promptpay"],
          metadata: {
            order_id: String(order._id),
            user_id: String(order.user_id),
          },
        },
        { idempotencyKey: `gearverse:promptpay:${order._id}:create` },
      );
      const bound = await Order.findOneAndUpdate(
        {
          _id: order._id,
          status: "pending",
          payment_status: { $ne: "paid" },
          stripe_payment_intent_id: null,
        },
        { $set: { stripe_payment_intent_id: intent.id } },
        { new: true },
      );
      order = bound ?? (await Order.findById(order._id));
      if (
        !order ||
        order.stripe_payment_intent_id !== intent.id ||
        order.status !== "pending"
      ) {
        // ยกเลิกเฉพาะรายการใหม่ที่ผูกไม่ได้ เพราะรายการที่ผูกแล้วอาจถูกจ่ายผ่านอีกคำขอไปแล้ว
        if (order?.stripe_payment_intent_id !== intent.id)
          await stripe.paymentIntents.cancel(intent.id);
        return {
          success: false,
          status: 409,
          message: "Order changed. Please refresh before paying.",
        };
      }
    }
    const invalid = verifyIntent(order, intent);
    if (invalid) return invalid;
    if (
      ["succeeded", "canceled", "processing", "requires_action"].includes(
        intent.status,
      )
    ) {
      return response(await sync(order, intent), intent);
    }
    // ใช้รหัสวิธีจ่ายที่ล้มเหลวแยกรอบลองใหม่ แต่การกดซ้ำในรอบเดียวกันใช้ key เดียวกัน
    const attempt =
      intent.last_payment_error?.payment_method?.id ||
      intent.payment_method ||
      "initial";
    // ใช้อีเมลที่เก็บตอนสร้างออเดอร์ก่อน ถ้าไม่มีจึงอ่านจากบัญชีผู้ใช้
    const user = await User.findById(order.user_id);
    const email = order.payment_email || user?.email;
    if (!email)
      return {
        success: false,
        status: 400,
        message: "An email address is required for PromptPay.",
      };
    // confirm ทำให้ Stripe ส่งข้อมูล QR กลับมา ยังไม่ถือว่าจ่ายสำเร็จในขั้นตอนนี้
    intent = await stripe.paymentIntents.confirm(
      intent.id,
      {
        payment_method_data: { type: "promptpay", billing_details: { email } },
      },
      { idempotencyKey: `gearverse:promptpay:${order._id}:confirm:${attempt}` },
    );
    return response(await sync(order, intent), intent);
  }

  // ตรวจและยกเลิกรายการที่ Stripe ก่อนเปลี่ยนออเดอร์เป็น cancelled
  // หาก Stripe รับเงินไปแล้ว ให้ sync ผลสำเร็จและปฏิเสธการยกเลิก
  async function cancel(order) {
    if (order.status === "cancelled") return order;
    if (order.status !== "pending" || order.payment_status === "paid") {
      return {
        success: false,
        status: 409,
        message: "Only unpaid pending orders can be cancelled.",
      };
    }
    if (order.stripe_session_id) {
      return {
        success: false,
        status: 409,
        message:
          "Cancel the existing hosted Checkout before cancelling this order.",
      };
    }
    if (order.stripe_payment_intent_id) {
      const invalidConfig = validateTestMode();
      if (invalidConfig) return invalidConfig;
      const current = await stripe.paymentIntents.retrieve(
        order.stripe_payment_intent_id,
      );
      const invalid = verifyIntent(order, current);
      if (invalid) return invalid;
      if (["succeeded", "processing"].includes(current.status)) {
        await sync(order, current);
        return {
          success: false,
          status: 409,
          message: "Payment is complete or processing and cannot be cancelled.",
        };
      }
      const intent =
        current.status === "canceled"
          ? current
          : await stripe.paymentIntents.cancel(current.id);
      return sync(order, intent);
    }
    const cancelled = await Order.findOneAndUpdate(
      {
        _id: order._id,
        status: "pending",
        payment_status: { $ne: "paid" },
        stripe_payment_intent_id: null,
      },
      { $set: { status: "cancelled", payment_status: "cancelled" } },
      { new: true },
    );
    if (!cancelled)
      return {
        success: false,
        status: 409,
        message: "Payment has started. Please refresh and retry cancellation.",
      };
    return cancelled;
  }

  // webhook ใช้ PaymentIntent ID หาออเดอร์ และข้ามเหตุการณ์ที่ไม่เกี่ยวข้อง
  async function handleEvent(event) {
    if (!event.type.startsWith("payment_intent.")) return;
    const invalidConfig = validateTestMode();
    if (invalidConfig) return invalidConfig;
    const order = await Order.findOne({
      stripe_payment_intent_id: event.data.object.id,
    });
    if (!order) return;
    // อ่านสถานะล่าสุดแทนข้อมูลเก่าใน event เพราะ webhook อาจซ้ำหรือมาถึงสลับลำดับ
    const intent = await stripe.paymentIntents.retrieve(event.data.object.id);
    return sync(order, intent);
  }
  return { start, read, cancel, handleEvent };
}
