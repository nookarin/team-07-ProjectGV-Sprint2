import { useCart } from "@/contexts/Cart/CartProvider";
import { Heart, ShoppingCart } from "lucide-react";
import React from "react";

const ProductSecondaryCard = ({ img, name, price, description }, product) => {
  const { addToCart } = useCart();
  return (
    <div className="border border-gpurple-2 bg-gbg-1/95 text-center rounded-2xl shadow-lg shadow-purple-900/50">
      <img
        className="rounded-t-2xl w-full h-80 object-cover"
        src={img}
        alt={name}
      />
      <div className="w-[80%] mx-auto my-4 text-white">
        <h3 className="font-bold text-sm lg:text-xl">{name.toUpperCase()}</h3>
        <p className="text-sm h-30 overflow-auto font-light mt-4 scrollbar-thumb-gbase-1">
          {description}
        </p>
      </div>
      <div className="flex justify-between m-4 mt-10">
        <div className="flex w-40 justify-between items-center border-2 rounded-xl border-gpurple-2">
          <p className="text-gpurple-2 w-full font-bold textxl p-2">${price}</p>
          <button
            onClick={() => addToCart(product)}
            className="bg-gpurple-2 p-2 rounded-e-lg hover:bg-gpurple-4"
          >
            <ShoppingCart />
          </button>
        </div>
        <button>
          <Heart
            color="#A78BFA"
            className="hover:fill-gpurple-2 active:fill-red-600 active:stroke-red-600 "
          />
        </button>
      </div>
    </div>
  );
};

export default ProductSecondaryCard;
