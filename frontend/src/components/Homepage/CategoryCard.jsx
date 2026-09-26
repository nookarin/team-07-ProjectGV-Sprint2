import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ img, name }) => {
  return (
    <div className="border border-gpurple-2 md:rounded-2xl rounded-4xl">
      <Link to={`/products/${name}`} className="relative">
        <img src={img} alt={name} className="rounded-4xl" />
        <div className="font-bold absolute bottom-2 left-1/2 -translate-x-1/2 text-center">
          <p className="text-white tracking-widest">{name.toUpperCase()}</p>
        </div>
      </Link>
    </div>
  );
};

export default CategoryCard;
