import { useEffect, useState } from "react";
import { MapPin, Plus, Trash2, X } from "lucide-react";
import AccountSidebar from "../AccountSidebar";
import { useAuth } from "../../../contexts/Authentication/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";

const API_URL = import.meta.env.VITE_API_URL;

const ADDRESS_FIELDS = [
  { key: "firstname", label: "First name", placeholder: "e.g. Kim" },
  { key: "lastname", label: "Last name", placeholder: "e.g. Winter" },
  { key: "houseNo", label: "House no.", placeholder: "e.g. 123/45" },
  { key: "street", label: "Street", placeholder: "e.g. Sukhumvit Road" },
  { key: "subdistrict", label: "Subdistrict", placeholder: "e.g. Khlong Toei" },
  { key: "district", label: "District", placeholder: "e.g. Khlong Toei" },
  { key: "province", label: "Province", placeholder: "e.g. Bangkok" },
  { key: "zipCode", label: "Zip code", placeholder: "e.g. 10110" },
];

function emptyAddress() {
  return {
    firstname: "",
    lastname: "",
    houseNo: "",
    street: "",
    subdistrict: "",
    district: "",
    province: "",
    zipCode: "",
    isDefault: false,
  };
}

function formatAddress(value) {
  if (!value) return "";
  return [value.houseNo, value.street, value.subdistrict, value.district, value.province, value.zipCode]
    .map((part) => (part == null ? "" : String(part)).trim())
    .filter(Boolean)
    .join(", ");
}

function recipientName(value) {
  return [value.firstname, value.lastname].filter(Boolean).join(" ").trim();
}

function toAddressDoc(value) {
  const clean = {};
  for (const { key } of ADDRESS_FIELDS) {
    if (key === "zipCode") {
      if ((value[key] ?? "").trim() !== "") clean.zipCode = Number(value[key]);
    } else if ((value[key] ?? "") !== "") {
      clean[key] = String(value[key]).trim();
    }
  }
  if (value.isDefault) clean.isDefault = true;
  return clean;
}

export default function Addresses() {
  const { user } = useAuth();
  const userId = user?._id;

  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(null);
  const [editor, setEditor] = useState(null); // { mode: "add" | "edit", index: number | null }
  const [draft, setDraft] = useState(null);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;

    async function loadAddresses() {
      setLoading(true);
      setLoadError("");
      try {
        const res = await fetch(`${API_URL}/users/${userId}`, { credentials: "include" });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || "Failed to load addresses");
        const current = result.data;
        const raw = current?.address ?? [];
        const rows = Array.isArray(raw) ? raw.filter((addr) => addr && formatAddress(addr) !== "") : [];
        if (!cancelled) setAddresses(rows.map((addr) => ({ ...addr, zipCode: addr.zipCode != null ? String(addr.zipCode) : "" })));
      } catch (loadErr) {
        if (!cancelled) setLoadError(loadErr.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadAddresses();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function openAdd() {
    setDraft(emptyAddress());
    setEditor({ mode: "add", index: null });
    setError("");
  }

  function openEdit(index) {
    setDraft({ ...addresses[index] });
    setEditor({ mode: "edit", index });
    setError("");
  }

  function closeEditor() {
    setEditor(null);
    setDraft(null);
    setError("");
  }

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function handleSave(event) {
    event.preventDefault();
    if (!userId || !draft) return;
    setSaving(true);
    setError("");
    try {
      if (editor.mode === "edit" && addresses[editor.index]?._id) {
        const delRes = await fetch(
          `${API_URL}/users/${userId}/address/${addresses[editor.index]._id}`,
          { method: "DELETE", credentials: "include" },
        );
        if (!delRes.ok) {
          const delResult = await delRes.json().catch(() => ({}));
          throw new Error(delResult.message || "Failed to update address");
        }
      }

      const res = await fetch(`${API_URL}/users/${userId}/address`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ address: toAddressDoc(draft) }),
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Failed to save address");

      closeEditor();
      setConfirmingDelete(null);
      setLoading(true);
      const refreshRes = await fetch(`${API_URL}/users/${userId}`, { credentials: "include" });
      const refreshResult = await refreshRes.json();
      if (refreshRes.ok) {
        const current = refreshResult.data;
        const raw = current?.address ?? [];
        const rows = Array.isArray(raw) ? raw.filter((addr) => addr && formatAddress(addr) !== "") : [];
        setAddresses(rows.map((addr) => ({ ...addr, zipCode: addr.zipCode != null ? String(addr.zipCode) : "" })));
      }
    } catch (saveErr) {
      setError(saveErr.message);
    } finally {
      setSaving(false);
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!userId || confirmingDelete == null) return;
    const target = addresses[confirmingDelete];
    if (!target?._id) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/users/${userId}/address/${target._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(result.message || "Failed to delete address");
      setAddresses((current) => current.filter((_, i) => i !== confirmingDelete));
      setConfirmingDelete(null);
    } catch (deleteErr) {
      setError(deleteErr.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      {/* Show full-screen LoadingScreen while the address API request is being fetched */}
      {loading && <LoadingScreen />}
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/edit-profile/addresses" />

        <section id="addresses" aria-labelledby="addresses-heading">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h1 id="addresses-heading" className="text-base font-bold">
              My Addresses
            </h1>
            <button
              type="button"
              onClick={openAdd}
              disabled={!userId || saving}
              className="flex items-center gap-1.5 rounded-lg bg-[#8B5CF6] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#A78BFA] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="size-3.5" />
              Add New Address
            </button>
          </div>

          {error && (
            <p className="mb-4 rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-rose-300" role="alert">
              {error}
            </p>
          )}

          {!userId ? (
            <div className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-8 text-center">
              <p className="text-sm font-semibold text-[#AAA4C4]">
                Sign in to manage your shipping addresses.
              </p>
            </div>
          ) : loading ? (
            <div className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-8 text-center">
              <p className="text-sm font-semibold text-[#AAA4C4]">Loading addresses...</p>
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-rose-500/30 bg-[#1A1A2E] p-8 text-center">
              <p className="text-sm font-medium text-rose-300">{loadError}</p>
            </div>
          ) : addresses.length === 0 ? (
            <div className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-8 text-center">
              <p className="text-sm font-semibold text-[#AAA4C4]">
                You don't have any saved addresses yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {addresses.map((item, index) => (
                <article
                  key={item._id ?? index}
                  className="rounded-xl border border-[#2A2A45] bg-[#1A1A2E] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <MapPin
                        className="mt-0.5 size-5 shrink-0 text-[#A78BFA]"
                        strokeWidth={1.8}
                      />
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-sm font-bold text-white">
                            {recipientName(item) || `Address ${index + 1}`}
                          </h2>
                          {item.isDefault && (
                            <span className="rounded border border-[#EC4899] px-2 py-0.5 text-[10px] font-semibold text-[#F9A8D4]">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="mt-1 max-w-xl text-[13px] leading-5 text-[#AAA4C4]">
                          {formatAddress(item)}
                        </p>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-2">
                      {confirmingDelete === index ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={handleDelete}
                            disabled={saving}
                            className="text-xs font-semibold text-rose-400 transition-colors hover:text-rose-300 disabled:opacity-50"
                          >
                            {saving ? "Deleting..." : "Confirm"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDelete(null)}
                            disabled={saving}
                            className="text-xs font-semibold text-[#6B6B86] transition-colors hover:text-white disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => openEdit(index)}
                            className="text-xs font-semibold text-[#22D3EE] transition-colors hover:text-[#A5F3FC]"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmingDelete(index)}
                            className="flex items-center gap-1 text-xs font-semibold text-[#6B6B86] transition-colors hover:text-rose-400"
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      {editor && draft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8">
          <div className="max-h-full w-full max-w-2xl overflow-y-auto rounded-2xl border border-[#2A2A45] bg-[#1A1A2E] p-6">
            <div className="mb-5 flex items-center justify-between gap-4">
              <h2 className="text-base font-bold">
                {editor.mode === "add" ? "Add New Address" : "Edit Address"}
              </h2>
              <button
                type="button"
                onClick={closeEditor}
                className="text-[#6B6B86] transition-colors hover:text-white"
                aria-label="Close"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={handleSave} noValidate>
              <div className="grid gap-4 sm:grid-cols-2">
                {ADDRESS_FIELDS.map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label
                      htmlFor={`addr-${key}`}
                      className="mb-1.5 block text-xs font-semibold text-[#AAA4C4]"
                    >
                      {label}
                    </label>
                    <input
                      id={`addr-${key}`}
                      inputMode={key === "zipCode" ? "numeric" : undefined}
                      value={draft[key] ?? ""}
                      onChange={(event) => updateDraft(key, event.target.value)}
                      placeholder={placeholder}
                      className="w-full rounded-lg border border-[#2A2A45] bg-[#11101D] px-3 py-2.5 text-sm text-white outline-none transition placeholder:text-[#4B4B66] focus:border-[#8B5CF6]"
                    />
                  </div>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer items-center gap-2 text-[13px] font-semibold text-[#DDD6FE]">
                <input
                  type="checkbox"
                  checked={Boolean(draft.isDefault)}
                  onChange={(event) => updateDraft("isDefault", event.target.checked)}
                  className="size-4 accent-[#8B5CF6]"
                />
                Set as default address
              </label>

              {error && (
                <p className="mt-4 text-sm font-medium text-rose-400" role="alert">
                  {error}
                </p>
              )}

              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeEditor}
                  className="rounded-lg border border-[#2A2A45] bg-transparent px-4 py-2 text-xs font-bold text-[#AAA4C4] transition-colors hover:bg-[#22223A]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-[#8B5CF6] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#A78BFA] disabled:opacity-50"
                >
                  {saving ? "Saving..." : editor.mode === "add" ? "Add Address" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}