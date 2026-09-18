import { useEffect, useRef, useState } from "react";
import nookAvatar from "../../../assets/nook.jpg";
import AccountSidebar from "../AccountSidebar";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import axios from "axios";

const profileRows = [
  { label: "Username:" },
  { label: "Email:" },
  { label: "Password:", editable: true },
  { label: "Phone Number:", value: "099-546-3219", editable: true },
  { label: "Date of Birth:" },
];

export default function PersonalInfo() {
  const { user, url } = useAuth();
  const [avatar, setAvatar] = useState(nookAvatar);
  const [loading, setLoading] = useState(null);
  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    phone_number: "",
    date_of_birth: "",
  });
  const fileInput = useRef(null);

  function selectAvatar(event) {
    const file = event.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  }

  const fetchUser = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/users/auth/${user._id}`, {
      withCredentials: true,
    });
    setData(response.data.user);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchUser();
  }, [user]);

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(360px,1fr)_170px] lg:gap-[60px]">
        <AccountSidebar active="/edit-profile" />

        <section id="personal-information" aria-labelledby="personal-heading">
          <h1 id="personal-heading" className="mb-3 text-base font-bold">
            Personal Information
          </h1>

          <dl>
            {!loading ? (
              <div className="flex flex-col gap-5 min-h-12 px-3 text-[13px] font-semibold">
                <div className="flex pb-4 border-b border-gbase-1">
                  <p className="w-1/3 text-gpurple-3">Username:</p>
                  <p>{data.username}</p>
                </div>
                <div className="flex pb-4 border-b border-gbase-1">
                  <p className="w-1/3 text-gpurple-3">Firstname:</p>
                  <p className="capitalize">{data.firstname}</p>
                </div>
                <div className="flex pb-4 border-b border-gbase-1">
                  <p className="w-1/3 text-gpurple-3">Lastname:</p>
                  <p className="capitalize">{data.lastname}</p>
                </div>
                <div className="flex pb-4 border-b border-gbase-1">
                  <p className="w-1/3 text-gpurple-3">Email:</p>
                  <p>{data.email}</p>
                </div>
                <div className="flex pb-4 border-b border-gbase-1">
                  <p className="w-1/3 text-gpurple-3">Password:</p>
                  <p>••••••••••••••••••</p>
                </div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </dl>

          <button
            type="button"
            className="ml-3 mt-4 min-w-45 rounded-lg bg-[#9D174D] px-8 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#EC4899]"
          >
            Delete Account
          </button>
        </section>

        <section
          className="flex flex-col items-center lg:pt-0"
          aria-label="Profile picture"
        >
          <img
            src={avatar}
            alt="John Doe profile"
            className="h-[148px] w-[148px] rounded-[25px] border-2 border-[#A78BFA] object-cover"
          />
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            onChange={selectAvatar}
            className="hidden"
          />
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
