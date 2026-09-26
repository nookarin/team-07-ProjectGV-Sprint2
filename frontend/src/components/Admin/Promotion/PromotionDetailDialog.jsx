import React, { useState } from "react";
import { Textarea } from "#components/ui/textarea";
import { Button } from "@/components/ui/button";
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
import axios from "axios";
const toDateInputValue = (value) => {
  if (!value) return "";
  const date = new Date(value);
  //   if (isNaN(date)) return "";
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const DateInput = ({ value }) => {
  const [expireAt, setExpireAt] = useState(toDateInputValue(value));

  return (
    <Input
      id="expire_at"
      name="expire_at"
      type="date"
      value={expireAt}
      onChange={(e) => setExpireAt(e.target.value)}
      className={"border-gbase-1 rounded-xl"}
    />
  );
};

const PromotionDetailDialog = ({ item, url }) => {
  const [description, setDescription] = useState(item.description);

  const updateData = async (e) => {
    e.preventDefault();
    const response = await axios.put(`${url}/${item._id}`, {
      ...item,
      description,
    });
    // console.log(response);
  };

  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button
            className={
              "border-gbase-1 bg-gbase-3 text-gray-300 hover:bg-gbase-2"
            }
          >
            View detail
          </Button>
        }
      />
      <DialogContent className="sm:max-w-sm bg-gbase-4 text-white">
        <form onSubmit={updateData}>
          <DialogHeader>
            <DialogTitle>PROMOTION DETAIL</DialogTitle>
            <DialogDescription className={"text-gray-500 text-xs"}>
              Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Field className={'border-y-2 py-3 my-3 border-gbase-1'}>
              {/* <hr className="mt-2 " /> */}
              <div className="grid grid-cols-2">
                <div>
                  <Label className={"mb-2"} htmlFor="name">
                    Promotion
                  </Label>
                  <Input id="name" value={item.name} disabled />
                </div>
                <div>
                  <Label className={"mb-2"} htmlFor="discount_amount">
                    Discount amount
                  </Label>
                  <p className="bg-gbase-3 border border-gbase-1 px-6 py-3 font-semibold text-gray-500 rounded-xl">
                    {item.discount_amount}{" "}
                    {item.discount_type === "percent" ? "%" : "Baht"}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2">
                <div>
                  <Label htmlFor="min_order_price">Minimum Price</Label>
                  <Input
                    id="min_order_price"
                    value={item.min_order_price}
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="max_use">Max Use</Label>
                  <Input
                    type="number"
                    id="max_use"
                    name="max_use"
                    value={item.max_use}
                    disabled
                  />
                </div>
              </div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                type="text"
                id="description"
                name="description"
                className={"border-gbase-1 rounded-xl"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              <Label htmlFor="promo_start">Start date</Label>
              <DateInput value={item.promo_start} />
              <Label htmlFor="expire_at">Expire date</Label>
              <DateInput value={item.expire_at} />
            </Field>
          </FieldGroup>
          <DialogFooter className={"mt-4"}>
            <DialogClose render={<Button>Cancel</Button>} />
            <Button
              type="submit"
              className="flex items-center justify-center gap-2 bg-linear-to-r from-violet-600 to-fuchsia-600 px-5 py-3.5 font-bold transition hover:from-violet-500 hover:to-fuchsia-500 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:ring-offset-2 focus:ring-offset-[#11101d] disabled:cursor-not-allowed disabled:opacity-60"
            >
              Save changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PromotionDetailDialog;
