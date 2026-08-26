const STORAGE_KEY = "gearverse_shopping_cart";
const PROMO_KEY = "gearverse_applied_promo"; //ช่องที่ใช้เก็บว่าเราเลือก Code อะไร

const INITIAL_CART_ITEMS = [
  {
    id: "1",
    name: "GearVerse Pro Headset",
    tag: "RGB • 7.1 Surround • Pink",
    unitPrice: 89.99,
    quantity: 1,
    delivery: "Est. Delivery: 2-3 Business Days",
    image: "/images/headset.jpg",
  },
  {
    id: "2",
    name: "GearVerse Mechanical Keyboard",
    tag: "Cherry MX Red • TKL Layout • Matte Black",
    unitPrice: 149.99,
    quantity: 1,
    delivery: "Est. Delivery: 2-3 Business Days",
    image: "/images/keyboard.jpg",
  },
  {
    id: "3",
    name: "GearVerse Gaming Mouse",
    tag: "Wireless • 25K DPI • Black",
    unitPrice: 69.99,
    quantity: 2,
    delivery: "Est. Delivery: 2-3 Business Days",
    image: "/images/mouse.jpg",
  },
];

//เอาไว้เช็กว่า Code ที่ผู้ใช้กรอกมาใน PROMO_KEY มีอยู่จริงไหม และลดเท่าไหร่
const PROMO_CODES = {
  GEAR30: { discount: 30.0, description: "Code 'GEAR30' saved you $30.00!" },
  GAME10: { discount: 10.0, description: "Code 'GAME10' saved you $10.00!" },
};

export const DEFAULT_SHIPPING = 5.99;

export function getInitialCart() {
  const saved = localStorage.getItem(STORAGE_KEY); //เช็กว่าผู้ใช้เคยมี Cart ที่บันทึกไว้หรือยัง
  if (saved) {
    try {
      return JSON.parse(saved); //ถ้ามีลองเอากลับมาใช้ return Cart ที่อยู่ใน localStorage (วิธีหลัก)
    } catch {
      //ถ้ามีแต่ข้อมูลนั้นผิด/ไม่ใช่สินค้าใน json หรือถ้าไม่มี saved ไว้เลยจะไหลลงไปทำด้านล่าง
    }
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CART_ITEMS));
  return INITIAL_CART_ITEMS; //(วิธีสำรอง)
}

//เอา Cart ปัจจุบันไปบันทึกลง localStorage (พอรีเฟรชก็จะไปทำ getInitatilCart)
export function saveCart(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); //เอา items ที่แปลงเป็น String แล้ว ไปเก็บไว้ใน localStorage ช่องที่ชื่อ STORAGE_KEY
}

//ไปดูใน localStorage ว่ามี applied_promo ใส่ไว้ไหม ถ้ามีเอาอันนั้นมาใช้ แต่ถ้าไม่มี ให้ใช้ GEAR30 แทน
export function getSavedPromo() {
  return localStorage.getItem(PROMO_KEY) || "GEAR30"; // ตอนนี้ผู้ใช้เลือก Promo Code อะไรไว้? ถ้าด้านซ้ายไม่มีค่า ให้ใช้ด้านขวาแทน
}

//บันทึก Promo ที่ผู้ใช้เลือกไว้
export function savePromo(code) {
  if (code) {
    localStorage.setItem(PROMO_KEY, code);
  } else {
    localStorage.removeItem(PROMO_KEY);
  }
}

//ล้างสิ่งที่ผู้ใช้แก้ไว้ แล้วเอาทุกอย่างกลับไปเหมือนตอนเริ่มต้น
export function resetToDefaultCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_CART_ITEMS));
  localStorage.setItem(PROMO_KEY, "GEAR30");
  return { items: INITIAL_CART_ITEMS, promoCode: "GEAR30" };
}

//ตรวจสอบว่า Promo Code ที่ผู้ใช้กรอกมา ถูกต้องไหม
export function validatePromoCode(code) { //สร้างฟังก์ชันชื่อ validatePromoCode รับ code ที่ผู้ใช้กรอกเข้ามา
  const normalized = (code || "").trim().toUpperCase(); //เช็กว่ามีค่าไหม ถ้า code มีค่า → ใช้ code ถ้าไม่มีค่า → ใช้ "", ตัดช่องว่างหัว-ท้าย, เปลี่ยนตัวอักษรเป็นตัวใหญ่
  if (PROMO_CODES[normalized]) {
    return { valid: true, code: normalized, ...PROMO_CODES[normalized] }; //  valid: true, code: "GAME10", discount: 10.0, description: "Code 'GAME10' saved you $10.00!"
  }
  return { valid: false, error: "Invalid promo code" };
}
//ผู้ใช้กรอก Code, validatePromoCode(code), ทำให้เป็นมาตรฐาน trim + toUpperCase, PROMO_CODES[normalized]
//มีโค้ดในระบบไหม?
//   ↙       ↘
// มี         ไม่มี
// ↓           ↓
//valid:true  valid:false
// ↓           ↓
//เอาข้อมูล    Invalid
//discount    promo code
//มาใช้