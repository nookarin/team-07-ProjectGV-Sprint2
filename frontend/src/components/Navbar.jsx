import React from "react";
import LogoImg from "../assets/Artboard1.png";
import LogoText from "../assets/Untitled-2.png";
import {
  Menubar,
  MenubarCheckboxItem,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "#components/ui/menubar";
import { CircleUser, CircleX, LogOut, Search, ShoppingBag, Star, User } from "lucide-react";
import { Link } from "react-router-dom";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "#components/ui/navigation-menu"

const Navbar = () => {
  return (
    <nav className="bg-[#12121A] w-full h-16 flex items-center justify-between px-10 text-white relative z-10 shadow-xl shadow-[#5B21B6]">
      <Link to={"/"} className="flex items-center gap-4">
        <img className="w-10 h-10" src={LogoImg} alt="logo" />
        <img className="w-40" src={LogoText} alt="logo text" />
      </Link>
      {/* SECTION 2 */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>SHOP</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>COLLECTIONS</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink>NEW ARRIVALS</NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink className={'border border-pink-300 text-pink-300 h-8 rounded-lg'}>SALE</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      {/* SEC3 */}
      
      <NavigationMenu>
        <NavigationMenuList className={'flex gap-2'}>
          <NavigationMenuItem>
              <NavigationMenuLink className={'border border-[#1C1C24] rounded-lg h-10'}><Search size={20} color="#22D3EE" /></NavigationMenuLink>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={'border border-[#1C1C24] rounded-lg h-10'}><User size={20} color="#22D3EE" className="mr-2" />PROFILE</NavigationMenuTrigger>
            <NavigationMenuContent className={'w-52'}>
              <NavigationMenuLink render={<Link to={'/edit-profile'} />} className={'text-white gap-4 hover:bg-[#2a2a452f]'}><CircleUser color="#6B6B8D" />My Account</NavigationMenuLink>
              <NavigationMenuLink render={<Link to={'/my-purchases'} />} className={'text-white gap-4 hover:bg-[#2a2a452f]'}><ShoppingBag color="#6B6B8D" />My Order</NavigationMenuLink>
              <NavigationMenuLink render={<Link to={'/my-reviews'} />} className={'text-white gap-4 hover:bg-[#2a2a452f]'}><Star color="#6B6B8D" />My Reviews</NavigationMenuLink>
              <NavigationMenuLink render={<Link to={'/my-cancellations'} />} className={'text-white gap-4 hover:bg-[#2a2a452f]'}><CircleX color="#6B6B8D" />My Returns</NavigationMenuLink>
              <hr className="w-full my-2 border-[#ffffff1f]" />
              {/* // add logout link under here */}
              <NavigationMenuLink zrender={<Link to={'/edit-profile'} />} className={'text-white gap-4 hover:bg-[#2a2a452f]'}><LogOut color="#6B6B8D" />Logout</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={'border border-[#1C1C24] rounded-lg h-10'}><ShoppingBag size={20} color="#22D3EE" /></NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuLink>USD/THB</NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </nav>
  );
};

export default Navbar;
