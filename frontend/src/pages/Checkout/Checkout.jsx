import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CreditCard,
  Landmark,
  Lock,
  QrCode,
  ShieldCheck,
  Sparkles,
  Truck,
  Upload,
  X,
  Loader2,
  FileImage,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useAuth } from "@/contexts/Authentication/AuthContext";
import { useCart } from "@/contexts/Cart/CartProvider";
import { fetchPromptPayQR, submitPayment } from "@/lib/payment-api";
import { DEFAULT_SHIPPING } from "#lib/cart-service";
import { toast } from "sonner";
import ShippingAddressForm from "./ShippingAddressForm";

const PAYMENT_METHODS = [
  {
    id: "promptpay",
    label: "PromptPay QR",
    description: "Scan & pay via Thai banking apps",
    icon: QrCode,
  },
  {
    id: "stripe",
    label: "Stripe",
    description: "Credit / Debit via Stripe Gateway",
    icon: Sparkles,
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    description: "Visa, Mastercard, JCB",
    icon: CreditCard,
  },
  {
    id: "bank_transfer",
    label: "Bank Auto-Debit",
    description: "Authorize a direct debit",
    icon: Landmark,
  },
];

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function Checkout() {
  const navigate = useNavigate();
  const { url, user } = useAuth();
  const { data, loading } = useCart();

  const [shippingForm, setShippingForm] = useState({
    fullName: "",
    phoneNumber: "",
    province: "",
    district: "",
    subdistrict: "",
    zipCode: "",
    houseAndStreet: "",
    isDefault: true,
    isDeliveryAddress: true,
    isReturnAddress: false,
  });
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [paymentMethod, setPaymentMethod] = useState("promptpay");
  const [promptPayData, setPromptPayData] = useState(null);
  const [loadingQR, setLoadingQR] = useState(false);
  const [slipFile, setSlipFile] = useState(null);
  const [slipPreview, setSlipPreview] = useState(null);

  const [card, setCard] = useState({
    number: "",
    expiry: "",
    cvv: "",
    holderName: "",
  });
  const [bank, setBank] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);

  // Load PromptPay dynamic QR when promptpay is selected
  useEffect(() => {
    if (paymentMethod === "promptpay" && !promptPayData) {
      let cancelled = false;
      setLoadingQR(true);
      fetchPromptPayQR(url)
        .then((res) => {
          if (!cancelled && res.success) {
            setPromptPayData(res.data);
          }
        })
        .catch((err) => {
          console.warn("Failed to load PromptPay QR", err);
        })
        .finally(() => {
          if (!cancelled) setLoadingQR(false);
        });
      return () => {
        cancelled = true;
      };
    }
  }, [paymentMethod, promptPayData, url]);

  const handleSlipChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("ไฟล์สลิปต้องมีขนาดไม่เกิน 5 MB");
      return;
    }
    setSlipFile(file);
    const reader = new FileReader();
    reader.onload = () => setSlipPreview(reader.result);
    reader.readAsDataURL(file);
    toast.success("แนบสลิปเรียบร้อยแล้ว", { richColors: true });
  };

  const handleRemoveSlip = () => {
    setSlipFile(null);
    setSlipPreview(null);
  };

  // Load saved address from user's account if available
  useEffect(() => {
    if (!user?._id) return;
    let cancelled = false;

    async function loadUserAddresses() {
      try {
        const res = await axios.get(`${url}/users/${user._id}`, {
          withCredentials: true,
        });
        const addrs = res.data?.data?.address || [];
        const validAddrs = addrs.filter(
          (a) => a && (a.houseNo || a.province || a.firstname),
        );
        if (cancelled) return;
        setSavedAddresses(validAddrs);

        const def = validAddrs.find((a) => a.isDefault) || validAddrs[0];
        if (def) {
          const name = [def.firstname, def.lastname].filter(Boolean).join(" ");
          setShippingForm((prev) => ({
            ...prev,
            fullName:
              name ||
              [user.firstname, user.lastname].filter(Boolean).join(" "),
            phoneNumber: String(
              def.phoneNumber || user.phoneNumber || prev.phoneNumber || "",
            ),
            province: def.province || prev.province,
            district: def.district || prev.district,
            subdistrict: def.subdistrict || prev.subdistrict,
            zipCode:
              def.zipCode != null
                ? String(def.zipCode)
                : prev.zipCode,
            houseAndStreet:
              [def.houseNo, def.street].filter(Boolean).join(" ") ||
              prev.houseAndStreet,
          }));
        } else if (user.firstname || user.phoneNumber) {
          setShippingForm((prev) => ({
            ...prev,
            fullName:
              [user.firstname, user.lastname].filter(Boolean).join(" ") ||
              prev.fullName,
            phoneNumber:
              String(user.phoneNumber || "") || prev.phoneNumber,
          }));
        }
      } catch (err) {
        console.warn("Could not load user addresses:", err);
      }
    }

    loadUserAddresses();
    return () => {
      cancelled = true;
    };
  }, [user, url]);

  const handleSelectSavedAddress = (addr) => {
    const name = [addr.firstname, addr.lastname].filter(Boolean).join(" ");
    setShippingForm({
      fullName:
        name || [user?.firstname, user?.lastname].filter(Boolean).join(" "),
      phoneNumber: String(addr.phoneNumber || user?.phoneNumber || ""),
      province: addr.province || "",
      district: addr.district || "",
      subdistrict: addr.subdistrict || "",
      zipCode: addr.zipCode != null ? String(addr.zipCode) : "",
      houseAndStreet: [addr.houseNo, addr.street].filter(Boolean).join(" "),
      isDefault: true,
      isDeliveryAddress: true,
      isReturnAddress: false,
    });
    toast.success("เลือกที่อยู่เรียบร้อยแล้ว", { richColors: true });
  };

  const items = data ?? [];
  const subtotal = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.product_id.price * item.quantity,
        0,
      ),
    [items],
  );
  const shipping = items.length > 0 ? DEFAULT_SHIPPING : 0;
  const grandTotal = subtotal + shipping;

  const handleCardChange = (field) => (e) => {
    const raw = e.target.value;
    const value =
      field === "number"
        ? formatCardNumber(raw)
        : field === "expiry"
          ? formatExpiry(raw)
          : field === "cvv"
            ? raw.replace(/\D/g, "").slice(0, 4)
            : raw;
    setCard((prev) => ({ ...prev, [field]: value }));
  };

  const handleBankChange = (field) => (e) => {
    const raw = e.target.value;
    const value =
      field === "accountNumber" ? raw.replace(/\D/g, "").slice(0, 15) : raw;
    setBank((prev) => ({ ...prev, [field]: value }));
  };

  const validateBeforeSubmit = () => {
    if (!shippingForm.fullName.trim()) {
      return "กรุณาระบุ ชื่อ นามสกุล ผู้รับ";
    }
    const cleanPhone = shippingForm.phoneNumber.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 9) {
      return "กรุณาระบุ หมายเลขโทรศัพท์ ผู้รับที่ถูกต้อง";
    }
    if (!shippingForm.province.trim()) {
      return "กรุณาระบุ จังหวัด";
    }
    if (!shippingForm.zipCode.trim() || shippingForm.zipCode.length < 5) {
      return "กรุณาระบุ รหัสไปรษณีย์ 5 หลัก";
    }
    if (!shippingForm.houseAndStreet.trim()) {
      return "กรุณาระบุ บ้านเลขที่, ซอย, ถนน หรือข้อมูลที่อยู่";
    }

    if (paymentMethod === "promptpay") {
      // PromptPay requires no card/bank validation
      return null;
    }

    if (paymentMethod === "bank_transfer") {
      if (!bank.bankName.trim()) return "Please select a bank.";
      if (bank.accountNumber.length < 8)
        return "Bank account number looks too short.";
      if (!bank.accountName.trim()) return "Please enter the account holder name.";
      if (!bank.consent)
        return "Please authorize automatic debit to continue.";
    } else {
      if (card.number.replace(/\s/g, "").length < 13)
        return "Card number looks incomplete.";
      if (!/^\d{2}\/\d{2}$/.test(card.expiry))
        return "Card expiry should be in MM/YY format.";
      if (card.cvv.length < 3) return "CVV looks incomplete.";
      if (!card.holderName.trim()) return "Please enter the cardholder name.";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateBeforeSubmit();
    if (validationError) {
      toast.error(validationError, { richColors: true });
      return;
    }

    const nameParts = (shippingForm.fullName || "").trim().split(/\s+/);
    const firstname = nameParts[0] || "Customer";
    const lastname = nameParts.slice(1).join(" ") || "-";

    const payloadShippingAddress = {
      firstname,
      lastname,
      phoneNumber: shippingForm.phoneNumber.trim(),
      houseNo: shippingForm.houseAndStreet.trim(),
      street: "",
      subdistrict: shippingForm.subdistrict.trim() || "-",
      district: shippingForm.district.trim() || "-",
      province: shippingForm.province.trim(),
      zipCode: shippingForm.zipCode.trim(),
    };

    setSubmitting(true);
    try {
      const result = await submitPayment(url, {
        shipping_address: payloadShippingAddress,
        payment_method: paymentMethod,
        card:
          paymentMethod === "card" || paymentMethod === "stripe"
            ? card
            : undefined,
        bank: paymentMethod === "bank_transfer" ? bank : undefined,
        slipFile: paymentMethod === "promptpay" ? slipFile : undefined,
      });

      // Optionally save to user's address book if isDefault is selected
      if (shippingForm.isDefault && user?._id) {
        try {
          await axios.patch(
            `${url}/users/${user._id}/address`,
            {
              address: {
                firstname,
                lastname,
                houseNo: shippingForm.houseAndStreet.trim(),
                street: "",
                subdistrict: shippingForm.subdistrict.trim() || "-",
                district: shippingForm.district.trim() || "-",
                province: shippingForm.province.trim(),
                zipCode: shippingForm.zipCode.trim(),
                isDefault: true,
              },
            },
            { withCredentials: true },
          );
        } catch {
          // ignore duplicate or non-fatal address update errors
        }
      }

      toast.success("Payment successful!", { richColors: true });
      navigate(`/order-confirmation/${result.data.order._id}`);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Payment could not be processed.",
        { richColors: true, duration: 6000 },
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (!loading && items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-100 px-4">
        <h1 className="text-2xl font-extrabold">Your cart is empty</h1>
        <p className="text-slate-400 text-sm">
          Add some gear to your cart before checking out.
        </p>
        <Button
          onClick={() => navigate("/products")}
          className="bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] text-slate-950 font-bold"
        >
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative z-10 text-slate-100 py-6 sm:py-10 px-3 sm:px-6 lg:px-12 font-sans antialiased">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white pb-6">
          Checkout
        </h1>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          {/* Left: shipping + payment */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="bg-[#121022] border-[#231e3d] rounded-2xl shadow-xl overflow-hidden">
              <CardContent className="p-5 sm:p-6">
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#231e3d]">
                  <h2 className="text-base sm:text-lg font-extrabold text-white flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-[#ec4899] to-[#a855f7]" />
                    ที่อยู่ในการจัดส่ง (Shipping Address)
                  </h2>
                </div>
                <ShippingAddressForm
                  shippingForm={shippingForm}
                  setShippingForm={setShippingForm}
                  savedAddresses={savedAddresses}
                  onSelectSavedAddress={handleSelectSavedAddress}
                />
              </CardContent>
            </Card>

            <Card className="bg-[#121022] border-[#231e3d] rounded-2xl">
              <CardContent className="p-6 space-y-5">
                <Label className="text-white font-bold">Payment Method</Label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {PAYMENT_METHODS.map((method) => {
                    const Icon = method.icon;
                    const selected = paymentMethod === method.id;
                    return (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setPaymentMethod(method.id)}
                        className={`text-left rounded-xl border p-3.5 transition-all cursor-pointer ${
                          selected
                            ? "border-cyan-400 bg-[#1f1938] shadow-[0_0_0_1px_rgba(6,182,212,0.6)]"
                            : "border-[#2e264f] bg-[#18152e] hover:border-purple-500/50"
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mb-2 ${
                            selected ? "text-cyan-300" : "text-slate-400"
                          }`}
                        />
                        <p className="text-xs font-bold text-white">
                          {method.label}
                        </p>
                        <p className="text-[11px] text-slate-400 line-clamp-1">
                          {method.description}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* 1. PromptPay Section */}
                {paymentMethod === "promptpay" && (
                  <div className="space-y-4 pt-2">
                    <div className="bg-[#18152e] border border-cyan-500/30 rounded-2xl p-5 text-center space-y-4 shadow-lg">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/40 text-blue-300 text-xs font-bold">
                        <QrCode className="w-3.5 h-3.5 text-cyan-400" />
                        <span>PromptPay (พร้อมเพย์)</span>
                      </div>

                      <p className="text-xs text-slate-300">
                        เปิดแอปธนาคารของคุณ (K PLUS, SCB EASY, Krungthai NEXT ฯลฯ)
                        แล้วสแกน QR Code ด้านล่างนี้เพื่อชำระเงิน
                      </p>

                      {loadingQR ? (
                        <div className="w-52 h-52 mx-auto rounded-2xl bg-[#121022] border border-[#2e264f] flex flex-col items-center justify-center gap-2 text-slate-400">
                          <Loader2 className="w-6 h-6 animate-spin text-cyan-400" />
                          <span className="text-xs">กำลังสร้าง QR Code...</span>
                        </div>
                      ) : promptPayData?.qrCode ? (
                        <div className="space-y-3">
                          <div className="inline-block p-3 rounded-2xl bg-white shadow-xl shadow-cyan-500/10 border-4 border-cyan-500/40">
                            <img
                              src={promptPayData.qrCode}
                              alt="PromptPay QR Code"
                              className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                            />
                          </div>
                          <div className="text-xs space-y-0.5 text-slate-300">
                            <p className="font-semibold text-white">
                              ชื่อบัญชี: {promptPayData.promptpayName}
                            </p>
                            <p className="font-mono text-slate-400">
                              พร้อมเพย์: {promptPayData.promptpayNumber}
                            </p>
                            <p className="text-sm font-black text-cyan-400 pt-1">
                              ยอดชำระ: ฿
                              {promptPayData.amountTHB?.toLocaleString()} THB{" "}
                              <span className="text-xs text-slate-400 font-normal">
                                (${grandTotal.toFixed(2)})
                              </span>
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-900/60 text-xs text-slate-400">
                          ไม่สามารถสร้าง QR Code ได้ กรุณาลองใหม่อีกครั้ง
                        </div>
                      )}

                      {/* Slip Upload */}
                      <div className="pt-3 border-t border-[#231e3d] text-left space-y-2">
                        <Label className="text-xs text-slate-300 font-bold flex items-center gap-1.5">
                          <Upload className="w-3.5 h-3.5 text-cyan-400" />
                          แนบสลิปหลักฐานการโอนเงิน (ไม่บังคับ)
                        </Label>

                        {slipPreview ? (
                          <div className="relative inline-block border border-emerald-500/40 rounded-xl overflow-hidden bg-[#121022]">
                            <img
                              src={slipPreview}
                              alt="Slip preview"
                              className="h-32 object-contain rounded-lg p-1"
                            />
                            <button
                              type="button"
                              onClick={handleRemoveSlip}
                              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-500 cursor-pointer shadow"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#2e264f] hover:border-cyan-500/50 rounded-xl p-4 cursor-pointer bg-[#121022]/60 transition-colors">
                            <Upload className="w-6 h-6 text-slate-400 mb-1" />
                            <span className="text-xs text-slate-300 font-medium">
                              คลิกเพื่ออัปโหลดสลิป
                            </span>
                            <span className="text-[10px] text-slate-500">
                              รองรับไฟล์ JPG, PNG (สูงสุด 5MB)
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleSlipChange}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. Stripe or Card Section */}
                {(paymentMethod === "card" || paymentMethod === "stripe") && (
                  <div className="space-y-4 pt-2">
                    {paymentMethod === "stripe" && (
                      <p className="text-xs text-slate-400 bg-[#18152e] border border-cyan-500/30 rounded-lg px-3 py-2 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span>
                          Secured by Stripe &mdash; รองรับบัตรเครดิต/เดบิตทั่วโลก
                          (ใส่เลขบัตรทดสอบ 4242 4242 4242 4242 ได้)
                        </span>
                      </p>
                    )}
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Card Number
                      </Label>
                      <Input
                        value={card.number}
                        onChange={handleCardChange("number")}
                        placeholder="4242 4242 4242 4242"
                        inputMode="numeric"
                        className="bg-[#18152e] border-[#2e264f] text-white font-mono tracking-wider"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">
                          Expiry (MM/YY)
                        </Label>
                        <Input
                          value={card.expiry}
                          onChange={handleCardChange("expiry")}
                          placeholder="12/29"
                          inputMode="numeric"
                          className="bg-[#18152e] border-[#2e264f] text-white font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300 text-xs">CVV</Label>
                        <Input
                          value={card.cvv}
                          onChange={handleCardChange("cvv")}
                          placeholder="123"
                          inputMode="numeric"
                          type="password"
                          className="bg-[#18152e] border-[#2e264f] text-white font-mono"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Cardholder Name
                      </Label>
                      <Input
                        value={card.holderName}
                        onChange={handleCardChange("holderName")}
                        placeholder="As shown on card"
                        className="bg-[#18152e] border-[#2e264f] text-white"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* 3. Bank Auto-Debit Section */}
                {paymentMethod === "bank_transfer" && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">Bank</Label>
                      <select
                        value={bank.bankName}
                        onChange={handleBankChange("bankName")}
                        className="w-full bg-[#18152e] border border-[#2e264f] text-white rounded-md px-3 py-2 text-sm"
                        required
                      >
                        <option value="">Select a bank</option>
                        <option value="Kasikornbank">
                          Kasikornbank (KBank)
                        </option>
                        <option value="Siam Commercial Bank">
                          Siam Commercial Bank (SCB)
                        </option>
                        <option value="Bangkok Bank">Bangkok Bank</option>
                        <option value="Krungthai Bank">Krungthai Bank</option>
                        <option value="TTB">TMBThanachart (TTB)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Account Number
                      </Label>
                      <Input
                        value={bank.accountNumber}
                        onChange={handleBankChange("accountNumber")}
                        placeholder="1234567890"
                        inputMode="numeric"
                        className="bg-[#18152e] border-[#2e264f] text-white font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300 text-xs">
                        Account Holder Name
                      </Label>
                      <Input
                        value={bank.accountName}
                        onChange={handleBankChange("accountName")}
                        placeholder="As shown on bank account"
                        className="bg-[#18152e] border-[#2e264f] text-white"
                        required
                      />
                    </div>
                    <label className="flex items-start gap-2 text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={bank.consent}
                        onChange={(e) =>
                          setBank((prev) => ({
                            ...prev,
                            consent: e.target.checked,
                          }))
                        }
                        className="mt-0.5"
                      />
                      <span>
                        I authorize GearVerse to automatically debit this bank
                        account for this order.
                      </span>
                    </label>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right: order summary */}
          <div className="lg:col-span-5 space-y-6">
            <Card className="bg-[#121022] border-[#231e3d] rounded-2xl">
              <CardContent className="p-6 space-y-4">
                <h2 className="text-lg font-extrabold text-white">
                  Order Summary
                </h2>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <img
                        src={item.product_id.image_url}
                        alt={item.product_id.product_name}
                        className="w-12 h-12 rounded-lg object-cover border border-[#2e264f]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-semibold truncate">
                          {item.product_id.product_name}
                        </p>
                        <p className="text-xs text-slate-400">
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-white">
                        ${(item.product_id.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <hr className="border-[#231e3d]" />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>Subtotal</span>
                    <span className="font-bold text-white">
                      ${subtotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5" /> Shipping
                    </span>
                    <span className="font-bold text-white">
                      ${shipping.toFixed(2)}
                    </span>
                  </div>
                </div>

                <hr className="border-[#231e3d]" />

                <div className="flex justify-between items-baseline">
                  <span className="text-lg font-extrabold text-white">
                    Total
                  </span>
                  <span className="text-2xl font-black text-white">
                    ${grandTotal.toFixed(2)}
                  </span>
                </div>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 h-auto rounded-xl font-black text-sm tracking-wider uppercase bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] text-slate-950 hover:brightness-110 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? "PROCESSING..." : `PAY $${grandTotal.toFixed(2)}`}
                </Button>

                <div className="flex items-center justify-center gap-1.5 text-slate-400 text-xs">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Payments are simulated for this demo</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#121022] border-[#231e3d] rounded-2xl">
              <CardContent className="p-4 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#a855f7]" />
                <p className="text-xs text-slate-400">
                  No real charge is made. Card/bank details are validated for
                  format only, never stored or sent to a real payment network.
                </p>
              </CardContent>
            </Card>
          </div>
        </form>
      </div>
    </div>
  );
}
