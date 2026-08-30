import { useState } from "react";
import bgImage from "../../assets/bg-2-edited.jpg";
import {
  LuUserRoundPen,
  LuSpellCheck,
  LuMail,
  LuEye,
  LuEyeClosed,
} from "react-icons/lu";
import { PiLockKeyBold } from "react-icons/pi";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [Password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
    >
      <div className="bg-[#000000]/50 backdrop-blur-lg  flex flex-col justify-center gap-8 items-center p-10 w-full max-w-lg rounded-2xl ">
        <div className="text-[#22D3EE]">Ready To Level Up?</div>
        <div className="text-white font-extrabold text-5xl [-webkit-text-stroke:0.5px_#22D3EE] text-shadow-[0_0_32px_#22D3EE]">
          JOIN GEARVERSE
        </div>
        <div className="text-white">Create Your Account</div>
        <form className="flex flex-col gap-8 p-4 w-full">
          <div className="flex flex-row gap-1.5 ">
            <div className="flex flex-col w-full min-w-0">
              <label className="text-white" for="firstname">
                First name
              </label>
              <div className="relative w-full">
                <LuUserRoundPen
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 brightness-0 invert opacity-80"
                  alt="user icon"
                />
                <input
                  className=" pl-10 py-2 rounded-md bg-[#2A2A45] text-white w-full min-w-0 autofill:shadow-[0_0_0_30px_#2A2A45_inset] 
             autofill:[-webkit-text-fill-color:white]"
                  id="firstname"
                  type="text"
                  required
                ></input>
              </div>
            </div>
            <div className="flex flex-col w-full min-w-0">
              <label className="text-white" for="lastname">
                Last name
              </label>
              <div className="relative w-full">
                <LuUserRoundPen
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 brightness-0 invert opacity-80"
                  alt="user icon"
                />
                <input
                  className=" pl-10 py-2 rounded-md bg-[#2A2A45] text-white w-full min-w-0 autofill:shadow-[0_0_0_30px_#2A2A45_inset] 
             autofill:[-webkit-text-fill-color:white]"
                  id="lastname"
                  type="text"
                  required
                ></input>
              </div>
            </div>
          </div>
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
                onBlur={(e) => {
                  const value = e.target.value;
                  if (value && !emailRegex.test(value)) {
                    setEmailError("The email format is incorrect!");
                  } else {
                    setEmailError("");
                  }
                }}
                required
              ></input>
            </div>
          </div>
          {emailError && <div></div>}
          <div className="flex flex-col">
            <label className="text-white" for="password">
              Password
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
          <div className="flex flex-col">
            <label className="text-white" for="confirm-password">
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
                required
              ></input>
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
          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" className="mr-2 cursor-pointer" />
            <span>
              I agree to the{" "}
              <a className="text-[#22D3EE] cursor-pointer">Terms of Service</a>{" "}
              and{" "}
              <a className="text-[#22D3EE] cursor-pointer">Privacy Policy</a>.
            </span>
          </label>
          <button
            className="px-4 py-2 text-white bg-gradient-to-r from-[#ec4899] via-[#a855f7] to-[#06b6d4] rounded-md cursor-pointer"
            type="submit"
          >
            INITIALIZE ACCOUNT
          </button>
        </form>
        <div className="border-t-2 border-gray-500 w-full pt-8 flex justify-center items-center">
          <span className="text-white">
            Already have an account?{" "}
            <strong className="ml-2 text-[#22D3EE] cursor-pointer">
              <Link to="/login">Log in</Link>
            </strong>
          </span>
        </div>
      </div>
    </div>
  );
}
