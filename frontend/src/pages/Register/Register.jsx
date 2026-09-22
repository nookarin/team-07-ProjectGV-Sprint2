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
import { data, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { toast } from "sonner";

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { url } = useAuth();
  const [data, setData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    password: "",
    confirmpassword: "",
  });

  const register = async (data) => {
    const response = await axios.post(`${url}/users/register`, data);
    if (response.data.success) {
      navigate("/login");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(e);
    if (data.confirmpassword !== data.password) {
      toast.error("Passwords do not match!", {
        position: "top-center",
        style: {
          background: "#12121A",
          color: "#fb2c36",
          border: "1px solid #fb2c36",
          borderRadius: "10px",
        },
      });
    }

    const submitData = {
      firstname: data.firstname,
      lastname: data.lastname,
      email: data.email,
      password: data.password,
    };

    register(submitData);
  };

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };
  return (
    <div
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${bgImage})`,
      }}
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
    >
      <div className="bg-[#000000]/50 backdrop-blur-lg relative z-10  border border-gbase-1 flex flex-col justify-center gap-8 items-center p-10 w-full max-w-lg rounded-2xl ">
        <div className="text-[#22D3EE]">Ready To Level Up?</div>
        <div className="text-white font-extrabold text-5xl [-webkit-text-stroke:0.5px_#22D3EE] text-shadow-[0_0_32px_#22D3EE]">
          JOIN GEARVERSE
        </div>
        <div className="text-white">Create Your Account</div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-8 p-4 w-full"
        >
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
                  oninput="this.value = this.value.replace(/\s+/g, '');"
                  name="firstname"
                  onChange={onChangeHandler}
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
                  oninput="this.value = this.value.replace(/\s+/g, '');"
                  onChange={onChangeHandler}
                  name="lastname"
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
                oninput="this.value = this.value.replace(/\s+/g, '');"
                name="email"
                onChange={onChangeHandler}
                required
              ></input>
            </div>
          </div>

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
                oninput="this.value = this.value.replace(/\s+/g, '');"
                value={data.password}
                onChange={onChangeHandler}
                name="password"
                minlength="6"
                maxlength="20"
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
                oninput="this.value = this.value.replace(/\s+/g, '');"
                value={data.confirmpassword}
                onChange={onChangeHandler}
                name="confirmpassword"
                minlength="6"
                maxlength="20"
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
              {data.confirmpassword &&
                data.password !== data.confirmpassword && (
                  <p className="absolute left-0 top-full mt-1 text-xs text-red-500">
                    Passwords do not match!
                  </p>
                )}
            </div>
          </div>

          <label className="flex items-center gap-2 text-white">
            <input type="checkbox" className="mr-2 cursor-pointer" required />
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
            CREATE AN ACCOUNT
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
