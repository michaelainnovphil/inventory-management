"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

export default function RequestList() {
  const [requests, setRequests] = useState([]);

  const fetchRequests = async () => {
  try {
    const res = await fetch("/api/request", {
      headers: { "auth-token": localStorage.getItem("token") },
    });

    const data = await res.json();
    setRequests(data.requests || []);
  } catch (error) {
    console.error("❌ GET /api/request error stack:", error.stack);
    console.error("❌ GET /api/request error message:", error.message);
    alert("Failed to fetch requests: " + error.message);
  }
};



  const handleAction = async (id, action) => {
    const res = await fetch("/api/request", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "auth-token": localStorage.getItem("token"),
      },
      body: JSON.stringify({ id, action }), // action: 'approve' or 'decline'
    });

    const data = await res.json();
    if (data.success) fetchRequests();
    else alert("Action failed: " + data.message);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return (
    <div className="p-4">
      <Header />
      <h2 className="text-lg font-semibold mb-4">Item Requests</h2>
      {requests.map(req => (
        <div key={req._id} className="p-2 border rounded mb-2">
          <p><strong>Item:</strong> {req.productId?.slug || "N/A"}</p>
          <p><strong>Requested by:</strong> {req.user?.name}</p>
          <p><strong>Quantity:</strong> {req.quantity}</p>
          <p><strong>Status:</strong> {req.status}</p>

          {req.status === "pending" && (
            <div className="flex gap-2 mt-2">
              <button onClick={() => handleAction(req._id, "approve")} className="bg-green-500 text-white px-2 py-1 rounded">
                Approve
              </button>
              <button onClick={() => handleAction(req._id, "decline")} className="bg-red-500 text-white px-2 py-1 rounded">
                Decline
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
