import React from "react";
import LogoImg from "../../assets/Artboard1.png";
import LogoText from "../../assets/Untitled-2.png";
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
import NavbarAuthenticate from "./NavbarAuthenticate";
import NavbarUnauthen from "./NavbarUnauthen";

const category = ['keyboard', 'mouse', 'headset', 'accessory']

const Navbar = () => {
  
  return (
    <nav className="bg-gbg-2 w-full h-16 flex items-center justify-between px-10 text-white relative z-10 shadow-xl shadow-gpurple-4/80">
      <Link to={"/"} className="flex items-center gap-4">
        <img className="w-10 h-10" src={LogoImg} alt="logo" />
        <img className="w-40" src={LogoText} alt="logo text" />
      </Link>
      {/* SECTION 2 */}
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink render={<Link to={"/products"} />} className={`active:text-gcyan-light`}>SHOP</NavigationMenuLink>
            {/* <NavigationMenuTrigger>SHOP</NavigationMenuTrigger>
            <NavigationMenuContent>
              <NavigationMenuLink>Link</NavigationMenuLink>
            </NavigationMenuContent> */}
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger>COLLECTIONS</NavigationMenuTrigger>
            <NavigationMenuContent className={'text-white'}>
              { category.map((item) => {
                return (
                  <NavigationMenuLink><Link to={`products/${item}`}>{item}</Link></NavigationMenuLink>
                )
              })}
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
      
      {!true ? <NavbarAuthenticate /> : <NavbarUnauthen />}
    </nav>
  );
};

export default Navbar;
