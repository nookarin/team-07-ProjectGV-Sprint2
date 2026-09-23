import React, { useEffect, useState } from "react";
import img_cate1 from "../../assets/image-category/Gemini_Generated_Image_hh5i48hh5i48hh5i.jpg";
import img_cate2 from "../../assets/image-category/Gemini_Generated_Image_k7cgvsk7cgvsk7cg.jpg";
import img_cate3 from "../../assets/image-category/Gemini_Generated_Image_pjqv70pjqv70pjqv.jpg";
import img_cate4 from "../../assets/image-category/Gemini_Generated_Image_rex7yirex7yirex7.jpg";
import img_product1 from "../../assets/image-product/Gemini_Generated_Image_4knuxp4knuxp4knu.jpg";
import img_product2 from "../../assets/image-product/Gemini_Generated_Image_cfukikcfukikcfuk.jpg";
import img_product3 from "../../assets/image-product/Gemini_Generated_Image_waq5aswaq5aswaq5.jpg";
import ProductSecondaryCard from "#components/Homepage/ProductSecondaryCard";
import CategoryCard from "#components/Homepage/CategoryCard";
// import fluidCursor from "../../contexts/use-FluidCursor";
import BannerCarousel from "#components/Homepage/BannerCarousel";
import HeaderSection from "#components/Homepage/HeaderSection";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";

const category = [
  { name: "headphone", img: img_cate1 },
  { name: "keyboard", img: img_cate2 },
  { name: "accessory", img: img_cate3 },
  { name: "mouse", img: img_cate4 },
];

const mock_item = [
  {
    name: "Keyboard Mark II",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi deleniti sunt odit soluta quia esse!",
    price: 99.99,
    img: img_product1,
  },
  {
    name: "Mouse Mark II",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi deleniti sunt odit soluta quia esse!",
    price: 39.99,
    img: img_product2,
  },
  {
    name: "Headphone Mark II",
    description:
      "Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eligendi deleniti sunt odit soluta quia esse!",
    price: 129.99,
    img: img_product3,
  },
];

const Homepage = () => {
  const [loading, setLoading] = useState(null);
  const [products, setProducts] = useState([]);
  const { url } = useAuth();
  const getProducts = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/products`);
    setProducts(response.data.products);
    setLoading(false);
  };
  useEffect(() => {
    getProducts();
  }, []);
  return (
    <div className="relative z-10">
      <BannerCarousel />
      <div className="w-3/4 mx-auto my-10">
        <HeaderSection name={"categories"} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {category.map((item, index) => {
            return <CategoryCard img={item.img} name={item.name} key={index} />;
          })}
        </div>
      </div>
      <div className="w-3/4 mx-auto py-10">
        <HeaderSection name={"trending gear"} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 text-white">
          {!loading &&
            products?.slice(0, 3).map((item, index) => {
              return (
                <div key={index}>
                  <ProductSecondaryCard product={item} />
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
