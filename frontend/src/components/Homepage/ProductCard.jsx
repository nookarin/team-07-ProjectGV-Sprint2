import { Heart, ShoppingCart } from "lucide-react";
import React from "react";

const ProductCard = ({ img }) => {
  return (
    <div className="border border-[#A78BFA] text-center rounded-2xl shadow-lg shadow-purple-900/50">
      <img className="rounded-t-2xl h-80 object-cover" src={img} alt="" />
      <div className="w-[80%] mx-auto my-4">
        <h3 className="font-bold text-xl">Product Name</h3>
        <p className="text-sm font-light mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Nesciunt
          sequi enim modi ab? Exp
        </p>
      </div>
      <div className="flex justify-between m-4 mt-10">
        <div className="flex w-40 justify-between items-center border-2 rounded-xl border-[#A78BFA]">
          <p className="text-[#A78BFA] w-full font-bold textxl p-2">$149.99</p>
          <button className="bg-[#A78BFA] p-2 rounded-e-lg">
            <ShoppingCart />
          </button>
        </div>
        <button>
          <Heart color="#A78BFA" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
