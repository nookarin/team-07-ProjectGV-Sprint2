import { useState } from "react";
import {
  Sparkles,
  MapPin,
  Phone,
  User,
  Building,
  Check,
  ChevronDown,
  ChevronUp,
  BookmarkCheck,
  PlusCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { parseThaiAddress } from "./thaiAddressParser";

function ToggleSwitch({ checked, onChange, label, description }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-[#231e3d] last:border-b-0">
      <div className="space-y-0.5 pr-4">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        {description && (
          <p className="text-xs text-slate-400">{description}</p>
        )}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
          checked ? "bg-[#ec4899]" : "bg-slate-700"
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
            checked ? "translate-x-5" : "translate-x-0"
          }`}
        />
      </button>
    </div>
  );
}

export default function ShippingAddressForm({
  shippingForm,
  setShippingForm,
  savedAddresses = [],
  onSelectSavedAddress,
}) {
  const [pasteText, setPasteText] = useState("");
  const [showSavedList, setShowSavedList] = useState(false);

  const handleFieldChange = (field) => (e) => {
    const value = e.target.value;
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleToggle = (field) => (value) => {
    setShippingForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAutoFill = () => {
    if (!pasteText.trim()) {
      toast.error("กรุณาแปะข้อความที่อยู่ก่อนกดกรอกข้อมูลอัตโนมัติ", {
        richColors: true,
      });
      return;
    }

    const parsed = parseThaiAddress(pasteText);
    const hasAny =
      parsed.fullName ||
      parsed.phoneNumber ||
      parsed.province ||
      parsed.district ||
      parsed.subdistrict ||
      parsed.zipCode ||
      parsed.houseAndStreet;

    if (!hasAny) {
      toast.error("ไม่สามารถแยกข้อมูลได้ กรุณากรอกในช่องด้านล่างโดยตรง", {
        richColors: true,
      });
      return;
    }

    setShippingForm((prev) => ({
      ...prev,
      fullName: parsed.fullName || prev.fullName,
      phoneNumber: parsed.phoneNumber || prev.phoneNumber,
      province: parsed.province || prev.province,
      district: parsed.district || prev.district,
      subdistrict: parsed.subdistrict || prev.subdistrict,
      zipCode: parsed.zipCode || prev.zipCode,
      houseAndStreet: parsed.houseAndStreet || prev.houseAndStreet,
    }));

    toast.success("แยกและกรอกข้อมูลที่อยู่เรียบร้อยแล้ว!", {
      richColors: true,
      icon: <Sparkles className="w-4 h-4 text-emerald-400" />,
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Header / Saved Address Selector */}
      {savedAddresses.length > 0 && (
        <div className="bg-[#18152e] border border-[#2e264f] rounded-xl p-3 sm:p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <BookmarkCheck className="w-4 h-4 text-[#a855f7]" />
              <span>ที่อยู่ที่บันทึกไว้ ({savedAddresses.length})</span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowSavedList((prev) => !prev)}
              className="text-xs text-[#a855f7] hover:text-[#c084fc] hover:bg-[#22173d] h-8 px-2.5"
            >
              {showSavedList ? (
                <>
                  ซ่อน <ChevronUp className="w-3.5 h-3.5 ml-1" />
                </>
              ) : (
                <>
                  เลือกที่อยู่เดิม <ChevronDown className="w-3.5 h-3.5 ml-1" />
                </>
              )}
            </Button>
          </div>

          {showSavedList && (
            <div className="mt-3 space-y-2 pt-3 border-t border-[#231e3d]">
              {savedAddresses.map((addr, idx) => (
                <div
                  key={addr._id || idx}
                  onClick={() => {
                    onSelectSavedAddress(addr);
                    setShowSavedList(false);
                  }}
                  className="p-3 rounded-lg border border-[#2e264f] bg-[#121022] hover:border-[#a855f7] cursor-pointer transition-all flex items-start justify-between gap-3 text-left"
                >
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-white">
                      {addr.firstname} {addr.lastname}
                      {addr.isDefault && (
                        <span className="ml-2 text-[10px] bg-[#ec4899]/20 text-[#f472b6] border border-[#ec4899]/40 px-1.5 py-0.5 rounded">
                          ค่าเริ่มต้น
                        </span>
                      )}
                    </p>
                    <p className="text-slate-300">
                      {[
                        addr.houseNo,
                        addr.street,
                        addr.subdistrict,
                        addr.district,
                        addr.province,
                        addr.zipCode,
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    </p>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs bg-[#22173d] text-[#c084fc] hover:bg-[#311f56]"
                  >
                    เลือก
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Box 1: Quick Paste / Auto Fill (แปะข้อมูลที่อยู่) */}
      <div className="rounded-2xl border border-rose-500/30 bg-gradient-to-b from-rose-950/20 via-[#18152e] to-[#121022] p-4 sm:p-5 space-y-3 shadow-inner">
        <div className="flex items-start gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-rose-200 flex items-center gap-1.5">
              แปะข้อมูลที่อยู่
            </h3>
            <p className="text-xs text-rose-200/70">
              แปะข้อมูลที่อยู่ของคุณในช่องนี้ เพื่อกรอกข้อมูลโดยอัตโนมัติ
            </p>
          </div>
        </div>

        <Textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="แปะข้อมูลที่อยู่ของคุณในช่องนี้ จากนั้นกดปุ่มกรอกข้อมูล เพื่อเพิ่มชื่อ เบอร์โทรศัพท์ และที่อยู่ของคุณในช่องโดยอัตโนมัติ"
          className="bg-[#121022]/90 border-rose-500/30 text-white placeholder:text-slate-500 text-xs sm:text-sm min-h-[72px] resize-y rounded-xl focus-visible:ring-rose-500/50"
        />

        <div className="flex justify-end">
          <Button
            type="button"
            onClick={handleAutoFill}
            size="sm"
            className="bg-gradient-to-r from-rose-500 via-pink-500 to-purple-600 hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            กรอกข้อมูลอัตโนมัติ
          </Button>
        </div>
      </div>

      {/* Box 2: Address Fields (ที่อยู่) */}
      <div className="space-y-4 pt-1">
        <div className="flex items-center gap-2 pb-1 border-b border-[#231e3d]">
          <MapPin className="w-4 h-4 text-[#a855f7]" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            ที่อยู่
          </h3>
        </div>

        {/* ชื่อ นามสกุล */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300 font-medium">
            ชื่อ นามสกุล <span className="text-rose-400">*</span>
          </Label>
          <div className="relative">
            <Input
              value={shippingForm.fullName}
              onChange={handleFieldChange("fullName")}
              placeholder="ชื่อ นามสกุล"
              className="bg-[#18152e] border-[#2e264f] text-white pl-9 text-sm"
              required
            />
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* หมายเลขโทรศัพท์ */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300 font-medium">
            หมายเลขโทรศัพท์ <span className="text-rose-400">*</span>
          </Label>
          <div className="relative">
            <Input
              value={shippingForm.phoneNumber}
              onChange={handleFieldChange("phoneNumber")}
              placeholder="หมายเลขโทรศัพท์ (เช่น 0812345678)"
              inputMode="tel"
              className="bg-[#18152e] border-[#2e264f] text-white pl-9 text-sm font-mono"
              required
            />
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* จังหวัด, เขต/อำเภอ, แขวง/ตำบล, รหัสไปรษณีย์ */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300 font-medium">
            จังหวัด, เขต/อำเภอ, แขวง/ตำบล, รหัสไปรษณีย์{" "}
            <span className="text-rose-400">*</span>
          </Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <Input
              value={shippingForm.province}
              onChange={handleFieldChange("province")}
              placeholder="จังหวัด (เช่น กรุงเทพมหานคร)"
              className="bg-[#18152e] border-[#2e264f] text-white text-sm"
              required
            />
            <Input
              value={shippingForm.district}
              onChange={handleFieldChange("district")}
              placeholder="เขต / อำเภอ (เช่น วัฒนา)"
              className="bg-[#18152e] border-[#2e264f] text-white text-sm"
              required
            />
            <Input
              value={shippingForm.subdistrict}
              onChange={handleFieldChange("subdistrict")}
              placeholder="แขวง / ตำบล (เช่น คลองตันเหนือ)"
              className="bg-[#18152e] border-[#2e264f] text-white text-sm"
            />
            <Input
              value={shippingForm.zipCode}
              onChange={handleFieldChange("zipCode")}
              placeholder="รหัสไปรษณีย์ (เช่น 10110)"
              inputMode="numeric"
              maxLength={5}
              className="bg-[#18152e] border-[#2e264f] text-white text-sm font-mono"
              required
            />
          </div>
        </div>

        {/* บ้านเลขที่, ซอย, หมู่, ถนน, แขวง/ตำบล */}
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300 font-medium">
            บ้านเลขที่, ซอย, หมู่, ถนน, แขวง/ตำบล{" "}
            <span className="text-rose-400">*</span>
          </Label>
          <div className="relative">
            <Input
              value={shippingForm.houseAndStreet}
              onChange={handleFieldChange("houseAndStreet")}
              placeholder="บ้านเลขที่, ซอย, หมู่, ถนน, อาคาร/ห้อง"
              className="bg-[#18152e] border-[#2e264f] text-white pl-9 text-sm"
              required
            />
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Box 3: Toggles / Switches (ตัวเลือกสถานะที่อยู่) */}
      <div className="pt-2 border-t border-[#231e3d] space-y-1">
        <ToggleSwitch
          checked={shippingForm.isDefault}
          onChange={handleToggle("isDefault")}
          label="เลือกเป็นที่อยู่ตั้งต้น"
          description="บันทึกเป็นที่อยู่หลักในการสั่งซื้อครั้งต่อไป"
        />
        <ToggleSwitch
          checked={shippingForm.isDeliveryAddress}
          onChange={handleToggle("isDeliveryAddress")}
          label="ตั้งเป็นที่อยู่ในการรับสินค้า"
        />
        <ToggleSwitch
          checked={shippingForm.isReturnAddress}
          onChange={handleToggle("isReturnAddress")}
          label="ตั้งเป็นที่อยู่ในการรับสินค้าคืน"
        />
      </div>
    </div>
  );
}
