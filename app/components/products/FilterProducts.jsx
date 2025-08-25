"use client";

import { useEffect } from "react";

export default function FilterProducts({
  searchName,
  priceSort,
  setSearchName,
  setPriceSort,
  filterFn,
}) {
  useEffect(() => {
    filterFn();
  }, [searchName, priceSort]);

  // onSortChange function to update the priceSort state
  const onSortChange = (value) => {
    setPriceSort(value);
  };

  return (
    <form className="flex flex-wrap sm:flex-nowrap justify-between items-center mt-5">
      <input
        type="text"
        value={searchName}
        onChange={(e) => setSearchName(e.target.value)}
        placeholder="Search by name"
        className="
                    w-full px-4 py-2 mr-0 mb-3 sm:mr-3 sm:mb-0
                    border border-gray-300 rounded-2xl
                    focus:outline-none focus:border-indigo-400
                    transition
                    placeholder-gray-500 text-gray-900
                "
      />
      <select
        value={priceSort}
        onChange={(e) => onSortChange(e.target.value)}
        className="
          w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-2xl bg-white
          focus:outline-none focus:border-indigo-400 transition text-gray-500
        "
      >
        <option value="" disabled defaultValue>
          Sort by price
        </option>
        <option value="0">Lowest price first</option>
        <option value="1">Highest price first</option>
      </select>
    </form>
  );
}
