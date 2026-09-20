import {
  MapPin,
  MapPinIcon,
  SaveCheck,
  Star,
  UserRoundIcon,
} from "lucide-react";
import AccountSidebar from "../AccountSidebar";
import { useEffect, useState } from "react";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "#components/ui/button";
import { toast } from "sonner";
import { MailIcon, PhoneIcon, MessageSquareIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "#components/ui/avatar";

const initial_address = {
  firstname: "",
  lastname: "",
  houseNo: "",
  street: "",
  subdistrict: "",
  district: "",
  province: "",
  zipCode: "",
};
export default function Addresses() {
  const { url, user } = useAuth();
  const [loading, setLoading] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [data, setData] = useState(initial_address);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);

  const onChangeHandler = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const addAddress = async (e) => {
    e.preventDefault();
    setIsDialogOpen(false);
    try {
      const response = await axios.patch(
        `${url}/users/${user._id}/address`,
        data,
        {
          withCredentials: true,
        },
      );
      console.log(response);
      toast.success(response.data.message, {
        richColors: true,
        duration: 5000,
      });
    } catch (error) {
      console.log(error.response.data);
      toast.error(error.response.data.message, {
        richColors: true,
        duration: 5000,
      });
    } finally {
      fetchData();
    }
  };

  const editAddressHandler = (item) => {
    setData({
      firstname: item.firstname,
      lastname: item.lastname,
      houseNo: item.houseNo,
      street: item.street,
      subdistrict: item.subdistrict,
      district: item.district,
      province: item.province,
      zipCode: item.zipCode,
    });
    setEditOpen(true);
    setSelectedAddress(item);
  };

  const saveEditHandler = async (e) => {
    e.preventDefault();
    console.log(data, selectedAddress);
    const response = await axios.patch(
      `${url}/users/${user._id}/address/${selectedAddress._id}`,
      data,
    );

    fetchData();
    toast.success(response.data.message, {
      richColors: true,
      duration: 5000,
    });
  };

  const deleteAddressHandler = async (e) => {
    e.preventDefault();
    const response = await axios.delete(
      `${url}/users/${user._id}/address/${selectedAddress._id}`,
    );
    fetchData();
    toast.success(response.data.message, {
      richColors: true,
      duration: 5000,
    });
    setSelectedAddress(null);
  };

  const fetchData = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/users/auth/${user._id}`, {
      withCredentials: true,
    });
    setAddresses(response.data.user.address);
    setLoading(false);
  };

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);
  return (
    <main className="min-h-screen bg-[#090813] px-4 py-12 font-sans text-[#DDD6FE] sm:px-8 lg:px-14 lg:py-[72px]">
      <div className="mx-auto grid max-w-[920px] gap-12 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-[60px]">
        <AccountSidebar active="/edit-profile/addresses" />
        <section id="addresses" aria-labelledby="addresses-heading">
          <div className="mb-5 flex items-center justify-between gap-4">
            <h1 id="addresses-heading" className="text-base font-bold">
              My Addresses
            </h1>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger
                render={
                  <Button className="rounded-lg bg-[#8B5CF6] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#A78BFA]">
                    + Add New Address
                  </Button>
                }
              />

              <DialogContent className="sm:max-w-sm w-250 min-w-150 text-white bg-gbase-1 shadow-2xl shadow-gpurple-5">
                <form onSubmit={addAddress}>
                  <DialogHeader className={"mb-4"}>
                    <DialogTitle>+ Add Address</DialogTitle>
                    <DialogDescription className={"text-gray-400"}>
                      Click save when you&apos;re done.
                    </DialogDescription>
                  </DialogHeader>
                  <FieldGroup>
                    <Field className={"grid grid-cols-2 gap-4"}>
                      <div>
                        <Label htmlFor="firstname">Firstname</Label>
                        <Input
                          id="firstname"
                          name="firstname"
                          placeholder="Firstname"
                          className={"border-gpurple-2 rounded-xl mt-2.5"}
                          onChange={onChangeHandler}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastname">Lastname</Label>
                        <Input
                          id="lastname"
                          name="lastname"
                          placeholder="Lastname"
                          className={"border-gpurple-2 rounded-xl mt-2.5"}
                          onChange={onChangeHandler}
                          required
                        />
                      </div>
                    </Field>
                    <Field>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="houseNo">House No.</Label>
                          <Input
                            id="houseNo"
                            name="houseNo"
                            className={"border-gpurple-2 rounded-xl mt-2.5"}
                            onChange={onChangeHandler}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="street">Street</Label>
                          <Input
                            id="street"
                            name="street"
                            className={"border-gpurple-2 rounded-xl mt-2.5"}
                            onChange={onChangeHandler}
                          />
                        </div>
                      </div>
                      <Label htmlFor="subdistrict">Sub District</Label>
                      <Input
                        id="subdistrict"
                        name="subdistrict"
                        className={"border-gpurple-2 rounded-xl"}
                        onChange={onChangeHandler}
                      />
                      <Label htmlFor="district">District</Label>
                      <Input
                        id="district"
                        name="district"
                        className={"border-gpurple-2 rounded-xl"}
                        onChange={onChangeHandler}
                        required
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="province">Province</Label>
                          <Input
                            id="province"
                            name="province"
                            className={"border-gpurple-2 rounded-xl mt-2"}
                            onChange={onChangeHandler}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipCode">Zip Code</Label>
                          <Input
                            id="zipCode"
                            name="zipCode"
                            className={"border-gpurple-2 rounded-xl mt-2"}
                            type={"number"}
                            onChange={onChangeHandler}
                            required
                          />
                        </div>
                      </div>
                    </Field>
                  </FieldGroup>
                  <DialogFooter className={"my-4"}>
                    <DialogClose
                      render={
                        <Button className={"hover:text-red-400"}>Cancel</Button>
                      }
                    />
                    <Button
                      className={
                        "bg-gpurple-3 border border-gpurple-1 hover:bg-gpurple-2"
                      }
                      type="submit"
                    >
                      Save changes
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            {loading ? (
              <p>loading...</p>
            ) : addresses.length === 0 ? (
              <p>no address</p>
            ) : (
              addresses?.map((item, index) => (
                <article
                  key={index}
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
                            Address {index + 1}
                          </h2>
                          {item.isDefault && (
                            <span className="rounded border border-[#EC4899] px-2 py-0.5 text-[10px] font-semibold text-[#F9A8D4]">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="mt-2 text-[13px] font-semibold flex gap-1 capitalize">
                          {item.firstname ? (
                            <p>{item.firstname}</p>
                          ) : (
                            <p>{user.username}</p>
                          )}{" "}
                          {item.lastname ? (
                            <p>{item.lastname}</p>
                          ) : (
                            <p>{user.email}</p>
                          )}
                          <span className="text-[#6B6B86]">|</span> 099-999-9999
                        </div>
                        <div className="mt-1 max-w-xl text-[13px] leading-5 text-gray-100">
                          <p className="font-medium capitalize">
                            No.{" "}
                            <span className="font-bold text-white">
                              {item?.houseNo && item.houseNo}
                            </span>
                            {", "}
                            Street:{" "}
                            <span className="font-bold text-white">
                              {item?.street && item.street}
                            </span>
                            {", "}
                            Sub-district:{" "}
                            <span className="font-bold text-white">
                              {item?.subdistrict && item.subdistrict}
                            </span>
                          </p>
                          <p className="font-medium capitalize">
                            District:{" "}
                            <span className="font-bold text-white">
                              {item?.district && item.district}
                            </span>
                            {", "}
                            Province:{" "}
                            <span className="font-bold text-white">
                              {item?.province && item.province}
                            </span>
                            {", "}
                            Zip:{" "}
                            <span className="font-bold text-white">
                              {item?.zipCode && item.zipCode}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger
                        render={
                          <Button
                            onClick={() => editAddressHandler(item)}
                            className="cursor-pointer text-gcyan-light hover:text-gcyan-neon hover:bg-gbase-1"
                          />
                        }
                      >
                        Edit
                      </DialogTrigger>
                      <DialogContent className="data-open:slide-in-from-right-8 data-closed:slide-out-to-right-8 data-open:zoom-in-100 data-closed:zoom-out-100 duration-300 [[data-slot=dialog-overlay]:has(~_&)]:duration-300 bg-gbase-4 text-white min-w-140">
                        <div className="flex items-center gap-3">
                          <div className="flex flex-col gap-0.5">
                            <DialogTitle className="text-sm font-semibold leading-none">
                              Editing Address {index + 1}
                            </DialogTitle>
                            {/* <DialogDescription className="text-xs">
                              Product Manager at Notion
                            </DialogDescription> */}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 rounded-lg bg-muted dark:bg-muted/50 p-3">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <UserRoundIcon size={14} />
                            <span>
                              {data.firstname || item.firstname}{" "}
                              {data.lastname || item.lastname}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPinIcon size={14} />
                            <div className="flex gap-2">
                              <label htmlFor="houseNo">No.</label>
                              <input
                                type="text"
                                className="w-14"
                                value={data.houseNo}
                                name="houseNo"
                                onChange={onChangeHandler}
                              />
                            </div>

                            <div className="flex gap-2">
                              <label htmlFor="street">Street</label>
                              <input
                                type="text"
                                className="w-20"
                                value={data.street}
                                name="street"
                                onChange={onChangeHandler}
                              />
                            </div>
                            <div className="flex gap-2">
                              <label htmlFor="subdistrict">Subdistrict</label>
                              <input
                                type="text"
                                name="subdistrict"
                                value={data.subdistrict}
                                onChange={onChangeHandler}
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPinIcon size={14} />
                            <div className="flex gap-2">
                              <label htmlFor="district">District</label>
                              <input
                                type="text"
                                value={data.district}
                                name="district"
                                className="w-24"
                                onChange={onChangeHandler}
                              />
                            </div>

                            <div className="flex gap-2">
                              <label htmlFor="province">Province</label>
                              <input
                                type="text"
                                value={data.province}
                                name="province"
                                className="w-24"
                                onChange={onChangeHandler}
                              />
                            </div>
                            <div className="flex gap-2">
                              <label htmlFor="zipCode">Zipcode</label>
                              <input
                                type="text"
                                value={data.zipCode}
                                name="zipCode"
                                className="w-24"
                                onChange={onChangeHandler}
                              />
                            </div>
                          </div>
                          {/* <div className="flex items-center gap-2 text-muted-foreground">
                            <Star size={14} />
                            <span className="text-xs">+1 (415) 867-5309</span>
                            <input type="checkbox" />
                            <p>Set as default</p>
                          </div> */}
                        </div>
                        <div className="flex gap-2">
                          <DialogClose
                            render={
                              <Button className="flex-1 cursor-pointer hover:bg-gbase-1" />
                            }
                          >
                            Close
                          </DialogClose>
                          <DialogClose
                            render={
                              <Button
                                onClick={(e) => {
                                  deleteAddressHandler(e, item);
                                }}
                                className="flex-1 cursor-pointer bg-red-600 hover:bg-red-500"
                              />
                            }
                          >
                            Delete
                          </DialogClose>
                          <DialogClose
                            render={
                              <Button
                                type="submit"
                                onClick={saveEditHandler}
                                className="flex-1 cursor-pointer bg-gpurple-4 hover:bg-gpurple-3"
                              />
                            }
                          >
                            <SaveCheck size={14} />
                            Save
                          </DialogClose>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
