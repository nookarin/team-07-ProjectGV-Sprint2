import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { CheckCircle2, Package, FileImage } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const { url } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadOrder() {
      try {
        const response = await axios.get(`${url}/orders/${orderId}`, {
          withCredentials: true,
        });
        if (!cancelled) setOrder(response.data.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message || "Could not load this order.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadOrder();
    return () => {
      cancelled = true;
    };
  }, [orderId, url]);

  if (loading) return <LoadingScreen />;

  if (error || !order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-100 px-4">
        <h1 className="text-2xl font-extrabold">Order not found</h1>
        <p className="text-slate-400 text-sm">{error}</p>
        <Link to="/">
          <Button className="bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] text-slate-950 font-bold">
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  const purchasedAt = new Date(order.createdAt);

  return (
    <div className="min-h-screen relative z-10 text-slate-100 py-10 px-3 sm:px-6 lg:px-12 font-sans antialiased flex items-center justify-center">
      <div className="max-w-2xl w-full space-y-6">
        <Card className="bg-[#121022] border-[#231e3d] rounded-3xl">
          <CardContent className="p-8 flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-tr from-emerald-500 to-cyan-400 rounded-full flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30">
              <CheckCircle2 className="w-8 h-8 stroke-[3]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Order Confirmed!
            </h1>
            <p className="text-slate-400 text-sm">
              Thanks for your order. A confirmation has been recorded for your
              account.
            </p>

            <div className="w-full bg-[#18152e] border border-[#2e264f] rounded-xl p-4 text-sm space-y-2 text-left">
              <div className="flex justify-between text-slate-300">
                <span>Order Number</span>
                <span className="font-mono font-bold text-white">
                  {order.order_number}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Purchase Date/Time</span>
                <span className="font-bold text-white">
                  {purchasedAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  &middot;{" "}
                  {purchasedAt.toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Payment Method</span>
                <span className="font-bold text-white">
                  {order.payment_method}
                </span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Status</span>
                <span className="font-bold text-emerald-400 capitalize">
                  {order.status}
                </span>
              </div>
              {order.shipping_address && (
                <div className="pt-2 border-t border-[#231e3d] flex flex-col gap-0.5 text-xs text-slate-300">
                  <span className="font-semibold text-slate-400">
                    Shipping Address:
                  </span>
                  <span className="text-white font-medium">
                    {order.shipping_address.firstname}{" "}
                    {order.shipping_address.lastname}{" "}
                    {order.shipping_address.phoneNumber &&
                      `(${order.shipping_address.phoneNumber})`}
                  </span>
                  <span className="text-slate-300">
                    {[
                      order.shipping_address.houseNo,
                      order.shipping_address.street,
                      order.shipping_address.subdistrict,
                      order.shipping_address.district,
                      order.shipping_address.province,
                      order.shipping_address.zipCode,
                    ]
                      .filter(Boolean)
                      .join(" ")}
                  </span>
                </div>
              )}
              {order.slip_url && (
                <div className="pt-2 border-t border-[#231e3d] flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-400">
                    Payment Slip:
                  </span>
                  <a
                    href={order.slip_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline flex items-center gap-1"
                  >
                    <FileImage className="w-3.5 h-3.5" /> ดูรูปสลิป
                  </a>
                </div>
              )}
            </div>

            <div className="w-full space-y-2">
              {order.items.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center gap-3 bg-[#18152e] border border-[#2e264f] rounded-xl p-3 text-left"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#22173d] text-[#a855f7] flex items-center justify-center flex-shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {item.product_id?.product_name || "Product"}
                    </p>
                    <p className="text-xs text-slate-400">
                      Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-white">
                    ${item.unit_price.toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            <div className="w-full flex justify-between items-baseline pt-2">
              <span className="text-lg font-extrabold text-white">Total</span>
              <span className="text-2xl font-black text-white">
                ${order.total_price.toFixed(2)}
              </span>
            </div>

            <Link to="/my-purchases" className="w-full">
              <Button className="w-full bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] text-slate-950 font-black py-3 rounded-xl h-auto">
                View My Purchases
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
