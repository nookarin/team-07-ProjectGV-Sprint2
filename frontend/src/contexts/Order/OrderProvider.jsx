import { createContext, useContext } from "react";

// แยก Context และ hook ออกจาก component ผู้ให้ข้อมูล เพื่อให้หน้าอื่นเรียก useOrder() ได้
// ค่าที่ได้ เช่น orders, loading, error, refreshOrders ถูกกำหนดใน OrderContext.jsx
export const OrderContext = createContext();
export const useOrder = () => useContext(OrderContext);
