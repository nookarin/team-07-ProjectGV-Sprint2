import React from "react";
import { Link } from "react-router-dom";
import LogoImg from "../../assets/Artboard1.png";
import LogoText from "../../assets/Untitled-2.png";
import { CircleSmall } from "lucide-react";
const NavbarAdmin = () => {
  return (
    <nav>
      <div className="flex items-center p-4">
        <Link to={"/"} className="flex items-center gap-4">
          <img className="w-10 h-10" src={LogoImg} alt="logo" />
          <img className="w-40" src={LogoText} alt="logo text" />
        </Link>
        <h3 className="flex items-center gap-2 text-xl font-bold tracking-wide text-shadow-md text-shadow-white/55 text-white">
          <CircleSmall className="fill-white" size={12} />
          Admin
        </h3>
      </div>
      <div></div>
    </nav>
  );
};

export default NavbarAdmin;
