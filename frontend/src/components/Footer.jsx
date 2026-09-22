import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Input } from "#components/ui/input";
import { Button } from "#components/ui/button";
import { Field } from "#components/ui/field";

const SHOP_LINKS = [
  { label: "All Products", to: "/products/all" },
  { label: "Keyboard", to: "/products/keyboard" },
  { label: "Headset", to: "/products/headset" },
  { label: "Mouse", to: "/products/mouse" },
  { label: "Custom", to: "/products/custom" },
];

// ยังไม่มีหน้าเหล่านี้ในระบบ แสดงเป็นปุ่มที่กดไม่ได้แทนลิงก์ตาย
const COMPANY_LINKS = ["About Us", "Careers", "Our Commitment"];
const SUPPORT_LINKS = ["FAQ", "Live Chat"];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const FooterColumn = ({ title, children }) => (
  <div>
    <h2 className="text-white text-base mb-4">
      <span className="font-black text-[#BF00FF]">|</span> {title}
    </h2>
    {children}
  </div>
);

const ComingSoonItem = ({ label }) => (
  <li>
    <span
      aria-disabled="true"
      title="Coming soon"
      className="cursor-not-allowed opacity-60"
    >
      {label}
    </span>
  </li>
);

const Footer = () => {
  const [email, setEmail] = useState("");

  const handleSubscribe = (event) => {
    event.preventDefault();
    const value = email.trim();

    if (!EMAIL_PATTERN.test(value)) {
      toast.error("Please enter a valid email address");
      return;
    }

    toast.success("You're subscribed! Your 15% code is on its way.");
    setEmail("");
  };

  return (
    <div className="bg-gbg-1 text-[#8A8A93] py-10 text-sm relative z-10">
      <div className="w-11/12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mx-auto">
        <FooterColumn title="SHOP">
          <ul className="uppercase flex flex-col gap-2">
            {SHOP_LINKS.map(({ label, to }) => (
              <li key={label}>
                <Link to={to} className="hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="OUR COMPANY">
          <ul className="uppercase flex flex-col gap-2">
            {COMPANY_LINKS.map((label) => (
              <ComingSoonItem key={label} label={label} />
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="SUPPORT">
          <ul className="uppercase flex flex-col gap-2">
            {SUPPORT_LINKS.map((label) => (
              <ComingSoonItem key={label} label={label} />
            ))}
          </ul>
        </FooterColumn>

        <FooterColumn title="SUBSCRIBE TO GEARVERSE">
          <p>Don't miss our next drop and 15% off your order!</p>
          <form onSubmit={handleSubscribe} noValidate>
            <Field orientation="horizontal" className={"mt-2"}>
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <Input
                id="newsletter-email"
                type="email"
                name="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@gearverse.com"
                className={"ring-1 ring-[#1C1C24] bg-gbg-3 rounded-lg"}
              />
              <Button
                type="submit"
                className={
                  "rounded-lg bg-gpink-2 text-white"
                }
              >
                SUBMIT
              </Button>
            </Field>
          </form>
        </FooterColumn>
      </div>
    </div>
  );
};

export default Footer;
