"use client";

import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { fetchCart } from "../redux/cartSlice";
import { useEffect } from "react";

export default function CartNavbar() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch]);

  const { items } = useSelector((state) => state.cart);

  return (
    <ul>
      <li className="relative">
        {items.length > 0 && (
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-[#551540de] ring-1 ring-white"></span>
        )}
        <Link href="/cart">
          <i className="bi bi-cart"></i>
        </Link>
      </li>
    </ul>
  );
}
