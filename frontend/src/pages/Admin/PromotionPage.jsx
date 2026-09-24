import axios from "axios";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ArrowUpDown, Plus, Search, TicketPercent, Users } from "lucide-react";
import React, { useEffect, useState } from "react";
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
import Header from "#components/Admin/Header";
import DialogForm from "#components/Admin/Promotion/DialogForm";
import PromotionList from "#components/Admin/Promotion/PromotionList";
import LoadingScreen from "@/components/LoadingScreen";
import { Label } from "#components/ui/label";


const PromotionPage = () => {
  const url = import.meta.env.VITE_API_URL;
  const [loading, setLoading] = useState(null);
  const SORTABLE_COLUMNS = [
    { value: "name", label: "Name" },
    { value: "createdAt", label: "Created at" },
    { value: "updatedAt", label: "Updated at" },
  ];
  const [data, setData] = useState([]);
  const [query, setQuery] = useState({
    name: "",
    max_use: "",
    promo_start: "",
    expire_at: "",
    created_at: "",
    updated_at: "",
  });
  const [form, setForm] = useState({
    name: "",
    discount_amount: 0,
    discount_type: "",
    min_order_price: 0,
    max_use: 0,
    promo_start: "",
    expire_at: "",
    description: "",
  });
  const [formErrors, setFormErrors] = useState(null);

  const validateInput = () => {
    Object.keys(form).map((item) => {
      if (!form[item]) {
        setFormErrors(`Required: ${item.toUpperCase()}`);
      }
    });
  };

  const onChangeHandler = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    console.log(form);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    validateInput();
    // console.log("submitting", form);
    const response = await axios.post(`${url}/promo`, form)
    if(response.data.success) {
      fetchApi()
    }
  };

  const editingUser = () => {};

  const fetchApi = async () => {
    setLoading(true);
    const res = await axios.get(`${url}/promo`);
    console.log(res.data.data);
    setData(res.data.data);
    setLoading(false);
  };

  const getQueryData = async () => {
    setLoading(true);
    const res = await axios.get(`${url}/promo?name=${query.name}`);
    setData(res.data.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchApi();
  }, []);

  return (
    <main className="min-h-screen bg-[#090813] px-4 py-10 text-white sm:px-6 lg:px-10">
      {/* Show full-screen LoadingScreen while the promotion API request is being fetched */}
      {loading && <LoadingScreen />}
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <Header
            heading="Promotion Manager"
            desc={"Add, Update, or Delete Promotions here"}
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-3 rounded-2xl border border-violet-400/20 bg-violet-500/10 px-4 py-3">
              <TicketPercent className="size-5 text-violet-300" />
              <span className="text-sm font-semibold">
                {!loading ? `${data.length} ` : "loading..."}Promotions
              </span>
            </div>

            <Dialog>
              <DialogTrigger>
                <div className="flex items-center justify-center w-24 h-10 rounded-full gap-2 bg-linear-to-r from-violet-600 to-fuchsia-600 font-bold hover:from-violet-500 hover:to-fuchsia-500">
                  <Plus className="size-4" aria-hidden="true" /> Add
                </div>
              </DialogTrigger>
              <DialogContent className="max-w-2xl border-violet-400/20 bg-[#11101d] text-white">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold">
                    Add Promotion
                  </DialogTitle>
                  <DialogDescription className="text-slate-400">
                    Create a new promotion.
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter className="grid">
                  <DialogForm
                    handleSubmit={handleSubmit}
                    form={form}
                    setForm={setForm}
                    onChangeHandler={onChangeHandler}
                  />
                  <div className="flex items-center justify-between mt-5">
                    {formErrors && (
                      <p className="text-red-500 inline font-bold text-xs">
                        * {formErrors}
                      </p>
                    )}
                    <div className="w-full text-end">
                      <DialogClose render={<Button>Cancel</Button>} />
                      <Button
                        type="submit"
                        onClick={handleSubmit}
                        className="gap-2 bg-linear-to-r from-violet-600 to-fuchsia-600 font-bold hover:from-violet-500 hover:to-fuchsia-500"
                      >
                        Confirm
                      </Button>
                    </div>
                  </div>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </header>
        <div className="bg-gbg-2/60 border border-gbase-1 shadow-2xl shadow-gpurple-5/30 rounded-2xl">
          <div className="pt-4 px-4">
            <Label className={"ml-1 mb-2"}>Search</Label>
            <Field orientation="horizontal" className={"relative bor"}>
              <Search
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-slate-500"
                aria-hidden="true"
              />
              <Input
                className={
                  "w-full rounded-xl border border-white/10 bg-[#090813] py-3 pr-4 pl-10 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-violet-400 focus:ring-2 focus:ring-violet-500/30"
                }
                type="search"
                placeholder="Search..."
                onChange={(e) => setQuery({ ...query, name: e.target.value })}
              />
              <Button
                onClick={getQueryData}
                className={
                  "rounded-xl border border-gpurple-2 bg-gpurple-3 hover:bg-gpurple-2"
                }
              >
                Search
              </Button>
            </Field>
          </div>
          <div className="py-4 px-4">
            <Label>Sort by</Label>
            <div className="mt-2 flex gap-2">
              <Button
                className={"border border-gbase-1 bg-gbase-3"}
                type="button"
              >
                Created at
                <ArrowUpDown />
              </Button>
              <Button
                className={"border border-gbase-1 bg-gbase-3"}
                type="button"
              >
                Updated at
                <ArrowUpDown />
              </Button>
            </div>
          </div>
          {!loading && (
            <PromotionList data={data} setData={setData} loading={loading} />
          )}
        </div>
      </div>
    </main>
  );
};

export default PromotionPage;
