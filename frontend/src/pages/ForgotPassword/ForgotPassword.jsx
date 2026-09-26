import { useState } from "react";
import bgImage from "../../assets/bg-2-edited.jpg";
import { LuMail } from "react-icons/lu";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { toast } from "sonner";

export default function ForgotPassword() {
  const { url } = useAuth();
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${url}/password/forgot`, { email });
      setSent(true);
      toast.success("ถ้าอีเมลนี้มีในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปแล้ว", {
        richColors: true,
        duration: 6000,
      });
    } catch (error) {
      toast.error("ส่งคำขอไม่สำเร็จ ลองใหม่อีกครั้ง", {
        richColors: true,
        duration: 5000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
      className="min-h-[calc(100vh-4rem)] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
    >
      <div className="bg-[#000000]/50 backdrop-blur-lg relative z-10 border border-gbase-1 flex flex-col justify-center gap-8 items-center p-10 w-full max-w-md rounded-2xl ">
        <div className="text-white font-extrabold text-4xl [-webkit-text-stroke:0.5px_#22D3EE] text-shadow-[0_0_32px_#22D3EE] text-center">
          FORGOT PASSWORD
        </div>
        <div className="text-[#22D3EE] text-center">
          กรอกอีเมลที่ใช้สมัคร แล้วเราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้
        </div>

        {sent ? (
          <div className="w-full text-center text-white text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-md py-4 px-4">
            ถ้าอีเมลนี้มีในระบบ เราได้ส่งลิงก์รีเซ็ตรหัสผ่านไปที่ {email} แล้ว
            กรุณาตรวจสอบกล่องจดหมาย
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-8 w-full p-4"
          >
            <div className="flex flex-col">
              <label className="text-white" htmlFor="email">
                Email Address
              </label>
              <div className="relative w-full">
                <LuMail
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 brightness-0 invert opacity-80"
                  alt="email icon"
                />
                <input
                  className="pl-10 py-2 rounded-md bg-[#2A2A45] text-white w-full autofill:shadow-[0_0_0_30px_#2A2A45_inset]
             autofill:[-webkit-text-fill-color:white]"
                  id="email"
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              className="px-4 py-2 text-white bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] rounded-md cursor-pointer disabled:opacity-60"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "SENDING..." : "SEND RESET LINK"}
            </button>
          </form>
        )}

        <div className="border-t-2 border-gray-500 w-full pt-8 flex justify-center items-center">
          <span className="text-white">
            Remembered your password?{" "}
            <strong className="ml-2 text-[#22D3EE] cursor-pointer">
              <Link to="/login">Log in</Link>
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
