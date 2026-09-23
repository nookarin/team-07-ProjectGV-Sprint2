import { Badge } from "#components/ui/badge";
import { Button } from "@base-ui/react";
import { Heart, ShoppingCart, Star } from "lucide-react";
import React from "react";
import { data, Link } from "react-router-dom";
import img_default from "/images/headset.jpg";
import { useCart } from "@/contexts/Cart/CartProvider";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { useWishlist } from "@/contexts/Wishlist/WishlistProvider";

const ProductCard = ({ img, product }) => {
  const { url, user } = useAuth();
  const { cart, setCart, addToCart,err } = useCart();
  // Pull the wishlist functions/state from context so the heart can add and remove.
  const { products, addToWishlist, removeFromWishlist } = useWishlist();
  // check active.
  const isWishlisted = products.some((p) => p._id === product._id);
  // Toggle adds if absent, removes if already saved.
  const handleWishlistClick = () =>
    isWishlisted ? removeFromWishlist(product._id) : addToWishlist(product);

  return (
    <div className="relative border bg-gbg-1/60 backdrop-blur-2xl border-gpurple-2 text-center rounded-2xl shadow-lg shadow-purple-900/50 text-white">
      <Badge
        variant="outline"
        className={"border-gpurple-2 absolute left-5 top-2 bg-gpurple-4/55"}
      >
        {product.category_id.category_name}
      </Badge>
      <Link to={`/product/${product._id}`}>
        <img
          className="rounded-t-2xl w-full h-100 object-cover border-b border-gbase-1"
          src={img ? img : img_default}
          alt=""
        />
      </Link>
      <div className="w-[80%] h-30 mx-auto my-4 text-white">
        <h3 className="font-bold text-xs sm:text-base xl:text-xl">
          {product.product_name}
        </h3>
        <p
          className={`text-sm font-light mt-4 overflow-auto scrollbar-thumb-gbase-1 ${product.product_name.length > 20 ? "h-[70%]" : "h-[90%]"}`}
        >
          {product.description}
        </p>
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
        <div className="flex gap-2">
          <Button 
            onClick={handleWishlistClick}
            className="border border-gbase-1 bg-gbase-3 rounded-lg p-2 hover:bg-gpurple-4">
            <Heart
              color="#ffffff"
              className={isWishlisted ? "fill-red-600 stroke-red-600" : ""}
            />
          </Button>
          <Button
            onClick={() => addToCart(product)}
            className="border border-gbase-1 bg-gbase-3 rounded-lg p-2 hover:bg-gpurple-4"
          >
            <ShoppingCart />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
