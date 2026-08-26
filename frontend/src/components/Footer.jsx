import React from "react";
import { Link } from "react-router-dom";
import { Input } from "#components/ui/input";
import { Button } from "#components/ui/button";
import { Field } from "#components/ui/field";

const Footer = () => {
  return (
    <div className="bg-gbg-1 text-[#8A8A93] py-10 text-sm">
      <div className="w-11/12 grid grid-cols-4 mx-auto">
        <div>
          <h2 className="text-white text-base mb-4">
            <span className="font-black text-[#BF00FF]">|</span> SHOP
          </h2>
          <ul className="uppercase flex flex-col gap-2">
            <li>
              <Link>All Products</Link>
            </li>
            <li>
              <Link>Keyboard</Link>
            </li>
            <li>
              <Link>Headset</Link>
            </li>
            <li>
              <Link>Mouse</Link>
            </li>
            <li>
              <Link>Custom</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-white text-base mb-4">
            <span className="font-black text-[#BF00FF]">|</span> OUR COMPANY
          </h2>
          <ul className="uppercase flex flex-col gap-2">
            <li>
              <Link>ABOUT US</Link>
            </li>
            <li>
              <Link>CAREERS</Link>
            </li>
            <li>
              <Link>OUR COMMITMENT</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-white text-base mb-4">
            <span className="font-black text-[#BF00FF]">|</span> SUPPORT
          </h2>
          <ul className="uppercase flex flex-col gap-2">
            <li>
              <Link>FAQ</Link>
            </li>
            <li>
              <Link>LIVE CHAT</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-white text-base mb-4">
            <span className="font-black text-[#BF00FF]">|</span> SUBSCRIBE TO
            GEARVERSE
          </h2>
          <p>Don't miss our next drop and 15% off your oder!</p>
          <Field orientation="horizontal" className={"mt-2"}>
            <Input
              type="search"
              placeholder="user@gearverse.com"
              className={"ring-1 ring-[#1C1C24] bg-gbg-3 rounded-lg"}
            />
            <Button
              className={
                "rounded-lg bg-gpink-2 shadow-md shadow-gpink-2 text-white"
              }
            >
              SUBMIT
            </Button>
          </Field>
        </div>
      </div>
    </div>
  );
};

export default Footer;
