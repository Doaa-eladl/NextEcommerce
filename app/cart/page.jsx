"use client";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart, updateQuantity } from "../redux/cartSlice";
import { useEffect } from "react";

export default function Cart() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const { items, loading, error } = useSelector((state) => state.cart);

  function calcTotal() {
    const total = items.reduce((sum, item) => {
      return sum + item.price * item.quantity;
    }, 0);
    return total;
  }

  const handleUpdate = (type, product) => {
    dispatch(updateQuantity({ type, cartProduct: product }));
  };

  return (
    <main className="max-w-6xl mx-auto">
      <div className="pt-8 mt-8 flex flex-col justify-items-center items-center">
        <h1 className="w-min pt-6 pb-2 border-b-8 border-double uppercase text-2xl text-center text-[#551540de] font-semibold">
          Cart
        </h1>
      </div>

      {items.length !== 0 && (
        <>
          <div className="rounded-md overflow-hidden border border-gray-300 mt-6">
            <table className="min-w-full table-auto text-center">
              <thead className="bg-gray-100">
                <tr>
                  <th className=" px-4 py-2">ID</th>
                  <th className=" px-4 py-2">Product Name</th>
                  <th className=" px-4 py-2">Price ($)</th>
                  <th className=" px-4 py-2">Quantity</th>
                  <th className=" px-4 py-2">Action</th>
                  <th className=" px-4 py-2">Total ($)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((product) => (
                  <tr key={product.id} className="text-zinc-600 text-sm">
                    <td className=" px-4 py-2">{product.id}</td>
                    <td className=" px-4 py-2">{product.name}</td>
                    <td className=" px-4 py-2">{product.price}</td>
                    <td className=" px-4 py-2">
                      <span>{product.quantity}</span>
                    </td>
                    <td className=" px-4 py-2 flex items-center justify-center gap-2">
                      <button
                        className="px-2 py-1 font-semibold text-3xl text-red-800"
                        onClick={() => handleUpdate("-", product)}
                      >
                        –
                      </button>
                      <button
                        className={`px-2 py-1 font-semibold text-3xl text-green-800  ${
                          product.stock === 0
                            ? " opacity-40 cursor-not-allowed"
                            : ""
                        }`}
                        disabled={product.stock === 0}
                        onClick={() => handleUpdate("+", product)}
                      >
                        +
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800"
                        onClick={() => handleUpdate("remove", product)}
                      >
                        🗑️
                      </button>
                    </td>
                    <td className=" px-4 py-2">
                      {product.price * product.quantity}
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={6} className="px-4 py-2 border-t">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>{calcTotal()}$</span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-5 flex justify-end items-center">
            <Link
              href="/bill"
              className="font-semibold text-base bg-[#551540de] text-white py-3 px-5 rounded-md"
            >
              Purchase
            </Link>
          </div>
        </>
      )}

      {/* there is no products */}
      {items.length === 0 && !loading && (
        <div className="bg-gray-200 p-4 rounded-md mt-4 text-center">
          <p>there is no products in Cart</p>
        </div>
      )}

      {items.length === 0 && loading && (
        <div className="bg-gray-200 p-4 rounded-md mt-4 text-center">
          <h2 className="text-[#551540de] text-lg font-bold">Loading...</h2>
          <p>Hopefully not for to long :)</p>{" "}
        </div>
      )}
    </main>
  );
}
