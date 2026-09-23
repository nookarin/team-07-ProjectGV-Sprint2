import ProductSecondaryCard from "#components/Homepage/ProductSecondaryCard";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

const SalePage = () => {
  const [loading, setLoading] = useState(null);
  const [data, setData] = useState([]);
  const { url } = useAuth();
  const fetchData = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/products`);
    setData(response.data.products);
    setLoading(false);
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="h-screen w-full flex flex-col text-white">
      <div className="h-60 border flex flex-col justify-center items-center border-gbase-1 bg-linear-to-br from-gbg-1 0% via-50% via-gbase-3 to-gpurple-5/40">
        <div className="text-white text-center">
          <h3 className="font-bold tracking-widest">SALE</h3>
          <h1 className="font-light text-7xl tracking-tighter capitalize">
            Big Clearance
            <span className="text-gcyan-light">.</span>
          </h1>
        </div>
      </div>
      <div className="w-full flex flex-1 items-center justify-center">
        {/* <p>NO PRODUCTS</p> */}
        <div className="grid grid-cols-3 gap-10 w-8/12">
          {!loading &&
            data?.slice(0, 3).map((item) => {
              return (
                <ProductSecondaryCard product={item} discount={0.7} />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default SalePage;
