import ProductCard from "#components/ProductCard/ProductCard";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import axios from "axios";
import React, { useEffect, useState } from "react";

const AllProductPage = () => {
  const { url } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/products`);
    setProducts(response.data.products);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);
  return (
    <div className="min-h-screen">
      <header className="h-60 border flex flex-col justify-center items-center border-gbase-1 bg-linear-to-br from-gbg-1 0% via-50% via-gbase-3 to-gpurple-5/40">
        <div className="text-white text-center">
          {/* <h3 className="font-bold tracking-widest">PRODUCTS</h3> */}
          <h1 className="font-light text-7xl tracking-tighter capitalize">
            All Products
            <span className="text-gcyan-light">.</span>
          </h1>
        </div>
      </header>
      <div className="w-3/4 mx-auto py-20">
        <div className="grid grid-cols-3 gap-6">
          {!loading ? (
            products?.map((item) => {
              return (
                <div key={item._id}>
                  <ProductCard img={item.images[0]} product={item} />
                </div>
              );
            })
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllProductPage;
