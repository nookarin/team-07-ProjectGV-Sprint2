import { Link, NavLink } from "react-router-dom";
import LogoImg from "../../assets/Artboard1.png";
import LogoText from "../../assets/Untitled-2.png";
import {
  CircleSmall,
  LayoutDashboard,
  TicketPercent,
  Users,
} from "lucide-react";
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
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { useEffect } from "react";
const NavbarAdmin = () => {
  const { logout, user } = useAuth();
  return (
    <nav className="flex items-center justify-between border px-6 py-4 relative shadow-xl shadow-gpurple-5/20 z-50 backdrop-blur-2xl">
      <div className="flex items-center w-1/3">
        <Link to={"/"} className="flex items-center gap-4">
          <img className="w-10 h-10" src={LogoImg} alt="logo" />
          <img className="w-40" src={LogoText} alt="logo text" />
        </Link>
        <h3 className="flex items-center gap-2 text-xl font-bold tracking-wide text-shadow-md text-shadow-white/55 text-white">
          <CircleSmall className="fill-white" size={12} />
          Admin
        </h3>
      </div>
      <nav className="hidden justify-center items-center gap-2 md:flex w-1/3">
        <NavLink
          to={"/"}
          end
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-violet-500/20 text-violet-200"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`
          }
        >
          <LayoutDashboard className="size-4" />
          Product
        </NavLink>
        <NavLink
          to={"/users"}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-violet-500/20 text-violet-200"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`
          }
        >
          <Users className="size-4" />
          Users
        </NavLink>
        <NavLink
          to={"/promotion"}
          className={({ isActive }) =>
            `inline-flex items-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-violet-500/20 text-violet-200"
                : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
            }`
          }
        >
          <TicketPercent className="size-4" />
          Promotion
        </NavLink>
      </nav>
      <div className="w-1/3 text-end">
        <DropdownMenu>
          <DropdownMenuTrigger
            className={"text-white h-14"}
            render={<Button className={"bg-gbase-3 ring ring-gbase-1"} />}
          >
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>Name</AvatarFallback>
            </Avatar>{" "}
            <div className="text-start ml-3">
              <h4 className="font-bold capitalize">{user.username}</h4>
              <p className="text-xs text-[#8B8AA3]">Store Admin</p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className={"text-white bg-gbase-3/50 ring-gbase-1 mt-2"}
          >
            {/* <DropdownMenuGroup>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator /> */}
            {/* <DropdownMenuGroup> */}
            {/* <DropdownMenuItem>Team</DropdownMenuItem> */}
            <DropdownMenuItem onClick={logout} className={"hover:bg-gbase-4"}>
              <Button>Logout</Button>
            </DropdownMenuItem>
            {/* </DropdownMenuGroup> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default NavbarAdmin;
