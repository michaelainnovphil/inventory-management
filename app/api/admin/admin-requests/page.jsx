// app/admin/requests/page.jsx
"use client";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Header from "@/components/Header";

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
  const fetchRequests = async () => {
    const res = await fetch("/api/request?admin=true");
    const data = await res.json();

    console.log("Fetched request data:", data); // Debug log

    if (Array.isArray(data.requests)) {
      if (res.ok && Array.isArray(data.requests)) {
  setRequests(data.requests);
} else {
  console.error("Expected 'requests' to be an array but got:", data);
  setRequests([]);
}

    } else {
      console.error("Expected requests to be an array", data);
      setRequests([]); // Fallback
    }
  };
  fetchRequests();
}, []);



  return (
    <div className="p-6">
      <Header />
      <h1 className="text-2xl font-bold mb-4">Admin - View Requests</h1>
      <div className="space-y-4">
        {requests.length === 0 ? (
          <p className="text-gray-500">No requests found.</p>
        ) : (
          requests.map((req) => (
            <div key={req._id} className="border p-4 rounded shadow">
              <p><strong>Product:</strong> {req.product?.slug || "Deleted Product"}</p>
              <p><strong>Requested By:</strong> {req.requestedBy}</p>
              <p><strong>Quantity:</strong> {req.quantity}</p>
              <p><strong>Reason:</strong> {req.reason}</p>
              <p className="text-sm text-gray-500">
                <strong>Date:</strong> {new Date(req.createdAt).toLocaleString()}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
