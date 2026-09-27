// งานฝั่ง server ทำงานแม้ไม่มีผู้ใช้เปิดหน้าจ่ายเงิน และไล่รายการค้างหลัง restart
export async function expireDuePayments({ Order, paymentService, now = Date.now, onError = console.error }) {
  const orders = Order.find({
    payment_method: "promptpay",
    stripe_session_id: null,
    stripe_payment_intent_id: { $ne: null },
    status: "pending",
    payment_status: { $in: ["pending", "failed"] },
    $or: [
      { payment_expires_at: { $lte: new Date(now()) } },
      { payment_expires_at: null },
    ],
  }).sort({ payment_expires_at: 1 }).cursor();
  // Stripe ต้องยืนยันการยกเลิกก่อนจึงเปลี่ยนสถานะในฐานข้อมูล
  // หากเครือข่ายขัดข้อง เก็บ pending ไว้แล้วลองใหม่ในรอบถัดไป
  const expire = async (order) => {
    try {
      const result = await paymentService.read(order);
      if (result.success === false) onError("Payment expiry failed:", String(order._id), result.message);
    } catch (error) {
      onError("Payment expiry failed:", String(order._id), error.message);
    }
  };
  // อ่านครบทุกออเดอร์เป็นชุด เพื่อไม่ให้รายการ processing กลุ่มแรกขวางรายการถัดไป
  let batch = [];
  try {
    for await (const order of orders) {
      batch.push(expire(order));
      if (batch.length === 10) {
        await Promise.all(batch);
        batch = [];
      }
    }
  } finally {
    await Promise.all(batch);
    await orders.close();
  }
}

export function startPaymentExpiryWorker(options, intervalMs = 1000) {
  let running = false;
  let stopped = false;
  const run = async () => {
    if (running || stopped) return;
    running = true;
    try {
      await expireDuePayments(options);
    } catch (error) {
      (options.onError ?? console.error)("Payment expiry scan failed:", error.message);
    } finally {
      running = false;
    }
  };
  const timer = setInterval(run, intervalMs);
  timer.unref();
  void run();
  return () => { stopped = true; clearInterval(timer); };
}
