"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
export default function RequestForm({ currentUser }) {
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Fetch categories from your products
  const categories = [...new Set(items.map(i => i.category))];

  useEffect(() => {
    fetch("/api/product", {
      headers: { "auth-token": localStorage.getItem("token") },
    })
      .then(res => res.json())
      .then(data => setItems(data.products || []));
  }, []);

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity) return alert("Select a product and quantity");
    const res = await fetch("/api/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({ productId: selectedProduct._id, quantity }),
    });

    const result = await res.json();
    if (result.success) alert("Request submitted!");
    else alert("Error: " + result.message);
  };

  return (
    
    <div className="p-4 bg-white shadow rounded">
  <Header />
      <h2 className="text-lg font-semibold mb-2">Request Item</h2>

      <select value={category} onChange={e => setCategory(e.target.value)}>
        <option value="">Select Category</option>
        {categories.map(c => <option key={c}>{c}</option>)}
      </select>

      {category && (
        <select onChange={e => setSelectedProduct(items.find(i => i._id === e.target.value))}>
          <option value="">Select Item</option>
          {items
            .filter(i => i.category === category)
            .map(i => (
              <option key={i._id} value={i._id}>
                {i.code} - {i.slug}
              </option>
            ))}
        </select>
      )}

      <input
        type="number"
        min="1"
        value={quantity}
        onChange={e => setQuantity(e.target.value)}
        className="border p-1"
        placeholder="Quantity"
      />

      <button onClick={handleSubmit} className="bg-blue-600 text-white px-4 py-1 rounded mt-2">
        Submit Request
      </button>
    </div>
  );
}
