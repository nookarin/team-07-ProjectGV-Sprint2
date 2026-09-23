import React, { useEffect, useState } from "react";
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
  const { cart, setCart, addToCart, getCart, loading, data } = useCart();
  const handleLogout = () => {
    logout();
    navigate("/");
  };

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
              className={"border border-gbase-1 rounded-lg h-10"}
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
            <NavigationMenuTrigger
              className={"border border-gbase-1 rounded-lg h-10"}
              render={<Link to={"/cart"} />}
            >
              <ShoppingBag size={20} color="#22D3EE" />
            </NavigationMenuTrigger>
            <NavigationMenuContent className={"text-white"}>
              <div className="flex flex-col gap-4">
                {!loading &&
                  data?.map((item) => {
                    return (
                      <div
                        key={item.product_id._id}
                        className="flex gap-2 items-center"
                      >
                        <img
                          src={item.product_id.image_url}
                          alt=""
                          className="w-10 h-10 object-cover rounded-lg"
                        />
                        <div>
                          <p>{item.product_id.product_name}</p>
                          <p>Price: {item.product_id.price}</p>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <NavigationMenuLink className={"cursor-pointer"}>
                See More
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={"cursor-pointer"}>
              USD/THB
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default NavbarAuthenticate;
