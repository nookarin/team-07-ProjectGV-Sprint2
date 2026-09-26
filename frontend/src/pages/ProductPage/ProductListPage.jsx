import React, { useEffect, useState } from "react";
import img_product1 from "../../assets/image-product/Gemini_Generated_Image_4knuxp4knuxp4knu.jpg";
import ProductCard from "#components/ProductCard/ProductCard";
import { useParams } from "react-router-dom";
import { DollarSign } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/contexts/Authentication/AuthContext";
import LoadingScreen from "@/components/LoadingScreen";
import { useDebounce } from "use-debounce";

const ProductListPage = () => {
  const param = useParams();
  const { url } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(null);
  const [filter, setFilter] = useState("");
  const [debouncedValue] = useDebounce(filter, 500);
  const [tags, setTags] = useState([]);
  const [err, setErr] = useState("");
  const [price, setPrice] = useState({
    min: 0,
    max: 20000,
  });
  const [filterTag, setFilterTag] = useState("");
  const fetchData = async () => {
    setLoading(true);
    setErr("");
    try {
      const response = await axios.get(
        `${url}/products/${param.id}?name=${filter}&tag=${filterTag}`,
      );
      console.log(response.data);
      if (response.data.message) {
        setProducts([]);
        setErr(response.data.message);
      }
      setProducts(response.data.products);
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const fetchTags = async () => {
    const response = await axios.get(`${url}/subcategories`);
    setTags(response.data.subcategories);
  };
  useEffect(() => {
    fetchData();
  }, [debouncedValue, filterTag]);

  useEffect(() => {
    fetchData();
    fetchTags();
  }, [param.id]);

  const min = price.min === "" || price.min == null ? 0 : Number(price.min);
  const max =
    price.max === "" || price.max == null ? Infinity : Number(price.max);
  const filteredProducts = products?.filter(
    (product) => product.price >= min && product.price <= max,
  );
  return (
    <div className="min-h-[calc(100vh-4rem)] relative z-10">
      {/* Show full-screen LoadingScreen while the products API request is being fetched */}
      {loading && <LoadingScreen />}
      <div className="h-60 border flex flex-col justify-center items-center border-gbase-1 bg-linear-to-br from-gbg-1 0% via-50% via-gbase-3 to-gpurple-5/40">
        <div className="text-white text-center">
          <h3 className="font-bold tracking-widest">COLLECTION</h3>
          <h1 className="font-light text-7xl tracking-tighter capitalize">
            {param.id}
            <span className="text-gcyan-light">.</span>
          </h1>
        </div>
      </div>
      <aside className="bg-gbg-2/30 border backdrop-blur-xl border-gbase-1 w-11/12 sm:w-9/12 flex flex-col gap-3 sm:gap-2 mx-auto mt-10 rounded-2xl text-white px-4 sm:px-6 lg:px-10 py-4">
        <div className="flex flex-col">
          <label htmlFor="name" className="text-sm sm:text-base">
            Search name
          </label>
          <input
            type="text"
            id="name"
            placeholder="GearVerse Nova III"
            onChange={(e) => setFilter(e.target.value)}
            className="w-full border border-gbase-2 bg-gbase-3/30 rounded-lg mt-2 py-2 sm:py-1 px-2"
          />
        </div>
        <div className="flex flex-col lg:flex-row gap-5 w-full">
          <div className="flex flex-col gap-2 w-full lg:w-1/2">
            <label>Price:</label>
            <div className="flex items-center gap-1 sm:gap-0">
              <div className="flex flex-1 items-center min-w-0 border border-gbase-2 bg-gbase-3/30 px-2 py-1.5 sm:py-1 rounded-lg">
                <DollarSign size={14} color="gray" className="shrink-0" />
                <input
                  type="number"
                  name="min"
                  className="outline-0 w-full min-w-0 sm:w-40"
                  placeholder="min price"
                  value={price.min === 0 ? "" : price.min}
                  onChange={(e) =>
                    setPrice({ ...price, [e.target.name]: e.target.value })
                  }
                />
              </div>
              <span className="shrink-0 mx-1 sm:mx-2">-</span>
              <div className="flex flex-1 items-center min-w-0 border border-gbase-2 bg-gbase-3/30 px-2 py-1.5 sm:py-1 rounded-lg">
                <DollarSign size={14} color="gray" className="shrink-0" />
                <input
                  type="number"
                  name="max"
                  className="outline-0 w-full min-w-0 sm:w-40"
                  placeholder="max price"
                  value={price.max === 20000 ? "" : price.max}
                  onChange={(e) =>
                    setPrice({ ...price, [e.target.name]: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full lg:w-1/2">
            <label htmlFor="" className="text-sm sm:text-base">
              Tags:
            </label>
            <div className="flex gap-2 min-h-10 max-h-24 w-full overflow-y-auto flex-wrap scrollbar-thumb-gbase-1 scrollbar-track-gbase-3/50 scrollbar-thin">
              {!loading ? (
                tags?.map((tag, index) => {
                  return (
                    <button
                      key={index}
                      className="border border-gpurple-2/40 px-2 py-1.5 sm:py-1 rounded-xl bg-gpink-3/30 hover:bg-gpink-2"
                      // onClick={(e) => setFilterTag(tag.subcategory_name)}
                    >
                      {tag.subcategory_name}
                    </button>
                  );
                })
              ) : (
                <p>Loading...</p>
              )}
            </div>
          </div>
        </div>
      </aside>
      <div className="w-9/12 py-14 mx-auto">
        <div
          className={`${loading ? "flex justify-center" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 xl:gap-10 max-xl:gap-20"}`}
        >
          {!loading &&
            filteredProducts?.map((product, index) => {
              return (
                <div key={index}>
                  <ProductCard product={product} img={product.image_url} />
                </div>
              );
            })}
          {err && <p className="text-gray-500">{err}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProductListPage;
