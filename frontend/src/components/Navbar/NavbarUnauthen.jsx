import React, { useState } from "react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "#components/ui/navigation-menu";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@base-ui/react";

const NavbarUnauthen = () => {
  const [click, setClick] = useState(false);
  return (
    <div className="w-1/5 flex justify-end ">
      <NavigationMenu>
        <NavigationMenuList className={"flex gap-2"}>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={`border border-gbase-2 rounded-lg h-10 ${click && "w-80 justify-between"}`}
            >
              {click && (
                <Input
                  type="text"
                  className="w-full border-b border-gbase-2 outline-0"
                />
              )}
              <div onClick={() => setClick(!click)} className="h-8 w-8 flex justify-center items-center">
                <Search color="#22D3EE" strokeWidth={3} />
              </div>
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={
                "bg-gpink-2 rounded-lg h-10 font-bold tracking-wide hover:bg-gpink-3"
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
