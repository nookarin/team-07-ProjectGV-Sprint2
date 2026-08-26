import {
  CircleUserRound,
  ClipboardList,
  ShieldX,
  Star,
} from "lucide-react";
import { Link } from "react-router-dom";

const navigation = [
  { label: "My Account", icon: CircleUserRound, to: "/edit-profile" },
  { label: "My Purchase", icon: ClipboardList, to: "/my-purchases" },
  { label: "My Reviews", icon: Star, to: "/my-reviews" },
  {
    label: "My Cancellations\n& Returns",
    icon: ShieldX,
    to: "/my-cancellations",
  },
];

export default function AccountSidebar({ active }) {
  return (
    <aside className="text-sm font-semibold">
      <p className="mb-4 pl-9 text-base">Hi, &nbsp;John Doe</p>
      <div className="mb-3 h-px bg-[#2A2A45]" />

      <nav aria-label="Account navigation" className="space-y-1.5">
        {navigation.map(({ label, icon: Icon, to }, index) => {
          const isActive =
            active === to ||
            (to === "/edit-profile" && active.startsWith("/edit-profile/"));

          return (
            <div key={label}>
              <Link
                to={to}
                className={`flex items-start gap-4 rounded-xl px-5 py-1.5 transition-colors hover:bg-[#22223A] ${
                  isActive ? "text-[#F9A8D4]" : ""
                }`}
              >
                <Icon className="mt-0.5 size-4 shrink-0 text-[#A78BFA]" strokeWidth={1.8} />
                <span className="whitespace-pre-line leading-5">{label}</span>
              </Link>

            {index === 0 && (
              <div className="ml-10 space-y-0.5">
                <Link
                  to="/edit-profile"
                  className={`block rounded-xl px-4 py-1.5 font-medium ${
                    active === "/edit-profile"
                      ? "border border-[#2A2A45] bg-[#1A1A2E] text-[#F9A8D4]"
                      : "text-[#DDD6FE]"
                  }`}
                >
                  Personal Information
                </Link>
                <Link
                  to="/edit-profile/addresses"
                  className={`block rounded-xl px-4 py-1.5 font-medium ${
                    active === "/edit-profile/addresses"
                      ? "border border-[#2A2A45] bg-[#1A1A2E] text-[#F9A8D4]"
                      : "text-[#DDD6FE]"
                  }`}
                >
                  Addresses
                </Link>
              </div>
            )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
