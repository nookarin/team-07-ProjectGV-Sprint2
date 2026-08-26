import React from "react";
import { Link } from "react-router-dom";

const CategoryCard = ({ img }) => {
  return (
    <Link className="relative">
      <img src={img} alt="" />
      <p className="text-white font-semibold absolute bottom-6 left-1/2 -translate-x-1/2">
        View All {"➜"}
      </p>
    </Link>
  );
};

export default CategoryCard;
