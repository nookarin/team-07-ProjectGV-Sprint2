import { Outlet } from "react-router-dom";
import Navbar from "./Navbar/Navbar";
import Footer from "./Footer";
import { Toaster } from "./ui/sonner";
import { useEffect } from "react";

import fluidCursor from "../contexts/use-FluidCursor";

const Layout = () => {
  useEffect(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.innerWidth < 768 && 'ontouchstart' in window) return; // portrait phone
  const destroy = fluidCursor();
  return destroy;
}, []); // responsive fluidCursor, if not pic = no fluidCursor
  // useEffect(() => {
  //   fluidCursor();
  // }, []);
  return (
    <>
      <Navbar />
      <div className="bg-gbg-3">
        <Outlet />
        <div className="fixed top-0 left-0 z-2 pointer-events-none">
          <canvas id="fluid" className="w-screen h-screen" />
        </div>
      </div>
      <Footer />
      <Toaster />
    </>
  );
};

export default Layout;
