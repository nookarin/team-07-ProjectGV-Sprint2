import { ShoppingCart } from "../models/cart.model.js";
import { Product } from "../models/product.model.js";
import { Promo } from "../models/promocode.model.js";
import { calculateTotals, toSatang } from "./pricing.js";

// โหลดราคาและโปรโมชันจากฐานข้อมูล ไม่เชื่อยอดที่ frontend ส่งมา
// session ทำให้ใช้ได้ทั้งตอนดูยอดปกติและตอนสร้างออเดอร์ภายใน transaction
export async function quoteCart(userId, cartId, promoCode, session = null) {
  // ต้องเป็นตะกร้าของผู้ใช้ที่เข้าสู่ระบบ และยังไม่ถูก checkout
  const cart = await ShoppingCart.findOne({
    _id: cartId,
    user_id: userId,
    status: "active",
  }).session(session);
  if (!cart)
    return {
      success: false,
      status: 409,
      message: "Cart is unavailable or already checked out!",
    };
  // อ่านราคากับสต็อกล่าสุดของสินค้าทั้งหมดในตะกร้าครั้งเดียว
  const products = await Product.find({
    _id: { $in: cart.items.map((item) => item.product_id) },
  }).session(session);
  // เก็บ unit_price ณ ตอนซื้อไว้เป็นประวัติ; ขั้นตอนนี้ตรวจสต็อกแต่ยังไม่จองหรือตัดสต็อก
  const items = [];
  for (const item of cart.items) {
    const product = products.find(
      (product) => String(product._id) === String(item.product_id),
    );
    if (!product)
      return {
        success: false,
        status: 409,
        message: "Some products are no longer available!",
      };
    if (item.quantity > product.stock)
      return {
        success: false,
        status: 409,
        message: `${product.product_name} has insufficient stock.`,
      };
    const price = toSatang(product.price);
    if (price === null)
      return { success: false, status: 400, message: "Invalid price." };
    items.push({
      product_id: product._id,
      quantity: item.quantity,
      unit_price: price / 100,
    });
  }
  if (promoCode != null && typeof promoCode !== "string")
    return { success: false, status: 400, message: "Invalid promo code." };
  // จัดรูปแบบโค้ดก่อนค้นหา แล้วให้ calculateTotals ตรวจเงื่อนไขการใช้โปรโมชัน
  const code = promoCode?.trim().toLowerCase();
  const promo = code
    ? await Promo.findOne({ name: code }).session(session)
    : null;
  if (code && !promo)
    return {
      success: false,
      status: 400,
      message: "Promotion code not found.",
    };
  const totals = calculateTotals(items, promo);
  if (totals.success === false) return totals;
  // ส่งเอกสารพร้อมยอดให้ route ใช้บันทึกต่อ โดยไม่ต้องคำนวณใหม่คนละสูตร
  return { cart, items, promo, totals };
}
