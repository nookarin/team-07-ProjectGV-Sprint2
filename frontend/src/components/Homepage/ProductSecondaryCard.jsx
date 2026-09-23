import { useCart } from "@/contexts/Cart/CartProvider";
import { Heart, ShoppingCart } from "lucide-react";
import React from "react";

const ProductSecondaryCard = ({ product, discount }) => {
  const { addToCart } = useCart();
  return (
    <div className="border border-gpurple-2 bg-gbg-1/95 text-center rounded-2xl shadow-lg shadow-purple-900/50">
      <img
        className="rounded-t-2xl w-full h-80 object-cover"
        src={product.image_url}
        // alt={name}
      />
      <div className="w-[80%] mx-auto my-4 text-white">
        <h3 className="font-bold text-sm lg:text-xl">{product.product_name}</h3>
        <p className="text-sm h-30 overflow-auto font-light mt-4 scrollbar-thumb-gbase-1">
          {product.description}
        </p>
      </div>
      <div className="flex justify-between m-4 mt-10">
        <div className="flex w-40 justify-between items-center border-2 rounded-xl border-gpurple-2">
          <div className="flex items-center w-full h-10">
            <p
              className={`text-gpurple-2 ${discount ? "line-through ml-2 font-normal text-sm" : "w-full p-2 font-bold text-2xl"}`}
            >
              ${product.price}
            </p>
            <p className={`text-red-500 ml-1 font-bold text-2xl ${!discount && "hidden"}`}>
              {Math.floor(product.price * discount)}
            </p>
          </div>
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
