import { Outlet } from "react-router-dom";
import NavbarAdmin from "./NavbarAdmin";
import { Toaster } from "@/components/ui/sonner";
import { useEffect } from "react";
import FluidCursor from "../../contexts/use-FluidCursor";

const LayoutAdmin = () => {
  useEffect(() => {
    FluidCursor();
  }, []);
  return (
    <div className="min-h-screen bg-gbg-3">
      <NavbarAdmin />
      <div>
        <Outlet />
        <div className="fixed top-0 left-0 z-2 pointer-events-none">
          <canvas id="fluid" className="w-screen h-screen" />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default LayoutAdmin;
