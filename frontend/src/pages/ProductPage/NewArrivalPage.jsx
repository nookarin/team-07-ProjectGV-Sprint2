import ProductSecondaryCard from "#components/Homepage/ProductSecondaryCard";
import LoadingScreen from "#components/LoadingScreen";
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
    console.log(response);
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="min-h-[calc(100vh-4rem)] relative z-10 w-full flex flex-col text-white">
      {loading && <LoadingScreen />}
      <div className="h-60 border flex flex-col justify-center items-center border-gbase-1 bg-linear-to-br from-gbg-1 0% via-50% via-gbase-3 to-gpurple-5/40">
        <div className="text-white text-center">
          <h3 className="font-bold tracking-widest">OUR</h3>
          <h1 className="font-light text-7xl tracking-tighter capitalize">
            New Arrivals
            <span className="text-gcyan-light">.</span>
          </h1>
        </div>
      </div>
      <div className="w-full h-screen flex items-center justify-center">
        {/* <p>NO PRODUCTS</p> */}
        <div className="grid grid-cols-3 gap-16 w-8/12">
          {!loading &&
            products?.slice(0, 3).map((item) => {
                console.log(item)
              return <div key={item._id}><ProductSecondaryCard product={item} /></div>;
            })}
        </div>
      </div>
    </div>
  );
};

export default NewArrivalPage;
