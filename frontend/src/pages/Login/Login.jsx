import bgImage from "../../assets/bg-2-edited.jpg";
import { LuMail, LuEye, LuEyeClosed } from "react-icons/lu";
import { PiLockKeyBold } from "react-icons/pi";
import { IoEnter, IoGameControllerOutline } from "react-icons/io5";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { toast } from "sonner";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await login(data);
    if (response) {
      toast.success("Login successful.", {
        richColors: true,
        duration: 5000,
        position: "top-center",
      });
      navigate("/");
    }
  };

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
      className="min-h-[calc(100vh-4rem)] bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
    >
      <div className="bg-[#000000]/50 mt-30 mb-15 backdrop-blur-lg relative z-10 border border-gbase-1 flex flex-col justify-center gap-8 items-center p-10 w-full max-w-md rounded-2xl ">
        <IoGameControllerOutline className="w-12 h-12 text-purple-400 " />
        <div className="text-white font-extrabold text-5xl [-webkit-text-stroke:0.5px_#22D3EE] text-shadow-[0_0_32px_#22D3EE]">
          WELCOME
        </div>
        <div className="text-[#22D3EE]">Customer Login</div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 w-full p-4"
        >
          <div className="flex flex-col">
            <label className="text-white" for="email">
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
                onChange={onChangeHandler}
                required
              />
            </div>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <label className="text-white" for="password">
                Password
              </label>
              <label
                className="text-purple-400 text-xs cursor-pointer"
                for="password"
              >
                <button
                  type="button"
                  className="cursor-pointer"
                  onClick={() => navigate("/forgot-password")}
                >
                  Forgot Password?
                </button>
              </label>
            </div>
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
                value={data.password}
                name="password"
                onChange={onChangeHandler}
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

          <button
            className="px-4 py-2 text-white bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] rounded-md cursor-pointer"
            type="submit"
          >
            <div className="flex justify-center items-center gap-2">
              <span>LOGIN</span>
              <IoEnter />
            </div>
          </button>
        </form>
        {/* {err && (
          <div className="w-full text-center text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded-md py-2 px-4">
            {err}
          </div>
        )} */}
        <div className="border-t-2 border-gray-500 w-full pt-8 flex justify-center items-center">
          <span className="text-white">
            Don't have an account?{" "}
            <strong className="ml-2 text-[#22D3EE] cursor-pointer">
              <Link to="/register">Register</Link>
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
