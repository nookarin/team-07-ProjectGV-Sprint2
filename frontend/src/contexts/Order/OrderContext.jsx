import { useCallback, useEffect, useState } from "react";
import { OrderContext } from "./OrderProvider";
import axios from "axios";
import { useAuth } from "../Authentication/AuthContext";

// แหล่งข้อมูลออเดอร์ร่วมกันของหน้าจ่ายเงินและ My Purchase
export function OrderProvider({ children }) {
  const { url, user } = useAuth();
  const [state, setState] = useState(null);
  // เพิ่มเลขรอบเพื่อให้ effect โหลดใหม่เมื่อหน้าจ่ายเงินแจ้งว่าสถานะเปลี่ยน
  const [revision, setRevision] = useState(0);
  const refreshOrders = useCallback(() => setRevision(value => value + 1), []);
  const userId = user?._id;
  // โหลดเฉพาะของผู้ใช้ที่เข้าสู่ระบบ และยกเลิกคำขอเก่าเมื่อผู้ใช้หรือรอบการโหลดเปลี่ยน
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    // ใช้ async/await กับ try/catch ภายใน effect เพื่อแยกผลสำเร็จและข้อผิดพลาดให้อ่านตามได้
    const fetchOrders = async () => {
      try {
        const { data } = await axios.get(`${url}/orders/user/${userId}`, { withCredentials: true, signal: controller.signal });
        setState({ userId, revision, orders: data.orders, error: null });
      } catch (error) {
        if (!axios.isCancel(error)) setState({ userId, revision, orders: [],
          error: error.response?.data?.message || "Unable to load orders." });
      }
    };
    fetchOrders();
    return () => controller.abort();
  }, [url, userId, revision]);
  // กันข้อมูลออเดอร์ของบัญชีเดิมค้างบนจอหลังเปลี่ยนผู้ใช้
  const current = state?.userId === userId ? state : null;
  return <OrderContext.Provider value={{
    orders: current?.orders ?? [], error: current?.error,
    // ถ้ายังไม่มีข้อมูล หรือข้อมูลเป็นรอบเก่า ให้หน้าที่เรียกใช้แสดงสถานะกำลังโหลด
    loading: !!userId && (!current || current.revision !== revision), refreshOrders,
  }}>{children}</OrderContext.Provider>;
}
