"use client";
import { useState } from "react";

export default function PaymentForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    address: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Payment Submitted ✅");
  };

  return (
    <main className="max-w-6xl mx-auto">
      <div className="pt-8 mt-8 flex flex-col justify-items-center items-center">
        <h1 className="pt-6 pb-2 mb-4 border-b-8 border-double uppercase text-2xl text-center text-[#551540de] font-semibold">
          💳 Payment Form
        </h1>
      </div>

      <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="text"
            name="address"
            placeholder="Billing Address"
            value={form.address}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />

          <input
            type="text"
            name="cardNumber"
            placeholder="Card Number"
            value={form.cardNumber}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          <div className="flex gap-2">
            <input
              type="text"
              name="expiry"
              placeholder="MM/YY"
              value={form.expiry}
              onChange={handleChange}
              className="w-1/2 border p-2 rounded"
              required
            />
            <input
              type="text"
              name="cvv"
              placeholder="CVV"
              value={form.cvv}
              onChange={handleChange}
              className="w-1/2 border p-2 rounded"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#551540b1] text-white py-2 rounded hover:bg-[#551540de]"
          >
            Pay Now
          </button>
        </form>
      </div>
    </main>
  );
}
