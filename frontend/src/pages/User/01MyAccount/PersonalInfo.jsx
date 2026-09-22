import { useEffect, useRef, useState } from "react";
import nookAvatar from "../../../assets/nook.jpg";
import AccountSidebar from "../AccountSidebar";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "#components/ui/button";
import { toast } from "sonner";

const PASSWORD_MASK = "••••••••••••••••••";

export default function PersonalInfo() {
  const { url, user } = useAuth();
  const [avatar, setAvatar] = useState(nookAvatar);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);
  const profileRows = [
    { label: "username", value: data?.username },
    { label: "email", value: data?.email },
    { label: "password", value: PASSWORD_MASK, editable: true, secret: true },
    { label: "firstname", value: data?.firstname, editable: true },
    { label: "lastname", value: data?.lastname, editable: true },
  ];
  function selectAvatar(event) {
    const file = event.target.files?.[0];
    if (file) setAvatar(URL.createObjectURL(file));
  }

  async function fetchData() {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/users/${user._id}`, {
        withCredentials: true,
      });
      setData(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  function openEditor(label, value) {
    setEditing(label);
    setDraft(value ?? "");
  }

  async function handleSave() {
    if (!editing || draft.trim() === "") {
      toast.error("Required data.", {
        richColors: true,
      });
      return;
    }
    if (editing === "password" && draft === PASSWORD_MASK) {
      toast.error("Please enter a new password.", {
        richColors: true,
      });
      return;
    }
    setSaving(true);
    try {
      await axios.patch(
        `${url}/users/${user._id}`,
        { [editing]: draft.trim() },
        { withCredentials: true },
      );
      toast.success(`${editing} updated successfully.`, {
        richColors: true,
      });
      await fetchData();
      setEditing(null);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update.", {
        richColors: true,
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(360px,1fr)_170px] lg:gap-[60px]">
        <AccountSidebar active="/edit-profile" />

        <section id="personal-information" aria-labelledby="personal-heading">
          <h1 id="personal-heading" className="mb-3 text-base font-bold">
            Personal Information
          </h1>

          <dl>
            {!loading &&
              profileRows.map(({ label, value, editable, secret }, index) => (
                <div
                  key={index}
                  className="grid min-h-12 grid-cols-[116px_1fr_38px] items-center border-b border-[#2A2A45] px-3 text-[13px]"
                >
                  <dt className="font-semibold text-[#8B5CF6]">{label}</dt>
                  <dd className="font-semibold">{value}</dd>
                  <dd>
                    {editable && (
                      <Dialog
                        open={editing === label}
                        onOpenChange={(open) =>
                          open ? openEditor(label, value) : setEditing(null)
                        }
                      >
                        <DialogTrigger className="text-[#22D3EE] transition-colors hover:text-[#A5F3FC]">
                          Edit
                        </DialogTrigger>
                        <DialogContent className={"text-white bg-gbase-2/90"}>
                          <DialogHeader>
                            <DialogTitle>Edit {label}</DialogTitle>
                            <DialogDescription
                              className={"flex flex-col gap-2 mt-2"}
                            >
                              <label className="capitalize" htmlFor={label}>
                                {label}
                              </label>
                              <input
                                className="border border-gpurple-3 rounded-xl py-2 px-2"
                                id={label}
                                type={secret ? "password" : "text"}
                                value={draft}
                                onChange={(event) =>
                                  setDraft(event.target.value)
                                }
                                autoFocus
                              />
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <DialogClose
                              render={<Button variant="outline">Cancel</Button>}
                            />
                            <Button
                              className={"bg-gpurple-4 hover:bg-gpurple-3"}
                              onClick={handleSave}
                              disabled={saving}
                            >
                              {saving ? "Saving..." : "Save"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
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
