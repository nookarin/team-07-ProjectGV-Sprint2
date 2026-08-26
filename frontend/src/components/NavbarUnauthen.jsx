import React, { useState } from "react";
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
  LogOut,
  Search,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@base-ui/react";

const NavbarUnauthen = () => {
  const [click, setClick] = useState(true);
  return (
    <div className="w-1/5 flex justify-end ">
      <NavigationMenu>
        <NavigationMenuList className={"flex gap-2"}>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={`border border-[#1C1C24] rounded-lg h-10 ${click ? 'w-80 justify-between' : ''}`}
            >
              {click && <Input type="text" className="w-full border-b border-[#1C1C24] outline-0" />}
              <Search onClick={() => setClick(!click)} size={20} color="#22D3EE" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={
                "bg-pink-400 rounded-lg h-10 font-bold tracking-wide hover:bg-pink-500"
              }
            >
              LOGIN
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default NavbarUnauthen;
