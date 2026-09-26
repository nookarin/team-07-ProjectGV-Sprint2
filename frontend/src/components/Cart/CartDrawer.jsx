import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";
import { Loader2, Minus, Plus, ShoppingBag, Sparkles, Trash2, X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/Cart/CartProvider";
import img_default from "/images/headset.jpg";

const formatPrice = (value) =>
  new Intl.NumberFormat("th-TH", { maximumFractionDigits: 0 }).format(value || 0);

const QUANTITY_SYNC_DELAY = 400;
const QUANTITY_SYNC_MAX_WAIT = 1500;

const CartLineItem = ({
  item,
  quantity,
  isNewest,
  busy,
  onChangeQuantity,
  onRemove,
}) => {
  const product = item.product_id;
  const atMaxStock = typeof product?.stock === "number" && quantity >= product.stock;

  return (
    <div
      className={`flex gap-3 rounded-xl border p-3 transition-colors hover:bg-gpurple-5 ${
        isNewest
          ? "border-gpurple-2 bg-gpurple-4/25 ring-1 ring-gpurple-2/60"
          : "border-gbase-1 bg-gbase-3"
      }`}
    >
      <img
        src={product?.image_url || img_default}
        alt=""
        className="h-16 w-16 shrink-0 rounded-lg object-cover"
      />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <p className="line-clamp-2 text-sm font-semibold text-white">
            {product?.product_name}
          </p>
          <button
            type="button"
            onClick={() => onRemove(item._id)}
            disabled={busy}
            aria-label={`Remove ${product?.product_name}`}
            className="shrink-0 rounded-md p-1 text-gpurple-1/60 transition-colors hover:bg-gpink-2/20 hover:text-gpink-1 disabled:opacity-40"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {isNewest && (
          <span className="inline-flex w-fit items-center gap-1 rounded-full bg-gpurple-2/20 px-2 py-0.5 text-[10px] font-semibold text-gpurple-1">
            <Sparkles size={10} />
            เพิ่มล่าสุด
          </span>
        )}

        <div className="mt-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-gbase-1 bg-gbase-2 p-0.5">
            <button
              type="button"
              onClick={() => onChangeQuantity(item._id, quantity - 1)}
              disabled={busy || quantity <= 1}
              aria-label="Decrease quantity"
              className="rounded-md p-1 text-white transition-colors hover:bg-gpurple-4 disabled:opacity-30"
            >
              <Minus size={14} />
            </button>
            <span className="min-w-6 text-center text-sm font-semibold tabular-nums text-white">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => onChangeQuantity(item._id, quantity + 1)}
              disabled={busy || atMaxStock}
              aria-label="Increase quantity"
              className="rounded-md p-1 text-white transition-colors hover:bg-gpurple-4 disabled:opacity-30"
            >
              <Plus size={14} />
            </button>
          </div>
          <p className="text-sm font-bold text-gcyan-neon">
            ฿{formatPrice(quantity * (product?.price || 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    data,
    loading,
    cartCount,
    cartSubtotal,
    drawerOpen,
    openDrawer,
    closeDrawer,
    lastAddedProductId,
    updateQuantity,
    handleRemoveItem,
  } = useCart();
  const [busyItemIds, setBusyItemIds] = useState(() => new Set());
  const [draftQuantities, setDraftQuantities] = useState({});
  const draftsRef = useRef({});
  const queuedItemIdsRef = useRef(new Set());

  const isEmpty = !loading && data.length === 0;

  const setBusyItem = (itemId, isBusy) => {
    setBusyItemIds((current) => {
      if (current.has(itemId) === isBusy) return current;
      const next = new Set(current);
      if (isBusy) {
        next.add(itemId);
      } else {
        next.delete(itemId);
      }
      return next;
    });
  };

  const withBusyItem = async (itemId, action) => {
    setBusyItem(itemId, true);
    try {
      await action();
    } finally {
      setBusyItem(itemId, false);
    }
  };

  const syncDraftQuantities = useDebouncedCallback(
    async () => {
      const cartItemIds = new Set(data.map((item) => item._id));
      const entries = Object.entries(draftsRef.current).filter(([itemId]) =>
        cartItemIds.has(itemId),
      );

      entries.forEach(([itemId]) => queuedItemIdsRef.current.delete(itemId));
      if (entries.length === 0) return;

      await Promise.all(
        entries.map(([itemId, quantity]) =>
          withBusyItem(itemId, () => updateQuantity(itemId, quantity)),
        ),
      );
    },
    QUANTITY_SYNC_DELAY,
    { maxWait: QUANTITY_SYNC_MAX_WAIT, flushOnExit: true },
  );

  const handleChangeQuantity = (itemId, nextQuantity) => {
    draftsRef.current[itemId] = nextQuantity;
    queuedItemIdsRef.current.add(itemId);
    setDraftQuantities((current) => ({ ...current, [itemId]: nextQuantity }));
    syncDraftQuantities();
  };

  useEffect(() => {
    const draftIds = Object.keys(draftsRef.current);
    if (draftIds.length === 0) return;

    const syncedIds = draftIds.filter(
      (itemId) => !queuedItemIdsRef.current.has(itemId),
    );
    if (syncedIds.length === 0) return;

    syncedIds.forEach((itemId) => delete draftsRef.current[itemId]);
    setDraftQuantities((current) => {
      const next = { ...current };
      syncedIds.forEach((itemId) => delete next[itemId]);
      return next;
    });
  }, [data]);

  const goToCart = () => {
    closeDrawer();
    navigate("/cart");
  };

  return (
    <Drawer
      open={drawerOpen}
      onOpenChange={(next) => (next ? openDrawer() : closeDrawer())}
      swipeDirection="right"
    >
      <DrawerContent className="shadow-2xl shadow-gpurple-4/50 rounded-l-4xl border-gpurple-2/40 bg-gbase-3 text-white sm:[--drawer-content-width:26rem]">
        <DrawerHeader className="border-b border-gbase-1 pb-4 pr-14">
          <DrawerTitle className="flex items-center gap-2 text-lg font-bold text-white">
            <ShoppingBag size={18} className="text-gcyan-light" />
            My Cart
            {cartCount > 0 && (
              <span className="rounded-full bg-gpink-2 px-2 py-0.5 text-xs font-bold text-white">
                {cartCount}
              </span>
            )}
          </DrawerTitle>
          <DrawerDescription className="text-gpurple-1/70">
            {cartCount > 0
              ? `มี ${cartCount} ชิ้น ในตะกร้าของคุณ`
              : "เลือกสินค้าที่คุณชอบเพื่อเริ่มช้อปปิ้ง"}
          </DrawerDescription>
        </DrawerHeader>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 scrollbar-thumb-gpurple-4/50">
          {loading && data.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-gpurple-1/70">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-sm">กำลังโหลดตะกร้า...</p>
            </div>
          ) : isEmpty ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gpurple-4/30">
                <ShoppingBag size={28} className="text-gpurple-2" />
              </div>
              <div>
                <p className="font-semibold text-white">ยังไม่มีสินค้าในตะกร้า</p>
                <p className="mt-1 text-sm text-gpurple-1/70">
                  กดไอคอนตะกร้าที่มุมบนเพื่อกลับไปเลือกซื้อสินค้า
                </p>
              </div>
              <Button
                onClick={goToCart}
                className="bg-gpink-2 text-white hover:bg-gpink-3"
              >
                เลือกซื้อสินค้า
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {data.map((item) => (
                <CartLineItem
                  key={item._id}
                  item={item}
                  quantity={draftQuantities[item._id] ?? item.quantity ?? 0}
                  isNewest={item.product_id?._id === lastAddedProductId}
                  busy={busyItemIds.has(item._id)}
                  onChangeQuantity={handleChangeQuantity}
                  onRemove={(itemId) =>
                    withBusyItem(itemId, () => handleRemoveItem(itemId))
                  }
                />
              ))}
            </div>
          )}
        </div>

        <DrawerFooter className="border-t border-gbase-1 pt-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gpurple-1/70">Subtotal</span>
            <span className="text-lg font-bold text-white tabular-nums">
              ฿{formatPrice(cartSubtotal)}
            </span>
          </div>
          <p className="text-xs text-gpurple-1/50">
            ค่าจัดส่งและส่วนลดจะคำนวณอีกครั้งในหน้าตะกร้า
          </p>
          <div className="flex gap-2">
            <DrawerClose
              render={
                <Button
                  variant="outline"
                  className="flex-1 border-gbase-1 bg-transparent text-white hover:bg-gbase-2"
                />
              }
            >
              <X size={16} />
              ปิด
            </DrawerClose>
            <Button
              onClick={goToCart}
              disabled={cartCount === 0}
              className="flex-1 bg-gpink-2 text-white hover:bg-gpink-3"
            >
              ดูตะกร้าทั้งหมด
            </Button>
          </div>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default CartDrawer;
