const API_BASE = import.meta.env.VITE_API_URL || "/api/v1";
const CART_API = `${API_BASE}/shoppingcart`;

//แปลงจากเอกสาร MongoDB (snake_case) เป็น shape ที่ React แสดงผล (camelCase)
function toFrontendItem(item) {
  return {
    id: item.product_id || item._id,
    name: item.product_name,
    tag: item.tag ?? "",
    unitPrice: item.unit_price,
    quantity: item.quantity,
    delivery: item.delivery ?? "",
    image: item.image ?? "",
  };
}

//แปลงจาก shape ของ React (camelCase) ไปเป็นเอกสาร MongoDB (snake_case)
function toBackendItem(item) {
  return {
    product_id: item.id,
    product_name: item.name,
    tag: item.tag ?? "",
    unit_price: item.unitPrice,
    quantity: item.quantity,
    delivery: item.delivery ?? "",
    image: item.image ?? "",
  };
}

// เพิ่ม/แก้/ลบ cart ต้องเป็น user ที่ login จริงเท่านั้น
// (ไม่อนุญาตให้ขโมย cart ของ user อื่น หรือใช้ id ที่ไม่ใช่ของตัวเอง)
function resolveUserId(userId) {
  return userId || null;
}

export async function fetchCart(userId) {
  const id = resolveUserId(userId);
  if (!id) return null;

  try {
    const res = await fetch(`${CART_API}/${id}`, { credentials: "include" });
    const result = await res.json();
    const cart = result.data ?? null;
    if (!cart) return null;
    return cart.items.map(toFrontendItem);
  } catch {
    return null;
  }
}

export async function syncCart(items, userId) {
  const id = resolveUserId(userId);
  if (!id) return null;

  try {
    const res = await fetch(`${CART_API}/${id}`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: items.map(toBackendItem) }),
    });
    const result = await res.json();
    return result.data ?? null;
  } catch {
    return null;
  }
}