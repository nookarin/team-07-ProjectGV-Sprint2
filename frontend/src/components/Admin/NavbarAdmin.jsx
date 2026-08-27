import React from "react";
import { Link } from "react-router-dom";
import LogoImg from "../../assets/Artboard1.png";
import LogoText from "../../assets/Untitled-2.png";
import { CircleSmall } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
const NavbarAdmin = () => {
  return (
    <nav className="flex items-center justify-between px-6 py-4 relative shadow-xl shadow-gpurple-5/20">
      <div className="flex items-center">
        <Link to={"/"} className="flex items-center gap-4">
          <img className="w-10 h-10" src={LogoImg} alt="logo" />
          <img className="w-40" src={LogoText} alt="logo text" />
        </Link>
        <h3 className="flex items-center gap-2 text-xl font-bold tracking-wide text-shadow-md text-shadow-white/55 text-white">
          <CircleSmall className="fill-white" size={12} />
          Admin
        </h3>
      </div>
      <div>
        <DropdownMenu>
          <DropdownMenuTrigger className={"text-white h-14"} render={<Button className={'bg-gbase-3 ring ring-gbase-1'} />}>
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>Name</AvatarFallback>
            </Avatar>{" "}
            <div className="text-start ml-3">
              <h4 className="font-bold">Kim Winter</h4>
              <p className="text-xs text-[#8B8AA3]">Store Admin</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={"text-white"}>
            <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>Team</DropdownMenuItem>
              <DropdownMenuItem><Button>Logout</Button></DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
