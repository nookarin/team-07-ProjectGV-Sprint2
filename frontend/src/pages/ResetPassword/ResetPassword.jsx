import { useState } from "react";
import bgImage from "../../assets/bg-2-edited.jpg";
import { LuEye, LuEyeClosed, LuSpellCheck } from "react-icons/lu";
import { PiLockKeyBold } from "react-icons/pi";
import { Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { toast } from "sonner";

export default function ResetPassword() {
  const { url } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("รหัสผ่านทั้งสองช่องไม่ตรงกัน", {
        richColors: true,
        duration: 5000,
      });
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${url}/password/reset/${token}`, {
        password,
        confirmPassword,
      });
      toast.success("ตั้งรหัสผ่านใหม่สำเร็จ กรุณาเข้าสู่ระบบอีกครั้ง", {
        richColors: true,
        duration: 5000,
      });
      navigate("/login");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "ลิงก์นี้หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่",
        { richColors: true, duration: 6000 },
      );
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
          RESET PASSWORD
        </div>
        <div className="text-[#22D3EE] text-center">ตั้งรหัสผ่านใหม่ของคุณ</div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8 w-full p-4">
          <div className="flex flex-col">
            <label className="text-white" htmlFor="password">
              New Password
            </label>
            <div className="relative w-full">
              <PiLockKeyBold
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 brightness-0 invert opacity-80"
                alt="password icon"
              />
              <input
                className="pr-10 pl-10 py-2 rounded-md bg-[#2A2A45] text-white w-full autofill:shadow-[0_0_0_30px_#2A2A45_inset]
             autofill:[-webkit-text-fill-color:white]"
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                maxLength={20}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white focus:outline-none"
              >
                {showPassword ? (
                  <LuEyeClosed className="w-5 h-5 cursor-pointer" />
                ) : (
                  <LuEye className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          <div className="flex flex-col">
            <label className="text-white" htmlFor="confirm-password">
              Confirm Password
            </label>
            <div className="relative w-full">
              <LuSpellCheck
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 brightness-0 invert opacity-80"
                alt="checked password icon"
              />
              <input
                className="pr-10 pl-10 py-2 rounded-md bg-[#2A2A45] text-white w-full autofill:shadow-[0_0_0_30px_#2A2A45_inset]
             autofill:[-webkit-text-fill-color:white]"
                id="confirm-password"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={6}
                maxLength={20}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/80 hover:text-white focus:outline-none"
              >
                {showConfirmPassword ? (
                  <LuEyeClosed className="w-5 h-5 cursor-pointer" />
                ) : (
                  <LuEye className="w-5 h-5 cursor-pointer" />
                )}
              </button>
            </div>
          </div>

          <button
            className="px-4 py-2 text-white bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] rounded-md cursor-pointer disabled:opacity-60"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "SAVING..." : "SET NEW PASSWORD"}
          </button>
        </form>

        <div className="border-t-2 border-gray-500 w-full pt-8 flex justify-center items-center">
          <span className="text-white">
            Back to{" "}
            <strong className="ml-2 text-[#22D3EE] cursor-pointer">
              <Link to="/login">Log in</Link>
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
