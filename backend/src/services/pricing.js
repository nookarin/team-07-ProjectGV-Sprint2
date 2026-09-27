// คำนวณเงินเป็นจำนวนเต็มหน่วยสตางค์ เพื่อลดปัญหาทศนิยม; ค่าส่ง 39 บาท = 3,900 สตางค์
export const SHIPPING_SATANG = 3900;

// แปลงบาทเป็นสตางค์ และคืน null เมื่อราคาไม่ใช่ตัวเลขที่ระบบนำไปใช้ได้
export function toSatang(value) {
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  const amount = Math.round(value * 100);
  if (!Number.isSafeInteger(amount)) return null;
  return amount;
}

// ใช้สูตรเดียวกันตอนแสดงยอดตะกร้าและสร้างออเดอร์
// validation คืน { success: false, status, message } ให้ route ตอบด้วย res.status()
export function calculateTotals(items, promo = null, now = new Date()) {
  if (!items.length) return { success: false, status: 400, message: "Your cart is empty!" };
  let subtotal = 0;
  for (const item of items) {
    if (!Number.isSafeInteger(item.quantity) || item.quantity < 1) {
      return { success: false, status: 400, message: "Product quantity must be a positive integer!" };
    }
    const price = toSatang(item.unit_price);
    if (price === null) return { success: false, status: 400, message: "Invalid price." };
    subtotal += price * item.quantity;
  }
  let discount = 0;
  if (promo) {
    // ตรวจวันเริ่ม/หมดอายุ สถานะ และโควตาโปรโมชันก่อนนำส่วนลดมาใช้
    if (!promo.is_active || !(new Date(promo.promo_start) <= now) ||
        !(new Date(promo.expire_at) > now) || promo.max_use <= (promo.used_count ?? 0)) {
      return { success: false, status: 400, message: "This promotion is inactive, expired, or fully used." };
    }
    // ยอดขั้นต่ำของโปรโมชันใช้ยอดสินค้า ไม่รวมค่าส่ง
    const minimum = toSatang(promo.min_order_price);
    if (minimum === null) return { success: false, status: 400, message: "Invalid price." };
    if (subtotal < minimum) {
      return { success: false, status: 400, message: "Your cart does not meet the promotion minimum." };
    }
    if (!Number.isFinite(promo.discount_amount) || promo.discount_amount < 0 ||
        !["percent", "baht"].includes(promo.discount_type) ||
        (promo.discount_type === "percent" && promo.discount_amount > 100)) {
      return { success: false, status: 400, message: "Invalid promotion discount." };
    }
    const promoDiscount = promo.discount_type === "percent"
      ? Math.round(subtotal * promo.discount_amount / 100)
      : toSatang(promo.discount_amount);
    if (promoDiscount === null) return { success: false, status: 400, message: "Invalid price." };
    // ส่วนลดมากที่สุดเท่ากับยอดสินค้า จึงไม่ทำให้ยอดติดลบหรือหักค่าส่ง
    discount = Math.min(subtotal, promoDiscount);
  }
  const total = subtotal - discount + SHIPPING_SATANG;
  // จำกัดยอดที่ส่ง Stripe ให้ไม่เกิน 8 หลักในหน่วยสตางค์
  if (!Number.isSafeInteger(total) || total > 99999999) {
    return { success: false, status: 400, message: "Order total exceeds the payment limit." };
  }
  // ส่งกลับเป็นบาทเพื่อบันทึกและแสดงบนเว็บ; แปลงเป็นสตางค์อีกครั้งเมื่อส่ง Stripe
  return {
    subtotal_price: subtotal / 100,
    shipping_fee: SHIPPING_SATANG / 100,
    discount_amount: discount / 100,
    promo_code: promo?.name ?? null,
    total_price: total / 100,
    total_quantity: items.reduce((sum, item) => sum + item.quantity, 0),
  };
}
