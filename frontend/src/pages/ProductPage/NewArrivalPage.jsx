import ProductSecondaryCard from "#components/Homepage/ProductSecondaryCard";
import LoadingScreen from "#components/LoadingScreen";
import PromotionSection from "#components/Promotion/PromotionSection";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

const NewArrivalPage = () => {
  const { url } = useAuth();
  const [loading, setLoading] = useState(null);
  const [products, setProducts] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/products?createdAt=1`);
    setProducts(response.data.products);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="min-h-[calc(100vh-4rem)] relative z-10 w-full flex flex-col text-white">
      {loading && <LoadingScreen />}
      <div className="h-60 border flex flex-col justify-center items-center border-gbase-1 bg-linear-to-br from-gbg-1 0% via-50% via-gbase-3 to-gpurple-5/40">
        <div className="text-white text-center">
          <h3 className="font-bold tracking-widest">GET</h3>
          <h1 className="font-light text-7xl tracking-tighter capitalize">
            Coupons
            <span className="text-gcyan-light">.</span>
          </h1>
        </div>
      </div>
      {/* <div className="w-full my-10 flex items-center justify-center">
        <div className="grid grid-cols-1 md:w-10/12 md:grid-cols-2 xl:grid-cols-3 gap-16 w-8/12">
          {!loading &&
            products?.slice(0, 3).map((item) => {
              return <div key={item._id}><ProductSecondaryCard product={item} /></div>;
            })}
        </div>
      </div> */}
      <div className="w-3/4 mx-auto my-10">
        <img
          className="rounded-4xl"
          src="images/banner_voucher2.jpg"
          alt="banner"
        />
      </div>
      <div className="w-3/4 mx-auto mb-10">
        <PromotionSection />
      </div>
    </div>
  );
};

export default NewArrivalPage;
