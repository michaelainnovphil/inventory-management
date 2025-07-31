"use client";
import Header from "@/components/Header";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import RequestList from "../requestlist/page";
import { getUserFromToken } from "@/utils/getUserFromToken";


export default function RequestForm() {
  const router = useRouter();
  const [category, setCategory] = useState("");
  const [items, setItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [modalMessage, setModalMessage] = useState("");
  const [showRequestList, setShowRequestList] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [userRole, setUserRole] = useState(null);
  




  const categories = [...new Set(items.map((i) => i.category))];

  useEffect(() => {
    fetch("/api/product", {
      headers: { "auth-token": localStorage.getItem("token") },
    })
      .then((res) => res.json())
      .then((data) => setItems(data.products || []));
  }, []);

  const handleSubmit = async () => {
    if (!selectedProduct || !quantity) {
      setModalMessage("Please select a product and quantity.");
      setShowFeedbackModal(true);
      return;
    }

    const res = await fetch("/api/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({ productId: selectedProduct._id, quantity }),
    });

    const result = await res.json();
    if (result.success) {
      setModalMessage("Request submitted successfully!");
      setCategory("");
      setSelectedProduct(null);
      setQuantity(1);
    } else {
      setModalMessage("Error: " + result.message);
    }
    setShowFeedbackModal(true);
  };

  useEffect(() => {
      const decoded = getUserFromToken();
      if (decoded && decoded.user && decoded.user.role) {
        setUserRole(decoded.user.role);
        console.log("✅ Current Role:", decoded.user.role);
      } else {
        console.warn("⚠️ No role found in token.");
      }
    }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      
      {/* Top-right positioned Request List Button */}

      {userRole === "admin" && (
      <div className="max-w-xl mx-auto mt-6">
        <button
          className="bg-blue-900 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
          onClick={() => setShowRequestList(true)}
        >
          📄 See Requests List
        </button>
      </div>)}

      {showRequestList && <RequestList onClose={() => setShowRequestList(false)} />}
      

      


      {/* Request Form */}
      <div className="max-w-xl mx-auto bg-white p-6 mt-4 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Request an Item</h2>

        {/* Category */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">Category</label>
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setSelectedProduct(null);
            }}
            className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* Item */}
        {category && (
          <div className="mb-4">
            <label className="block mb-1 text-sm font-medium text-gray-700">Item</label>
            <select
              value={selectedProduct?._id || ""}
              onChange={(e) =>
                setSelectedProduct(items.find((i) => i._id === e.target.value))
              }
              className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Item</option>
              {items
                .filter((i) => i.category === category)
                .map((i) => (
                  <option key={i._id} value={i._id}>
                    {i.code} - {i.slug}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Quantity */}
        <div className="mb-4">
          <label className="block mb-1 text-sm font-medium text-gray-700">Quantity</label>
          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full px-3 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter quantity"
          />
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-900 hover:bg-blue-800 text-white py-2 rounded-xl font-semibold transition duration-200"
        >
          Submit Request
        </button>
      </div>

      {/* Modal */}
      {showFeedbackModal && (
      <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full text-center">
          <p className="text-lg font-medium text-gray-800">{modalMessage}</p>
          <button
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl"
            onClick={() => setShowFeedbackModal(false)}
          >
            Close
          </button>
        </div>
      </div>
      )}


      
    </div>
  );
}
