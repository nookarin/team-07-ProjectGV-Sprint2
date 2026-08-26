import React from "react";
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

const NavbarAuthenticate = () => {
  return (
    <div className="w-1/5 flex justify-end">
      <NavigationMenu>
        <NavigationMenuList className={"flex gap-2"}>
          <NavigationMenuItem>
            <NavigationMenuLink
              className={"border border-[#1C1C24] rounded-lg h-10"}
            >
              <Search size={20} color="#22D3EE" />
            </NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={"border border-[#1C1C24] rounded-lg h-10"}
            >
              <User size={20} color="#22D3EE" className="mr-2" />
              PROFILE
            </NavigationMenuTrigger>
            <NavigationMenuContent className={"w-52"}>
              <NavigationMenuLink
                render={<Link to={"/edit-profile"} />}
                className={"text-white gap-4 hover:bg-[#2a2a452f]"}
              >
                <CircleUser color="#6B6B8D" />
                My Account
              </NavigationMenuLink>
              <NavigationMenuLink
                render={<Link to={"/my-purchases"} />}
                className={"text-white gap-4 hover:bg-[#2a2a452f]"}
              >
                <ShoppingBag color="#6B6B8D" />
                My Order
              </NavigationMenuLink>
              <NavigationMenuLink
                render={<Link to={"/my-reviews"} />}
                className={"text-white gap-4 hover:bg-[#2a2a452f]"}
              >
                <Star color="#6B6B8D" />
                My Reviews
              </NavigationMenuLink>
              <NavigationMenuLink
                render={<Link to={"/my-cancellations"} />}
                className={"text-white gap-4 hover:bg-[#2a2a452f]"}
              >
                <CircleX color="#6B6B8D" />
                My Returns
              </NavigationMenuLink>
              <hr className="w-full my-2 border-[#ffffff1f]" />
              {/* // add logout link under here */}
              <NavigationMenuLink
                zrender={<Link to={"/edit-profile"} />}
                className={"text-white gap-4 hover:bg-[#2a2a452f]"}
              >
                <LogOut color="#6B6B8D" />
                Logout
              </NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger
              className={"border border-[#1C1C24] rounded-lg h-10"}
            >
              <ShoppingBag size={20} color="#22D3EE" />
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink>USD/THB</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
};

export default NavbarAuthenticate;
