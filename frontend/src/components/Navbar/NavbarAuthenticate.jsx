import React, { useEffect, useRef, useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "#components/ui/navigation-menu";
import {
  CircleUser,
  CircleX,
  Heart,
  LogOut,
  Search,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { useCart } from "@/contexts/Cart/CartProvider";
import axios from "axios";

const NavbarAuthenticate = ({ setClick, click }) => {
  const navigate = useNavigate();
  const { url, logout, user } = useAuth();
  const { cartCount, drawerOpen, openDrawer } = useCart();
  const [badgeBump, setBadgeBump] = useState(0);
  const previousCount = useRef(cartCount);
  const handleLogout = () => {
    logout();
    navigate("/");
  };

  useEffect(() => {
    if (cartCount > previousCount.current) {
      setBadgeBump((bump) => bump + 1);
    }
    previousCount.current = cartCount;
  }, [cartCount]);

  const cartButton = (
    <button
      type="button"
      onClick={openDrawer}
      aria-haspopup="dialog"
      aria-expanded={drawerOpen}
      className="relative border border-gbase-1 rounded-lg h-10 px-3 flex items-center gap-2 hover:bg-gbase-2 transition-colors"
    >
      <span className="relative flex items-center">
        <ShoppingBag size={20} color="#22D3EE" />
        {cartCount > 0 && (
          <span
            key={badgeBump}
            className={`absolute -top-2 -right-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gpink-2 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-gbg-2 ${
              badgeBump > 0 ? "animate-[bounce_0.6s_ease-out_1]" : ""
            }`}
          >
            {cartCount > 99 ? "99+" : cartCount}
          </span>
        )}
      </span>
      My Cart
    </button>
  );

  return (
    <div className="flex justify-end shrink-0">
      <NavigationMenu>
        <NavigationMenuList className={"flex gap-2"}>
          {/* <NavigationMenuItem>
            <NavigationMenuLink
              className={"border border-gbase-1 rounded-lg h-10"}
            >
              <Search size={20} color="#22D3EE" />
            </NavigationMenuLink>
          </NavigationMenuItem> */}
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={"border border-gbase-1 rounded-lg h-10 hover:bg-gbase-2"}
            >
              <User size={20} color="#22D3EE" className="mr-2" />
              PROFILE
            </NavigationMenuTrigger>
            <NavigationMenuContent className={"w-52"}>
              <NavigationMenuLink
                render={<Link to={"/edit-profile"} />}
                className={"text-white gap-4 hover:bg-gbase-3"}
              >
                <CircleUser color="#6B6B8D" />
                My Account
              </NavigationMenuLink>
              <NavigationMenuLink
                render={<Link to={"/my-purchases"} />}
                className={"text-white gap-4 hover:bg-gbase-3"}
              >
                <ShoppingBag color="#6B6B8D" />
                My Order
              </NavigationMenuLink>
              <NavigationMenuLink
                render={<Link to={"/my-reviews"} />}
                className={"text-white gap-4 hover:bg-gbase-3"}
              >
                <Star color="#6B6B8D" />
                My Reviews
              </NavigationMenuLink>
              <NavigationMenuLink
                render={<Link to={"/my-cancellations"} />}
                className={"text-white gap-4 hover:bg-gbase-3"}
              >
                <CircleX color="#6B6B8D" />
                My Returns
              </NavigationMenuLink>
              {/* Wishlist link - routes to the user's wishlist page */}
              <NavigationMenuLink
                render={<Link to={"/wishlists"} />}
                className={"text-white gap-4 hover:bg-gbase-3"}
              >
                <Heart color="#6B6B8D" />
                My Wishlist
              </NavigationMenuLink>
              <hr className="w-full my-2 border-[#ffffff1f]" />
              {/* // add logout link under here */}
              <NavigationMenuLink
                className={"text-white gap-4 hover:bg-gbase-3 cursor-pointer"}
                onClick={handleLogout}
              >
                <LogOut color="#6B6B8D" />
                Logout
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={"cursor-pointer hidden xl:block"}>
              USD/THB
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
      {cartButton}
    </div>
  );
};

export default NavbarAuthenticate;
