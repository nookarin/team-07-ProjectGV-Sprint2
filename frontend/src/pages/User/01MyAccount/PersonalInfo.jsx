import { useRef, useState } from "react";
import {
  CircleUserRound,
  ClipboardList,
  ShieldX,
  Star,
} from "lucide-react";
import nookAvatar from "../../../assets/nook.jpg";

const profileRows = [
  { label: "Username:", value: "John Doe", editable: true },
  { label: "Email:", value: "johndoe@email.com" },
  { label: "Password:", value: "••••••••••••••••••", editable: true },
  { label: "Phone Number:", value: "099-546-3219", editable: true },
  { label: "Date of Birth:", value: "03-07-1996" },
];

const navigation = [
  { label: "My Account", icon: CircleUserRound },
  { label: "My Purchase", icon: ClipboardList },
  { label: "My Reviews", icon: Star },
  { label: "My Cancellations\n& Returns", icon: ShieldX },
];

export default function PersonalInfo() {
  const [avatar, setAvatar] = useState(nookAvatar);
  const fileInput = useRef(null);

  function selectAvatar(event) {
    const file = event.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  }

  return (
    <main className="min-h-screen bg-[#16162A] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(360px,1fr)_170px] lg:gap-[60px]">
        <aside className="text-sm font-semibold">
          <p className="mb-4 pl-9 text-base">Hi, &nbsp;John Doe</p>
          <div className="mb-3 h-px bg-[#2A2A45]" />

          <nav aria-label="Account navigation" className="space-y-1.5">
            {navigation.map(({ label, icon: Icon }, index) => (
              <div key={label}>
                <a
                  href="#"
                  className="flex items-start gap-4 rounded-xl px-5 py-1.5 transition-colors hover:bg-[#22223A]"
                >
                  <Icon className="mt-0.5 size-4 shrink-0 text-[#A78BFA]" strokeWidth={1.8} />
                  <span className="whitespace-pre-line leading-5">{label}</span>
                </a>
                {index === 0 && (
                  <div className="ml-10 space-y-0.5">
                    <a href="#personal-information" className="block rounded-xl border border-[#2A2A45] bg-[#1A1A2E] px-4 py-1.5 font-medium text-[#F9A8D4]">
                      Personal Information
                    </a>
                    <a href="#addresses" className="block px-4 py-1 font-medium text-[#DDD6FE]">
                      Addresses
                    </a>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        <section id="personal-information" aria-labelledby="personal-heading">
          <h1 id="personal-heading" className="mb-3 text-base font-bold">
            Personal Information
          </h1>

          <dl>
            {profileRows.map(({ label, value, editable }) => (
              <div
                key={label}
                className="grid min-h-12 grid-cols-[116px_1fr_38px] items-center border-b border-[#2A2A45] px-3 text-[13px]"
              >
                <dt className="font-semibold text-[#8B5CF6]">{label}</dt>
                <dd className="font-semibold">{value}</dd>
                <dd>
                  {editable && (
                    <button type="button" className="text-[#22D3EE] transition-colors hover:text-[#A5F3FC]">
                      Edit
                    </button>
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <button
            type="button"
            className="ml-3 mt-4 min-w-45 rounded-lg bg-[#9D174D] px-8 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#EC4899]"
          >
            Delete Account
          </button>
        </section>

        <section className="flex flex-col items-center lg:pt-0" aria-label="Profile picture">
          <img
            src={avatar}
            alt="John Doe profile"
            className="h-[148px] w-[148px] rounded-[25px] border-2 border-[#A78BFA] object-cover"
          />
          <input ref={fileInput} type="file" accept="image/*" onChange={selectAvatar} className="hidden" />
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="mt-1.5 w-[105px] rounded-lg border border-[#2A2A45] bg-[#1A1A2E] py-2 text-[8px] text-[#A5F3FC] transition-colors hover:bg-[#22223A]"
          >
            Select Image
          </button>
        </section>
      </div>
    </main>
  );
}
