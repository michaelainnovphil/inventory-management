"use client";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Header from "@/components/Header";


export default function RequestPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState("");
  const [requestedBy, setRequestedBy] = useState("");


  useEffect(() => {
  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/product", {
        headers: {
          "auth-token": localStorage.getItem("token"),
        },
      });

      const data = await res.json();

      console.log("Fetched products:", data.products); // ✅ Add this

      if (res.ok && Array.isArray(data.products)) {
        setProducts(data.products);
        const uniqueCategories = [...new Set(data.products.map((p) => p.category))];
        setCategories(uniqueCategories);
      } else {
        toast.error(data.message || "Failed to fetch products");
      }
    } catch (err) {
      toast.error("Error fetching products");
    }
  };

  fetchProducts();
}, []);





  useEffect(() => {
  if (selectedCategory) {
    const filtered = products.filter((p) => {
      const matchesCategory =
        p.category?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesSearch =
        !searchText.trim() ||
        p.slug?.toLowerCase().includes(searchText.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
    setFilteredProducts(filtered);
  } else {
    setFilteredProducts([]);
  }
}, [searchText, selectedCategory, products]);




  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) {
      toast.error("Please select a product from the list.");
      return;
    }

    const res = await fetch("/api/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({
        productId: selectedProduct._id,
        quantity,
        reason,
        requestedBy,
      }),
    });

    

    const result = await res.json();
    if (res.ok) {
      toast.success("Request submitted!");
      setSelectedCategory("");
      setSearchText("");
      setSelectedProduct(null);
      setQuantity(1);
      setReason("");
    } else {
      toast.error(result.message || "Something went wrong");
    }
  };

  return (
    <div className="md:p-6 w-full">
      <Header />
    <div className="max-w-md mx-auto mt-10 p-6 border rounded">
      <h2 className="text-xl font-bold mb-4">Request an Item</h2>
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Category Dropdown */}
        <select
          className="w-full p-2 border rounded"
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSearchText("");
            setSelectedProduct(null);
          }}
          required
        >
          <option value="">Select a category</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Search Input */}
        {selectedCategory && (
          <input
            type="text"
            className="w-full p-2 border rounded"
            placeholder="Search product by name"
            value={searchText}
            onChange={(e) => {
              setSearchText(e.target.value);
              setSelectedProduct(null);
            }}
          />
        )}

        {/* Filtered Product Results */}
        {selectedCategory && (
  <ul className="border rounded p-2 max-h-40 overflow-y-auto">
    {filteredProducts.length > 0 ? (
      filteredProducts.map((product) => (
        <li
          key={product._id}
          className={`p-2 cursor-pointer hover:bg-blue-100 rounded ${
            selectedProduct?._id === product._id ? "bg-blue-200 font-bold" : ""
          }`}
          onClick={() => setSelectedProduct(product)}
        >
          {product.slug || product.name} ({product.quantity} available)

        </li>
      ))
    ) : (
      <li className="p-2 text-gray-400 italic">No products found</li>
    )}
  </ul>
)}



        <input
  type="text"
  className="w-full p-2 border rounded"
  placeholder="Your Name"
  value={requestedBy}
  onChange={(e) => setRequestedBy(e.target.value)}
  required
/>

        {/* Quantity and Reason */}
        {selectedProduct && (
          <>
            <input
              type="number"
              className="w-full p-2 border rounded"
              placeholder="Quantity"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              required
              min="1"
              max={selectedProduct.quantity}
            />

            <textarea
              className="w-full p-2 border rounded"
              placeholder="Reason for request"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </>
        )}

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          Submit Request
        </button>
      </form>
    </div>
    </div>
  );
}
