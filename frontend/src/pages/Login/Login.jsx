import bgImage from "../../assets/bg-2-edited.jpg";
import { LuMail, LuEye, LuEyeClosed } from "react-icons/lu";
import { PiLockKeyBold } from "react-icons/pi";
import { IoEnter, IoGameControllerOutline } from "react-icons/io5";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [Password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
    >
      <div className="bg-[#000000]/50 backdrop-blur-lg  flex flex-col justify-center gap-8 items-center p-10 w-full max-w-md rounded-2xl ">
        <IoGameControllerOutline className="w-12 h-12 text-purple-400 " />
        <div className="text-white font-extrabold text-5xl [-webkit-text-stroke:0.5px_#22D3EE] text-shadow-[0_0_32px_#22D3EE]">
          WELCOME
        </div>
        <div className="text-[#22D3EE]">Access Your Armory</div>
        <form className="flex flex-col gap-8 w-full p-4">
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
                required
              ></input>
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
                Forgot Password?
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
                value={Password}
                onChange={(e) => setPassword(e.target.value)}
                required
              ></input>
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
