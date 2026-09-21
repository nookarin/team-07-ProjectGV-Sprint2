import { Badge } from "#components/ui/badge";
import { Button } from "@base-ui/react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import React from "react";
import { Link } from "react-router-dom";
import img_default from "/images/headset.jpg";

const ProductCard = ({ img, product }) => {
  return (
    <div className="relative border bg-gbg-1/60 backdrop-blur-2xl border-gpurple-2 text-center rounded-2xl shadow-lg shadow-purple-900/50 text-white">
      <Badge
        variant="outline"
        className={"border-gpurple-2 absolute left-5 top-2 bg-gpurple-4/55"}
      >
        {product.category_id.category_name}
      </Badge>
      <Link to={'/product'}>
        <img className="rounded-t-2xl w-full h-100 object-cover border-b border-gbase-1" src={img ? img : img_default} alt="" />
      </Link>
      <div className="w-[80%] h-30 mx-auto my-4 text-white">
        <h3 className="font-bold text-xl">{product.product_name}</h3>
        <p className="text-sm font-light mt-4">{product.description.length >= 150 ? product.description.slice(0,150) : product.description}</p>
      </div>
      <div className="text-start gap-0.5 mx-4 mt-10 flex items-center">
        <Star size={16} className="fill-amber-500 stroke-amber-500" />
        <Star size={16} className="fill-amber-500 stroke-amber-500" />
        <Star size={16} className="fill-amber-500 stroke-amber-500" />
        <Star size={16} className="fill-amber-500 stroke-amber-500" />
        <Star size={16} className="fill-amber-500 stroke-amber-500" />
        <p className="text-xs text-gpurple-2 ml-1">(16 Reviews)</p>
      </div>
      <div className="flex items-center justify-between m-4 mt-2">
        <div>
          <p className="text-3xl font-bold tracking-wide">฿{product.price}</p>
        </div>
        {/* <div className="flex w-40 justify-between items-center border-2 rounded-xl border-gpurple-2">
          <p className="text-gpurple-2 w-full font-bold textxl p-2">$149.99</p>
          <button className="bg-gpurple-2 p-2 rounded-e-lg">
            <ShoppingCart />
          </button>
        </div> */}
        <div className="flex gap-2">
          <Button className="border border-gbase-1 bg-gbase-3 rounded-lg p-2">
            <Heart
              color="#A78BFA"
              className="hover:fill-gpurple-2 active:fill-red-600 active:stroke-red-600 "
            />
          </Button>
          <Button className="border border-gbase-1 bg-gbase-3 rounded-lg p-2">
            <ShoppingCart />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
