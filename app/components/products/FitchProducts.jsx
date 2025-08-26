"use client";
import { useState, useEffect } from "react";
import FilterForm from "./FilterProducts.jsx";
import Image from "next/image";
import { useDispatch, useSelector } from "react-redux";
import { fetchProducts } from "@/app/redux/productSlice.js";
import { addToCart } from "@/app/redux/cartSlice.js";

export default function FitchProducts() {
  const [filtered, setFiltered] = useState([]);
  const [searchName, setSearchName] = useState("");
  const [priceSort, setPriceSort] = useState("");

  const dispatch = useDispatch();
  const { products, loading, error } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);
  // when products are fetched, set filtered = all products
  useEffect(() => {
    if (products.length > 0) {
      setFiltered(products);
    }
  }, [products]);
  async function filterFn() {
    // Step 1: Always start by filtering the **full products list**
    const term = searchName.toLowerCase();
    const afterFilter = products.filter((product) =>
      product.title.toLowerCase().includes(term)
    );
    let result = afterFilter;
    // Step 2: Then sort the filtered list (if sorting was selected)
    if (priceSort === "0") {
      result = [...afterFilter].sort((a, b) => a.price - b.price);
    } else if (priceSort === "1") {
      result = [...afterFilter].sort((a, b) => b.price - a.price);
    }
    // Update filtered state once
    setFiltered(result);
  }

  function addProduct(product) {
    dispatch(addToCart(product));
  }

  return (
    <main className="max-w-6xl mx-auto">
      <Image
        src="/phones.avif"
        alt="market products"
        width={1480}
        height={800}
        className="mt-5"
        unoptimized
      />
      <FilterForm
        searchName={searchName}
        priceSort={priceSort}
        setSearchName={setSearchName}
        setPriceSort={setPriceSort}
        filterFn={filterFn}
      />

      {/* products */}
      <div>
        {filtered.length !== 0 && !loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 mt-5">
            {/* product cart */}
            {filtered.map((product) => (
              <div
                key={product.id}
                className="border border-gray-300 p-3 rounded-lg flex flex-col justify-between items-center"
              >
                <Image
                  src={product.image}
                  alt={product.description}
                  width={280}
                  height={400}
                  unoptimized
                  className="mb-4 p-2 h-52"
                />
                <h3 className="font-bold flex justify-between mb-3 w-full">
                  {product.title}
                </h3>
                <p className="text-gray-600 mb-3">{product.description}</p>
                <div className="flex justify-between mb-3 w-full">
                  <p className="flex justify-center">
                    <span className="text-gray-500">{product.price}$</span>
                  </p>
                  <p
                    className={`flex justify-center items-center ${
                      product.rating.count === 0
                        ? "text-red-600 line-through"
                        : "text-gray-700"
                    }`}
                  >
                    {product.rating.count}
                    <span
                      className={`ml-1 ${
                        product.rating.count === 0
                          ? "text-red-500"
                          : "text-gray-700"
                      }
                }`}
                    >
                      in stock
                    </span>
                  </p>
                </div>
                <button
                  disabled={product.rating.count === 0}
                  className={`
                w-full rounded py-2 font-semibold text-white
                ${
                  product.rating.count === 0
                    ? "bg-[#55154059] cursor-not-allowed"
                    : "bg-[#551540de]"
                }
              `}
                  onClick={() => addProduct(product)}
                >
                  Add to Cart
                </button>
              </div>
            ))}
          </div>
        )}

        {products.length === 0 && !loading && (
          <div className="bg-gray-200 p-4 rounded-md mt-4 text-center">
            <p>There are no products !</p>
          </div>
        )}
      </div>
      {loading && (
        <div className="bg-gray-200 p-4 rounded-md mt-4 text-center">
          <h2 className="text-[#551540de] text-lg font-bold">Loading...</h2>
          <p>Hopefully not for to long :)</p>{" "}
        </div>
      )}
    </main>
  );
}
