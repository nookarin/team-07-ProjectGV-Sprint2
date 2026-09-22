import React, { useEffect, useState } from "react";
import img_product1 from "../../assets/image-product/Gemini_Generated_Image_4knuxp4knuxp4knu.jpg";
import ProductCard from "#components/ProductCard/ProductCard";
import { useParams } from "react-router-dom";
import { DollarSign } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import { Ring } from "#components/ring";

const ProductListPage = () => {
  const param = useParams();
  const { url } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(null);
  const [filter, setFilter] = useState("");
  const [tags, setTags] = useState([]);
  const [price, setPrice] = useState({
    min: 0,
    max: 20000,
  });
  const fetchData = async () => {
    setLoading(true);
    const response = await axios.get(`${url}/products/${param.id}?name=${filter}`);
    setProducts(response.data.products);
    setLoading(false);
  };

  const fetchTags = async () => {
    const response = await axios.get(`${url}/subcategories`);
    setTags(response.data.subcategories);
  };
  useEffect(() => {
    fetchData();
    fetchTags();
  }, [filter, param.id]);

  const min = price.min === "" || price.min == null ? 0 : Number(price.min);
  const max = price.max === "" || price.max == null ? Infinity : Number(price.max);
  const filteredProducts = products.filter(
    (product) => product.price >= min && product.price <= max,
  );
  return (
    <div className="min-h-screen relative z-10">
      <div className="h-60 border flex flex-col justify-center items-center border-gbase-1 bg-linear-to-br from-gbg-1 0% via-50% via-gbase-3 to-gpurple-5/40">
        <div className="text-white text-center">
          <h3 className="font-bold tracking-widest">COLLECTION</h3>
          <h1 className="font-light text-7xl tracking-tighter capitalize">
            {param.id}
            <span className="text-gcyan-light">.</span>
          </h1>
        </div>
      </div>
      <aside className="bg-gbg-2/30 border backdrop-blur-xl border-gbase-1 w-9/12 flex flex-col gap-2 mx-auto mt-10 rounded-2xl text-white px-10 py-4">
        <div className="flex flex-col">
          <label htmlFor="name">Search name</label>
          <input
            type="text"
            id="name"
            onChange={(e) => setFilter(e.target.value)}
            className="border border-gbase-2 bg-gbase-3/30 rounded-lg mt-2 py-1 px-2"
          />
        </div>
        <div className="flex gap-5">
          <div className="flex flex-col gap-2">
            <label>Price:</label>
            <div className="flex items-center">
              <div className="flex items-center border border-gbase-2 bg-gbase-3/30 px-2 py-1 rounded-lg">
                <DollarSign size={14} color="gray" />
                <input
                  type="number"
                  name="min"
                  className="outline-0"
                  placeholder="min price"
                  value={price.min === 0 ? "" : price.min}
                  onChange={(e) =>
                    setPrice({ ...price, [e.target.name]: e.target.value })
                  }
                />
              </div>
              <span className="mx-2">-</span>
              <div className="flex items-center border border-gbase-2 bg-gbase-3/30 px-2 py-1 rounded-lg">
                <DollarSign size={14} color="gray" />
                <input
                  type="number"
                  name="max"
                  className="outline-0"
                  placeholder="max price"
                  value={price.max === 20000 ? "" : price.max}
                  onChange={(e) =>
                    setPrice({ ...price, [e.target.name]: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          {/* <div>
            <p>Sort</p>
          </div> */}
          <div className="flex flex-col gap-2">
            <label htmlFor="">Tags:</label>
            <div className="flex gap-2">
              {!loading ? (
                tags?.map((tag, index) => {
                  return (
                    <button
                      key={index}
                      className="border border-gpurple-2/40 px-2 py-1 rounded-xl bg-gpink-3/30"
                    >
                      {tag.subcategory_name}
                    </button>
                  );
                })
              ) : (
                <p>Loading..</p>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className="w-9/12 py-14 mx-auto">
        <div className="grid grid-cols-3 xl:gap-10 max-xl:gap-20">
          {!loading ? (
            filteredProducts?.map((product, index) => {
              return (
                <div key={index}>
                  <ProductCard product={product} img={product.image_url} />
                </div>
              );
            })
          ) : (
            <Ring className={"size-20"} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
