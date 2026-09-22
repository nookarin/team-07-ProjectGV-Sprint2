import React, { useEffect, useState } from "react";
import LogoImg from "../../assets/Artboard1.png";
import LogoText from "../../assets/Untitled-2.png";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "#components/ui/navigation-menu";
import NavbarAuthenticate from "./NavbarAuthenticate";
import NavbarUnauthen from "./NavbarUnauthen";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import axios from "axios";

// const category = ["keyboard", "mouse", "headset", "accessory"];

const Navbar = () => {
  const [click, setClick] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, url } = useAuth();
  const [loading, setLoading] = useState(null);
  const [category, setCategory] = useState([]);
  const fetchData = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/categories/`);
    setCategory(response.data.categories);
    setLoading(false);
    console.log(response.data.categories);
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <nav className="bg-gbg-2 w-full h-16 flex items-center justify-between gap-4 px-4 sm:px-10 text-white relative z-20 shadow-xl shadow-gpurple-4/80">
      <Link to={"/"} className="flex items-center gap-2 sm:gap-4 shrink-0">
        <img className="w-10 h-10 shrink-0" src={LogoImg} alt="logo" />
        <img
          className="w-40 hidden sm:block"
          src={LogoText}
          alt="logo text"
        />
      </Link>

      {/* SECTION 2 — ซ่อนเมนูแนวนอนตอนจอแคบ ใช้ hamburger แทนกันตัวหนังสือทับกัน */}
      <NavigationMenu className={"hidden md:flex flex-1 justify-center"}>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink
              render={<Link to={"/products"} />}
              className={`active:text-gcyan-light`}
            >
              SHOP
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>COLLECTIONS</NavigationMenuTrigger>
            <NavigationMenuContent className={"text-white w-56"}>
              {!loading &&
                category?.map((item, index) => {
                  return (
                    <NavigationMenuLink
                      key={index}
                      render={
                        <Link
                          className="capitalize"
                          to={`products/${item.category_name}`}
                        />
                      }
                      className={"hover:bg-gbase-2"}
                    >
                      {item.category_name}
                    </NavigationMenuLink>
                  );
                })}
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink>NEW ARRIVALS</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={
                "border border-pink-300 text-pink-300 h-8 ml-4 rounded-lg"
              }
              render={<Link to={"/sale"} />}
            >
              SALE
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* SEC3 */}
      <div className="flex items-center gap-2 shrink-0">
        {user ? (
          <NavbarAuthenticate setClick={setClick} click={click} />
        ) : (
          <NavbarUnauthen />
        )}

        {/* Hamburger — โผล่เฉพาะจอแคบกว่า md */}
        <button
          type="button"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg hover:bg-gbase-2 cursor-pointer"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* เมนูมือถือ — แสดงเป็น panel เต็มความกว้างใต้ navbar แทนการยัดเรียงในแถวเดียว */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full bg-gbg-2 border-t border-white/10 flex flex-col p-4 gap-1 shadow-xl shadow-gpurple-4/80">
          <Link
            to={"/products"}
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg hover:bg-gbase-2"
          >
            SHOP
          </Link>
          <span className="px-3 pt-3 pb-1 text-xs tracking-widest text-gbase-1">
            COLLECTIONS
          </span>
          {!loading &&
            category?.map((item, index) => (
              <Link
                key={index}
                to={`products/${item.category_name}`}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-lg capitalize hover:bg-gbase-2"
              >
                {item.category_name}
              </Link>
            ))}
          <Link
            to={"/"}
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 rounded-lg hover:bg-gbase-2"
          >
            NEW ARRIVALS
          </Link>
          <Link
            to={"/sale"}
            onClick={() => setMobileMenuOpen(false)}
            className="mx-3 mt-2 px-3 py-2 text-center border border-pink-300 text-pink-300 rounded-lg"
          >
            SALE
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
