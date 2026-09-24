import { useEffect, useRef, useState } from "react";
import userAvatar from "../../../assets/user.png";
import AccountSidebar from "../AccountSidebar";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
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
import { Trash2, Loader2 } from "lucide-react";

const PASSWORD_MASK = "••••••••••••••••••";

export default function PersonalInfo() {
  const { url, user } = useAuth();
  const [avatar, setAvatar] = useState(userAvatar);
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(null);
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const fileInput = useRef(null);
  // เก็บสถานะการอัปโหลด / ลบรูปโปรไฟล์ เพื่อแสดง loading บนปุ่ม
  const [avatarUpdating, setAvatarUpdating] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);
  const profileRows = [
    { label: "username", value: data?.username, editable: true },
    { label: "email", value: data?.email, editable: true },
    { label: "password", value: PASSWORD_MASK, editable: true, secret: true },
    { label: "firstname", value: data?.firstname, editable: true },
    { label: "lastname", value: data?.lastname, editable: true },
  ];
  // อัปโหลดรูปโปรไฟล์ที่ผู้ใช้เลือกไปยัง backend แล้วให้ backend อัปโหลดต่อขึ้น Cloudinary
  async function selectAvatar(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    // สร้าง FormData เพื่อส่งไฟล์รูปให้ backend
    const formData = new FormData();
    formData.append("avatar", file);

    setAvatarUpdating(true);
    try {
      // POST ไปยัง endpoint อัปโหลดรูปโปรไฟล์ backend จะจัดการ Cloudinary ให้
      const response = await axios.post(
        `${url}/users/${user._id}/avatar`,
        formData,
        { withCredentials: true },
      );
      // อัปเดตรูปโปรไฟล์ให้แสดงรูปใหม่จาก Cloudinary ทันที
      setAvatar(response.data.avatar);
      setData((current) => ({ ...current, avatar: response.data.avatar }));
      toast.success("Profile picture updated successfully.", {
        richColors: true,
        position: "top-center",
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update profile picture.", {
        richColors: true,
        position: "top-center",
      });
    } finally {
      setAvatarUpdating(false);
      // reset input เพื่อให้เลือกไฟล์เดิมซ้ำได้อีกครั้ง
      if (fileInput.current) fileInput.current.value = "";
    }
  }

  // ลบรูปโปรไฟล์ออกจาก Cloudinary และรีเซ็ตกลับไปเป็นรูปเริ่มต้น
  async function deleteAvatar() {
    setAvatarDeleting(true);
    try {
      await axios.delete(`${url}/users/${user._id}/avatar`, {
        withCredentials: true,
      });
      // กลับไปแสดงรูปเริ่มต้น (default avatar) หลังลบสำเร็จ
      setAvatar(userAvatar);
      setData((current) => ({ ...current, avatar: null }));
      toast.success("Profile picture deleted.", {
        richColors: true,
        position: "top-center",
      });
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to delete profile picture.", {
        richColors: true,
        position: "top-center",
      });
    } finally {
      setAvatarDeleting(false);
    }
  }

  async function fetchData() {
    setLoading(true);
    try {
      const response = await axios.get(`${url}/users/${user._id}`, {
        withCredentials: true,
      });
      setData(response.data.data);
      // ใช้รูปโปรไฟล์จาก Cloudinary ถ้าผู้ใช้เคยอัปโหลดไว้ ไม่เช่นนั้นใช้รูปเริ่มต้น
      if (response.data.data?.avatar) {
        setAvatar(response.data.data.avatar);
      } else {
        setAvatar(userAvatar);
      }
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
        position: 'top-center'
      });
      return;
    }
    if (editing === "password" && draft === PASSWORD_MASK) {
      toast.error("Please enter a new password.", {
        richColors: true,
        position: 'top-center'
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
        position: 'top-center'
      });
      await fetchData();
      setEditing(null);
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Failed to update.", {
        richColors: true,
        position: 'top-center'
      });
    } finally {
      setSaving(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      {/* Show full-screen LoadingScreen while the user data API request is being fetched */}
      {loading && <LoadingScreen />}
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
          {/* ปุ่มเลือกไฟล์รูปโปรไฟล์ - ระหว่างอัปโหลดจะแสดงสถานะ Uploading... */}
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={avatarUpdating || avatarDeleting}
            className="mt-1.5 flex w-[150px] items-center justify-center gap-1.5 rounded-lg border border-[#2A2A45] bg-[#1A1A2E] py-2 text-[8px] text-[#A5F3FC] transition-colors hover:bg-[#22223A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {avatarUpdating && <Loader2 className="size-3 animate-spin" />}
            {avatarUpdating ? "Uploading..." : "Select Image"}
          </button>
          {/* ปุ่มลบรูปโปรไฟล์ - แสดงเฉพาะเมื่อมีรูปที่อัปโหลดไว้แล้ว */}
          {data?.avatar && (
            <button
              type="button"
              onClick={deleteAvatar}
              disabled={avatarDeleting || avatarUpdating}
              className="mt-1.5 flex w-[150px] items-center justify-center gap-1.5 rounded-lg border border-rose-500/40 bg-[#2A0F18] py-2 text-[8px] text-rose-300 transition-colors hover:bg-[#3D183F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {avatarDeleting ? (
                <Loader2 className="size-3 animate-spin" />
              ) : (
                <Trash2 className="size-3" />
              )}
              {avatarDeleting ? "Removing..." : "Delete Picture"}
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
